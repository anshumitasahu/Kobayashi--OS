import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Piano as PianoKeyboard,
    KeyboardShortcuts,
    MidiNumbers
} from 'react-piano';

import * as Tone from 'tone';
import 'react-piano/dist/styles.css';
import { MusicNoteIcon } from '@phosphor-icons/react';
import { getAllSongs, saveSong, deleteSongById, getMeta, setMeta } from '../../../DB/pianoDB';

const TONE_PRESETS = [
    {
        id: 'grand',
        label: 'Grand',
        voice: Tone.Synth,
        volume: -4,
        options: {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 1.2 },
        },
    },
    {
        id: 'bright',
        label: 'Bright Pop',
        voice: Tone.Synth,
        volume: -10,
        options: {
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.003, decay: 0.2, sustain: 0.1, release: 0.8 },
        },
    },
    {
        id: 'electric',
        label: 'Electric Piano',
        voice: Tone.FMSynth,
        volume: -6,
        options: {
            harmonicity: 3,
            modulationIndex: 14,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 1.5 },
            modulation: { type: 'sine' },
            modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 1 },
        },
    },
    {
        id: 'organ',
        label: 'Organ',
        voice: Tone.Synth,
        volume: -12,
        options: {
            oscillator: { type: 'square' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 1, release: 0.3 },
        },
    },
    {
        id: 'strings',
        label: 'Strings',
        voice: Tone.Synth,
        volume: -10,
        options: {
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.4, decay: 0.2, sustain: 0.8, release: 1.5 },
        },
    },
    {
        id: 'bell',
        label: 'Bell',
        voice: Tone.FMSynth,
        volume: -8,
        options: {
            harmonicity: 5,
            modulationIndex: 20,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.6, sustain: 0, release: 2 },
            modulation: { type: 'sine' },
            modulationEnvelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 1 },
        },
    },
];

let activeSynth = null;

function buildSynth(preset) {
    if (activeSynth) {
        try { activeSynth.releaseAll(); } catch { /* noop */ }
        activeSynth.dispose();
    }
    activeSynth = new Tone.PolySynth(preset.voice, {
        ...preset.options,
        volume: preset.volume,
    }).toDestination();
    return activeSynth;
}

buildSynth(TONE_PRESETS[0]);

const FIRST_NOTE = MidiNumbers.fromNote('c4');
const LAST_NOTE = MidiNumbers.fromNote('f5');

const CATEGORIES = ['Nursery', 'Celebration', 'Holiday', 'Classical', 'Folk', 'Custom'];
const DIFFICULTIES = ['Beginner', 'Easy', 'Medium'];

const PRESET_SONGS = [
    {
        id: 'twinkle',
        title: 'Twinkle Twinkle',
        notes: ['a', 'a', 'g', 'g', 'h', 'h', 'g', 'f', 'f', 'd', 'd', 's', 's', 'a'],
        category: 'Nursery',
        tags: ['kids', 'classic', 'lullaby'],
        difficulty: 'Beginner',
        description: 'The classic first song — slow and repetitive.',
        builtIn: true,
        createdAt: 1,
    },
    {
        id: 'happy-birthday',
        title: 'Happy Birthday',
        notes: ['a', 'a', 's', 'a', 'f', 'd', 'a', 'a', 's', 'a', 'g', 'f', 'a', 'a', 'k', 'h', 'f', 'd', 's', 'j', 'j', 'h', 'f', 'g', 'f'],
        category: 'Celebration',
        tags: ['party', 'classic'],
        difficulty: 'Easy',
        description: 'For birthdays — slightly longer phrasing.',
        builtIn: true,
        createdAt: 2,
    },
    {
        id: 'jingle-bells',
        title: 'Jingle Bells',
        notes: ['d', 'd', 'd', 'd', 'd', 'd', 'd', 'g', 'a', 's', 'd', 'f', 'f', 'f', 'f', 'f', 'd', 'd', 'd', 'd', 's', 's', 'd', 's', 'g'],
        category: 'Holiday',
        tags: ['christmas', 'cheerful'],
        difficulty: 'Easy',
        description: 'Bouncy holiday chorus.',
        builtIn: true,
        createdAt: 3,
    },
];

