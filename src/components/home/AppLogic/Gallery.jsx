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

    const [selectImage, setSelectImage] = useState(false);

    console.log(
        selectImage ? "image is selected" : "image is not selected"
    );

    return (
        <div className="w-full h-full overflow-scroll">
            <div className="flex flex-col gap-3">
                {Images.map((image) => (
                    <div key={image.date}>
                        <h3>{image.date}</h3>

                        <div className="flex flex-wrap gap-4 items-center">
                            {image.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`image ${index + 1} is not available`}
                                    className="aspect-video object-cover w-55"
                                    onClick={() => {
                                        console.log("image is clicked");
                                        setSelectImage((boolean) => !boolean);
                                    }}
                                    style={{
                                        width: selectImage
                                            ? "100%"
                                            : "220px",
                                    }}
                                />
                            ))}
                        </div>

                        <button>Next</button>
                    </div>
                ))}
            </div>

            <img
                src="./hero.jpg"
                alt=""
                className="w-full h-full mt-4"
            />
        </div>
    );
}