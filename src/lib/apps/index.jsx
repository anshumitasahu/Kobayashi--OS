import Calculator from "../../components/home/AppLogic/Calculator";
import ToDos from "../../components/home/AppLogic/ToDoList";
import Settings from "../../components/home/AppLogic/Settings";
import Gallery from "../../components/home/AppLogic/Gallery";
import Browser from "../../components/home/AppLogic/Browser";
import { IconsApperance } from "../apps/icons";
import Notes from "../../components/home/AppLogic/Notes";
import ChatBot from "../../components/home/AppLogic/ChatBot";
import Piano from "../../components/home/AppLogic/Piano";
import { MenuIconApperance } from "../menuApps/MenuAppsIcons";
import Terminal from "../../components/home/AppLogic/Terminal";
import VS_Code from "../../components/home/AppLogic/VSCode";
import Kanvas from "../../components/home/AppLogic/Kanvas";

export const AppsMenu = (iconStyle = "Colloid") => [
    {
        id: 1,
        name: "Kobai",
        description: "use as Ai",
        icon: "./chatBot.png",
        app: <ChatBot />,
        width: 400,
        height: 300,
    },
    {
        id: 12,
        name: "Kanvas",
        description: "used to paint",
        icon: IconsApperance[iconStyle].Paint,
        app: <Kanvas />,
        width: 676,
        height: 500,
    },
    {
        id: 3,
        name: "Settings",
        description: "use to customize the desktop",
        icon: IconsApperance[iconStyle].Settings,
        app: <Settings />,
        width: 688,
        height: 400,
    },
    {
        id: 4,
        name: "VS Code",
        description: "used to write code",
        icon: IconsApperance[iconStyle].VSCode,
        app: <VS_Code />,
        width: 450,
        height: 400,
    },
    {
        id: 5,
        name: "Kobashi",
        description: "used as terminal for the os",
        icon: IconsApperance[iconStyle].Terminal,
        app: <Terminal />,
        width: 520,
        height: 400,
    },
    {
        id: 6,
        name: "Piano",
        description: "used to play piano",
        icon: IconsApperance[iconStyle].Piano,
        app: <Piano />,
        width: 600,
        height: 450,
    },
]