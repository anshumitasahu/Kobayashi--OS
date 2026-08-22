import { AppsInMenu } from "../menuApps/menuAppIndex";
import { useAppStore } from "../../store";
import Browser from "../../components/home/AppLogic/Browser";
import Camera from "../../components/home/AppLogic/Camera";
import MusicPlayer from "../../components/home/AppLogic/MusicPlayer";

export function openAppByName(name) {
    const openApp = useAppStore.getState().openApp;
    const apps = AppsInMenu();

    const app = apps.find((item) => item.name.toLowerCase() === name.toLowerCase())

    if (!app) {
        console.error(`App "${name}" not found`);
        return false;
    }
    openApp(app);
    return true;
}


export function handleSearchWeb(query) {
    const openApp = useAppStore.getState().openApp;

    openApp({
        id: 5,
        name: "Browser",
        description: "use as a search engine",
        icon: "./colloid/browser.svg",
        app: <Browser searchQuery={query} />,
        width: 700,
        height: 500,
    });

    return true;
}

export function handleOpenCalculator() {
    return openAppByName("Calculator");
}

export function handleOpenBrowser() {
    return openAppByName("Browser");
}

export function handleOpenCamera() {
    return openAppByName("Camera");
}

export function handleOpenMusic() {
    return openAppByName("Music Player");
}

export function handleOpenYouTube() {
    return openAppByName("YouTube");
}

export function handleOpenGallery() {
    return openAppByName("Gallery");
}

export function handleOpenNotes() {
    return openAppByName("Notes");
}

export function handleOpenSettings() {
    return openAppByName("Settings");
}

export function handleOpenTodo() {
    return openAppByName("Todo");
}

export function handleOpenGames() {
    return openAppByName("Games");
}

export function handleOpenFileManager() {
    return openAppByName("File Manager");
}

export function handleOpenShorts() {
    return openAppByName("Shorts");
}

export function handleTakePicture() {
    const openApp = useAppStore.getState().openApp;

    openApp({
        id: 7,
        name: "Camera",
        description: "used to click photos",
        icon: "./colloid/camera.svg",
        app: <Camera autoCapture={true} />,
        width: 650,
        height: 480,
    });
    return true;
}

export function handlePlayMusic() {
    const openApp = useAppStore.getState().openApp;
    openApp({
        id: 8,
        name: "Music Player",
        description: "used to listen Music",
        icon: "./colloid/music.svg",
        app: <MusicPlayer autoPlay={true} />,
        width: 250,
        height: 450,
    });

    return true;
}

export function handleBrightness() {
    return useAppStore.getState().Brightness;
}

export function handleIncreaseBrightness() {
    const { Brightness, setBrightness } = useAppStore.getState();

    const newBrightness = Math.min(
        Brightness + 10,
        100
    );
    setBrightness(newBrightness);
    return newBrightness;
}

export function handleDecreaseBrightness() {
    const { Brightness, setBrightness } = useAppStore.getState();
    const newBrightness = Math.max(
        Brightness - 10,
        20
    );
    setBrightness(newBrightness);
    return newBrightness;
}

export function handleWallpaper(
    wallpaper = "./bg1.jpg"
) {
    const setWallpaper = useAppStore.getState().setWallpaper;

    setWallpaper(wallpaper);
    return wallpaper;
}

export function handleWidgets() {
    const toggleWidgetMenu = useAppStore.getState().toggleWidgetMenu;

    toggleWidgetMenu();
    return true;
}