import Calculator from "../../components/home/AppLogic/Calculator";
import ToDos from "../../components/home/AppLogic/ToDoList";
import Settings from "../../components/home/AppLogic/Settings";
import Gallery from "../../components/home/AppLogic/Gallery";
import Browser from "../../components/home/AppLogic/Browser";
import Notes from "../../components/home/AppLogic/Notes";
import Camera from "../../components/home/AppLogic/Camera";
import { MenuIconApperance } from "./MenuAppsIcons";
import MusicPlayer from "../../components/home/AppLogic/MusicPlayer";
import YouTube from "../../components/home/AppLogic/YouTube";
import FileManager from "../../components/home/AppLogic/FileManager";
import Shorts from "../../components/home/AppLogic/Shorts";
import Chess from "../../components/home/AppLogic/Chess";
import Kanvas from "../../components/home/AppLogic/Kanvas";
import Terminal from "../../components/home/AppLogic/Terminal";
import KobaSheets from "../../components/home/AppLogic/KobaSheets";
import Word from "../../components/home/AppLogic/Word";
import JsonLab from "../../components/home/AppLogic/JSONLab";
import DevScope from "../../components/home/AppLogic/DevScope";
import SpiderMan from "../../components/home/AppLogic/SpiderMan";
import TypingTest from "../../components/home/AppLogic/TypingTest";
import HackClub from "../../components/home/AppLogic/HackClub";
import MoneyTrail from "../../components/home/AppLogic/ExpenseTracker";
import Weather from "../../components/home/AppLogic/Weather";
import Pomodoro from "../../components/home/AppLogic/Pomodoro";
import Captain from "../../components/home/AppLogic/CaptainAmerica";
import MyColorPicker from "../../components/home/AppLogic/ColorPicker";
import Piano from "../../components/home/AppLogic/Piano";
import Thor from "../../components/home/AppLogic/ThorGame";
import VS_Code from "../../components/home/AppLogic/VSCode";
import ChatBot from "../../components/home/AppLogic/ChatBot";
import Hunter from "../../components/home/AppLogic/Hunter";
import MineCraft from "../../components/home/AppLogic/MineCraft";
import Ben10S from "../../components/home/AppLogic/Ben10S";
import Ben10G from "../../components/home/AppLogic/Ben!0G";
import DelackHack from "../../components/home/AppLogic/DelackHack";

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
        width: 700,
        height: 480,
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
        width: 670,
        height: 560,
    },
    {
        id: 6,
        name: "Notes",
        description: "use to store thoughts and random text",
        icon: MenuIconApperance[iconStyle].Notes,
        app: <Notes />,
        width: 440,
        height: 400,
    },
    {
        id: 7,
        name: "Camera",
        description: "used to click photos",
        icon: MenuIconApperance[iconStyle].Camera,
        app: <Camera />,
        width: 480,
        height: 580,
    },
    {
        id: 8,
        name: "Music Player",
        description: "used to listen Music",
        icon: MenuIconApperance[iconStyle].MusicPlayer,
        app: <MusicPlayer />,
        width: 370,
        height: 570,
    },
    {
        id: 9,
        name: "YouTube",
        description: "used to watch Youtube",
        icon: MenuIconApperance[iconStyle].YouTube,
        app: <YouTube />,
        width: 1050,
        height: 560,
    },
    {
        id: 10,
        name: "Chess",
        description: "used to play Chess",
        icon: MenuIconApperance[iconStyle].Chess,
        app: <Chess />,
        width: 550,
        height: 700,
    },
    {
        id: 11,
        name: "File Manager",
        description: "used to manage files in the system",
        icon: MenuIconApperance[iconStyle].FileManager,
        app: <FileManager />,
        width: 650,
        height: 360,
    },
    {
        id: 12,
        name: "Shorts",
        description: "used to doomscroll",
        icon: "./Shorts.png",
        app: <Shorts />,
        width: 314,
        height: 641,
    },
    {
        id: 13,
        name: "Kanvas",
        description: "used to paint",
        icon: MenuIconApperance[iconStyle].Paint,
        app: <Kanvas />,
        width: 796,
        height: 560,
    },
    {
        id: 14,
        name: "VS Code",
        description: "used to write code",
        icon: MenuIconApperance[iconStyle].VSCode,
        app: <VS_Code />,
        width: 850,
        height: 660,
    },
    {
        id: 15,
        name: "MineCraft",
        description: "used tp play game MineCraft",
        icon: "MineCraft.png",
        app: <MineCraft />,
        width: 750,
        height: 666,
    },
    {
        id: 16,
        name: "KobaSheets",
        description: "used to deal with spreadsheets",
        icon: MenuIconApperance[iconStyle].Excel,
        app: <KobaSheets />,
        width: 750,
        height: 666,
    },
    {
        id: 17,
        name: "Koba Word",
        description: "used to deal with words and docx",
        icon: MenuIconApperance[iconStyle].Word,
        app: <Word />,
        width: 700,
        height: 480,
    },
    {
        id: 18,
        name: "JSON Lab",
        description: "used to deal with JSON",
        icon: "Json.png",
        app: <JsonLab />,
        width: 782,
        height: 569,
    },
    {
        id: 19,
        name: "DevScope",
        description: "used as a github profile analyzer",
        icon: "DevScope.png",
        app: <DevScope />,
        width: 750,
        height: 666,
    },
    {
        id: 20,
        name: "Spider-Man: Mysterio Rush",
        description: "used to play game called Spider-Man: Mysterio Rush",
        icon: "SpiderMan.png",
        app: <SpiderMan />,
        width: 750,
        height: 666,
    },
    {
        id: 21,
        name: "Assassin's Hunt",
        description: "used to play game called Hunters Assasin",
        icon: "Hunter.png",
        app: <Hunter />,
        width: 460,
        height: 600,
    },
    {
        id: 22,
        name: "TypingTest.com",
        description: "used to test your typing speed",
        icon: "TypingTest.png",
        app: <TypingTest />,
        width: 750,
        height: 666,
    },
    {
        id: 23,
        name: "HackClub",
        description: "used to explore the hackclub website",
        icon: "HackClub.png",
        app: <HackClub />,
        width: 750,
        height: 666,
    },
    {
        id: 24,
        name: "MoneyTrail",
        description: "used to track expense",
        icon: "MoneyTrail.png",
        app: <MoneyTrail />,
        width: 770,
        height: 666,
    },
    {
        id: 25,
        name: "Weather",
        description: "used to know about the weather",
        icon: MenuIconApperance[iconStyle].Weather,
        app: <Weather />,
        width: 540,
        height: 440,
    },
    {
        id: 26,
        name: "Pomodoro",
        description: "used as a pomodoro",
        icon: "Pomodoro.png",
        app: <Pomodoro />,
        width: 300,
        height: 300,
    },
    {
        id: 27,
        name: "Captain America: Shield Strike",
        description: "used to play game Captain America: Shield Strike",
        icon: "CaptainAmerica.png",
        app: <Captain />,
        width: 750,
        height: 666,
    },
    {
        id: 28,
        name: "Colour",
        description: "used as a color picker",
        icon: MenuIconApperance[iconStyle].ColorPicker,
        app: <MyColorPicker />,
        width: 550,
        height: 390,
    },
    {
        id: 29,
        name: "Piano",
        description: "used to play piano",
        icon: MenuIconApperance[iconStyle].Piano,
        app: <Piano />,
        width: 800,
        height: 500,
    },
    {
        id: 30,
        name: "Thor : Boss Battle",
        description: "used to play Thor : Boss Battle",
        icon: "Thor.png",
        app: <Thor />,
        width: 750,
        height: 666,
    },
    {
        id: 31,
        name: "Kobashi",
        description: "used as terminal for the os",
        icon: MenuIconApperance[iconStyle].Terminal,
        app: <Terminal />,
        width: 520,
        height: 400,
    },
    {
        id: 32,
        name: "Kobai",
        description: "used as the ai assistant in the os",
        icon: "./chatBot.png",
        app: <ChatBot />,
        width: 400,
        height: 500,
    },
    {
        id: 33,
        name: "Ben10: Omni Switch",
        description: "used to play Ben10: Omni Switch",
        icon: "./Ben10.png",
        app: <Ben10S />,
        width: 750,
        height: 666,
    },
    {
        id: 34,
        name: "Dr. Who: Dalack Hack",
        description: "used to play Dr. Who: Dalack Hack",
        icon: "./Dr. Who.png",
        app: <DelackHack />,
        width: 750,
        height: 666,
    },
    {
        id: 35,
        name: "Ben10: Omni Glitch",
        description: "used to play Ben10: omni Glitch",
        icon: "./Ben10-2.png",
        app: <Ben10G />,
        width: 750,
        height: 666,
    },
]