"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const controlHeader = () => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }
            setLastScrollY(window.scrollY);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlHeader);
            return () => {
                window.removeEventListener('scroll', controlHeader);
            };
        }
    }, [lastScrollY]);

    return (
        <header
            className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <nav className="container mx-auto px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center transition-opacity hover:opacity-80"
                        aria-label="COMPUSTORE Logo"
                    >
                        <Image
                            src="/logo.svg"
                            alt="COMPUSTORE Logo"
                            width={200}
                            height={40}
                            className="h-10 w-auto cursor-pointer"
                            priority
                        />
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/#productos"
                            className="text-gray-700 hover:text-compustore-red transition-colors duration-200"
                        >
                            Productos
                        </Link>
                        <Link
                            href="/#aliados"
                            className="text-gray-700 hover:text-compustore-red transition-colors duration-200"
                        >
                            Aliados
                        </Link>
                        <button className="bg-compustore-red text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95">
                            Contacto
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}
