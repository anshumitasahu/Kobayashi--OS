const KEY = "widget-settings";

export function loadWidgetSettings() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
        return {};
    }
}

export function saveWidgetSetting(name, value) {
    try {
        localStorage.setItem(KEY, JSON.stringify({ ...loadWidgetSettings(), [name]: value }));
    } catch { /* ignore */ }
}

export function readNotes() {
    try {
        const raw = localStorage.getItem("notes");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") {
            return parsed.trim() ? [{ id: "legacy", text: parsed, color: "#fef08a" }] : [];
        }
        if (Array.isArray(parsed)) return parsed.filter((n) => n && typeof n.text === "string");
        return [];
    } catch {
        return [];
    }
}

export function readWeatherHistory() {
    try {
        const parsed = JSON.parse(localStorage.getItem("koba-weather-history"));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function readWeatherCache() {
    try {
        return JSON.parse(localStorage.getItem("koba-weather-cache")) || null;
    } catch {
        return null;
    }
}
