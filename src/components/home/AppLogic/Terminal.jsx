import { useEffect, useRef, useState } from "react";
import { Sandbox } from "e2b";
import {
  PlayIcon,
  ArrowClockwiseIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  XIcon,
  PlusIcon,
  SkullIcon,
} from "@phosphor-icons/react";

const USER = "riko";
const HOST = "koba";

const BANNER = String.raw`
 ██ ▄█▀ ▒█████   ▄▄▄▄    ▄▄▄        ██████  ██░ ██  ██▓
 ██▄█▒ ▒██▒  ██▒▓█████▄ ▒████▄    ▒██    ▒ ▓██░ ██▒▓██▒
▓███▄░ ▒██░  ██▒▒██▒ ▄██▒██  ▀█▄  ░ ▓██▄   ▒██▀▀██░▒██▒
▓██ █▄ ▒██   ██░▒██░█▀  ░██▄▄▄▄██   ▒   ██▒░▓█ ░██ ░██░
▒██▒ █▄░ ████▓▒░░▓█  ▀█▓ ▓█   ▓██▒▒██████▒▒░▓█▒░██▓░██░
▒ ▒▒ ▓▒░ ▒░▒░▒░ ░▒▓███▀▒ ▒▒   ▓▒█░▒ ▒▓▒ ▒ ░ ▒ ░░▒░▒░▓
`;

const KNOWN_COMMANDS = [
  "help", "clear", "history", "whoami", "about", "neofetch",
  "echo", "date", "pwd", "cd", "ls", "banner", "run", "script",
  "connect", "reconnect", "status", "exit", "sudo",
];

const HELP_ROWS = [
  ["help", "show this help"],
  ["run", "open the script editor"],
  ["clear (Ctrl+L)", "clear the screen"],
  ["history", "show past commands"],
  ["neofetch", "system info"],
  ["whoami / about", "who made this thing"],
  ["echo <text>", "print text"],
  ["date / pwd / cd / ls", "usual shell stuff (runs on e2b)"],
  ["connect / status", "shell connection controls"],
  ["exit", "try it and find out"],
];

function bootHistory(first) {
  if (!first) return [{ type: "info", value: "new shell — type 'help' if you're lost." }];
  return [
    { type: "banner", value: BANNER },
    { type: "info", value: "kobayashi shell — 'help' for commands · 'run' for script mode · + for a new tab." },
  ];
}

function suggestionFor(word) {
  let best = null;
  let bestScore = Infinity;
  for (const known of KNOWN_COMMANDS) {
    const a = word.toLowerCase();
    const b = known;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    const score = dp[a.length][b.length];
    if (score < bestScore) {
      bestScore = score;
      best = known;
    }
  }
  return bestScore <= 2 ? best : null;
}

function shortCwd(cwd, home) {
  if (!cwd) return "~";
  if (home && cwd.startsWith(home)) return "~" + cwd.slice(home.length) || "~";
  return cwd;
}

let tabSeq = 0;
function makeTab(first) {
  tabSeq += 1;
  return {
    id: `${Date.now()}-${tabSeq}`,
    name: tabSeq === 1 ? "bash" : `bash ${tabSeq}`,
    history: bootHistory(first),
    cmdLog: [],
    cmdIndex: -1,
    input: "",
    cwd: null,
  };
}

