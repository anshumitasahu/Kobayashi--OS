import { AppsMenu } from "../../lib/apps";

export default function AppsBar({ openApp }) {
    return (
        <div className="w-full flex justify-center items-center absolute bottom-0 z-1000">
            <div className="flex justify-center items-center gap-5 w-fit bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white">
                <div
                    className="cursor-pointer"
                    onClick={() => alert("menu not implememnted")}
                >
                    <img src="/devscope-icon2.png" className="w-12 bg-sky-500 p-2 rounded-xl hover:-translate-y-1" />
                </div>
                {
                    AppsMenu.map((apps) => (
                        <div
                            className="rounded-md hover:-translate-y-1 cursor-pointer"
                            onClick={() => openApp(apps)}
                            key={apps.id}
                        >
                            <img src={apps.icon} className="w-13" />
                        </div>
                    ))
                }
            </div>
        </div>
    );
}