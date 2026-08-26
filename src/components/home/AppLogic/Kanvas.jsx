import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function Kanvas() {
    return (
        <div className="border border-neutral-500 rounded-xl w-full h-full overflow-hidden">
            <Tldraw />
        </div>
    )
}