function parseNoteInput(input, validKeys) {
    if (!input || !input.trim()) return { notes: [], error: 'Type some keys first, e.g. a x2, w, f, e' };
    const cleaned = input.trim().replace(/^\(+|\)+$/g, '');
    const rawTokens = cleaned.split(/[\s,|]+/).filter(Boolean);
    if (rawTokens.length === 0) return { notes: [], error: 'No notes found.' };

    const notes = [];
    for (let raw of rawTokens) {
        const token = raw.replace(/^\(+|\)+$/g, '');
        if (!token) continue;
        const m = token.match(/^(.)(?:[xX*×](\d+))?$/);
        if (!m) return { notes: [], error: `Can't read "${token}". Use like a, w, or aX3.` };
        let key = m[1].toLowerCase();
        const repeat = m[2] ? parseInt(m[2], 10) : 1;
        if (!validKeys.has(key)) return { notes: [], error: `"${m[1]}" is not a piano key here. Try: ${[...validKeys].slice(0, 10).join(' ')} …` };
        if (repeat < 1 || repeat > 8) return { notes: [], error: `Repeat for "${key}" must be 1–8.` };
        for (let i = 0; i < repeat; i++) notes.push(key);
        if (notes.length > 64) return { notes: [], error: 'Keep it under 64 notes.' };
    }
    if (notes.length === 0) return { notes: [], error: 'No valid notes.' };
    return { notes, error: null };
}

const parseTagsInput = (input) =>
    input.split(/[,]+/).map((t) => t.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 16)).filter(Boolean).slice(0, 6);

const stopPianoKeysWhenTyping = (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) {
        e.stopPropagation();
    }
};

const iconBtn =
    'w-fit h-7 flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors text-sm leading-none gap-1 px-2';

const keepFocus = (e) => e.preventDefault();

const fieldCls =
    'w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm outline-none focus:border-neutral-900 placeholder:text-neutral-400 bg-white';

