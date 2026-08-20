import Calculator from "../../components/home/AppLogic/Calculator";
import ToDos from "../../components/home/AppLogic/ToDoList";
import Settings from "../../components/home/AppLogic/Settings";
import Gallery from "../../components/home/AppLogic/Gallery";
import Browser from "../../components/home/AppLogic/Browser";
import Notes from "../../components/home/AppLogic/Notes";
import Camera from "../../components/home/AppLogic/Camera";
import { MenuIconApperance } from "./MenuAppsIcons";
import MusicPlayer from "../../components/home/AppLogic/MusicPlayer";

export const AppsInMenu = (iconStyle = "Colloid") => [
    {
        id: 1,
        name: "Calculator",
        description: "use to calucate stuffs",
        icon: MenuIconApperance[iconStyle].Calculator,
        app: <Calculator />,
        width: 290,
        height: 500,
    },
    {
        id: 2,
        name: "Todo",
        description: "use to do todo list",
        icon: MenuIconApperance[iconStyle].ToDo,
        app: <ToDos />,
        width: 400,
        height: 280,
    },
    {
        id: 3,
        name: "Settings",
        description: "use to customize the desktop",
        icon: MenuIconApperance[iconStyle].Settings,
        app: <Settings />,
        width: 688,
        height: 400,
    },
    {
        id: 4,
        name: "Gallery",
        description: "use to slide image carsouel",
        icon: MenuIconApperance[iconStyle].Gallery,
        app: <Gallery />,
        width: 500,
        height: 400,
    },
    {
        id: 5,
        name: "Browser",
        description: "use as a search engine",
        icon: MenuIconApperance[iconStyle].Browser,
        app: <Browser />,
        width: 700,
        height: 500,
    },
    {
        id: 6,
        name: "Notes",
        description: "use to store thoughts and random text",
        icon: MenuIconApperance[iconStyle].Notes,
        app: <Notes />,
        width: 400,
        height: 300,
    },
    {
        id: 7,
        name: "Camera",
        description: "used to click photos",
        icon: MenuIconApperance[iconStyle].Camera,
        app: <Camera />,
        width: 650,
        height: 480,
    },
    {
       id: 8,
        name: "Music Player",
        description: "used to listen Music",
        icon: MenuIconApperance[iconStyle].MusicPlayer,
        app: <MusicPlayer />,
        width: 200,
        height: 400, 
    }
]