import { useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

export default function MyColorPicker() {
    const [color, setColor] = useColor("#ff0000");
    const [copied, setCopied] = useState(false);

    const copyColor = async () => {
        await navigator.clipboard.writeText(color.hex);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div className="w-full h-full">
            <ColorPicker color={color} onChange={setColor} />
            <p>Selected color: {color.hex}</p>
            <button onClick={copyColor}>
                {copied ? "Copied!" : "Copy"}
            </button>
        </div>
    );
}
