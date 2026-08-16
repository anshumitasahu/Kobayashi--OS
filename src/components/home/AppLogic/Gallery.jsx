import { useEffect, useState } from "react";
import { ArrowLeftIcon, CaretRightIcon, CaretLeftIcon } from "@phosphor-icons/react";
import { getPhotos } from "../../../DB/IndexedDB";

export default function Gallery() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [nextImage, setNextImage] = useState(0);

    useEffect(() => {
        getPhotos().then((photos) => {
            setImages(photos);
        });
    }, []);

    const handleImageClick = (image) => {
        setSelectedImage(images);

        const index = images.findIndex((item) => item.id === image.id);

        setNextImage(index);
    };

    const handleNextImage = () => {
        if (!selectedImage) return;

        setNextImage((prevIndex) => (prevIndex + 1) % selectedImage.length);
    };

    const handlePrevImage = () => {
        if (!selectedImage) return;

        setNextImage((prevIndex) => ((prevIndex - 1) + selectedImage.length) % selectedImage.length);
    };

    const handleBackToImage = () => {
        setSelectedImage(null);
    };

    console.log(new Date().toLocaleDateString())

    return (
        <div className="w-full h-full overflow-scroll bg-white rounded-lg p-4">
            {!selectedImage && (
                <div>
                    <p className="text-xs text-neutral-500 mt-1">
                        {new Date().toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((item) => (
                            <div key={item.id}>
                                <img
                                    src={URL.createObjectURL(item.image)}
                                    alt="Captured"
                                    className="aspect-video object-cover w-full cursor-pointer rounded-lg"
                                    onClick={() => handleImageClick(item)}
                                />


                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedImage && (
                <div className="relative h-full">

                    <button
                        onClick={handleBackToImage}
                        className="w-full text-left justify-between items-center absolute top-0 flex  cursor-pointer bg-linear-to-b from-white/70 to-transparent px-2 py-2"
                    >
                        <ArrowLeftIcon size={16} className="text-neutral-600" />
                    </button>

                    <img
                        src={URL.createObjectURL(
                            selectedImage[nextImage].image
                        )}
                        alt="Selected"
                        className="w-full h-full object-cover"
                    />

                    <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 bg-white/50 rounded-full p-1"
                    >
                        <CaretLeftIcon size={28} />
                    </button>

                    <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 bg-white/50 rounded-full p-1"
                    >
                        <CaretRightIcon size={28} />
                    </button>
                </div>
            )}
        </div>
    );
}
