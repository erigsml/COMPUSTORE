"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface Brand {
    name: string;
    logo: string;
}

interface BrandCarouselProps {
    brands: Brand[];
}

export default function BrandCarousel({ brands }: BrandCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationFrameId: number;
        let scrollPosition = 0;

        const smoothScroll = () => {
            if (!scrollContainer) return;

            // Velocidad constante para máxima fluidez
            scrollPosition += 0.8;

            // Reiniciar cuando llegamos a la mitad del contenido duplicado para que sea imperceptible
            const segmentWidth = scrollContainer.scrollWidth / 4;
            if (scrollPosition >= segmentWidth * 2) {
                scrollPosition = segmentWidth;
            }

            scrollContainer.scrollLeft = scrollPosition;
            animationFrameId = requestAnimationFrame(smoothScroll);
        };

        // Posicionar inicialmente en el segundo segmento para permitir scroll hacia atrás si fuera necesario
        // Aunque aquí solo vamos hacia adelante
        const initialScroll = () => {
            if (scrollContainer) {
                scrollPosition = scrollContainer.scrollWidth / 4;
                scrollContainer.scrollLeft = scrollPosition;
                animationFrameId = requestAnimationFrame(smoothScroll);
            }
        };

        // Esperar un poco para que el layout se calcule correctamente
        const timeoutId = setTimeout(initialScroll, 100);

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(timeoutId);
        };
    }, [brands]);

    return (
        <div className="max-w-full mx-auto overflow-hidden select-none">
            <div
                ref={scrollRef}
                className="flex gap-16 overflow-x-hidden items-center py-10"
                style={{ scrollBehavior: 'auto' }}
            >
                {/* Multiplication of brands to ensure no gaps during the loop */}
                {[...brands, ...brands, ...brands, ...brands].map((brand, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
                    >
                        <Image
                            src={brand.logo}
                            alt={`${brand.name} Logo`}
                            width={160}
                            height={80}
                            className="h-14 w-auto object-contain pointer-events-none"
                            draggable={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

