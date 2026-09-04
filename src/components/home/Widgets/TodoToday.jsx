import { useEffect, useState } from "react";
import { CheckIcon, FlagIcon, CalendarBlankIcon } from "@phosphor-icons/react";
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
    const pct = todays.length === 0 ? 0 : Math.round((done / todays.length) * 100);

    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const listColor = (id) => lists.find((l) => l.id === id)?.color ?? "#A78BFA";
    const listName = (id) => lists.find((l) => l.id === id)?.name;

    const toggle = (id) => {
        setTasks((prev) => {
            const next = prev.map((x) => (x.id === id ? { ...x, complete: !x.complete } : x));
            persistTodoTasks(next);
            return next;
        });
    };

    return (
        <div className="@container relative w-full h-full min-w-0 min-h-0 overflow-hidden rounded-xl border border-black/[0.07] bg-[#f8f7ff] flex flex-col" style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
            <div className="flex items-center gap-[2cqw] px-[4cqw] pt-[3.5cqw] pb-[2cqw]">
                <span className="flex shrink-0 items-center justify-center rounded-[2cqw] bg-[#60A5FA] text-white w-[clamp(22px,9cqw,34px)] h-[clamp(22px,9cqw,34px)]">
                    <CalendarBlankIcon size="60%" weight="duotone" />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-semibold text-neutral-700 truncate text-[clamp(11px,5cqw,16px)]">Today</p>
                    <p className="text-neutral-400 truncate text-[clamp(8px,3.4cqw,12px)]">{dateLabel}</p>
                </div>
                <span className="shrink-0 rounded-full bg-black/[0.06] px-[2.5cqw] py-[1cqw] font-semibold tabular-nums text-neutral-600 text-[clamp(8px,3.4cqw,12px)]">
                    {done}/{todays.length}
                </span>
            </div>

            <div className="mx-[4cqw] h-[1.5cqw] min-h-[5px] max-h-[8px] shrink-0 overflow-hidden rounded-full bg-black/[0.07]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#A78BFA] transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[2.5cqw] py-[2cqw]">
                {todays.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-[1cqw] px-[4cqw] text-center">
                        <p className="font-semibold text-neutral-500 text-[clamp(9px,4.2cqw,14px)]">Nothing due today</p>
                        <p className="text-neutral-400 text-[clamp(8px,3.6cqw,12px)]">Add one in the To-Do app</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-[1cqw]">
                        {todays.map((task) => (
                            <li
                                key={task.id}
                                className="flex items-center gap-[2cqw] rounded-[2cqw] bg-white px-[2.5cqw] py-[2cqw] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                            >
                                <span className="h-[5cqw] max-h-[18px] min-h-[10px] w-[1.2cqw] max-w-[5px] min-w-[3px] shrink-0 rounded-full" style={{ backgroundColor: listColor(task.listId) }} />
                                <button
                                    onMouseDown={stop}
                                    onClick={() => toggle(task.id)}
                                    title={task.complete ? "Mark open" : "Mark done"}
                                    className={`flex shrink-0 items-center justify-center rounded-full border transition active:scale-90 w-[clamp(14px,6cqw,20px)] h-[clamp(14px,6cqw,20px)] ${task.complete ? "border-[#A78BFA] bg-[#A78BFA] text-white" : "border-neutral-300 hover:border-[#A78BFA]"}`}
                                >
                                    {task.complete && <CheckIcon size="70%" weight="bold" />}
                                </button>
                                <div className="min-w-0 flex-1 leading-tight">
                                    <p className={`truncate text-[clamp(9px,4cqw,14px)] ${task.complete ? "text-neutral-400 line-through" : "text-neutral-600"}`}>
                                        {task.text}
                                    </p>
                                    {listName(task.listId) && (
                                        <p className="truncate text-neutral-400 text-[clamp(7px,3.2cqw,11px)]">{listName(task.listId)}</p>
                                    )}
                                </div>
                                {task.flagged && (
                                    <FlagIcon size="clamp(10px,4.5cqw,15px)" weight="fill" className="shrink-0 text-[#F472B6]" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
