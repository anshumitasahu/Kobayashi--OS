import { useEffect, useRef, useState } from "react";
import { savePhoto, getPhotos } from "../../../DB/IndexedDB";

export default function Camera() {
    const videoRef = useRef(null);
    const dbRef = useRef(null);
    const canvasRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [lastPhoto, setLastPhoto] = useState(null);
    const [dbReady, setDbReady] = useState(false);

    useEffect(() => {
        const request = indexedDB.open("cameraDB", 1);
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
        if (!dbReady) return;

        const loadLastPhoto = async () => {
            try {
                const photos = await getPhotos();

                if (photos.length === 0) {
                    setLastPhoto(null);
                    return;
                }

                const lastPhoto = photos[photos.length - 1];

                if (lastPhoto?.image) {
                    const url = URL.createObjectURL(lastPhoto.image);
                    setLastPhoto(url);

                    return () => URL.revokeObjectURL(url);
                }
            } catch (error) {
                console.error("Failed to load last photo:", error);
            }
        };

        loadLastPhoto();
    }, [dbReady]);

    useEffect(() => {
        let streaming = null;
        async function startCamera() {
            try {
                streaming = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, },
                });

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
                streaming.getTracks().forEach((track) => track.stop())
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

        canvas.toBlob(async (blob) => {
            if (!blob) {
                console.error("Failed to create image blob");
                return;
            }

            try {
                await savePhoto(blob);
                const imageUrl = URL.createObjectURL(blob);
                setCapturedPhoto(imageUrl);
                setLastPhoto(imageUrl);
                console.log("Photo saved:", blob);
            } catch (error) {
                console.error("Failed to save photo:", error);
            }
        }, "image/png");
    };

    return (
        <div className="w-full h-full overflow-scroll bg-white rounded-md px-6 py-3">
            <video
                ref={videoRef}
                className="aspect-video rounded-md"
                autoPlay
                playsInline
            />

            <div className="w-full flex justify-between mt-2 items-center">
                <div className="p-1 border-3 border-amber-300 rounded-full">
                    <button onClick={capturePhoto} disabled={!stream || !dbReady} className="text-black rounded-full disabled:opacity-50 w-13 h-13 bg-neutral-200 p-3" />
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div>
                    {lastPhoto && (
                        <img
                            src={lastPhoto}
                            alt="Last captured"
                            className="w-23 h-13 rounded-md object-cover"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}