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
    handleSearchWeb,
    handlePlayMusic,
    handleWallpaperFromUrl,
    handleWallpaper,
    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWidgets,
} from "./Capabilities.jsx";
import { ChatsCommand } from "./ChatCommands.jsx";

export const FunctionRegistry = {
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
    handleSearchWeb,
    handlePlayMusic,
    handleWallpaperFromUrl,
    handleWallpaper,
    handleBrightness,
    handleIncreaseBrightness,
    handleDecreaseBrightness,
    handleWidgets,
};

export async function processCommand(commandData) {
    const { command, params = {} } = commandData;

    const commandDefinition = ChatsCommand.find(
        (item) => item.command === command || item.function === command
    );

    if (!commandDefinition) {
        throw new Error(`Unknown command: ${command}`);
    }

    const fn = FunctionRegistry[commandDefinition.function];

    if (typeof fn !== "function") {
        throw new Error(`Function "${commandDefinition.function}" is not registered`);
    }

    const args = (commandDefinition.params || []).map((paramName) => params[paramName]);

    return await fn(...args);
}

export function toCommandReply(result, commandName) {
    if (result === true || result === undefined || result === null) {
        return { reply: `Executed: ${commandName}`, speakText: null };
    }
    if (typeof result === "object" && result.message) {
        return { reply: `${result.message}`, speakText: `${result.message}` };
    }
    return { reply: `${result}`, speakText: null };
}
