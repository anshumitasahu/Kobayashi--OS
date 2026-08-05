import Calculator from "../../components/home/AppLogic/Calculator";
import ToDos from "../../components/home/AppLogic/ToDoList";
import Settings from "../../components/home/AppLogic/Settings";
import Gallery from "../../components/home/AppLogic/Gallery";
import Browser from "../../components/home/AppLogic/Browser";
import { IconsApperance } from "../apps/icons";
import Notes from "../../components/home/AppLogic/Notes";

export const AppsMenu = (iconStyle = "Colloid") => [
    {
        id: 1,
        name: "Calculator",
        description: "use to calucate stuffs",
        icon: IconsApperance[iconStyle].Calculator,
        app: <Calculator />,
        width: 290,
        height: 500
    },
    {
        id: 2,
        name: "Todo",
        description: "use to do todo list",
        icon: IconsApperance[iconStyle].ToDo,
        app: <ToDos />,
        width: 400,
        height: 280,
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
        name: "Gallery",
        description: "use to slide image carsouel",
        icon: IconsApperance[iconStyle].Gallery,
        app: <Gallery />,
        id: 4
    },
    {
        id: 5,
        name: "Browser",
        description: "use as a search engine",
        icon: IconsApperance[iconStyle].Browser,
        app: <Browser />,
        width: 700,
        height: 500,
    },
    {
        id: 6,
        name: "Notes",
        description: "use to store thoughts and random text",
        icon: IconsApperance[iconStyle].Notes,
        app: <Notes />,
        width: 400,
        height: 300,
    }
]