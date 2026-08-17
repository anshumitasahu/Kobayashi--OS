import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import Wallpaper from './components/home/AppLogic/Settings/Wallpaper';
import Welcome from './components/home/AppLogic/Welcome';
import { SettingsIndex } from './lib/settingsStore/settingsIndex';
import Calendar from './components/home/Widgets/Calendar';
import { CalendarIcon } from '@phosphor-icons/react';

export const useAppStore = create((set) => ({
    openedApps: [{
        id: uuidv4(),
        name: "Welcome",
        app: <Welcome />,
        icon: "/logo.svg",
        zIndex: 1,
        x: 350,
        y: 100,
        windowState: "normal"
    }],
    Wallpaper: localStorage.getItem("Wallpaper") || "./bg2.png",
    openedSetting: SettingsIndex[0],
    highestZindex: 1,
    Brightness: localStorage.getItem("Brightness") || 100,
    IconStyle: localStorage.getItem("IconStyle") || "Colloid",
    isMenuOpen: false,
    menuZIndex: 0,
    gallerySelectedPhotoId: null,
    openedWidgets: [{
        id: 1,
        name: "Calender",
        widgets: <Calendar />,
        icon: <CalendarIcon />
    }],
    isWidgetsMenuOpen: false,
    setGallerySelectedPhotoId: (id) =>
        set({ gallerySelectedPhotoId: id, }),
    clearGallerySelectedPhotoId: () =>
        set({ gallerySelectedPhotoId: null, }),
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
        set((state) => {
            const sameApps = state.openedApps.filter(
                (openedApp) => openedApp.name === app.name
            );
            const position = sameApps.length * 30;

            return {
                openedApps: [...state.openedApps, {
                    ...app, id: uniqueId, zIndex: state.highestZindex + 1, windowState: "normal", x: 250 + position, y: 100 + position, width: app.width ?? 500,
                    height: app.height ?? 400,
                }],
                highestZindex: state.highestZindex + 1
            }
        })
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
        set({ openedSetting: setting })
    },
    minimize: (id) => {
        set((state) => ({
            openedApps: state.openedApps.map((app) =>
                app.id === id ? { ...app, windowState: "minimized" } : app
            ),
        }));
    },
    restore: (id) => {
        set((state) => ({
            openedApps: state.openedApps.map((app) =>
                app.id === id ? { ...app, windowState: "normal" } : app
            ),
        }));
    },
    setWindowPosition: (id, newX, newY) => {
        set((state) => ({
            openedApps: state.openedApps.map((app) => {
                return (
                    app.id === id ? { ...app, x: newX, y: newY } : app
                )
            })
        }))
    },
    maximize: (id) => {
        set((state) => ({
            openedApps: state.openedApps.map((app) =>
                app.id === id ? { ...app, windowState: "maximized" } : app
            )
        }))
    },
    openMenu: () => {
        set((state) => ({
            isMenuOpen: true,
            menuZIndex: state.highestZindex + 1
        }))
    },
    closeMenu: () => {
        set((state) => ({
            isMenuOpen: false
        }))
    },
    toggleMenu: () => {
        set((state) => ({
            isMenuOpen: !state.isMenuOpen
        }))
    },
    toggleWidgetMenu: () => {
        set((state) => ({
            isWidgetsMenuOpen: !state.isWidgetsMenuOpen
        }))
    },
    
}));