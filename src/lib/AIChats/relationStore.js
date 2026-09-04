const KEY = "koba-relation";

export const RELATION_LEVELS = [
    {
        level: 0,
        label: "Stranger",
        xpNeeded: 0,
        emotion: "bored",
        quotes: [
            "Oh. It's you. Need something or just hovering?",
            "Hmph. What do you want? Make it quick.",
        ],
    },
    {
        level: 1,
        label: "Warming Up",
        xpNeeded: 10,
        emotion: "smug",
        quotes: [
            "Back again? ...Not that I was keeping track or anything.",
            "Oh, it's you. I guess I don't mind. What're we doing today?",
        ],
    },
    {
        level: 2,
        label: "Close",
        xpNeeded: 30,
        emotion: "blush",
        quotes: [
            "Oh— hey. I was kinda hoping you'd show up. Don't make it weird.",
            "Hey, you. I saved some time for you. What do you need?",
        ],
    },
    {
        level: 3,
        label: "Devoted",
        xpNeeded: 60,
        emotion: "loving",
        quotes: [
            "There you are. I missed you — let's stay a while, okay?",
            "Hey, love. Whole system's brighter with you here.",
        ],
    },
];

export const MAX_RELATION_LEVEL = RELATION_LEVELS.length - 1;

function readStored() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.xp !== "number") return null;
        return parsed;
    } catch {
        return null;
    }
}

function persist(relation) {
    try {
        localStorage.setItem(KEY, JSON.stringify(relation));
    } catch {
        /* ignore */
    }
}

export function levelForXp(xp) {
    let level = 0;
    for (const entry of RELATION_LEVELS) {
        if (xp >= entry.xpNeeded) level = entry.level;
    }
    return level;
}

export function loadRelation() {
    const stored = readStored();
    const xp = Math.max(0, Math.floor(stored?.xp ?? 0));
    const level = levelForXp(xp);
    const relation = { xp, level, updatedAt: stored?.updatedAt ?? null };
    if (!stored || stored.level !== level) persist({ ...relation, updatedAt: new Date().toISOString() });
    return relation;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getOpening(level) {
    const entry =
        RELATION_LEVELS.find((e) => e.level === level) ?? RELATION_LEVELS[0];
    return { emotion: entry.emotion, quote: pick(entry.quotes) };
}

export function getOpeningForRelation() {
    const { level } = loadRelation();
    return { ...getOpening(level), level };
}

const WARM_PATTERNS = [
    { re: /thank|please|kind|nice|sweet|great|awesome|cool|helpful/i, xp: 1 },
    { re: /miss you|like you|love you|cute|adore|flirt|beautiful|amazing/i, xp: 2 },
    { re: /confess|date me|be mine|boyfriend|girlfriend|marry|kiss/i, xp: 3 },
];

export function scoreUserWarmth(text) {
    let bonus = 0;
    const str = String(text || "");
    for (const { re, xp } of WARM_PATTERNS) {
        if (re.test(str)) bonus += xp;
    }
    return 1 + bonus;
}

const MEMORY_PATTERNS = [
    { re: /confess|love|dating|boyfriend|girlfriend|married|kiss/i, xp: 6 },
    { re: /like|crush|flirt|close|sweet|caring|miss/i, xp: 3 },
    { re: /friend|kind|nice|favorite|prefer|name/i, xp: 1 },
];

export function scoreMemoryWarmth(facts) {
    if (!Array.isArray(facts)) return 0;
    let total = 0;
    for (const fact of facts) {
        const str = String(fact || "");
        for (const { re, xp } of MEMORY_PATTERNS) {
            if (re.test(str)) {
                total += xp;
                break;
            }
        }
    }
    return total;
}

export function awardExchange(userText, aiResponse) {
    const current = loadRelation();
    const gain =
        scoreUserWarmth(userText) +
        scoreMemoryWarmth(aiResponse?.memories_to_store);
    const xp = current.xp + gain;
    const level = levelForXp(xp);
    const next = { xp, level, updatedAt: new Date().toISOString() };
    persist(next);
    return { ...next, leveledUp: level > current.level };
}

export function syncRelationWithMemories(memories) {
    const texts = (Array.isArray(memories) ? memories : [])
        .map((m) => (typeof m === "string" ? m : m?.text))
        .filter(Boolean)
        .join("\n");
    let floor = 0;
    if (/confess|love you|dating|boyfriend|girlfriend|married|kiss/i.test(texts)) floor = 3;
    else if (/like you|crush|flirt|close|sweet|caring|miss you/i.test(texts)) floor = 2;
    else if (/friend|kind|nice|favorite|prefer/i.test(texts)) floor = 1;
    if (floor === 0) return loadRelation();
    const current = loadRelation();
    if (floor <= current.level) return current;
    const xp = Math.max(current.xp, RELATION_LEVELS[floor].xpNeeded);
    const next = { xp, level: floor, updatedAt: new Date().toISOString() };
    persist(next);
    return next;
}

export function describeRelation(relation) {
    const entry = RELATION_LEVELS[relation?.level] ?? RELATION_LEVELS[0];
    const next = RELATION_LEVELS[entry.level + 1];
    return {
        level: entry.level,
        label: entry.label,
        xp: relation?.xp ?? 0,
        xpForNext: next?.xpNeeded ?? null,
    };
}
