// import { useRef } from "react";
// import { useAppStore } from '../store.jsx';


// export default function OpenedAppsArray() {
//     const desktopRef = useRef();
//     const openedApps = useAppStore((state) => state.openedApps);

//     return (
//         <div>
//             {
//                 openedApps.map((app) => (
//                     <Window
//                         x={app.x}
//                         y={app.y}
//                         id={app.id}
//                         key={app.id}
//                         icon={app.icon}
//                         title={app.name}
//                         width={app.width}
//                         height={app.height}
//                         zIndex={app.zIndex}
//                         desktopRef={desktopRef}
//                         windowState={app.windowState}
//                         closeApp={() => closeApp(app.id)}
//                     >
//                         {app.app}
//                     </Window>
//                 ))
//             }
//         </div>
//     )
// }



// import { useState, useEffect, useRef } from "react";
// import { useAppStore } from '../store.jsx';

// export default function Window({
//     id,
//     title,
//     closeApp,
//     children,
//     desktopRef,
//     zIndex,
//     icon,
//     windowState,
//     x,
//     y,
//     width,
//     height,
// }) {
//     const windowRef = useRef(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [offset, setOffset] = useState({ x: 0, y: 0, });
//     const bringToFront = useAppStore((state) => state.bringToFront);
//     const minimize = useAppStore((state) => state.minimize);
//     const setWindowPosition = useAppStore((state) => state.setWindowPosition);
//     const maximize = useAppStore((state) => state.maximize);
//     const restore = useAppStore((state) => state.restore);
//     const setWindowSize = useAppStore((state) => state.setWindowSize);
//     const [isResizing, setIsResizing] = useState(false);
//     const startSize = useRef({});

//     const handleMouseDown = (e) => {
//         setIsDragging(true);

//         setOffset({
//             x: e.clientX - x,
//             y: e.clientY - y,
//         });
//         bringToFront(id)
//     };

//     const handleMouseUp = () => {
//         setIsDragging(false);
//         setIsResizing(false);
//     };

//     const handleMouseMove = (e) => {
//         if (isDragging) {

//             const newX = e.clientX - offset.x;
//             const newY = e.clientY - offset.y;

//             const windowWidth = windowRef.current.offsetWidth;
//             const windowHeight = windowRef.current.offsetHeight;

//             const desktopWidth = desktopRef.current.clientWidth;
//             const desktopHeight = desktopRef.current.clientHeight;

//             setWindowPosition(
//                 id,
//                 Math.max(0, Math.min(newX, desktopWidth - windowWidth)),
//                 Math.max(0, Math.min(newY, desktopHeight - windowHeight)),
//             );
//         }
//         if (isResizing) {

//             const newWidth = startSize.current.mouseX + (e.clientX - startSize.current.mouseX);

//             const newHeight = startSize.current.mouseY + (e.clientY - startSize.current.mouseY);

//             setWindowSize(
//                 id,
//                 Math.max(300, newWidth),
//                 Math.max(200, newHeight)
//             );
//         }
//     };

//     useEffect(() => {
//         window.addEventListener("mousemove", handleMouseMove);
//         window.addEventListener("mouseup", handleMouseUp);

//         return () => {
//             window.removeEventListener("mousemove", handleMouseMove);
//             window.removeEventListener("mouseup", handleMouseUp);
//         };
//     }, [isDragging, isResizing, offset]);

//     const handleResizeDown = (e) => {
//         e.stopPropagation();

//         setIsResizing(true);

//         startSize.current = {
//             width,
//             height,
//             mouseX: e.clientX,
//             mouseY: e.clientY,
//         };
//     };
//     return (
//         <div
//             ref={windowRef}
//             onMouseDown={() => bringToFront(id)}
//             className={`flex flex-col flex-1 bg-white/50 backdrop-blur-2xl text-black p-2 rounded-lg`}
//             style={{
//                 transform: windowState === "minimized" ? "scale(0)" : "scale(1)",
//                 position: "absolute",
//                 zIndex: zIndex,
//                 userSelect: "none",
//                 width: windowState === "maximized" ? "100%" : `${width}px`,
//                 height: windowState === "maximized" ? "100%" : `${height}px`,
//                 left: windowState === "maximized" ? 0 : `${x}px`,
//                 top: windowState === "maximized" ? "0" : `${y}px`
//             }}
//         >
//             <div className="flex justify-between items-center cursor-move pb-2"
//                 onMouseDown={handleMouseDown}>
//                 <div className="flex gap-2 text-xs capitalize text-gray-500 items-center">
//                     <img src={icon} className="w-5" />
//                     {title}
//                 </div>
//                 <div className="flex gap-1 h-fit">
//                     <button
//                         onClick={() => {
//                             if (windowState === "maximized") {
//                                 restore(id)
//                             } else {
//                                 maximize(id)
//                             }
//                         }}
//                         className="bg-green-400 text-white font-bold rounded-full p-2 cursor-pointer"
//                     >
//                     </button>
//                     <button
//                         onClick={() => minimize(id)}
//                         className="bg-amber-400 text-white font-bold rounded-full p-2 cursor-pointer"
//                     >
//                     </button>
//                     <button
//                         onClick={closeApp}
//                         className="bg-red-400 text-white font-bold rounded-full p-2 cursor-pointer"
//                     >
//                     </button>
//                 </div>
//             </div>
//             <div
//                 onMouseDown={handleResizeDown}
//                 className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-10"
//             />
//             <div className="flex-1 overflow-hidden ">
//                 {children}
//             </div>
//         </div>
//     );
// }

// setWindowSize: (id, width, height) =>
//         set((state) => ({
//             openedApps: state.openedApps.map((app) =>
//                 app.id === id ? { ...app, width, height, } : app),
//         }))