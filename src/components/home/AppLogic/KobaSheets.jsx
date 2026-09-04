import { useEffect, useRef } from "react";
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import * as XLSX from "xlsx";

const data = [
    {
        name: "Sheet1",
        celldata: [],
    },
];

export default function KobaSheets() {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            window.dispatchEvent(new Event("resize"));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full">
            <Workbook data={data} className="w-full h-full" />
        </div>
    );
};