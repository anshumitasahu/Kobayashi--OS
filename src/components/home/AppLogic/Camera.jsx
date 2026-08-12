import { useEffect, useRef, useState } from "react";

export default function Camera() {
    const videoRef = useRef(null);
    const dbRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
        const request = indexedDB.open("cameraDBTest", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("photos")) {
                db.createObjectStore("photos", {
                    keyPath: "id",
                    autoIncrement: true,
                });
            }
        };
        request.onsuccess = (event) => {
            dbRef.current = event.target.result;
            setDbReady(true);
        };
        request.onerror = (event) => {
            console.error("IndexedDB ERROR:", event.target.error);
        };
    }, []);

    useEffect(() => {
        let streaming = null;
        async function startCamera() {
            try {
                streaming = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, } });
                if (videoRef.current) {
                    videoRef.current.srcObject = streaming;
                    setStream(streaming);
                }
            } catch (error) {
                console.error("Camera error:", error);
            }
        }

        startCamera();


        return () => {
            if (streaming) {
                streaming.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, []);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            return;
        }

        if (!dbRef.current) {
            console.error("IndexedDB is not ready");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = 1280;
        canvas.height = 720;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (!blob) {
                console.error("Failed to create image blob");
                return;
            }

            const imageUrl = URL.createObjectURL(blob);
            setCapturedPhoto(imageUrl);

            const transaction = dbRef.current.transaction("photos", "readwrite");
            const store = transaction.objectStore("photos");

            const request = store.add({
                image: blob,
                createdAt: new Date(),
            });

            // request.onsuccess = () => {
            //     console.log("Photo saved to IndexedDB");
            // };

            request.onerror = (event) => {
                console.error(
                    "Failed to save photo:",
                    event.target.error
                );
            };
        },
            "image/png"
        );
    };

    return (
        <div className="w-full h-full overflow-scroll">
            <video ref={videoRef} className="w-full aspect-video" autoPlay playsInline />

            <button onClick={capturePhoto} disabled={!stream || !dbReady} className="text-black rounded disabled:opacity-50" >
                Capture
            </button>

            <canvas ref={canvasRef} className="hidden" />

            {capturedPhoto && (
                <div>
                    <img src={capturedPhoto} alt="Captured" className="w-full" />
                </div>
            )}
        </div>
    );
}
