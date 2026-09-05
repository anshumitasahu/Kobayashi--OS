import { useEffect, useRef, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

export default function Kanvas() {
    const containerRef = useRef(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        let rafId = 0
        let timer = 0
        let settled = 0
        let lastW = 0
        let lastH = 0

        const check = () => {
            const rect = el.getBoundingClientRect()
            const stable =
                rect.width > 100 &&
                rect.height > 100 &&
                Math.abs(rect.width - lastW) < 1 &&
                Math.abs(rect.height - lastH) < 1
            if (stable) {
                settled += 1
                if (settled >= 2) {
                    timer = window.setTimeout(() => setReady(true), 250)
                    return
                }
            } else {
                settled = 0
            }
            lastW = rect.width
            lastH = rect.height
            rafId = requestAnimationFrame(check)
        }
        rafId = requestAnimationFrame(check)
        const fallback = window.setTimeout(() => setReady(true), 1500)
        return () => {
            cancelAnimationFrame(rafId)
            window.clearTimeout(timer)
            window.clearTimeout(fallback)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="border border-neutral-500 rounded-xl w-full h-full min-h-0 overflow-hidden"
            style={{ minHeight: 200 }}
        >
            {ready ? (
                <Excalidraw />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-neutral-400">
                    Loading canvas…
                </div>
            )}
        </div>
    )
}
