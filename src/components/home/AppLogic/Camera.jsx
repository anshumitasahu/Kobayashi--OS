import { useEffect, useRef, useState } from "react";

export default function Camera() {
    const videoRef = useRef();
    const [stream, setStream] = useState();

    useEffect(() => {
        let streaming = null;
        async function toFetch() {
            try {
                streaming = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = streaming;
                    videoRef.current.onloadmetadata = () => {
                        videoRef.current.play()
                        console.log(videoRef.current, streaming)
                    }
                }
            } catch (error) {
                console.log(error + "this is the error message")
            }
        }

        setStream(streaming);
        toFetch();
    }, [])
    return (
        <div>
            <video ref={videoRef} className="w-full aspect-video" autoPlay></video>
        </div>
    )
}