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