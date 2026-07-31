export default function Welcome() {
    return (
        <div className="flex gap-5 justify-between items-center p-4 bg-white rounded-lg">
            <div>
                <img src="/avatar/1.webp" className="w-32 h-32 rounded-full" alt="" />
            </div>
            <div>
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