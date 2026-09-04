import { emotionsData } from "./Emotions.jsx";

export const DEFAULT_AVATAR_EMOTION = "bored";
export const DEFAULT_AVATAR_QUOTE =
    "Oh. It's you. Need something or just hovering?";

export const ALL_EMOTIONS = Object.values(emotionsData.categories).flat();

export const VALID_EMOTION_NAMES = ALL_EMOTIONS.map((e) => e.emotion);

export function formatEmotionCatalog(categories = emotionsData.categories) {
    return Object.entries(categories)
        .map(
            ([category, list]) =>
                `${category}:\n${list.map((e) => `- ${e.emotion}: ${e.description}`).join("\n")}`
        )
        .join("\n\n");
}

const EMOTION_IMAGE_MAP = Object.fromEntries(
    ALL_EMOTIONS.map((e) => [e.emotion, e.image_path.replace("/kobaAi/", "/kobaAI/")])
);

export function getEmotionImage(emotion) {
    return EMOTION_IMAGE_MAP[emotion] || EMOTION_IMAGE_MAP[DEFAULT_AVATAR_EMOTION];
}

export function normalizeEmotion(emotion) {
    if (!emotion) return DEFAULT_AVATAR_EMOTION;
    const cleaned = String(emotion).trim().toLowerCase();
    return VALID_EMOTION_NAMES.includes(cleaned) ? cleaned : DEFAULT_AVATAR_EMOTION;
}