export default function Terminal() {
  const [tabs, setTabs] = useState(() => [makeTab(true)]);
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [busyTab, setBusyTab] = useState(null);
  const [conn, setConn] = useState("idle");
  const [sandboxId, setSandboxId] = useState(null);
  const [connError, setConnError] = useState(null);
  const [home, setHome] = useState(null);
  const [lastExit, setLastExit] = useState(null);
  const [lastMs, setLastMs] = useState(null);
  const [showStatus, setShowStatus] = useState(true);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [script, setScript] = useState("# write shell here — Ctrl+Enter to run\necho hello from script\ndate\n");

  const sandboxRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const scriptInputRef = useRef(null);
  const busyRef = useRef(false);
  busyRef.current = busy;
  const activeIdRef = useRef(null);

  const apiKey = import.meta.env.VITE_E2B_API_KEY;

  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  useEffect(() => {
    activeIdRef.current = tab.id;
  }, [tab.id]);

  useEffect(() => {
    if (!activeId && tabs.length) setActiveId(tabs[0].id);
  }, [activeId, tabs]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [tab.history, busy, scriptOpen, activeId]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
    getSandbox().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scriptOpen) scriptInputRef.current?.focus({ preventScroll: true });
  }, [scriptOpen]);

  function updateTab(id, fn) {
    setTabs((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));
  }

  function push(id, ...items) {
    updateTab(id, (t) => ({ ...t, history: [...t.history.slice(-500), ...items] }));
  }

  function setTabInput(id, value) {
    updateTab(id, (t) => ({ ...t, input: value }));
  }

  function addTab() {
    const fresh = makeTab(false);
    setTabs((prev) => [...prev, fresh]);
    setActiveId(fresh.id);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  }

  function closeTab(id) {
    setTabs((prev) => {
      if (prev.length === 1) return [{ ...prev[0], history: [] }];
      const idx = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);
      if (id === activeIdRef.current) {
        const fallback = next[Math.max(0, idx - 1)] ?? next[0];
        setActiveId(fallback.id);
      }
      return next;
    });
  }

  async function getSandbox() {
    if (sandboxRef.current) return sandboxRef.current;
    if (!apiKey) throw new Error("Missing VITE_E2B_API_KEY — add it to your .env to power the shell.");
    setConn("connecting");
    setConnError(null);
    try {
      const sbx = await Sandbox.create("base", { apiKey });
      sandboxRef.current = sbx;
      setSandboxId(sbx.sandboxId ?? sbx.id ?? "e2b");
      try {
        const probe = await sbx.commands.run("pwd && echo $HOME");
        const lines = probe.stdout.trim().split("\n");
        const pwd = lines[0]?.trim();
        const h = lines[1]?.trim();
        if (h) setHome(h);
        if (pwd) setTabs((prev) => prev.map((t) => (t.cwd ? t : { ...t, cwd: pwd })));
      } catch {
        /* cwd tracking is best-effort */
      }
      setConn("connected");
      return sbx;
    } catch (e) {
      setConn("error");
      setConnError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  async function reconnect(silent) {
    sandboxRef.current = null;
    setSandboxId(null);
    setConn("connecting");
    setConnError(null);
    try {
      await getSandbox();
      if (!silent) push(activeIdRef.current, { type: "success", value: "shell reconnected." });
    } catch (e) {
      push(activeIdRef.current, { type: "error", value: `could not connect shell: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  function friendlyError(command, result) {
    const stderr = (result.stderr || "").trim();
    const code = result.exitCode ?? 1;
    const firstWord = command.split(/\s+/)[0];
    if (/command not found/i.test(stderr) || code === 127) {
      const hint = suggestionFor(firstWord);
      return {
        type: "error",
        value: `command did not work: '${firstWord}' not found${hint ? ` — did you mean '${hint}'?` : ""} (exit ${code})${stderr ? `\n${stderr}` : ""}`,
      };
    }
    if (!stderr) return { type: "error", value: `command did not work (exit ${code}) — no output.` };
    return { type: "error", value: `${stderr}\n(exit ${code})` };
  }

  async function execRemote(raw, cwd) {
    const sbx = await getSandbox();
    const t0 = Date.now();
    const prefix = cwd ? `cd ${JSON.stringify(cwd)} && ` : "";
    const result = await sbx.commands.run(prefix + raw);
    setLastMs(Date.now() - t0);
    setLastExit(result.exitCode ?? 0);
    return result;
  }

  function snapshot(tabObj) {
    return { user: USER, host: HOST, cwd: shortCwd(tabObj.cwd, home) };
  }

  async function handleCd(id, tabObj, arg) {
    const target = (arg || "~").trim() || "~";
    try {
      const result = await execRemote(`cd ${target} && pwd`, tabObj.cwd);
      if ((result.exitCode ?? 0) !== 0 || !result.stdout.trim()) {
        push(id, friendlyError(`cd ${target}`, { ...result, exitCode: result.exitCode ?? 1, stderr: result.stderr || `cd: no such directory: ${target}` }));
        return;
      }
      updateTab(id, (t) => ({ ...t, cwd: result.stdout.trim() }));
    } catch (e) {
      push(id, { type: "error", value: `command did not work: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  async function runSingle(id, tabObj, rawCommand) {
    const command = rawCommand.trim();
    if (!command || busyRef.current) return;
    updateTab(id, (t) => ({ ...t, cmdLog: [...t.cmdLog.slice(-99), command], cmdIndex: -1 }));
    push(id, { type: "input", value: command, ...snapshot(tabObj) });

    const [head, ...rest] = command.split(/\s+/);
    const tail = rest.join(" ");

    switch (head) {
      case "clear":
        updateTab(id, (t) => ({ ...t, history: [] }));
        return;
      case "help":
        push(id, { type: "output", value: HELP_ROWS.map(([c, d]) => `  ${c.padEnd(16)} ${d}`).join("\n"), help: true });
        setLastExit(0);
        return;
      case "history":
        push(id, {
          type: "output",
          value: tabObj.cmdLog.length
            ? [...tabObj.cmdLog, command].map((c, i) => `  ${String(i + 1).padStart(3)}  ${c}`).join("\n")
            : `    1  ${command}`,
        });
        setLastExit(0);
        return;
      case "whoami":
        push(id, { type: "output", value: "Riko (Anshumita Sahu) — the developer" });
        setLastExit(0);
        return;
      case "about":
        push(id, { type: "output", value: "Kobayashi OS — a toy desktop in the browser.\nThis shell runs real commands on an e2b sandbox." });
        setLastExit(0);
        return;
      case "neofetch":
        push(id, {
          type: "output",
          value: [
            "      ____  ____",
            "     / __ \\/ __/  riko@koba",
            "    / /_/ / /_    ──────────",
            `    \\____/\\__/    shell: bash (e2b ${conn === "connected" ? "connected" : conn})`,
            `                 cwd: ${shortCwd(tabObj.cwd, home)}`,
            "                 de: kobayashi-os",
          ].join("\n"),
        });
        setLastExit(0);
        return;
      case "echo":
        push(id, { type: "output", value: tail.replace(/^(['"])(.*)\\1$/, "$2") });
        setLastExit(0);
        return;
      case "date":
        push(id, { type: "output", value: new Date().toString() });
        setLastExit(0);
        return;
      case "pwd":
        push(id, { type: "output", value: shortCwd(tabObj.cwd, home) });
        setLastExit(0);
        return;
      case "banner":
        push(id, { type: "banner", value: BANNER });
        setLastExit(0);
        return;
      case "run":
      case "script":
        setScriptOpen(true);
        setLastExit(0);
        return;
      case "connect":
      case "reconnect":
        setBusy(true);
        setBusyTab(id);
        try {
          await reconnect(false);
        } finally {
          setBusy(false);
          setBusyTab(null);
        }
        return;
      case "status":
        push(id, {
          type: "output",
          value: `shell: ${conn}${sandboxId ? ` (${String(sandboxId).slice(0, 8)})` : ""}\nlast exit: ${lastExit ?? "—"}${lastMs != null ? ` · ${lastMs}ms` : ""}`,
        });
        setLastExit(0);
        return;
      case "exit":
        push(id, { type: "info", value: "there is no escape. the shell keeps you. try 'clear' instead." });
        setLastExit(0);
        return;
      case "sudo": {
        push(id, { type: "info", value: "riko is not in the sudoers file. this incident will be reported… just kidding, running it anyway." });
        if (!tail) {
          push(id, { type: "error", value: "command did not work: sudo needs something to run." });
          setLastExit(1);
          return;
        }
        break;
      }
      case "cd":
        setBusy(true);
        setBusyTab(id);
        try {
          await handleCd(id, tabObj, tail);
        } finally {
          setBusy(false);
          setBusyTab(null);
        }
        return;
      default:
        break;
    }

    const effective = head === "sudo" ? tail : command;
    setBusy(true);
    setBusyTab(id);
    try {
      const result = await execRemote(effective, tabObj.cwd);
      if (result.stdout?.trim()) push(id, { type: "output", value: result.stdout.replace(/\\n$/, "") });
      if ((result.exitCode ?? 0) !== 0) push(id, friendlyError(command, result));
      else if (result.stderr?.trim()) push(id, { type: "output", value: result.stderr, dim: true });
      else if (!result.stdout?.trim()) push(id, { type: "info", value: "done — no output." });
    } catch (e) {
      push(id, { type: "error", value: `command did not work: ${e instanceof Error ? e.message : String(e)}` });
      setLastExit(1);
    } finally {
      setBusy(false);
      setBusyTab(null);
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  async function runScript() {
    const id = activeIdRef.current;
    const tabObj = tabs.find((t) => t.id === id) ?? tabs[0];
    const lines = script.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() && !l.trim().startsWith("#"));
    if (!lines.length || busyRef.current) return;
    setScriptOpen(false);
    push(id, { type: "script", value: `running script — ${lines.length} line${lines.length > 1 ? "s" : ""}` });
    setBusy(true);
    setBusyTab(id);
    try {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "clear") {
          updateTab(id, (t) => ({ ...t, history: [] }));
          continue;
        }
        const current = (tabs.find((t) => t.id === id) ?? tabObj);
        if (trimmed === "cd" || trimmed.startsWith("cd ")) {
          push(id, { type: "input", value: trimmed, ...snapshot(current) });
          await handleCd(id, current, trimmed.slice(2));
          continue;
        }
        push(id, { type: "input", value: trimmed, ...snapshot(current) });
        try {
          const result = await execRemote(trimmed, current.cwd);
          if (result.stdout?.trim()) push(id, { type: "output", value: result.stdout.replace(/\\n$/, "") });
          if ((result.exitCode ?? 0) !== 0) push(id, friendlyError(trimmed, result));
          else if (result.stderr?.trim()) push(id, { type: "output", value: result.stderr, dim: true });
        } catch (e) {
          push(id, { type: "error", value: `command did not work: ${e instanceof Error ? e.message : String(e)}` });
        }
        updateTab(id, (t) => ({ ...t, cmdLog: [...t.cmdLog.slice(-99), trimmed] }));
      }
      push(id, { type: "success", value: "script finished." });
    } finally {
      setBusy(false);
      setBusyTab(null);
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      runSingle(tab.id, tab, tab.input);
      setTabInput(tab.id, "");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!tab.cmdLog.length) return;
      const next = tab.cmdIndex === -1 ? tab.cmdLog.length - 1 : Math.max(0, tab.cmdIndex - 1);
      updateTab(tab.id, (t) => ({ ...t, cmdIndex: next, input: t.cmdLog[next] }));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (tab.cmdIndex === -1) return;
      const next = tab.cmdIndex + 1;
      if (next >= tab.cmdLog.length) {
        updateTab(tab.id, (t) => ({ ...t, cmdIndex: -1, input: "" }));
      } else {
        updateTab(tab.id, (t) => ({ ...t, cmdIndex: next, input: t.cmdLog[next] }));
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      updateTab(tab.id, (t) => ({ ...t, history: [] }));
    }
  }

  const connLabel = conn === "connected" ? "connected" : conn === "connecting" ? "connecting…" : conn === "error" ? "error" : "idle";
  const dot = conn === "connected" ? "bg-green-400" : conn === "connecting" ? "bg-amber-400 animate-pulse" : conn === "error" ? "bg-red-400" : "bg-gray-500";
  const tabBusy = busy && busyTab === tab.id;

  const iconBtn = "p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0";

  return (
    <div className="bg-[#1e1e1e] w-full h-full rounded-lg flex flex-col overflow-hidden text-sm font-mono select-none relative">
      <div className="flex items-end gap-1 px-2 pt-1.5 bg-[#252526] border-b border-black/50 shrink-0">
        <div className="flex items-end gap-1 flex-1 min-w-0 overflow-x-auto">
          {tabs.map((t) => {
            const active = t.id === tab.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveId(t.id);
                  setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
                }}
                className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-t-md text-xs transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-[#1e1e1e] text-white shadow-[inset_0_-2px_0_#ff4d9d]"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-[#ff4d9d]" : "bg-gray-600 group-hover:bg-gray-500"}`} />
                {t.name}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(t.id);
                  }}
                  title="Close tab"
                  className={`p-0.5 rounded transition-colors ${active ? "opacity-60 hover:opacity-100 hover:bg-white/10" : "opacity-0 group-hover:opacity-60 hover:opacity-100! hover:bg-white/10"}`}
                >
                  <XIcon size={11} />
                </span>
              </button>
            );
          })}
          <button onClick={addTab} title="New tab"
            className="p-1.5 mb-0.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors shrink-0">
            <PlusIcon size={13} />
          </button>
        </div>
        <div className="flex items-center gap-0.5 pb-0.5 shrink-0">
          <button onClick={() => setScriptOpen((v) => !v)} title="Write a shell script (run)"
            className="px-2 py-1 rounded-md text-gray-300 hover:text-[#ff4d9d] hover:bg-white/10 transition-colors text-xs font-medium flex items-center gap-1">
            <PlayIcon size={13} /> Script
          </button>
          <button onClick={() => reconnect(false)} title="Reconnect shell" className={iconBtn}>
            <ArrowClockwiseIcon size={14} />
          </button>
          <button onClick={() => updateTab(tab.id, (t) => ({ ...t, history: [] }))} title="Clear screen" className={iconBtn}>
            <TrashIcon size={14} />
          </button>
          <button onClick={() => setShowStatus((v) => !v)} title="Toggle status bar" className={iconBtn}>
            {showStatus ? <EyeIcon size={14} /> : <EyeSlashIcon size={14} />}
          </button>
        </div>
      </div>

      <div ref={scrollRef} onClick={() => inputRef.current?.focus({ preventScroll: true })}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1 cursor-text select-text selection:bg-[#ff4d9d]/30">
        {tab.history.map((item, i) => {
          if (item.type === "input") {
            return (
              <div key={i} className="break-all">
                <span className="text-green-400 font-semibold">{item.user}@{item.host}</span>
                <span className="text-gray-600">:</span>
                <span className="text-blue-400">{item.cwd}</span>
                <span className="text-gray-600">$ </span>
                <span className="text-white">{item.value}</span>
              </div>
            );
          }
          if (item.type === "banner") {
            return <pre key={i} className="text-green-500/90 text-[10px] leading-tight overflow-x-auto">{item.value}</pre>;
          }
          if (item.type === "info") {
            return <div key={i} className="text-gray-500 italic">{item.value}</div>;
          }
          if (item.type === "success") {
            return <div key={i} className="text-green-400">✓ {item.value}</div>;
          }
          if (item.type === "script") {
            return <div key={i} className="text-[#ff4d9d]/90 border-y border-[#ff4d9d]/20 py-0.5">▸ {item.value}</div>;
          }
          if (item.type === "error") {
            return (
              <div key={i} className="flex gap-1.5 items-start bg-red-500/10 border-l-2 border-red-500 rounded-r px-2 py-1">
                <SkullIcon size={14} className="text-red-400 shrink-0 mt-0.5" />
                <pre className="text-red-300 whitespace-pre-wrap break-all flex-1">{item.value}</pre>
              </div>
            );
          }
          return (
            <pre key={i} className={`whitespace-pre-wrap break-all ${item.dim ? "text-gray-500" : item.help ? "text-amber-200/90" : "text-gray-200"}`}>
              {item.value}
            </pre>
          );
        })}
        {tabBusy && (
          <div className="text-gray-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-500 animate-ping" /> running…
          </div>
        )}
        {!tabBusy && (
          <div className="flex items-center flex-wrap">
            <span className="text-green-400 font-semibold">{USER}@{HOST}</span>
            <span className="text-gray-600">:</span>
            <span className="text-blue-400">{shortCwd(tab.cwd, home)}</span>
            <span className="text-gray-600">$&nbsp;</span>
            <input
              ref={inputRef}
              value={tab.input}
              disabled={busy}
              spellCheck={false}
              autoComplete="off"
              placeholder="type 'help'…"
              className="bg-transparent outline-none flex-1 min-w-15 text-white placeholder:text-gray-600 caret-green-400"
              onChange={(e) => setTabInput(tab.id, e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        )}
      </div>

      {scriptOpen && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-10 rounded-lg" onClick={() => setScriptOpen(false)}>
          <div className="bg-[#252526] border border-white/10 rounded-lg w-full max-w-md flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center px-3 py-2 border-b border-black/40">
              <span className="text-gray-200 text-xs font-semibold">script.sh — lines run top to bottom</span>
              <div className="flex-1" />
              <button onClick={() => setScriptOpen(false)} className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10">
                <XIcon size={14} />
              </button>
            </div>
            <textarea
              ref={scriptInputRef}
              value={script}
              spellCheck={false}
              onChange={(e) => setScript(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  runScript();
                }
              }}
              className="bg-[#1e1e1e] text-gray-100 text-xs p-3 h-48 outline-none resize-none font-mono caret-[#ff4d9d] selection:bg-[#ff4d9d]/30"
              placeholder={"echo hello\ndate"}
            />
            <div className="flex items-center gap-2 px-3 py-2 border-t border-black/40">
              <span className="text-[11px] text-gray-500">Ctrl+Enter to run · # lines are skipped</span>
              <div className="flex-1" />
              <button onClick={() => setScriptOpen(false)} className="px-3 py-1 rounded-md text-xs text-gray-300 hover:bg-white/10">
                Cancel
              </button>
              <button onClick={runScript} disabled={busy || !script.trim()}
                className="px-4 py-1 rounded-md bg-[#ff2e88] hover:bg-[#ff5aa5] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                <PlayIcon size={12} /> Run
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatus && (
        <div className="flex items-center gap-2 px-3 h-6 bg-black/40 border-t border-[#ff4d9d]/10 text-[11px] text-gray-400 shrink-0 overflow-hidden whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
          <span className="font-medium">e2b: {connLabel}</span>
          {sandboxId && <span className="opacity-60 hidden sm:inline">· {String(sandboxId).slice(0, 8)}</span>}
          {connError && <span className="text-red-400/90 truncate hidden md:inline">· {connError}</span>}
          <div className="flex-1" />
          {lastMs != null && <span className="opacity-60 hidden sm:inline">{lastMs}ms</span>}
          {lastExit != null && (
            <span className={lastExit === 0 ? "text-green-400/90" : "text-red-400/90"}>exit {lastExit}</span>
          )}
          <span className="opacity-60 hidden sm:inline">bash · utf-8</span>
        </div>
      )}
    </div>
  );
}
