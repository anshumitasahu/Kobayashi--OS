import { useState } from "react";
import { ArrowLeftIcon, CaretRightIcon, CaretLeftIcon } from "@phosphor-icons/react";

export default function Gallery() {
    const Images = [
        {
            date: "02/06/2026",
            images: ["./bg-4.jpeg", "./bg-1.png"],
        },
        {
            date: "05/02/2018",
            images: ["./bg.png", "./bg3.jpg", "./hero.jpg"],
        },
    ];

    const allImages = Images.flatMap(item => item.images);
    // console.log(allImages)


    const [selectedImage, setSelectedImage] = useState(null);
    const [nextImage, setNextImage] = useState(0);

    const handleImageClick = (image) => {
        setSelectedImage(allImages);
        setNextImage(allImages.indexOf(image));
    };

    const handleNextImage = () => {
        if (!selectedImage) return;

        setNextImage((prevIndex) => (prevIndex + 1) % selectedImage.length);
    };

    const handlePrevImage = () => {
        if (!selectedImage || selectedImage.length === 0) return;

        setNextImage((prevIndex) => ((prevIndex - 1) + selectedImage.length) % selectedImage.length);
    };


    const handleBackToImage = () => {
        if (selectedImage) {
            setSelectedImage(null)
        }
    }

    return (
        <div className="w-full h-full overflow-scroll bg-white rounded-lg p-4">
            <div className="flex flex-col gap-3">
                {Images.map((imgs) => (
                    <div
                        key={imgs.date}
                        style={{
                            display: selectedImage ? "none" : "block"
                        }}
                    >
                        <h3 className="text-xs text-neutral-500">{imgs.date}</h3>

                        <div className="grid grid-cols-3 gap-2 items-center w-full mt-2">
                            {imgs.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`image ${index + 1} is not available`}
                                    className="aspect-video object-cover w-full cursor-pointer rounded-lg"
                                    onClick={() => handleImageClick(img)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="relative h-full group">
                    <button
                        onClick={handleBackToImage}
                        className="w-full text-left justify-between items-center absolute top-0 flex  cursor-pointer bg-linear-to-b from-white/70 to-transparent px-2 py-2  group-hover:"
                    >
                        <ArrowLeftIcon size={16} className="text-neutral-600" />
                        <span className="text-neutral-500 text-xs">{selectedImage[nextImage].replace("./", "")}</span>
                    </button>
                    <div className="h-full">
                        <img
                            src={selectedImage[nextImage]}
                            alt="Selected"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex justify-between">
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
                </div>
            )}
        </div>
    );
}
