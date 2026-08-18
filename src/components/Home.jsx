import { useRef } from "react";
import TopBar from "./home/topbar";
import AppsBar from "./home/AppsBar";
import Window from "./Window";
import { AppsMenu } from "../lib/apps";
import { useAppStore } from '../store.jsx';
import MenuApps from "./home/AppLogic/MenuApp.jsx";
import { WidgetsStore } from "../lib/Widgets/WidgetsStore.jsx"

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
    const IconStyle = useAppStore((state) => state.IconStyle)

    const Widgets = WidgetsStore(IconStyle)

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
                <div
                    className={`
            absolute top-10 right-0 z-50
            bg-white/20 p-2 text-sm/6 text-neutral-600
            rounded-b-md shadow-lg
            transition-all duration-500 ease-in-out
            origin-top-right
            ${isWidgetsMenuOpen
                            ? "opacity-100 translate-y-0 scale-100 visible"
                            : "opacity-0 -translate-y-3 scale-95 invisible pointer-events-none"
                        }
        `}
                >
                    {Widgets.map((widget) => {
                        const Icon = widget.icon;
                        const Widget = widget.component;

                        return (
                            <div
                                key={widget.id}
                                onClick={() => toggleWidget(widget)}
                                className="flex flex-col gap-5 items-center cursor-pointer px-2 mb-6 w-70"
                            >
                                <div className="flex gap-4 items-center">
                                    <img src={Icon} alt={widget.name} className="w-8"/>
                                    <p>{widget.name}</p>
                                </div>

                                <Widget />
                            </div>
                        );
                    })}
                </div>
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