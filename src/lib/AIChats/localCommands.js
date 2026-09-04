import {
    handleOpenCalculator,
    handleOpenBrowser,
    handleOpenCamera,
    handleOpenGallery,
    handleOpenFileManager,
    handleOpenGames,
    handleOpenSettings,
    handleOpenNotes,
    handleOpenTodo,
    handleOpenShorts,
    handleOpenYouTube,
    handleOpenMusic,
    handleTakePicture,
    handlePlayMusic,
    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWallpaper,
    handleWidgets,
} from "./Capabilities.jsx";

const EXACT_MATCHES = [
    [["open calculator", "launch calculator"], handleOpenCalculator, "Calculator App opened"],
    [["launch browser", "open browser"], handleOpenBrowser, "Browser launched"],
    [
        ["launch camera", "open camera"],
        handleOpenCamera,
        "Camera App launched. Allow camera permission to click photos.",
    ],
    [["launch gallery", "open gallery"], handleOpenGallery, "Gallery App Opened"],
    [
        ["launch file manager", "open file manager"],
        handleOpenFileManager,
        "File Manager App Opened",
    ],
    [["open games", "launch games"], handleOpenGames, "Chess game launched. Enjoy!!"],
    [["open settings", "launch settings"], handleOpenSettings, "Settings App Opened"],
    [["open notes", "launch notes"], handleOpenNotes, "Notes App Opened"],
    [["open todos", "launch todos"], handleOpenTodo, "ToDos App Opened"],
    [["open shorts", "launch shorts"], handleOpenShorts, "Shorts App Opened"],
    [["open youtube", "launch youtube"], handleOpenYouTube, "YouTube Opened"],
    [
        ["open music player", "launch music player"],
        handleOpenMusic,
        "Music player Opened",
    ],
    [
        [
            "take my picture",
            "click my picture",
            "click my photo",
            "take my photo",
            "take photo",
            "click photo",
            "take picture",
            "click picture",
        ],
        handleTakePicture,
        "Picture taken!! A beautiful face detected.",
    ],
    [
        ["play music", "play song", "play a song", "play a music"],
        handlePlayMusic,
        "Default song played!! Change yourself to listen to other songs. " +
            "(Info) Default Song: Aozora No Rhapsody - opening theme of Kobayashi OS season-1",
    ],
    [
        ["show brightness", "what is the brightness level", "show the brightness level"],
        handleBrightness,
        "Brightness showed",
    ],
    [
        ["increase brightness", "increase the brightness level"],
        handleIncreaseBrightness,
        "Increased",
    ],
    [
        ["decrease brightness", "decrease the brightness level"],
        handleDecreaseBrightness,
        "Decreased",
    ],
    [["open widgets", "close widgets"], handleWidgets, 'Widgets opened. Send "close widgets" to close.'],
    [["change wallpaper"], handleWallpaper, "Wallpaper Changed"],
];

/**
 * Handles exact-phrase commands locally without calling the AI.
 * Returns the reply string, or null when the input needs the AI.
 */
export function runLocalCommand(userInput) {
    const command = userInput.toLowerCase().trim();
    for (const [phrases, handler, reply] of EXACT_MATCHES) {
        if (phrases.includes(command)) {
            handler();
            return reply;
        }
    }
    return null;
}
