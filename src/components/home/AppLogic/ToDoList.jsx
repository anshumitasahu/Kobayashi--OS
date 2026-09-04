import {
  PlusIcon,
  TrashIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CheckCircleIcon,
  CalendarBlankIcon,
  ListBulletsIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState, useEffect, useMemo } from "react";

const LIST_COLORS = ["#A78BFA", "#F472B6", "#34D399", "#60A5FA", "#FBBF24", "#FB923C"];
const OLD_COLOR_MAP = {
  "#a866ff": "#A78BFA",
  "#8b5cf6": "#60A5FA",
  "#7c3aed": "#A78BFA",
  "#c4b5fd": "#A78BFA",
  "#6d28d9": "#60A5FA",
  "#d8b4fe": "#F472B6",
};
const ACTIVE_BG = "rgba(241, 226, 255, 0.8)";
const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function ToDos() {
  const [lists, setLists] = useState(() => {
    const stored = load("mac-todo-lists", null);
    if (stored) {
      return stored.map((l) => ({
        ...l,
        color: OLD_COLOR_MAP[l.color?.toLowerCase()] ?? l.color,
      }));
    }
    return [
      { id: "reminders", name: "Reminders", color: "#A78BFA" },
      { id: "work", name: "Work", color: "#60A5FA" },
      { id: "personal", name: "Personal", color: "#F472B6" },
    ];
  });
  const [tasks, setTasks] = useState(() => load("mac-todo-tasks", []));
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [due, setDue] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => { localStorage.setItem("mac-todo-lists", JSON.stringify(lists)); }, [lists]);
  useEffect(() => {
    localStorage.setItem("mac-todo-tasks", JSON.stringify(tasks));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const counts = useMemo(() => {
    const t = todayStr();
    const open = tasks.filter((x) => !x.complete);
    return {
      all: open.length,
      today: open.filter((x) => x.due === t).length,
      flagged: open.filter((x) => x.flagged).length,
      done: tasks.length - open.length,
    };
  }, [tasks]);

  const activeList = lists.find((l) => l.id === active);
  const title =
    active === "all" ? "All" :
    active === "today" ? "Today" :
    active === "flagged" ? "Flagged" :
    active === "done" ? "Completed" :
    activeList?.name ?? "Reminders";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = [...tasks];
    if (active === "today") out = out.filter((x) => x.due === todayStr());
    else if (active === "flagged") out = out.filter((x) => x.flagged);
    else if (active === "done") out = out.filter((x) => x.complete);
    else if (active !== "all") out = out.filter((x) => x.listId === active);
    if (q) out = out.filter((x) => x.text.toLowerCase().includes(q));
    out.sort((a, b) => {
      if (a.complete !== b.complete) return a.complete ? 1 : -1;
      if (a.due && b.due) return a.due.localeCompare(b.due);
      if (a.due) return -1;
      if (b.due) return 1;
      return b.createdAt - a.createdAt;
    });
    return out;
  }, [tasks, active, query]);

  const openCount = visible.filter((x) => !x.complete).length;

  function addTask() {
    if (!input.trim()) return;
    const listId = activeList ? activeList.id : lists[0]?.id;
    setTasks((prev) => [
      { id: uid(), listId, text: input.trim(), complete: false, flagged: false, due: due || null, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
    setDue("");
  }

  function patch(id, data) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }

  function addList() {
    const l = { id: uid(), name: `List ${lists.length + 1}`, color: LIST_COLORS[lists.length % LIST_COLORS.length] };
    setLists((prev) => [...prev, l]);
    setActive(l.id);
  }

  function renameList(id, name) {
    if (!name.trim()) return;
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name: name.trim() } : l)));
  }

  function deleteList(id) {
    if (lists.length <= 1) return;
    setLists((prev) => prev.filter((l) => l.id !== id));
    setTasks((prev) => prev.filter((t) => t.listId !== id));
    if (active === id) setActive("all");
  }

  const filters = [
    { id: "all", label: "All", n: counts.all, icon: ListBulletsIcon, tint: "#A78BFA" },
    { id: "today", label: "Today", n: counts.today, icon: CalendarBlankIcon, tint: "#60A5FA" },
    { id: "flagged", label: "Flagged", n: counts.flagged, icon: FlagIcon, tint: "#F472B6" },
    { id: "done", label: "Completed", n: counts.done, icon: CheckCircleIcon, tint: "#34D399" },
  ];

  return (
    <div
      className={`grid h-full w-full gap-2 ${showSidebar ? "grid-cols-[1fr_3fr]" : "grid-cols-[1fr]"}`}
    >
      {showSidebar && (
        <aside className="w-full overflow-y-auto bg-white/50 p-1">
          <div className="mb-1 mt-1 flex w-full items-center gap-3 rounded-md border border-black/10 bg-white px-2 py-1 text-xs">
            <button>
              <MagnifyingGlassIcon size={18} color="black" />
            </button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search here"
              className="w-full min-w-0 outline-0 placeholder:text-neutral-400"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-neutral-400 hover:text-neutral-600">
                <XIcon size={12} weight="bold" />
              </button>
            )}
          </div>

          <div className="mt-3">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className="flex w-full items-center gap-3 rounded-md p-1 text-left"
                style={{ backgroundColor: active === f.id ? ACTIVE_BG : "transparent" }}
              >
                <span className="rounded-md p-1" style={{ backgroundColor: f.tint }}>
                  <f.icon size={16} color="white" weight="duotone" />
                </span>
                <span className="flex-1 truncate text-xs text-neutral-600">{f.label}</span>
                <span className="text-xs tabular-nums text-neutral-400">{f.n}</span>
              </button>
            ))}
          </div>

          <div className="mb-1 mt-3 flex items-center justify-between px-1">
            <span className="text-xs text-neutral-500">Lists</span>
            <button onClick={addList} title="Add list" className="rounded p-0.5 text-neutral-500 hover:bg-black/10">
              <PlusIcon size={12} weight="bold" />
            </button>
          </div>
          <div className="mt-1">
            {lists.map((l) => {
              const n = tasks.filter((t) => t.listId === l.id && !t.complete).length;
              return (
                <div
                  key={l.id}
                  className="group flex items-center gap-3 rounded-md p-1"
                  style={{ backgroundColor: active === l.id ? ACTIVE_BG : "transparent" }}
                >
                  <span className="rounded-md p-1" style={{ backgroundColor: l.color }}>
                    <ListBulletsIcon size={16} color="white" weight="duotone" />
                  </span>
                  <input
                    defaultValue={l.name}
                    key={l.name + l.id}
                    onBlur={(e) => renameList(l.id, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                    onFocus={() => setActive(l.id)}
                    onClick={() => setActive(l.id)}
                    className="w-full min-w-0 cursor-default truncate bg-transparent text-xs text-neutral-600 outline-0 focus:cursor-text"
                  />
                  <span className="shrink-0 text-xs tabular-nums text-neutral-400">{n}</span>
                  <button onClick={() => deleteList(l.id)} title="Delete list" className="hidden shrink-0 text-neutral-400 hover:text-red-500 group-hover:block">
                    <TrashIcon size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      <main className="h-full w-full overflow-y-auto rounded bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setShowSidebar((v) => !v)}
            title="Toggle sidebar"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-black/5"
          >
            <span className="flex flex-col gap-[3px]">
              <span className="block h-px w-3.5 bg-current" />
              <span className="block h-px w-3.5 bg-current" />
              <span className="block h-px w-3.5 bg-current" />
            </span>
          </button>
          <h2 className="mt-1 min-w-0 flex-1 truncate text-xs text-black">{title}</h2>
          <span className="shrink-0 text-xs text-neutral-400">{openCount} open</span>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex w-full flex-1 items-center gap-3 rounded-md border border-black/10 bg-white px-2 py-1 text-xs">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
              placeholder="New reminder, Enter to add"
              className="w-full min-w-0 outline-0 placeholder:text-neutral-400"
            />
          </div>
          <input
            type="date"
            value={due}
            min={todayStr()}
            onChange={(e) => setDue(e.target.value)}
            title="Due date"
            className="shrink-0 rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-neutral-600 outline-0"
          />
          <button
            onClick={addTask}
            title="Add"
            className="shrink-0 rounded-md bg-primary p-1.5 text-white transition hover:opacity-90 active:scale-95"
          >
            <PlusIcon size={16} color="white" weight="bold" />
          </button>
        </div>

        <div className="mb-4">
          <h2 className="mb-4 mt-1 text-xs text-black">Reminders</h2>
          {visible.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-400">
              {query ? "No matches." : "No reminders."}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {visible.map((task) => {
                const list = lists.find((l) => l.id === task.listId);
                const overdue = task.due && !task.complete && task.due < todayStr();
                const dueToday = task.due === todayStr();
                return (
                  <li key={task.id} className="group flex items-center gap-3 rounded-md p-2 hover:bg-[#f2f2f2]">
                    <button
                      onClick={() => patch(task.id, { complete: !task.complete })}
                      title={task.complete ? "Mark open" : "Mark done"}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition active:scale-90 ${task.complete ? "border-primary bg-primary text-white" : "border-neutral-300 hover:border-primary"}`}
                    >
                      {task.complete && <CheckIcon size={10} weight="bold" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs ${task.complete ? "text-neutral-400 line-through" : "text-neutral-600"}`}>{task.text}</p>
                      {(list || task.due) && (
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] text-neutral-400">
                          {list && active !== list.id && <span className="truncate">{list.name}</span>}
                          {task.due && (
                            <span className={overdue ? "text-red-400" : dueToday ? "text-primary" : ""}>
                              {overdue ? `Overdue ${task.due.slice(5)}` : dueToday ? "Today" : task.due.slice(5)}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => patch(task.id, { flagged: !task.flagged })}
                      title="Flag"
                      className="shrink-0 rounded p-0.5"
                    >
                      <FlagIcon
                        size={14}
                        weight={task.flagged ? "fill" : "regular"}
                        className={task.flagged ? "text-primary" : "text-neutral-300 hover:text-primary"}
                      />
                    </button>
                    <button
                      onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                      title="Delete"
                      className="hidden shrink-0 rounded p-0.5 text-neutral-300 hover:text-red-500 group-hover:block"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
