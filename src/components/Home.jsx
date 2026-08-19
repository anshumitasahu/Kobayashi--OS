import { useRef, useState } from "react";
import TopBar from "./home/topbar";
import AppsBar from "./home/AppsBar";
import Window from "./Window";
import { useAppStore } from "../store.jsx";
import MenuApps from "./home/AppLogic/MenuApp.jsx";
import { WidgetsStore } from "../lib/Widgets/WidgetsStore.jsx";
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

            <div
                ref={desktopRef}
                className="relative flex-1 overflow-hidden"
            >
                {openedWidgets.map((widget) => {
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
                })}

                {openedApps.map((app) => (
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
                ))}
            </div>

            {isMenuOpen ? (
                <MenuApps openApp={openApp} />
            ) : (
                <AppsBar openApp={openApp} />
            )}
        </div>
    );
}