import { useRef, useState } from "react";
import TopBar from "./home/topbar";
import AppsBar from "./home/AppsBar";
import Window from "./Window";
import { WidgetsStore } from "../lib/Widgets/WidgetsStore.jsx";
import { useAppStore } from '../store.jsx';
import MenuApps from "./home/AppLogic/MenuApp.jsx";
import WidgetsWindow from "./WidgetsWindow.jsx";
import RightClick from "./home/RightClick.jsx";

export default function Home() {
    const desktopRef = useRef();

    const [clickComponent, setClickComponent] = useState(false);

    const openedApps = useAppStore((state) => state.openedApps);
    const openApp = useAppStore((state) => state.openApp);
    const closeApp = useAppStore((state) => state.closeApp);
    const Wallpaper = useAppStore((state) => state.Wallpaper);
    const Brightness = useAppStore((state) => state.Brightness);
    const isMenuOpen = useAppStore((state) => state.isMenuOpen);
    const openedWidgets = useAppStore((state) => state.openedWidgets);
    const isWidgetsMenuOpen = useAppStore((state) => state.isWidgetsMenuOpen);
    const openWidget = useAppStore((state) => state.openWidget);
    const closeWidget = useAppStore((state) => state.closeWidget);
    const IconStyle = useAppStore((state) => state.IconStyle);

    const Widgets = WidgetsStore(IconStyle);

    const handleRightClick = (event) => {
        event.preventDefault();
        setClickComponent(true);
    };

    return (
        <div
            onContextMenu={handleRightClick}
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
                <div className="absolute top-30 left-40 z-100 shadow-xl">
                    <RightClick />
                </div>
            )}

            <div>
                <div
                    className={`
            absolute top-20 right-0 z-50 bg-white/40 p-2 text-sm/6 text-neutral-600 rounded-lg shadow-lg transition-all duration-500 ease-in-out origin-top-right backdrop-blur-sm
            ${isWidgetsMenuOpen
                            ? "opacity-100 translate-y-0 scale-100 visible"
                            : "opacity-0 translate-y-3 scale-95 invisible pointer-events-none"
                        }
        `}
                >
                    {Widgets.map((widget) => {
                        const Icon = widget.icon;
                        const Widget = widget.component;

                        return (
                            <div
                                key={widget.id}
                                onClick={() => openWidget(widget)}
                                className="flex flex-col gap-5 items-center cursor-pointer px-2 mb-6 w-70"
                            >
                                <div className="flex gap-4 items-center">
                                    <img src={Icon} alt={widget.name} className="w-8" />
                                    <p>{widget.name}</p>
                                </div>

                                <Widget />
                            </div>
                        );
                    })}
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
                                zIndex={widget.zIndex}
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