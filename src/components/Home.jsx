import { useRef } from "react";
import TopBar from "./home/topbar";
import AppsBar from "./home/AppsBar";
import Window from "./Window";
import { AppsMenu } from "../lib/apps";
import { useAppStore } from '../store.jsx';
import MenuApps from "./home/AppLogic/MenuApp.jsx";

export default function Home() {
    const desktopRef = useRef();

    const openedApps = useAppStore((state) => state.openedApps);
    const openApp = useAppStore((state) => state.openApp);
    const closeApp = useAppStore((state) => state.closeApp);
    const Wallpaper = useAppStore((state) => state.Wallpaper);
    const Brightness = useAppStore((state) => state.Brightness);
    const isMenuOpen = useAppStore((state) => state.isMenuOpen)

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
            {/* <div className="fixed top-60 right-3">
                <Clock />
                <Calendar />
            </div> */}
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