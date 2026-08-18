import { CalendarIcon, ClockIcon } from "@phosphor-icons/react";
import Calendar from "../components/home/Widgets/Calendar";
import Clock from "../components/home/Widgets/Clock";

export const WidgetsStore = [
    {
        id: 1,
        name: "Calendar",
        component: Calendar,
        icon: CalendarIcon,
    },
    {
        id: 2,
        name: "Clock",
        component: Clock,
        icon: ClockIcon,
    },
];