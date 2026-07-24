import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Wall } from '@phosphor-icons/react';

export const useAppStore = create((set) => ({
    openedApps: [],
    Wallpaper: "/bg2.png",
    openApp: (app) => {
        const uniqueId = uuidv4();
        set((state) => ({
            openedApps: [...state.openedApps, { ...app, id: uniqueId }]
        }));
    },
    closeApp: (appId) => {
        set((state) => ({
            openedApps: state.openedApps.filter((app) => app.id !== appId)
        }));
    },
    setWallpaper: (Wallpaper) => {
        set({ Wallpaper });
    },
}));
