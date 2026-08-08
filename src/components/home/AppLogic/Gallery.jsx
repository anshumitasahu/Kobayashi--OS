import { useState } from "react";

export default function Gallery() {
    const Images = [
        {
            date: "02/06/2026",
            images: ["./bg-4.jpeg", "./bg-1.png"],
        },
        {
            date: "05/02/2018",
            images: ["./bg3.jpg", "./bg-4.jpeg", "./hero.jpg"],
        },
    ];

    const [selectedImage, setSelectedImage] = useState(null);
    const [nextImage, setNextImage] = useState(0);

    const handleImageClick = (images, index) => {
        setSelectedImage(images);
        setNextImage(index);
    };

    const handleNextImage = () => {
        if (!selectedImage) return;

        setNextImage(
            (prevIndex) => (prevIndex + 1) % selectedImage.length
        );
    };

    return (
        <div className="w-full h-full overflow-scroll">
            <div className="flex flex-col gap-3">
                {Images.map((imgs) => (
                    <div key={imgs.date}>
                        <h3>{imgs.date}</h3>

                        <div className="flex flex-wrap gap-4 items-center">
                            {imgs.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`image ${index + 1} is not available`}
                                    className="aspect-video object-cover w-55 cursor-pointer"
                                    onClick={() => handleImageClick(imgs.images, index)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="mt-4">
                    <img
                        src={selectedImage[nextImage]}
                        alt="Selected"
                        className="w-full max-h-150 object-contain"
                    />

                    <button onClick={handleNextImage}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
