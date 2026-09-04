import { useEffect, useRef, useState } from "react";

export function useContainerSize() {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        const update = () => {
            setSize({ width: el.clientWidth, height: el.clientHeight });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return [ref, size];
}
