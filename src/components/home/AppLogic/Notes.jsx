import { useState, useEffect } from "react";

export default function Notes() {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const getItems = JSON.parse(localStorage.getItem("notes"));
        if (getItems) {
            setNotes(getItems);
        }
    }, [])


    useEffect(() => {

        localStorage.setItem("notes", JSON.stringify(notes));
    }, [notes])


    return (
        <div className="bg-white h-full w-full">
            <textarea
                className="w-full h-full resize-none outline-0 p-2"
                placeholder="Enter your thoughts here"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            >

            </textarea>
        </div>
    )
}