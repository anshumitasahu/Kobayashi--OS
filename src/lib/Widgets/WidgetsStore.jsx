import Calendar from "../../components/home/Widgets/Calendar";
import Clock from "../../components/home/Widgets/Clock";
import { WidgetsIconApperance } from "./WidgetsIcons";


export const WidgetsStore = (iconStyle = "Colloid") => [
    {
        id: 1,
        name: "Calendar",
        component: Calendar,
        icon: WidgetsIconApperance[iconStyle].Calendar,
        height: 365,
        width: 300,
    },
    {
        id: 2,
        name: "Clock",
        component: Clock,
        icon: WidgetsIconApperance[iconStyle].Clock,
        height: 220,
        width: 180,
    },
];