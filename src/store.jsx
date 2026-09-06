import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import Display from './components/home/AppLogic/Settings/Display';
import Wallpaper from './components/home/AppLogic/Settings/Wallpaper';
import Welcome from './components/home/AppLogic/Welcome';
import { SettingsIndex } from './lib/settingsStore/settingsIndex';
import { DEFAULT_WALLPAPER, normalizeWallpaper } from './lib/wallpapers';
import Calendar from './components/home/Widgets/Calendar';
import { CalendarIcon } from '@phosphor-icons/react';
import { WidgetsStore } from './lib/Widgets/WidgetsStore';



const getSavedWidgets = () => {
    try {
        const saved = JSON.parse(localStorage.getItem("openedWidgets")) || [];

        const definitions = WidgetsStore();

        return saved
            .map((savedWidget) => {
                const definition = definitions.find((widget) => widget.id === savedWidget.id);
                if (!definition) return null;
                return {
                    ...definition,
                    ...savedWidget,
                };
            })
            .filter(Boolean);
    } catch {
        return [];
    }
};


const saveWidgets = (widgets) => {
    const data = widgets.map((widget) => ({
        id: widget.id,
        x: widget.x,
        y: widget.y,
        width: widget.width,
        height: widget.height,
    }));

    localStorage.setItem("openedWidgets", JSON.stringify(data));
};


const getInitialApps = () => {
    try {
        if (!localStorage.getItem("kobayashi-seen")) return [];
    } catch {
        return [];
    }
    return [{
        id: uuidv4(),
        name: "Welcome",
        app: <Welcome />,
        icon: "/logo.svg",
        zIndex: 1,
        x: 400,
        y: 110,
        width: 652,
        height: 524,
        windowState: "normal"
    }];
};


export const useAppStore = create((set) => ({
    openedApps: getInitialApps(),
    Wallpaper: normalizeWallpaper(localStorage.getItem("Wallpaper"), DEFAULT_WALLPAPER),
    WallpaperBlur: Number(localStorage.getItem("WallpaperBlur") ?? 0) || 0,
    WallpaperDim: Number(localStorage.getItem("WallpaperDim") ?? 0) || 0,
    highestZindex: 1,
    Brightness: localStorage.getItem("Brightness") || 100,
    IconStyle: localStorage.getItem("IconStyle") || "Colloid",
    isMenuOpen: false,
    menuZIndex: 0,
    gallerySelectedPhotoId: null,
    openedWidgets: getSavedWidgets(),
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
                    ...(app.name === "Settings" ? { settingId: app.settingId ?? SettingsIndex[0].id } : {}),
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
        const normalized = normalizeWallpaper(Wallpaper, DEFAULT_WALLPAPER);
        localStorage.setItem("Wallpaper", normalized);
        set({ Wallpaper: normalized });
    },
    setWallpaperBlur: (WallpaperBlur) => {
        const value = Math.min(24, Math.max(0, Number(WallpaperBlur) || 0));
        localStorage.setItem("WallpaperBlur", value);
        set({ WallpaperBlur: value })
    },
    setWallpaperDim: (WallpaperDim) => {
        const value = Math.min(80, Math.max(0, Number(WallpaperDim) || 0));
        localStorage.setItem("WallpaperDim", value);
        set({ WallpaperDim: value })
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
    setAppSettingId: (appId, settingId) => {
        set((state) => ({
            openedApps: state.openedApps.map((app) =>
                app.id === appId ? { ...app, settingId } : app
            ),
        }));
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
    setWindowSize: (id, newWidth, newHeight) => {
        set((state) => ({
            openedApps: state.openedApps.map((app) => {
                return (
                    app.id === id ? { ...app, width: newWidth, height: newHeight } : app
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
        set((state) => {
            console.log(state.isWidgetsMenuOpen)
            return { isWidgetsMenuOpen: !state.isWidgetsMenuOpen }
        })
    },
    openWidget: (widget) => {
        set((state) => {
            const alreadyOpen = state.openedWidgets.some((opened) => opened.id === widget.id);

            if (alreadyOpen) {
                const updatedWidgets = state.openedWidgets.filter((opened) => opened.id !== widget.id);
                saveWidgets(updatedWidgets);

                return {
                    openedWidgets: updatedWidgets,
                };
            }

            const position = state.openedWidgets.length * 30;

            const newWidget = {
                ...widget,
                x: widget.x ?? 50 + position,
                y: widget.y ?? 50 + position,
                width: widget.width ?? 280,
                height: widget.height ?? 260,
                zIndex: 0,
            };

            const updatedWidgets = [...state.openedWidgets, newWidget,];
            saveWidgets(updatedWidgets);

            return {
                openedWidgets: updatedWidgets,
            };
        });
    },
    closeWidget: (id) => {
        set((state) => {
            const updatedWidgets = state.openedWidgets.filter((widget) => widget.id !== id);
            saveWidgets(updatedWidgets);

            return {
                openedWidgets: updatedWidgets,
            };
        });
    },
    setWidgetPosition: (id, newX, newY) => {
        set((state) => {
            const updatedWidgets = state.openedWidgets.map((widget) => widget.id === id ? { ...widget, x: newX, y: newY, } : widget
            );
            saveWidgets(updatedWidgets);

            return {
                openedWidgets: updatedWidgets,
            };
        });
    },
    setWidgetSize: (id, newWidth, newHeight) => {
        set((state) => {
            const updatedWidgets = state.openedWidgets.map((widget) => widget.id === id ? { ...widget, width: newWidth, height: newHeight, } : widget
            );
            saveWidgets(updatedWidgets);

            return {
                openedWidgets: updatedWidgets,
            };
        });
    },
}));