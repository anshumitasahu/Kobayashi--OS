import { useRef } from "react";
import TopBar from "./home/topbar";
import AppsBar from "./home/AppsBar";
import Calculator from "./home/AppLogic/Calculator";
import ToDos from "./home/AppLogic/ToDoList";
import Window from "./Window";
import { AppsMenu } from "../lib/apps";
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../store.jsx';

export default function Home(zIndex) {
    const desktopRef = useRef();

    const openedApps = useAppStore((state) => state.openedApps);
    const openApp = useAppStore((state) => state.openApp);
    const closeApp = useAppStore((state) => state.closeApp);
    const background = useAppStore((state) => state.background)

    return (
        <div className="flex flex-col w-screen h-screen text-black">
            <div className="w-screen h-screen absolute -z-10">
                {background.type === "image" ? (
                    <img src={background.value} alt="" className="w-full h-full object-cover" />
                ) : null},

                {background.type === "color" ? (
                    <div className="w-screen h-screen" style={{ backgroundColor: background.value }} />
                ) : null}

                {background.type === "gradient" ? (
                    <div className="w-screen h-screen" style={{ background: background.value }} />
                ) : null}
            </div>
            <TopBar />
            <div ref={desktopRef} className="relative flex-1 overflow-hidden">
                {openedApps.map((app) => (
                    <Window
                        key={app.id}
                        id={app.id}
                        title={app.name}
                        icon={<app.icon size={14} />}
                        zIndex={app.zIndex}
                        desktopRef={desktopRef}
                        closeApp={() => closeApp(app.id)}
                    >
                        {app.app}
                    </Window>
                ))}
            </div>
            <AppsBar openApp={openApp} />
        </div >
    );
}