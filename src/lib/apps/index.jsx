import Calculator from "../../components/home/AppLogic/Calculator";
import ToDos from "../../components/home/AppLogic/ToDoList";
import Settings from "../../components/home/AppLogic/Settings";
import Gallery from "../../components/home/AppLogic/Gallery";
import Browser from "../../components/home/AppLogic/Browser";
import { IconsApperance } from "../apps/icons"

export const AppsMenu = (iconStyle = "Colloid") => [
    {
        name: "Calculator",
        description: "use to calucate stuffs",
        icon: IconsApperance[iconStyle].Calculator,
        app: <Calculator />,
        id: 1
    },
    {
        name: "Todo",
        description: "use to do todo list",
        icon: IconsApperance[iconStyle].ToDo,
        app: <ToDos />,
        id: 2
    },
    {
        name: "Settings",
        description: "use to customize the desktop",
        icon: IconsApperance[iconStyle].Settings,
        app: <Settings />,
        id: 3
    },
    {
        name: "Gallery",
        description: "use to slide image carsouel",
        icon: IconsApperance[iconStyle].Gallery,
        app: <Gallery />,
        id: 4
    },
    {
        name: "Browser",
        description: "use as a search engine",
        icon: IconsApperance[iconStyle].Browser,
        app: <Browser />,
        id: 5
    }
]