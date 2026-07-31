import { useState, useEffect } from "react"

export default function Notes() {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const getItems = JSON.parse(localStorage.getItem("notes"));
        if (getItems) {
            setNotes(getItems);
            console.log("parsed value:" + getItems)
        }
    }, [])


    useEffect(() => {

        localStorage.setItem("notes", JSON.stringify(notes));
        console.log("srinified note:" + JSON.stringify(notes))
    }, [notes])


    return (
        <div className="bg-white/50">
            <textarea
                className="w-100 h-70 resize-none outline-0 p-2"
                placeholder="Enter your thoughts here"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            >

            </textarea>
        </div>
    )
}