import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useAppStore = create((set) => ({
    openedApps: [],
    openApp: (app) => {
        const uniqueId = uuidv4();
        set((state) => ({
            openedApps: [...state.openedApps, { ...app, id: uniqueId }]
        }))
    },
    closeApp: (appId) => {
        set((state) => ({
            openedApps: state.openedApps.filter((app) => app.id !== appId)
        }))
    }
}));
