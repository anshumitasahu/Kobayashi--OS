import { useRef, useState } from "react";
import TopBar from "./home/topbar";
import AppsBar from "./home/AppsBar";
import Window from "./Window";
import { WidgetsStore } from "../lib/Widgets/WidgetsStore.jsx";
import { useAppStore } from '../store.jsx';
import MenuApps from "./home/AppLogic/MenuApp.jsx";
import WidgetsWindow from "./WidgetsWindow.jsx";
import RightClick from "./home/RightClick.jsx";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

export default function Home() {
    const desktopRef = useRef();

    const [clickComponent, setClickComponent] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const openedApps = useAppStore((state) => state.openedApps);
    const openApp = useAppStore((state) => state.openApp);
    const closeApp = useAppStore((state) => state.closeApp);
    const Wallpaper = useAppStore((state) => state.Wallpaper);
    const Brightness = useAppStore((state) => state.Brightness);
    const isMenuOpen = useAppStore((state) => state.isMenuOpen);
    const openedWidgets = useAppStore((state) => state.openedWidgets);
    const isWidgetsMenuOpen = useAppStore((state) => state.isWidgetsMenuOpen);
    const toggleWidgetMenu = useAppStore((state) => state.toggleWidgetMenu);
    const openWidget = useAppStore((state) => state.openWidget);
    const closeWidget = useAppStore((state) => state.closeWidget);
    const IconStyle = useAppStore((state) => state.IconStyle);

    const Widgets = WidgetsStore(IconStyle);

    const handleRightClick = (event) => {
        event.preventDefault();
        clickComponent ? setClickComponent(false) : setClickComponent(true);
        setPosition({ x: event.clientX, y: event.clientY })
    };

    const handleLeftClick = () => {
        setClickComponent(false);
    }

    return (
        <div
            onContextMenu={handleRightClick}
            onClick={handleLeftClick}
            className="flex flex-col w-screen h-screen text-black"
            style={{
                filter: `brightness(${Brightness}%)`
            }}
        >
            <div className="w-screen h-screen absolute -z-10">
                <img src={Wallpaper} alt="wallpaper" className="h-full w-full object-cover" />
            </div>

            <TopBar />

            {clickComponent && (
                <div className="absolute top-30 left-40 z-100 shadow-xl"
                    style={{
                        transition: "all 4s",
                        top: position.y,
                        left: position.x
                    }}
                >
                    <RightClick onClose={() => setClickComponent(false)} />
                </div>
            )}

            <div>
                <div
                    className={`
            absolute top-8 right-0 z-50 flex flex-col bg-white/40 text-sm/6 text-neutral-600 rounded-lg shadow-lg transition-all duration-600 ease-in-out origin-top-right backdrop-blur-sm h-full overflow-hidden
            ${isWidgetsMenuOpen
                            ? "opacity-100 translate-x-0 visible"
                            : "opacity-0 translate-x-100 invisible pointer-events-none"
                        }
        `}
                >
                    <div className="flex items-center justify-between px-3 py-2 shrink-0 border-b border-white/40">
                        <p className="text-sm font-semibold text-neutral-700">Widgets</p>
                        <button
                            onClick={toggleWidgetMenu}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition-colors cursor-pointer"
                        >
                            Save
                        </button>
                    </div>
                    <div className="flex-1 overflow-scroll p-2">
                    {Widgets.map((widget) => {
                        const Icon = widget.icon;
                        const Widget = widget.component;
                        const isPresent = openedWidgets.some((opened) => opened.id === widget.id);

                        return (
                            <div
                                key={widget.id}
                                className="flex flex-col items-center gap-2 mb-6 w-70"
                            >
                                <div className="flex items-center gap-2 px-2 w-full">
                                    <img src={Icon} alt={widget.name} className="w-5" />
                                    <p className="text-xs font-medium flex-1 text-left">{widget.name}</p>
                                    <button
                                        onClick={() => isPresent ? closeWidget(widget.id) : openWidget(widget)}
                                        title={isPresent ? `Remove ${widget.name}` : `Add ${widget.name}`}
                                        className="p-1 rounded-md cursor-pointer hover:bg-white/60 transition-colors text-neutral-700"
                                    >
                                        {isPresent ? <TrashIcon size={14} /> : <PlusIcon size={14} />}
                                    </button>
                                </div>

                                <div
                                    onClick={() => { if (!isPresent) openWidget(widget); }}
                                    className={`w-60 h-44 overflow-hidden rounded-lg shrink-0 ${isPresent ? "pointer-events-none" : "cursor-pointer"}`}
                                >
                                    <div className="pointer-events-none w-full h-full">
                                        <Widget />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>
            <div ref={desktopRef} className="relative flex-1 overflow-hidden">
                {
                    openedWidgets.map((widget) => {
                        const Widget = widget.component;

                        return (
                            <WidgetsWindow
                                key={widget.id}
                                id={widget.id}
                                title={widget.name}
                                icon={widget.icon}
                                x={widget.x}
                                y={widget.y}
                                width={widget.width}
                                height={widget.height}
                                minWidth={widget.minWidth}
                                minHeight={widget.minHeight}
                                desktopRef={desktopRef}
                                closeWidget={closeWidget}
                            >
                                <Widget />
                            </WidgetsWindow>
                        );
                    })
                }

                {
                    openedApps.map((app) => (
                        <Window
                            x={app.x}
                            y={app.y}
                            id={app.id}
                            key={app.id}
                            icon={app.icon}
                            title={app.name}
                            width={app.width}
                            height={app.height}
                            zIndex={app.zIndex}
                            desktopRef={desktopRef}
                            windowState={app.windowState}
                            closeApp={() => closeApp(app.id)}
                        >
                            {app.app}
                        </Window>
                    ))
                }
            </div>
            {isMenuOpen ? <MenuApps openApp={openApp} /> : <AppsBar openApp={openApp} />}
        </div >
    );
}