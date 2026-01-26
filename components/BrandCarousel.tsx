"use client";

import Image from "next/image";
import { allBrandSVGs } from "@/lib/productData";

export default function BrandCarousel({ brands = allBrandSVGs }: { brands?: any[] }) {
    // Filtrar para asegurarse de que solo se muestren SVGs
    const displayBrands = brands.filter(b => b.logo.toLowerCase().endsWith('.svg'));

    if (displayBrands.length === 0) return null;

    // Duplicamos las marcas para que el scroll sea continuo
    const duplicateBrands = [...displayBrands, ...displayBrands];

    return (
        <div className="max-w-full mx-auto overflow-hidden select-none relative py-10">
            {/* Máscaras de desvanecimiento a los lados para mayor suavidad visual */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
                {duplicateBrands.map((brand, index) => {
                    // Compensar tamaño para logos visualmente más pequeños
                    const isSmallLogo = ["Xerox", "Kyocera", "Canon"].includes(brand.name);
                    const logoHeight = isSmallLogo ? "h-14" : "h-12";

                    return (
                        <div
                            key={index}
                            className="flex-shrink-0 px-8 flex items-center justify-center h-20"
                            style={{ width: '220px' }}
                        >
                            <Image
                                src={brand.logo}
                                alt={`${brand.name} Logo`}
                                width={180}
                                height={80}
                                className={`${logoHeight} w-auto object-contain pointer-events-none transition-all`}
                                draggable={false}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
