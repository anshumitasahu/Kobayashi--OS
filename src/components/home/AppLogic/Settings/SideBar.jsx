import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export default function SideBar() {
    return (
        <div className="w-fit">
            <div className="flex items-center gap-3 mt-1 mb-1 w-full bg-white rounded-md border border-black/10 px-2 py-1 text-xs">
                <button>
                    <MagnifyingGlassIcon size={18} color="black" />
                </button>
                <input type="text" placeholder="Search here" className="w-full outline-0" />
            </div>
            <div>

            </div>
        </div>
    )
}