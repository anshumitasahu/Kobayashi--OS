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
import TripleTileMaster from "../../components/home/AppLogic/TripleTileMaster";
import KobaSheets from "../../components/home/AppLogic/KobaSheets";
import Word from "../../components/home/AppLogic/Word";
import JsonLab from "../../components/home/AppLogic/JSONLab";
import DevScope from "../../components/home/AppLogic/DevScope";
import DragonAnhillation from "../../components/home/AppLogic/DragonGame";
import MergeMania from "../../components/home/AppLogic/MergeGame";

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
        width: 300,
        height: 481,
    },
    {
        id: 9,
        name: "YouTube",
        description: "used to watch Youtube",
        icon: MenuIconApperance[iconStyle].YouTube,
        app: <YouTube />,
        width: 550,
        height: 550,
    },
    {
        id: 10,
        name: "Chess",
        description: "used to play Chess",
        icon: "./chess.png",
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
        width: 550,
        height: 500,
    },
    {
        id: 12,
        name: "Shorts",
        description: "used to doomscroll",
        icon: MenuIconApperance[iconStyle].Shorts,
        app: <Shorts />,
        width: 314,
        height: 511,
    },
    {
        id: 13,
        name: "Kanvas",
        description: "used to paint",
        icon: MenuIconApperance[iconStyle].Paint,
        app: <Kanvas />,
        width: 576,
        height: 500,
    },
    {
        id: 14,
        name: "Code Editor",
        description: "used to write code",
        icon: MenuIconApperance[iconStyle].Terminal,
        app: <Terminal />,
        width: 450,
        height: 400,
    },
    {
        id: 15,
        name: "Triple Tile Master",
        description: "used tp play game triple tile",
        icon: "triple_tile_master.png",
        app: <TripleTileMaster />,
        width: 321,
        height: 566,
    },
    {
        id: 16,
        name: "KobaSheets",
        description: "used to deal with spreadsheets",
        icon: "KobaSheets.png",
        app: <KobaSheets />,
        width: 500,
        height: 500,
    },
    {
        id: 17,
        name: "Koba Word",
        description: "used to deal with words and docx",
        icon: "TextEditor.png",
        app: <Word />,
        width: 400,
        height: 500,
    },
    {
        id: 18,
        name: "JSON Lab",
        description: "used to deal with JSON",
        icon: "Lo.png",
        app: <JsonLab />,
        width: 782,
        height: 569,
    },
    {
        id: 19,
        name: "DevScope",
        description: "used as a github profile analyzer",
        icon: "Logo-T-C.png",
        app: <DevScope />,
        width: 500,
        height: 500,
    },
    {
        id: 20,
        name: "Dragon Annihilation",
        description: "used play game called Dragon Annihilation",
        icon: "DragonGame.png",
        app: <DragonAnhillation />,
        width: 485,
        height: 655,
    },
    {
        id: 21,
        name: "Merge Mania",
        description: "used to play game called merge mania",
        icon: "merge-mania.png",
        app: <MergeMania />,
        width: 460,
        height: 600,
    },
]