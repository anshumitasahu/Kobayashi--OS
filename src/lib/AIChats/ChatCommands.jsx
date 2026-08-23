export const ChatsCommand = [
    {
        command: "open app",
        description: "Open an application in Kobayashi OS",
        function: "openAppByName",
        params: ["appName"],
    },

    {
        command: "search in web",
        description: "Search the web using the Kobayashi OS Browser",
        function: "handleSearchWeb",
        params: ["query"],
    },

    {
        command: "take picture",
        description: "Open the camera and automatically take a picture",
        function: "handleTakePicture",
        params: [],
    },

    {
        command: "play music",
        description: "Open the music player and automatically play music",
        function: "handlePlayMusic",
        params: [],
    },

    {
        command: "get brightness",
        description: "Get the current screen brightness",
        function: "handleBrightness",
        params: [],
    },

    {
        command: "increase brightness",
        description: "Increase the screen brightness",
        function: "handleIncreaseBrightness",
        params: [],
    },

    {
        command: "decrease brightness",
        description: "Decrease the screen brightness",
        function: "handleDecreaseBrightness",
        params: [],
    },

    {
        command: "set wallpaper",
        description: "Change the desktop wallpaper",
        function: "handleWallpaper",
        params: ["wallpaper"],
    },

    {
        command: "toggle widgets",
        description: "Open or close the widget menu",
        function: "handleWidgets",
        params: [],
    },
];