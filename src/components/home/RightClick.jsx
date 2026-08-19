export default function RightClick() {
    return (
        <div className="bg-white w-fit rounded-sm">
            <ul className="text-neutral-600 text-sm cursor-default">
                <li
                    className="px-4 py-2 hover:bg-gray-100 rounded-sm"
                >
                    Change Widgets
                </li>
                <li
                    className="px-4 py-2 hover:bg-gray-100 rounded-sm"
                >
                    Change Wallpaper
                </li>
                <li
                    className="px-4 py-2 hover:bg-gray-100 rounded-sm"
                >
                    Change Icons
                </li>
            </ul>
        </div>
    )
}