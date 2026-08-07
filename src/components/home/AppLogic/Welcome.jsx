export default function Welcome({isInSettings}) {
    return (
        <div className="flex gap-5 w-fit h-fit justify-between items-center p-4 bg-white rounded-lg">
            <div className="aspect-square">
                <img src="/avatar/1.webp" className="w-32 h-32 rounded-full aspect-square" alt="" />
            </div>
            <div className="w-80">
                <h1 className="text-gray-800 text-md">
                    Hello User! What'S Up?
                </h1>
                <div className="mt-4">
                    <p className="text-gray-600 text-sm">
                        Welcome to <strong className="text-black">Kobayashi OS</strong>.<br /> A lightweight web-based environment.<br /> Feel free to explore the available apps and features.
                    </p>
                </div>
            </div>
        </div>
    )
}