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
        <div className="bg-white lg:w-full lg:h-full md:h-70 md:w-100">
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