"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const images = [
    {
        src: "/images/products/toners.jpg",
        alt: "Toners de alta calidad"
    },
    {
        src: "/images/products/pickup-rollers.png",
        alt: "Rodillos de alimentación"
    },
    {
        src: "/images/products/opc-drums-v2.png",
        alt: "Tambores OPC"
    },
    {
        src: "/images/products/printer-chips.jpg",
        alt: "Chips para impresoras"
    },
    {
        src: "/images/products/software-solutions.png",
        alt: "Soluciones de software MyQ"
    },
    {
        src: "/images/products/maintenance-kits.jpg",
        alt: "Kits de mantenimiento"
    }
];

export default function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000); // Cambia cada 4 segundos

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full aspect-square max-w-2xl mx-auto overflow-hidden">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-contain"
                        priority={index === 0}
                    />
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? "w-8 bg-compustore-red"
                            : "bg-gray-400 hover:bg-gray-600"
                            }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
