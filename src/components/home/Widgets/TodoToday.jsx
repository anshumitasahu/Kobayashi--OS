import { useEffect, useState } from "react";
import { CheckIcon, FlagIcon, ListBulletsIcon } from "@phosphor-icons/react";
import { readTodoLists, readTodoTasks, persistTodoTasks } from "../../../lib/Widgets/widgetSettings";

const todayStr = () => new Date().toISOString().slice(0, 10);
const stop = (e) => e.stopPropagation();

export default function TodoToday() {
    const [tasks, setTasks] = useState(readTodoTasks);
    const [lists, setLists] = useState(readTodoLists);

    useEffect(() => {
        const sync = () => {
            setTasks(readTodoTasks());
            setLists(readTodoLists());
        };
        window.addEventListener("storage", sync);
        const timer = setInterval(sync, 2000);
        return () => {
            window.removeEventListener("storage", sync);
            clearInterval(timer);
        };
    }, []);

    const t = todayStr();
    const todays = tasks
        .filter((x) => x && x.due === t)
        .sort((a, b) => {
            if (a.complete !== b.complete) return a.complete ? 1 : -1;
            if (a.flagged !== b.flagged) return a.flagged ? -1 : 1;
            return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        });
    const open = todays.filter((x) => !x.complete);
    const done = todays.length - open.length;

    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const listColor = (id) => lists.find((l) => l.id === id)?.color ?? "#ff9500";
    const listName = (id) => lists.find((l) => l.id === id)?.name;

    const toggle = (id) => {
        setTasks((prev) => {
            const next = prev.map((x) => (x.id === id ? { ...x, complete: !x.complete } : x));
            persistTodoTasks(next);
            return next;
        });
    };

    return (
        <div className="@container relative w-full h-full min-w-0 min-h-0 overflow-hidden rounded-[26px] bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex flex-col">
            <div className="flex items-center gap-[2.5cqw] px-[5cqw] pt-[4cqw] pb-[2.5cqw]">
                <span className="flex shrink-0 items-center justify-center rounded-full bg-[#ff9500] text-white shadow-[0_2px_8px_rgba(255,149,0,0.4)] w-[clamp(24px,10cqw,36px)] h-[clamp(24px,10cqw,36px)]">
                    <ListBulletsIcon size="58%" weight="bold" />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-semibold tracking-tight text-neutral-900 truncate text-[clamp(12px,5.2cqw,17px)]">Reminders</p>
                    <p className="text-neutral-500 truncate text-[clamp(8px,3.4cqw,12px)]">{dateLabel}</p>
                </div>
                <span className="shrink-0 rounded-full bg-neutral-900/[0.06] px-[2.5cqw] py-[1cqw] font-semibold tabular-nums text-neutral-600 text-[clamp(8px,3.4cqw,12px)]">
                    {done}/{todays.length}
                </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[5cqw] pb-[4cqw]">
                {todays.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-[1cqw] text-center">
                        <p className="font-semibold text-neutral-500 text-[clamp(9px,4.2cqw,14px)]">Nothing due today</p>
                        <p className="text-neutral-400 text-[clamp(8px,3.6cqw,12px)]">Add one in the Reminders app</p>
                    </div>
                ) : (
                    <ul className="flex flex-col divide-y divide-neutral-900/[0.07]">
                        {todays.map((task) => (
                            <li key={task.id} className="flex items-center gap-[2.2cqw] py-[1.8cqw]">
                                <button
                                    onMouseDown={stop}
                                    onClick={() => toggle(task.id)}
                                    title={task.complete ? "Mark open" : "Mark done"}
                                    className="flex shrink-0 items-center justify-center rounded-full border-[1.5px] transition active:scale-90 w-[clamp(14px,6cqw,20px)] h-[clamp(14px,6cqw,20px)]"
                                    style={task.complete
                                        ? { borderColor: listColor(task.listId), backgroundColor: listColor(task.listId), color: "#fff" }
                                        : { borderColor: `${listColor(task.listId)}88` }}
                                >
                                    {task.complete && <CheckIcon size="70%" weight="bold" />}
                                </button>
                                <div className="min-w-0 flex-1 leading-tight">
                                    <p className={`truncate text-[clamp(9px,4cqw,14px)] ${task.complete ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                                        {task.text}
                                    </p>
                                    {listName(task.listId) && (
                                        <p className="truncate text-neutral-400 text-[clamp(7px,3.2cqw,11px)]">{listName(task.listId)}</p>
                                    )}
                                </div>
                                {task.flagged && (
                                    <FlagIcon size="clamp(10px,4.5cqw,15px)" weight="fill" className="shrink-0 text-[#ff9500]" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
