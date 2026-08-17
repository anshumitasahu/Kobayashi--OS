import { CalendarIcon, ClockIcon } from "@phosphor-icons/react";
import Calender from "../components/home/Widgets/Calendar";
import Clock from "../components/home/Widgets/Clock";

export const WidgetsStore = [
    {
        id: 1,
        name: "Calendar",
        widget: <Calender />,
        icon: CalendarIcon,
    },
    {
        id: 2,
        name: "Clock",
        widget: <Clock />,
        icon: ClockIcon,
    }
]