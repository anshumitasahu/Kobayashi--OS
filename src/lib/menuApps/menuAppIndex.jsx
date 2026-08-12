import Calculator from "../../components/home/AppLogic/Calculator";
import ToDos from "../../components/home/AppLogic/ToDoList";
import Settings from "../../components/home/AppLogic/Settings";
import Gallery from "../../components/home/AppLogic/Gallery";
import Browser from "../../components/home/AppLogic/Browser";
import Notes from "../../components/home/AppLogic/Notes";
import Camera from "../../components/home/AppLogic/Camera";
import { MenuIconApperance } from "./MenuAppsIcons";

export const AppsInMenu = (iconStyle = "Colloid") => [
    {
        id: 1,
        name: "Calculator",
        description: "use to calucate stuffs",
        icon: MenuIconApperance[iconStyle].Calculator,
        app: <Calculator />,
        width: 290,
        height: 500,
    },
    {
        id: 2,
        name: "Todo",
        description: "use to do todo list",
        icon: MenuIconApperance[iconStyle].ToDo,
        app: <ToDos />,
        width: 400,
        height: 280,
    },
    {
        id: 3,
        name: "Settings",
        description: "use to customize the desktop",
        icon: MenuIconApperance[iconStyle].Settings,
        app: <Settings />,
        width: 688,
        height: 400,
    },
    {
        id: 4,
        name: "Gallery",
        description: "use to slide image carsouel",
        icon: MenuIconApperance[iconStyle].Gallery,
        app: <Gallery />,
        width: 500,
        height: 400,
    },
    {
        id: 5,
        name: "Browser",
        description: "use as a search engine",
        icon: MenuIconApperance[iconStyle].Browser,
        app: <Browser />,
        width: 700,
        height: 500,
    },
    {
        id: 6,
        name: "Notes",
        description: "use to store thoughts and random text",
        icon: MenuIconApperance[iconStyle].Notes,
        app: <Notes />,
        width: 400,
        height: 300,
    },
    {
        id: 7,
        name: "Camera",
        description: "used to click photos",
        icon: MenuIconApperance[iconStyle].Camera,
        app: <Camera />,
        width: 484,
        height: 350,
    }
]


































// import { useEffect, useRef, useState } from "react";

// export default function Camera() {
//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [capturedPhoto, setCapturedPhoto] = useState(null);

//     useEffect(() => {
//         let mediaStream = null;

//         async function startCamera() {
//             try {
//                 mediaStream = await navigator.mediaDevices.getUserMedia({
//                     video: {
//                         width: 1280,
//                         height: 720,
//                     },
//                 });

//                 if (videoRef.current) {
//                     videoRef.current.srcObject = mediaStream;
//                 }
//             } catch (error) {
//                 console.error("Camera error:", error);
//             }
//         }

//         startCamera();

//         return () => {
//             if (mediaStream) {
//                 mediaStream.getTracks().forEach((track) => {
//                     track.stop();
//                 });
//             }
//         };
//     }, []);

//     const openDatabase = () => {
//         return new Promise((resolve, reject) => {
//             const request = indexedDB.open("cameraDB", 1);

//             request.onupgradeneeded = (event) => {
//                 const db = event.target.result;

//                 if (!db.objectStoreNames.contains("photos")) {
//                     db.createObjectStore("photos", {
//                         keyPath: "id",
//                         autoIncrement: true,
//                     });
//                 }
//             };

//             request.onsuccess = (event) => {
//                 resolve(event.target.result);
//             };

//             request.onerror = (event) => {
//                 reject(event.target.error);
//             };
//         });
//     };

//     const capturePhoto = async () => {
//         try {
//             const video = videoRef.current;
//             const canvas = canvasRef.current;

//             if (!video || !canvas) {
//                 throw new Error("Video or canvas is not available");
//             }

//             const ctx = canvas.getContext("2d");

//             canvas.width = 1280;
//             canvas.height = 720;

//             ctx.drawImage(
//                 video,
//                 0,
//                 0,
//                 canvas.width,
//                 canvas.height
//             );

//             const blob = await new Promise((resolve, reject) => {
//                 canvas.toBlob(
//                     (blob) => {
//                         if (blob) {
//                             resolve(blob);
//                         } else {
//                             reject(new Error("Failed to create image blob"));
//                         }
//                     },
//                     "image/png"
//                 );
//             });

//             // Show captured image
//             const imageUrl = URL.createObjectURL(blob);
//             setCapturedPhoto(imageUrl);

//             // Open IndexedDB
//             const db = await openDatabase();

//             // Save image
//             const transaction = db.transaction("photos", "readwrite");
//             const store = transaction.objectStore("photos");

//             const request = store.add({
//                 image: blob,
//                 createdAt: new Date(),
//             });

//             request.onsuccess = () => {
//                 console.log("Photo saved successfully");
//             };

//             request.onerror = (event) => {
//                 console.error(
//                     "Failed to save photo:",
//                     event.target.error
//                 );
//             };

//             transaction.onerror = (event) => {
//                 console.error(
//                     "Transaction error:",
//                     event.target.error
//                 );
//             };
//         } catch (error) {
//             console.error("Capture error:", error);
//         }
//     };

//     return (
//         <div className="w-full h-full overflow-scroll">
//             <video
//                 ref={videoRef}
//                 className="w-full aspect-video"
//                 autoPlay
//                 playsInline
//             />

//             <button onClick={capturePhoto}>
//                 Capture
//             </button>

//             <canvas
//                 ref={canvasRef}
//                 className="hidden"
//             />

//             {capturedPhoto && (
//                 <div>
//                     <img
//                         src={capturedPhoto}
//                         alt="Captured"
//                         className="w-full"
//                     />
//                 </div>
//             )}
//         </div>
//     );
// }