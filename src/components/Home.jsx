import { useRef } from "react";
import TopBar from "./home/topbar";
import AppsBar from "./home/AppsBar";
import Window from "./Window";
import { AppsMenu } from "../lib/apps";
import { useAppStore } from '../store.jsx';
import MenuApps from "./home/AppLogic/MenuApp.jsx";
import { WidgetsStore } from "../lib/WidgetsStore.jsx";

export default function Home() {
    const desktopRef = useRef();

    const openedApps = useAppStore((state) => state.openedApps);
    const openApp = useAppStore((state) => state.openApp);
    const closeApp = useAppStore((state) => state.closeApp);
    const Wallpaper = useAppStore((state) => state.Wallpaper);
    const Brightness = useAppStore((state) => state.Brightness);
    const isMenuOpen = useAppStore((state) => state.isMenuOpen)
    const openedWidgets = useAppStore((state) => state.openedWidgets);
    const isWidgetsMenuOpen = useAppStore((state) => state.isWidgetsMenuOpen);
    const toggleWidget = useAppStore((state) => state.toggleWidget);


    return (
        <div
            className="flex flex-col w-screen h-screen text-black"
            style={{
                filter: `brightness(${Brightness}%)`
            }}
        >
            <div className="w-screen h-screen absolute -z-10">
                <img src={Wallpaper} alt="" className="h-full w-full object-cover" />
            </div>
            <TopBar />
            <div>
                {isWidgetsMenuOpen && (
                    <div className="absolute top-8 right-2 z-50 bg-white/20 p-2 text-sm/6 text-neutral-600 rounded-b-md shadow-lg">
                        {WidgetsStore.map((widget) => {
                            const Icon = widget.icon;

                            return (
                                <div
                                    key={widget.id}
                                    onClick={() => toggleWidget(widget)}
                                    className="flex gap-3 items-center cursor-pointer px-2 hover:bg-gray-100/70"
                                >
                                    <Icon />
                                    <p>{widget.name}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="fixed top-20 right-3 z-40">
                {openedWidgets.map((widget) => {
                    const Widget = widget.component;
                    return (
                        <div key={widget.id} className="mb-4">
                            <Widget />
                        </div>
                    );
                })}
            </div>
            <div ref={desktopRef} className="relative flex-1 overflow-hidden">

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