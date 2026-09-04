import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";

const STARTER = {
    html: `<div class="card">\n  <h1>Hello Kobayashi</h1>\n  <p>Edit HTML, CSS & JS — then hit Run.</p>\n  <button id="btn">Click me</button>\n</div>`,
    css: `body {\n  font-family: sans-serif;\n  background: #0f172a;\n  color: #e2e8f0;\n  display: grid;\n  place-items: center;\n  height: 100vh;\n  margin: 0;\n}\n.card {\n  background: #1e293b;\n  padding: 32px 40px;\n  border-radius: 16px;\n  text-align: center;\n  box-shadow: 0 20px 60px rgba(0,0,0,.4);\n}\nbutton {\n  background: #22c55e;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 8px;\n  font-weight: bold;\n  cursor: pointer;\n}`,
    js: `console.log("Preview running!");\ndocument.getElementById("btn").onclick = () => {\n  console.log("Button clicked");\n};`,
};

const CONSOLE_HOOK = `<script>(function(){var send=function(type,args){try{parent.postMessage({__kobaConsole:true,type:type,args:args.map(function(a){try{return typeof a==="object"?JSON.stringify(a):String(a)}catch(e){return String(a)}})},"*")}catch(e){}};["log","info","warn","error"].forEach(function(m){var orig=console[m];console[m]=function(){send(m,Array.prototype.slice.call(arguments));if(orig)orig.apply(console,arguments)}});window.addEventListener("error",function(e){send("error",[e.message])});})();</script>`;

function buildDoc({ html, css, js }) {
    const safeJs = (js || "").replace(/<\/script>/gi, "<\\/script>");
    return `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<style>${css || ""}</style>\n</head>\n<body>\n${html || ""}\n${CONSOLE_HOOK}\n<script>${safeJs}</script>\n</body>\n</html>`;
}

const TABS = [
    { id: "html", label: "index.html", short: "HTML", lang: "html", dot: "bg-orange-500" },
    { id: "css", label: "style.css", short: "CSS", lang: "css", dot: "bg-blue-500" },
    { id: "js", label: "script.js", short: "JS", lang: "javascript", dot: "bg-yellow-400" },
];

const LOG_COLORS = { log: "text-gray-700", info: "text-blue-600", warn: "text-amber-600", error: "text-red-600" };

