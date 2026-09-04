import Calendar from "../../components/home/Widgets/Calendar";
import Clock from "../../components/home/Widgets/Clock";
import StickyNote from "../../components/home/Widgets/StickyNote";
import DigitalClock from "../../components/home/Widgets/DigitalClock";
import WeatherGlass from "../../components/home/Widgets/WeatherGlass";
import PhotoFrame from "../../components/home/Widgets/PhotoFrame";
import { WidgetsIconApperance } from "./WidgetsIcons";


export const WidgetsStore = (iconStyle = "Colloid") => [
    {
        id: 1,
        name: "Calendar",
        component: Calendar,
        icon: WidgetsIconApperance[iconStyle].Calendar,
        width: 300,
        height: 280,
    },
    {
        id: 2,
        name: "Clock",
        component: Clock,
        icon: WidgetsIconApperance[iconStyle].Clock,
        width: 200,
        height: 200,
    },
    {
        id: 3,
        name: "Sticky Note",
        component: StickyNote,
        icon: WidgetsIconApperance[iconStyle].StickyNote,
        width: 260,
        height: 260,
    },
    {
        id: 4,
        name: "Digital Clock",
        component: DigitalClock,
        icon: WidgetsIconApperance[iconStyle].DigitalClock,
        width: 300,
        height: 160,
    },
    {
        id: 5,
        name: "Weather",
        component: WeatherGlass,
        icon: WidgetsIconApperance[iconStyle].WeatherGlass,
        width: 300,
        height: 220,
    },
    {
        id: 6,
        name: "Photo Frame",
        component: PhotoFrame,
        icon: WidgetsIconApperance[iconStyle].PhotoFrame,
        width: 280,
        height: 280,
    },
];