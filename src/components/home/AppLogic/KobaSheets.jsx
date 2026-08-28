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
    return (
        <div className="w-full h-full">
            <Workbook data={data} />
        </div>
    );
};