const Piano = () => {
    const keyboardShortcuts = useMemo(
        () =>
            KeyboardShortcuts.create({
                firstNote: FIRST_NOTE,
                lastNote: LAST_NOTE,
                keyboardConfig: KeyboardShortcuts.HOME_ROW,
            }),
        []
    );

    const keyToMidi = useMemo(() => {
        const map = {};
        keyboardShortcuts.forEach((s) => {
            map[s.key] = s.midiNumber;
        });
        return map;
    }, [keyboardShortcuts]);

    const validKeys = useMemo(() => new Set(Object.keys(keyToMidi)), [keyToMidi]);

    const [songs, setSongs] = useState(PRESET_SONGS);
    const [dbReady, setDbReady] = useState(false);
    const [activeSongId, setActiveSongId] = useState(PRESET_SONGS[0].id);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [demoNotes, setDemoNotes] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [flashWrong, setFlashWrong] = useState(false);
    const [isPlayingDemo, setIsPlayingDemo] = useState(false);
    const [songName, setSongName] = useState('');
    const [songInput, setSongInput] = useState('');
    const [songCategory, setSongCategory] = useState('Custom');
    const [songTags, setSongTags] = useState('');
    const [songDifficulty, setSongDifficulty] = useState('Beginner');
    const [formError, setFormError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [loopFlash, setLoopFlash] = useState(false);
    const [query, setQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [toneId, setToneId] = useState(TONE_PRESETS[0].id);
    const demoCancel = useRef(false);
    const isPlayingRef = useRef(false);
    const indexRef = useRef(0);
    const heldRef = useRef(new Set());
    const songRef = useRef(PRESET_SONGS[0]);
    const flashTimer = useRef(null);
    const loopTimer = useRef(null);
    const pianoWrapRef = useRef(null);
    const stripRef = useRef(null);
    const [pianoWidth, setPianoWidth] = useState(640);

    const activeSong = songs.find((s) => s.id === activeSongId) || songs[0] || PRESET_SONGS[0];

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const stored = await getAllSongs();
                let list = stored && stored.length ? stored : null;
                if (!list) {
                    for (const p of PRESET_SONGS) await saveSong(p);
                    list = [...PRESET_SONGS];
                } else {
                    for (const p of PRESET_SONGS) {
                        if (!list.some((s) => s.id === p.id)) {
                            await saveSong(p);
                            list = [...list, p];
                        }
                    }
                }
                const savedActive = await getMeta('activeSongId');
                if (cancelled) return;
                setSongs(list);
                if (savedActive && list.some((s) => s.id === savedActive)) setActiveSongId(savedActive);
                setDbReady(true);
            } catch {
                if (!cancelled) setDbReady(true);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', stopPianoKeysWhenTyping, true);
        window.addEventListener('keyup', stopPianoKeysWhenTyping, true);
        return () => {
            window.removeEventListener('keydown', stopPianoKeysWhenTyping, true);
            window.removeEventListener('keyup', stopPianoKeysWhenTyping, true);
        };
    }, []);

    useEffect(() => {
        songRef.current = activeSong;
    }, [activeSong]);

    useEffect(() => () => {
        clearTimeout(flashTimer.current);
        clearTimeout(loopTimer.current);
    }, []);

    useEffect(() => {
        const el = pianoWrapRef.current;
        if (!el) return;
        const update = () => setPianoWidth(Math.max(300, Math.floor(el.clientWidth)));
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!showLibrary && !showAddModal) return;
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setShowLibrary(false);
                setShowAddModal(false);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showLibrary, showAddModal]);

    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return;
        const active = strip.querySelector('[data-current="true"]');
        if (!active) return;
        const stripRect = strip.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        strip.scrollTo({
            left: strip.scrollLeft + (activeRect.left - stripRect.left) - strip.clientWidth / 2 + activeRect.width / 2,
            behavior: 'smooth',
        });
    }, [currentIndex, activeSongId]);

    const filteredSongs = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...songs]
            .filter((s) => {
                if (filterCategory !== 'All' && (s.category || 'Custom') !== filterCategory) return false;
                if (!q) return true;
                return (
                    s.title.toLowerCase().includes(q) ||
                    (s.tags || []).some((t) => t.includes(q))
                );
            })
            .sort((a, b) => a.title.localeCompare(b.title));
    }, [songs, query, filterCategory]);

    const selectSong = (id) => {
        const song = songs.find((s) => s.id === id) || songs[0];
        if (!song) return;
        demoCancel.current = true;
        isPlayingRef.current = false;
        heldRef.current.clear();
        setIsPlayingDemo(false);
        setDemoNotes([]);
        songRef.current = song;
        indexRef.current = 0;
        setCurrentIndex(0);
        setMistakes(0);
        setLoopFlash(false);
        clearTimeout(loopTimer.current);
        setActiveSongId(song.id);
        setShowLibrary(false);
        setMeta('activeSongId', song.id).catch(() => {});
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };

    const changeTone = (id) => {
        const preset = TONE_PRESETS.find((p) => p.id === id) || TONE_PRESETS[0];
        buildSynth(preset);
        setToneId(preset.id);
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };

    const playNote = useCallback(async (midiNumber) => {
        await Tone.start();
        activeSynth.triggerAttack(Tone.Frequency(midiNumber, 'midi').toFrequency());
    }, []);

    const stopNote = useCallback((midiNumber) => {
        activeSynth.triggerRelease(Tone.Frequency(midiNumber, 'midi').toFrequency());
    }, []);

    const handleUserPlay = useCallback(
        (midiNumber) => {
            if (heldRef.current.has(midiNumber)) return;
            heldRef.current.add(midiNumber);
            if (isPlayingRef.current) return;
            const song = songRef.current;
            const idx = indexRef.current;
            if (idx >= song.notes.length) return;
            const expectedMidi = keyToMidi[song.notes[idx]];
            if (midiNumber === expectedMidi) {
                const next = idx + 1;
                if (next >= song.notes.length) {
                    setLoopFlash(true);
                    clearTimeout(loopTimer.current);
                    loopTimer.current = setTimeout(() => {
                        indexRef.current = 0;
                        setCurrentIndex(0);
                        setLoopFlash(false);
                    }, 600);
                }
                indexRef.current = next;
                setCurrentIndex(next);
            } else {
                setMistakes((m) => m + 1);
                setFlashWrong(true);
                clearTimeout(flashTimer.current);
                flashTimer.current = setTimeout(() => setFlashWrong(false), 250);
            }
        },
        [keyToMidi]
    );

    const handleUserStop = useCallback((midiNumber) => {
        heldRef.current.delete(midiNumber);
    }, []);

    const resetSong = () => {
        demoCancel.current = true;
        isPlayingRef.current = false;
        heldRef.current.clear();
        setIsPlayingDemo(false);
        setDemoNotes([]);
        indexRef.current = 0;
        setCurrentIndex(0);
        setMistakes(0);
        setLoopFlash(false);
        clearTimeout(loopTimer.current);
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };

    const playDemo = async () => {
        if (isPlayingRef.current) {
            demoCancel.current = true;
            return;
        }
        const notes = [...songRef.current.notes];
        demoCancel.current = false;
        isPlayingRef.current = true;
        setIsPlayingDemo(true);
        indexRef.current = 0;
        setCurrentIndex(0);
        setMistakes(0);
        await new Promise((r) => setTimeout(r, 300));
        for (let i = 0; i < notes.length; i++) {
            if (demoCancel.current) break;
            const midi = keyToMidi[notes[i]];
            if (midi == null) continue;
            setDemoNotes([midi]);
            indexRef.current = i + 1;
            setCurrentIndex(i + 1);
            await new Promise((r) => setTimeout(r, 420));
            if (demoCancel.current) break;
            setDemoNotes([]);
            await new Promise((r) => setTimeout(r, 80));
        }
        setDemoNotes([]);
        isPlayingRef.current = false;
        setIsPlayingDemo(false);
    };

    const handleAddSong = async () => {
        const { notes, error } = parseNoteInput(songInput, validKeys);
        if (error) {
            setFormError(error);
            return;
        }
        if (!songName.trim()) {
            setFormError('Give your song a name.');
            return;
        }
        const newSong = {
            id: `custom-${Date.now()}`,
            title: songName.trim().slice(0, 32),
            notes,
            category: songCategory || 'Custom',
            tags: parseTagsInput(songTags),
            difficulty: songDifficulty || 'Beginner',
            description: '',
            builtIn: false,
            createdAt: Date.now(),
        };
        try {
            await saveSong(newSong);
        } catch {
            setFormError('Could not save — IndexedDB unavailable.');
            return;
        }
        setSongs((prev) => [...prev, newSong]);
        setSongName('');
        setSongInput('');
        setSongTags('');
        setSongCategory('Custom');
        setSongDifficulty('Beginner');
        setFormError(null);
        setShowAddModal(false);
        selectSong(newSong.id);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setFormError(null);
    };

    const deleteCustomSong = async (id) => {
        try {
            await deleteSongById(id);
        } catch {
            return;
        }
        setSongs((prev) => prev.filter((s) => s.id !== id));
        if (activeSongId === id) {
            const fallback = songs.find((s) => s.id !== id) || PRESET_SONGS[0];
            selectSong(fallback.id);
        }
    };

    const completed = currentIndex >= activeSong.notes.length;
    const progress = activeSong.notes.length ? (currentIndex / activeSong.notes.length) * 100 : 0;
    const hasInput = songInput.trim().length > 0;
    const preview = hasInput ? parseNoteInput(songInput, validKeys) : { notes: [], error: null };

    return (
        <div className="w-full h-full flex flex-col items-center px-4 py-6 overflow-y-auto bg-white text-neutral-900">
            <style>{`
                .ReactPiano__Keyboard { border: 1px solid #e7e5e4; border-radius: 0; overflow: hidden; margin: 0 auto; }
                .ReactPiano__Key--white, .ReactPiano__Key--black { border-radius: 0 !important; }
                .ReactPiano__Key--white { border-color: #e7e5e4; }
                .ReactPiano__Key--active { background: #1c1917 !important; }
                .ReactPiano__Key--active.ReactPiano__Key--black { background: #57534e !important; }
                .ReactPiano__NoteLabel { font-size: 11px; }
            `}</style>

            <div className="w-full max-w-3xl flex flex-col gap-8">
                <div className="flex flex-wrap items-center gap-4 border-b border-neutral-200 pb-3">
                    <div className="flex gap-2 items-center justify-center">
                        <MusicNoteIcon className="w-4 h-4 text-primary" />
                        <button
                            onMouseDown={keepFocus}
                            onClick={() => setShowLibrary(true)}
                            className="flex items-center gap-1.5 text-xs font-medium text-primary cursor-pointer max-w-64 truncate hover:text-black transition-colors"
                            title="Browse songs"
                        >
                            <span className="truncate">{activeSong.title}</span>
                            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                                {activeSong.category || 'Custom'}
                            </span>
                            <span className="shrink-0 text-[10px] text-neutral-400">{songs.length} ▾</span>
                        </button>
                    </div>
                    <span className="text-xs text-neutral-400 tabular-nums">
                        {currentIndex}/{activeSong.notes.length}
                        {mistakes > 0 && ` · ${mistakes} miss${mistakes > 1 ? 'es' : ''}`}
                        {!dbReady && ' · saving…'}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                        <select
                            value={toneId}
                            onChange={(e) => changeTone(e.target.value)}
                            className={`${iconBtn} cursor-pointer outline-none max-w-28 bg-transparent`}
                            title="Change tone"
                        >
                            {TONE_PRESETS.map((t) => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                        <button onMouseDown={keepFocus} onClick={playDemo} className={iconBtn} title={isPlayingDemo ? 'Stop demo' : 'Play demo'}>
                            <span className="text-xs mr-1">Demo</span>
                            {isPlayingDemo ? '■' : '▶'}
                        </button>
                        <button onMouseDown={keepFocus} onClick={resetSong} className={iconBtn} title="Reset">
                            ↺
                        </button>
                        <button onClick={() => setShowAddModal(true)} className={iconBtn} title="Add song">
                            ＋
                        </button>
                        {!activeSong.builtIn && (
                            <button
                                onMouseDown={keepFocus}
                                onClick={() => deleteCustomSong(activeSong.id)}
                                className={`${iconBtn} hover:text-red-600`}
                                title="Delete song"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <div
                        ref={stripRef}
                        className="flex justify-start gap-2 py-2 px-[calc(50%-4.5rem)] overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {activeSong.notes.map((key, i) => {
                            const done = i < currentIndex;
                            const current = i === currentIndex && !completed;
                            const wrong = current && flashWrong;
                            const peek = !done && !current && i < currentIndex + 4;
                            return (
                                <span
                                    key={i}
                                    data-current={current}
                                    className={`flex items-center justify-center shrink-0 w-36 h-14 text-base font-mono border rounded-lg transition-all duration-150 ${wrong
                                        ? 'bg-red-100 border-red-200 text-red-700'
                                        : done
                                            ? 'bg-primary/15 border-primary/30 text-neutral-900 opacity-45 w-12 h-10 text-xs'
                                            : current
                                                ? 'bg-neutral-900 border-neutral-900 text-white scale-105 shadow-lg'
                                                : peek
                                                    ? 'bg-neutral-50 border-neutral-300 text-neutral-700'
                                                    : 'bg-white border-neutral-200 text-neutral-400 opacity-70 w-12 h-10 text-xs'
                                        }`}
                                >
                                    {key}
                                </span>
                            );
                        })}
                    </div>
                    <div className="mt-3 h-0.5 bg-neutral-100 overflow-hidden">
                        <div
                            className="h-full bg-neutral-900 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {completed ? (
                        <p className="mt-2 text-center text-xs text-neutral-400">
                            {loopFlash ? 'Nice — looping back…' : 'Complete'}
                        </p>
                    ) : (
                        <p className="mt-2 text-center text-xs text-neutral-300"></p>
                    )}
                </div>

                <div>
                    <div ref={pianoWrapRef} className="w-full flex justify-center">
                        <div className="mx-auto flex justify-center" style={{ width: pianoWidth, maxWidth: '100%' }}>
                            <PianoKeyboard
                                noteRange={{ first: FIRST_NOTE, last: LAST_NOTE }}
                                playNote={playNote}
                                stopNote={stopNote}
                                onPlayNoteInput={handleUserPlay}
                                onStopNoteInput={handleUserStop}
                                width={pianoWidth}
                                keyboardShortcuts={keyboardShortcuts}
                                activeNotes={demoNotes}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showLibrary && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={() => setShowLibrary(false)}
                >
                    <div
                        className="w-[calc(100%-2rem)] max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-7 pt-7 pb-5">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-semibold">Songs</p>
                                <button
                                    onClick={() => { setShowLibrary(false); setShowAddModal(true); }}
                                    className="px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-700 transition-colors"
                                >
                                    + New
                                </button>
                            </div>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                onKeyUp={(e) => e.stopPropagation()}
                                placeholder="Search"
                                className={`${fieldCls} mt-5`}
                            />
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {['All', ...CATEGORIES].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setFilterCategory(c)}
                                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-colors ${filterCategory === c
                                            ? 'bg-neutral-900 text-white'
                                            : 'text-neutral-500 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-2">
                            {filteredSongs.length === 0 && (
                                <p className="py-12 text-center text-sm text-neutral-400">Nothing found</p>
                            )}
                            {filteredSongs.map((song) => {
                                const selected = song.id === activeSongId;
                                return (
                                    <div
                                        key={song.id}
                                        className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-colors ${selected
                                            ? 'bg-neutral-900 text-white'
                                            : 'hover:bg-neutral-50'
                                            }`}
                                    >
                                        <button onClick={() => selectSong(song.id)} className="flex-1 min-w-0 text-left">
                                            <p className={`text-sm font-medium truncate ${selected ? 'text-white' : 'text-neutral-900'}`}>
                                                {song.title}
                                            </p>
                                            <p className={`mt-1 text-xs ${selected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                                                {song.category || 'Custom'}
                                            </p>
                                        </button>
                                        {!song.builtIn && (
                                            <button
                                                onClick={() => deleteCustomSong(song.id)}
                                                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-base transition-colors ${selected ? 'text-neutral-400 hover:text-white hover:bg-white/10' : 'text-neutral-300 hover:text-red-600 hover:bg-red-50'}`}
                                                title="Delete"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
                    onClick={closeModal}
                >
                    <div
                        className="w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl p-8 max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-base font-semibold">New song</p>
                        <div className="mt-6 flex flex-col gap-4">
                            <input
                                value={songName}
                                onChange={(e) => setSongName(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                onKeyUp={(e) => e.stopPropagation()}
                                placeholder="Name"
                                className={fieldCls}
                            />
                            <input
                                value={songInput}
                                onChange={(e) => {
                                    setSongInput(e.target.value);
                                    setFormError(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddSong();
                                    e.stopPropagation();
                                }}
                                onKeyUp={(e) => e.stopPropagation()}
                                placeholder="Notes, e.g. aX2 w f e"
                                className={`${fieldCls} font-mono`}
                            />
                            <div className="flex gap-4">
                                <select
                                    value={songCategory}
                                    onChange={(e) => setSongCategory(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className={fieldCls}
                                >
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    value={songDifficulty}
                                    onChange={(e) => setSongDifficulty(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    className={fieldCls}
                                >
                                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <input
                                value={songTags}
                                onChange={(e) => setSongTags(e.target.value)}
                                onKeyDown={(e) => e.stopPropagation()}
                                onKeyUp={(e) => e.stopPropagation()}
                                placeholder="Tags, comma separated"
                                className={fieldCls}
                            />
                        </div>
                        {(formError || (hasInput && preview.error)) && (
                            <p className="mt-4 text-xs text-red-600">{formError || preview.error}</p>
                        )}
                        <div className="mt-7 flex justify-end gap-1">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddSong}
                                className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Piano;
