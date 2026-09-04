import Calendar from "../../components/home/Widgets/Calendar";
import Clock from "../../components/home/Widgets/Clock";
import StickyNote from "../../components/home/Widgets/StickyNote";
import DigitalClock from "../../components/home/Widgets/DigitalClock";
import WeatherGlass from "../../components/home/Widgets/WeatherGlass";
import PhotoFrame from "../../components/home/Widgets/PhotoFrame";
import TodoToday from "../../components/home/Widgets/TodoToday";
import { WidgetsIconApperance } from "./WidgetsIcons";


export const WidgetsStore = (iconStyle = "Colloid") => [
    {
        id: 1,
        name: "Calendar",
        component: Calendar,
        icon: WidgetsIconApperance[iconStyle].Calendar,
        width: 300,
        height: 280,
        minWidth: 210,
        minHeight: 220,
    },
    {
        id: 2,
        name: "Clock",
        component: Clock,
        icon: WidgetsIconApperance[iconStyle].Clock,
        width: 200,
        height: 200,
        minWidth: 120,
        minHeight: 120,
    },
    {
        id: 3,
        name: "Sticky Note",
        component: StickyNote,
        icon: WidgetsIconApperance[iconStyle].StickyNote,
        width: 260,
        height: 260,
        minWidth: 160,
        minHeight: 150,
    },
    {
        id: 4,
        name: "Digital Clock",
        component: DigitalClock,
        icon: WidgetsIconApperance[iconStyle].DigitalClock,
        width: 300,
        height: 160,
        minWidth: 200,
        minHeight: 100,
    },
    {
        id: 5,
        name: "Weather",
        component: WeatherGlass,
        icon: WidgetsIconApperance[iconStyle].WeatherGlass,
        width: 300,
        height: 220,
        minWidth: 200,
        minHeight: 160,
    },
    {
        id: 6,
        name: "Photo Frame",
        component: PhotoFrame,
        icon: WidgetsIconApperance[iconStyle].PhotoFrame,
        width: 280,
        height: 280,
        minWidth: 150,
        minHeight: 150,
    },
    {
        id: 7,
        name: "Today's To-Dos",
        component: TodoToday,
        icon: WidgetsIconApperance[iconStyle].TodoToday,
        width: 300,
        height: 320,
        minWidth: 200,
        minHeight: 220,
    },
];