import { useEffect, useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { AppsMenu } from "../../lib/apps";
import { useAppStore } from "../../store";

const CLICK_DELAY = 240;
const MENU_WIDTH = 192;

export default function AppsBar({ openApp }) {

    const openedApps = useAppStore((state) => state.openedApps)
    const IconStyle = useAppStore((state) => state.IconStyle);
    const restore = useAppStore((state) => state.restore);
    const bringToFront = useAppStore((state) => state.bringToFront);
    const minimize = useAppStore((state) => state.minimize);
    const closeApp = useAppStore((state) => state.closeApp);
    const toggleMenu = useAppStore((state) => state.toggleMenu);
    const toggleWidgetMenu = useAppStore((state) => state.toggleWidgetMenu)

    const maximizedApp = openedApps.find((app) => app.windowState === "maximized");
    const maximized = Boolean(maximizedApp);
    const apps = AppsMenu(IconStyle);

    const [isMouseOver, setIsMouseOver] = useState(false)
    const [menu, setMenu] = useState(null);
    const clickTimer = useRef(null);

    const hidden = maximized && !isMouseOver;

    useEffect(() => {
        return () => {
            if (clickTimer.current) clearTimeout(clickTimer.current);
        };
    }, []);

    useEffect(() => {
        if (!menu) return;
        const dismiss = (e) => {
            if (e.target?.closest?.("[data-dock-menu]")) return;
            setMenu(null);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setMenu(null);
        };
        window.addEventListener("pointerdown", dismiss);
        window.addEventListener("keydown", onKey);
        window.addEventListener("blur", dismiss);
        return () => {
            window.removeEventListener("pointerdown", dismiss);
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("blur", dismiss);
        };
    }, [menu]);

    const focusWindow = (id) => {
        const target = openedApps.find((app) => app.id === id);
        if (!target) return;
        if (target.windowState === "minimized") restore(id);
        bringToFront(id);
    };

    const frontVisibleId = () => {
        const visible = openedApps.filter((app) => app.windowState !== "minimized");
        if (visible.length === 0) return null;
        return visible.reduce((top, app) => (app.zIndex > top.zIndex ? app : top)).id;
    };

    const handleDockClick = (template, instances) => {
        if (instances.length === 0) {
            openApp(template);
            return;
        }
        const visible = instances.filter((app) => app.windowState !== "minimized");
        if (visible.length === 0) {
            const top = instances.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
            focusWindow(top.id);
            return;
        }
        const topVisible = visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
        if (topVisible.id === frontVisibleId()) {
            minimize(topVisible.id);
        } else {
            bringToFront(topVisible.id);
        }
    };

    const scheduleClick = (template, instances) => {
        if (clickTimer.current) clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            clickTimer.current = null;
            handleDockClick(template, instances);
        }, CLICK_DELAY);
    };

    const handleDoubleClick = (template) => {
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }
        openApp(template);
    };

    const openMenu = (e, key, template, instances) => {
        e.preventDefault();
        e.stopPropagation();
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }
        const half = MENU_WIDTH / 2 + 8;
        const x = Math.min(Math.max(e.clientX, half), window.innerWidth - half);
        setMenu({ key, template, instances, x, bottom: window.innerHeight - e.clientY + 14 });
    };

    const closeMenu = () => setMenu(null);

    const renderMenu = () => {
        if (!menu) return null;
        const { template, key, x, bottom } = menu;
        const instances = key.startsWith("pinned-")
            ? openedApps.filter((property) => property.name === template.name)
            : key.startsWith("running-")
                ? openedApps.filter((property) => property.name === template.name && !apps.some((exist) => exist.name === property.name))
                : openedApps.filter((property) => property.id === template.id);
        const sorted = [...instances].sort((a, b) => b.zIndex - a.zIndex);
        return (
            <div
                data-dock-menu
                className="fixed z-[1100] w-48 overflow-hidden rounded-xl bg-white/80 text-neutral-800 text-sm shadow-xl ring-1 ring-black/10 backdrop-blur-xl"
                style={{ left: x, bottom, transform: "translateX(-50%)" }}
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <div className="px-3 pt-2 pb-1">
                    <p className="text-sm font-semibold truncate">{template.name}</p>
                    <p className="text-xs text-neutral-500">
                        {sorted.length === 0 ? "Not running" : `${sorted.length} window${sorted.length > 1 ? "s" : ""}`}
                    </p>
                </div>
                <div className="px-1.5 pb-1">
                    <button
                        className="w-full text-left text-sm px-2 py-1 rounded-md hover:bg-black/5 cursor-pointer"
                        onClick={() => {
                            openApp(template);
                            closeMenu();
                        }}
                    >
                        New Window
                    </button>
                    <button
                        className="w-full text-left text-sm px-2 py-1 rounded-md hover:bg-black/5 cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
                        disabled={sorted.length === 0}
                        onClick={() => {
                            sorted.forEach((win) => closeApp(win.id));
                            closeMenu();
                        }}
                    >
                        Quit All
                    </button>
                </div>
                {sorted.length > 0 && (
                    <div className="border-t border-black/10 px-1.5 py-1 max-h-48 overflow-y-auto">
                        {sorted.map((win, i) => (
                            <div
                                key={win.id}
                                className="group flex items-center gap-1 rounded-md hover:bg-black/5 cursor-pointer"
                                onClick={() => {
                                    focusWindow(win.id);
                                    closeMenu();
                                }}
                            >
                                <span className="flex-1 truncate text-sm px-2 py-1">
                                    {sorted.length > 1 ? `Window ${sorted.length - i}` : "Current Window"}
                                    {win.windowState === "minimized" && (
                                        <span className="text-neutral-500"> — Minimized</span>
                                    )}
                                </span>
                                <button
                                    title={`Close ${template.name} window`}
                                    className="mr-1 p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-black/10 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeApp(win.id);
                                        if (sorted.length <= 1) closeMenu();
                                    }}
                                >
                                    <XIcon size={12} weight="bold" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderDot = (isOpen) => (
        <div className="h-1.5 flex items-start justify-center">
            <div className={`w-1 h-1 rounded-full ${isOpen ? "bg-white shadow" : "bg-transparent"}`} />
        </div>
    );

    return (
        <div
            className="w-full flex justify-center items-end absolute bottom-0 z-1000"
            style={{
                height: maximized ? (isMouseOver ? "90px" : "12px") : "90px",
                overflow: "hidden",
                transition: "height 0.2s ease"
            }}
            onMouseEnter={() => {
                if (maximized) {
                    setIsMouseOver(true);
                }
            }}
            onMouseLeave={() => {
                setIsMouseOver(false);
            }}
        >
            {maximized && (
                <div
                    className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-32 h-[5px] rounded-full bg-white/80 shadow ring-1 ring-black/20"
                    style={{
                        opacity: hidden ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        pointerEvents: "none",
                    }}
                />
            )}
            <div
                className="flex justify-center items-center gap-5 w-fit h-23 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white"
                style={{
                    opacity: hidden ? 0 : 1,
                    visibility: hidden ? "hidden" : "visible",
                    transform: hidden ? "translateY(100%)" : "translateY(0)",
                    pointerEvents: hidden ? "none" : "auto",
                    transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s",
                }}
            >
                <div
                    className="cursor-pointer"
                    onClick={() => {
                        toggleMenu()
                    }}
                >
                    <img
                        src="/logo.svg"
                        className="w-12 bg-white p-2 rounded-xl hover:-translate-y-1"
                        style={{
                            transition: "all 0.1s"
                        }}
                    />
                </div>
                <div className="cursor-pointer">
                    <img
                        src="./widgets.svg"
                        className="w-12 bg-white rounded-xl hover:-translate-y-1"
                        style={{
                            transition: "all 0.3s"
                        }}
                        onClick={() => {
                            toggleWidgetMenu()
                        }}
                    />
                </div>
                {
                    apps.map((app) => {
                        const instances = openedApps.filter((property) => property.name === app.name);
                        const isOpen = instances.length > 0;
                        return (
                            <div
                                key={app.id}
                                className="rounded-md hover:-translate-y-1 cursor-pointer"
                                style={{
                                    transition: "all 0.3s"
                                }}
                                onClick={() => scheduleClick(app, instances)}
                                onDoubleClick={() => handleDoubleClick(app)}
                                onContextMenu={(e) => openMenu(e, `pinned-${app.name}`, app, instances)}
                            >
                                <div
                                    className="flex flex-col items-center"
                                >
                                    <img
                                        src={app.icon}
                                        className="w-12 rounded-lg"
                                    />
                                    {renderDot(isOpen)}
                                </div>
                            </div>
                        )
                    })
                }
                {Object.values(
                    openedApps
                        .filter((app) => !apps.some((exist) => exist.name === app.name))
                        .reduce((groups, app) => {
                            (groups[app.name] ??= []).push(app);
                            return groups;
                        }, {})
                ).map((instances) => {
                    const app = instances[0];
                    return (
                        <div key={`running-${app.name}`}>
                            <div
                                className="rounded-md hover:-translate-y-1 cursor-pointer"
                                style={{
                                    transition: "all 0.3s"
                                }}
                                onClick={() => scheduleClick(app, instances)}
                                onDoubleClick={() => handleDoubleClick(app)}
                                onContextMenu={(e) => openMenu(e, `running-${app.name}`, app, instances)}
                            >
                                <div className="flex flex-col items-center">
                                    <img
                                        src={app.icon}
                                        className="w-12"
                                    />
                                    {renderDot(true)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {renderMenu()}
        </div >
    );
}