export default function VS_Code() {
    const [tab, setTab] = useState("html");
    const [code, setCode] = useState(STARTER);
    const [srcDoc, setSrcDoc] = useState(() => buildDoc(STARTER));
    const [showPreview, setShowPreview] = useState(true);
    const [orientation, setOrientation] = useState("auto");
    const [split, setSplit] = useState(50);
    const [autoRun, setAutoRun] = useState(false);
    const [logs, setLogs] = useState([]);
    const [outputTab, setOutputTab] = useState("preview");
    const [lastRun, setLastRun] = useState(null);
    const [wide, setWide] = useState(true);

    const rootRef = useRef(null);
    const codeRef = useRef(code);
    useEffect(() => {
        codeRef.current = code;
    }, [code]);

    const active = useMemo(() => TABS.find((t) => t.id === tab), [tab]);
    const isRow = orientation === "side" || (orientation === "auto" && wide);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= 720));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const onMsg = (e) => {
            if (!e.data?.__kobaConsole) return;
            setLogs((prev) => [...prev.slice(-99), { type: e.data.type, args: e.data.args }]);
        };
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
    }, []);

    const run = useCallback(() => {
        setLogs([]);
        setSrcDoc(buildDoc(codeRef.current));
        setLastRun(new Date());
    }, []);
    const runRef = useRef(run);
    useEffect(() => {
        runRef.current = run;
    }, [run]);

    useEffect(() => {
        if (!autoRun) return;
        const t = setTimeout(() => runRef.current(), 900);
        return () => clearTimeout(t);
    }, [code, autoRun]);

    const reset = () => {
        setCode(STARTER);
        setLogs([]);
        setSrcDoc(buildDoc(STARTER));
        setLastRun(new Date());
    };

    const openExternal = () => {
        const blob = new Blob([buildDoc(codeRef.current)], { type: "text/html" });
        window.open(URL.createObjectURL(blob), "_blank", "noopener");
    };

    const cycleOrientation = () =>
        setOrientation((o) => (o === "auto" ? "side" : o === "side" ? "stack" : "auto"));

    const onDrag = (e) => {
        const el = rootRef.current;
        if (!el) return;
        const rect = el.querySelector("[data-split-root]").getBoundingClientRect();
        const move = (ev) => {
            const pct = isRow
                ? ((ev.clientX - rect.left) / rect.width) * 100
                : ((ev.clientY - rect.top) / rect.height) * 100;
            setSplit(Math.min(80, Math.max(20, pct)));
        };
        const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        e.preventDefault();
    };

    const iconBtn =
        "px-2 py-1 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium whitespace-nowrap";

    return (
        <div ref={rootRef} className="bg-[#1e1e1e] w-full h-full rounded-lg flex flex-col overflow-hidden text-sm select-none">
            <div className="flex items-center gap-1 px-2 py-1.5 bg-[#252526] border-b border-black/40 shrink-0 flex-wrap">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${tab === t.id ? "bg-[#1e1e1e] text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                        <span className="hidden sm:inline">{t.label}</span>
                        <span className="sm:hidden text-xs">{t.short}</span>
                    </button>
                ))}
                <div className="flex-1" />
                <button onClick={() => setAutoRun((v) => !v)} title="Re-run automatically as you type" className={`${iconBtn} ${autoRun ? "text-green-400" : ""}`}>
                    {autoRun ? "● Auto" : "○ Auto"}
                </button>
                <button onClick={cycleOrientation} title={`Layout: ${orientation}`} className={iconBtn}>
                    {orientation === "auto" ? "◫ Auto" : orientation === "side" ? "◧ Side" : "◨ Stack"}
                </button>
                <button onClick={() => setShowPreview((v) => !v)} title="Toggle preview pane" className={iconBtn}>
                    {showPreview ? "◉ Split" : "◎ Code"}
                </button>
                <button onClick={reset} title="Reset to starter code" className={iconBtn}>
                    ↺
                </button>
                <button
                    onClick={run}
                    title="Run (Ctrl+Enter)"
                    className="px-4 py-1 rounded-md bg-green-600 hover:bg-green-500 text-white font-semibold"
                >
                    ▶ Run
                </button>
            </div>

            <div data-split-root className={`flex-1 min-h-0 flex ${isRow ? "flex-row" : "flex-col"}`}>
                <div
                    className="min-h-0 min-w-0 shrink-0"
                    style={showPreview ? (isRow ? { width: `${split}%` } : { height: `${split}%` }) : { flex: 1 }}
                >
                    <Editor
                        theme="vs-dark"
                        height="100%"
                        language={active.lang}
                        value={code[tab]}
                        onChange={(v) => setCode((c) => ({ ...c, [tab]: v ?? "" }))}
                        onMount={(editor, monaco) => {
                            monaco.editor.defineTheme("koba-dark", {
                                base: "vs-dark",
                                inherit: true,
                                rules: [],
                                colors: { "editor.background": "#1e1e1e" },
                            });
                            monaco.editor.setTheme("koba-dark");
                            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
                        }}
                        options={{
                            automaticLayout: true,
                            minimap: { enabled: wide },
                            fontSize: 14,
                            tabSize: 2,
                            wordWrap: "on",
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>

                {showPreview && (
                    <>
                        <div
                            onPointerDown={onDrag}
                            title="Drag to resize"
                            className={`shrink-0 bg-[#2d2d2d] hover:bg-blue-600 active:bg-blue-500 transition-colors flex items-center justify-center ${
                                isRow ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize"
                            }`}
                            style={{ touchAction: "none" }}
                        >
                            <div className={`rounded-full bg-white/30 ${isRow ? "w-0.5 h-8" : "h-0.5 w-8"}`} />
                        </div>

                        <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-white">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 border-b shrink-0 text-xs">
                                <button
                                    onClick={() => setOutputTab("preview")}
                                    className={`px-2.5 py-0.5 rounded ${outputTab === "preview" ? "bg-white shadow text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-800"}`}
                                >
                                    Preview
                                </button>
                                <button
                                    onClick={() => setOutputTab("console")}
                                    className={`px-2.5 py-0.5 rounded ${outputTab === "console" ? "bg-white shadow text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-800"}`}
                                >
                                    Console{logs.length > 0 && ` (${logs.length})`}
                                </button>
                                <div className="flex-1" />
                                {logs.length > 0 && outputTab === "console" && (
                                    <button onClick={() => setLogs([])} className="px-2 py-0.5 text-gray-500 hover:text-gray-800">
                                        Clear
                                    </button>
                                )}
                                <button onClick={openExternal} title="Open preview in new tab" className="px-2 py-0.5 text-gray-500 hover:text-gray-800">
                                    ↗
                                </button>
                                <button onClick={() => setShowPreview(false)} title="Hide preview" className="px-2 py-0.5 text-gray-500 hover:text-gray-800">
                                    ✕
                                </button>
                            </div>
                            {outputTab === "preview" ? (
                                <iframe
                                    title="preview"
                                    srcDoc={srcDoc}
                                    sandbox="allow-scripts"
                                    className="flex-1 w-full h-full border-0 bg-white"
                                />
                            ) : (
                                <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-[#fafafa]">
                                    {logs.length === 0 ? (
                                        <p className="text-gray-400 italic">No console output yet — hit Run.</p>
                                    ) : (
                                        logs.map((l, i) => (
                                            <div key={i} className={`border-b border-gray-100 pb-1 break-all ${LOG_COLORS[l.type] || "text-gray-700"}`}>
                                                <span className="opacity-50 mr-1.5">{l.type}</span>
                                                {l.args.join(" ")}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-3 px-3 py-1 bg-white/5 text-white text-[11px] shrink-0 overflow-x-auto whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${TABS.find((t) => t.id === tab).dot}`} />
                    {active.label}
                </span>
                <span className="opacity-80">{(code[tab] || "").length} chars · {(code[tab] || "").split("\n").length} lines</span>
                <div className="flex-1" />
                {autoRun && <span>auto-run on</span>}
                {lastRun && <span className="opacity-80">ran {lastRun.toLocaleTimeString()}</span>}
                <span className="hidden sm:inline opacity-80">Ctrl+Enter to run</span>
            </div>
        </div>
    );
}
