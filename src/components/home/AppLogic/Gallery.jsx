import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, CaretRightIcon, CaretLeftIcon } from "@phosphor-icons/react";
import { getPhotos } from "../../../DB/IndexedDB";
import { useAppStore } from "../../../store";

const DEFAULT_SECTIONS = [
    {
        id: "nov-2025",
        label: "November 18, 2025",
        images: [
            { id: "default-4", src: "/gallery/4.jpeg" },
            { id: "default-5", src: "/gallery/5.jpeg" },
            { id: "default-6", src: "/gallery/6.jpeg" },
        ],
    },
    {
        id: "aug-2025",
        label: "August 2, 2025",
        images: [
            { id: "default-7", src: "/gallery/7.jpeg" },
            { id: "default-8", src: "/gallery/8.jpeg" },
            { id: "default-9", src: "/gallery/9.jpeg" },
            { id: "default-10", src: "/gallery/10.jpeg" },
            { id: "default-11", src: "/gallery/11.jpeg" },
        ],
    },
];

const DEFAULT_FLAT = DEFAULT_SECTIONS.flatMap((section) => section.images);

export default function Gallery() {
    const [dbImages, setDbImages] = useState([]);
    const [selectedList, setSelectedList] = useState(null);
    const [nextImage, setNextImage] = useState(0);
    const objectUrlsRef = useRef([]);

    const gallerySelectedPhotoId = useAppStore((state) => state.gallerySelectedPhotoId);
    const clearGallerySelectedPhotoId = useAppStore((state) => state.clearGallerySelectedPhotoId);

    const allImages = useMemo(() => [...DEFAULT_FLAT, ...dbImages], [dbImages]);

    const sections = useMemo(() => {
        const list = [...DEFAULT_SECTIONS];
        if (dbImages.length > 0) {
            list.push({
                id: "recent",
                label: new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                images: dbImages,
            });
        }
        return list;
    }, [dbImages]);

    useEffect(() => {
        const loadPhotos = async () => {
            try {
                const photos = await getPhotos();
                objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
                objectUrlsRef.current = photos.map((photo) => URL.createObjectURL(photo.image));
                const parsed = photos.map((photo, index) => ({
                    ...photo,
                    src: objectUrlsRef.current[index],
                }));
                setDbImages(parsed);

                if (gallerySelectedPhotoId !== null) {
                    const combined = [...DEFAULT_FLAT, ...parsed];
                    const index = combined.findIndex((photo) => photo.id === gallerySelectedPhotoId);
                    if (index !== -1) {
                        setSelectedList(combined);
                        setNextImage(index);
                    }
                    clearGallerySelectedPhotoId();
                }
            } catch (error) {
                console.error("Failed to load photos:", error);
            }
        };

        loadPhotos();
        window.addEventListener("gallery-photos-changed", loadPhotos);
        return () => {
            window.removeEventListener("gallery-photos-changed", loadPhotos);
            objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            objectUrlsRef.current = [];
        };
    }, [gallerySelectedPhotoId, clearGallerySelectedPhotoId]);

    useEffect(() => {
        if (!selectedList) return;
        const onKey = (e) => {
            if (e.key === "Escape") setSelectedList(null);
            if (e.key === "ArrowRight") setNextImage((i) => (i + 1) % selectedList.length);
            if (e.key === "ArrowLeft") setNextImage((i) => (i - 1 + selectedList.length) % selectedList.length);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selectedList]);

    const openImage = (image) => {
        const index = allImages.findIndex((item) => item.id === image.id);
        if (index === -1) return;
        setSelectedList(allImages);
        setNextImage(index);
    };

    const handleNextImage = () => {
        if (!selectedList) return;
        setNextImage((prev) => (prev + 1) % selectedList.length);
    };

    const handlePrevImage = () => {
        if (!selectedList) return;
        setNextImage((prev) => (prev - 1 + selectedList.length) % selectedList.length);
    };

    const current = selectedList?.[nextImage];

    return (
        <div className="relative w-full h-full overflow-hidden bg-white rounded-xl">
            <div className="h-full overflow-y-auto">
                <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-100 px-5 sm:px-7 pt-4 pb-3.5 flex items-end justify-between">
                    <div>
                        <h1 className="text-[15px] font-semibold text-neutral-900 tracking-tight leading-tight">
                            Gallery
                        </h1>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {allImages.length} {allImages.length === 1 ? "photo" : "photos"}
                        </p>
                    </div>
                    <span className="text-[11px] text-neutral-400 bg-neutral-100 rounded-full px-2.5 py-1">
                        2025 — Today
                    </span>
                </header>

                <main className="px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10 max-w-4xl mx-auto">
                    {sections.map((section) => (
                        <section key={section.id}>
                            <div className="flex items-baseline justify-between mb-3 px-1">
                                <h2 className="text-[13px] font-medium text-neutral-800">
                                    {section.label}
                                </h2>
                                <span className="text-[11px] text-neutral-400">
                                    {section.images.length} items
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                                {section.images.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => openImage(item)}
                                        className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
                                    >
                                        <img
                                            src={item.src}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                                        />
                                        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 group-hover:ring-black/10 transition" />
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>
            </div>

            {selectedList && current && (
                <div className="absolute inset-0 z-20 flex flex-col bg-neutral-950">
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 text-white">
                        <button
                            onClick={() => setSelectedList(null)}
                            className="flex items-center gap-2 text-sm text-white/90 hover:text-white cursor-pointer rounded-full hover:bg-white/10 px-2.5 py-1.5 transition"
                        >
                            <ArrowLeftIcon size={18} />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <span className="text-xs tabular-nums text-white/70">
                            {nextImage + 1} / {selectedList.length}
                        </span>
                        <span className="w-[52px]" />
                    </div>

                    <div className="relative flex-1 min-h-0 flex items-center justify-center px-12 sm:px-16 pb-2">
                        <img
                            key={current.id}
                            src={current.src}
                            alt=""
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />

                        {selectedList.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    aria-label="Previous photo"
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-2.5 backdrop-blur transition cursor-pointer"
                                >
                                    <CaretLeftIcon size={22} />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    aria-label="Next photo"
                                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-2.5 backdrop-blur transition cursor-pointer"
                                >
                                    <CaretRightIcon size={22} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 px-4 pb-4 pt-1 overflow-x-auto">
                        {selectedList.map((item, i) => (
                            <button
                                key={item.id}
                                onClick={() => setNextImage(i)}
                                className={`shrink-0 h-10 w-10 rounded-lg overflow-hidden transition cursor-pointer ${i === nextImage ? "ring-2 ring-white" : "opacity-45 hover:opacity-90"}`}
                            >
                                <img src={item.src} alt="" className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
