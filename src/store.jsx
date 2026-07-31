import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import Wallpaper from './components/home/AppLogic/Settings/Wallpaper';
export const useAppStore = create((set) => ({
    openedApps: [],
    Wallpaper: localStorage.getItem("Wallpaper") || "./bg2.png",
    openedSetting: <Wallpaper />,
    highestZindex: 1,
    Brightness: localStorage.getItem("Brightness") || 100,
    IconStyle: localStorage.getItem("IconStyle") || "Colloid",
    setBrightness: (Brightness) => {
        localStorage.setItem("Brightness", Brightness);
        set({ Brightness })
    },
    setIconStyle: (IconStyle) => {
        localStorage.setItem("IconStyle", IconStyle)
        set({ IconStyle })
    },
    openApp: (app) => {
        const uniqueId = uuidv4();
        set((state) => ({
            openedApps: [...state.openedApps, { ...app, id: uniqueId, zIndex: state.highestZindex + 1 }],
            highestZindex: state.highestZindex + 1
        }))
    },
    closeApp: (appId) => {
        set((state) => ({
            openedApps: state.openedApps.filter((app) => app.id !== appId)
        }));
    },
    setWallpaper: (Wallpaper) => {
        localStorage.setItem("Wallpaper", Wallpaper);
        set({ Wallpaper });
    },
    bringToFront: (id) => {
        set(state => {
            const newZ = state.highestZindex + 1;

            return {
                highestZindex: newZ,
                openedApps: state.openedApps.map((app) => {
                    if (app.id === id) {
                        return {
                            ...app, zIndex: newZ
                        }
                    } else {
                        return app
                    }
                })
            }
        })
    },
    openSetting: (setting) => {
        set({ openedSetting: setting.setting })
    }
}));
