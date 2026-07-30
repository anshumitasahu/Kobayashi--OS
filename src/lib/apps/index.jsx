import Calculator from "../../components/home/AppLogic/Calculator";
import ToDos from "../../components/home/AppLogic/ToDoList";
import Settings from "../../components/home/AppLogic/Settings";
import Gallery from "../../components/home/AppLogic/Gallery";
import { IconsApperance } from "../apps/icons"

export const AppsMenu = [
    {
        name: "Calculator",
        description: "use to calucate stuffs",
        icon: IconsApperance.colloid.Calculator,
        app: <Calculator />,
        id: 1
    },
    {
        name: "Todo",
        description: "use to do todo list",
        icon: IconsApperance.colloid.ToDo,
        app: <ToDos />,
        id: 2
    },
    {
        name: "Settings",
        description: "use to customize the desktop",
        icon: IconsApperance.colloid.Settings,
        app: <Settings />,
        id: 3
    },
    {
        name: "Gallery",
        description: "use to slide image carsouel",
        icon: IconsApperance.colloid.Gallery,
        app: <Gallery />,
        id: 4
    }
]