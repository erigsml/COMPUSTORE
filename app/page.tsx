"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import BrandCarousel from "@/components/BrandCarousel";
import ChatWidget from "@/components/ChatWidget";
import ContactButton from "@/components/ContactButton";

function useReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
        );
        document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

export default function Home() {
    const [chatOpen, setChatOpen] = useState(false);
    useReveal();

    const handleScrollToProducts = () => {
        document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <main className="min-h-screen bg-white overflow-x-hidden">

            {/* ── NAV ── */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <nav className="container mx-auto px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="transition-opacity hover:opacity-70">
                            <Image src="/logo.svg" alt="COMPUSTORE" width={180} height={40} className="h-9 w-auto" priority />
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="#productos" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium tracking-wider uppercase">
                                Productos
                            </Link>
                            <Link href="#aliados" className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium tracking-wider uppercase">
                                Aliados
                            </Link>
                            <ContactButton className="border border-compustore-red text-compustore-red px-5 py-2 text-sm font-bold tracking-widest uppercase hover:bg-compustore-red hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-red-200/60">
                                Contacto
                            </ContactButton>
                        </div>
                    </div>
                </nav>
            </header>

            {/* ── HERO ── */}
            <section className="relative overflow-hidden min-h-[92vh] flex items-center bg-white">

                {/* Subtle red grid */}
                <div className="absolute inset-0 hero-grid-light" />

                {/* Red glow orbs — very soft */}
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-compustore-red/[0.04] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-compustore-red/[0.03] rounded-full blur-[80px] pointer-events-none" />

                {/* Scan line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-compustore-red/30 to-transparent animate-scan pointer-events-none" />

                {/* Corner accents */}
                <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-compustore-red/25 pointer-events-none" />
                <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-compustore-red/25 pointer-events-none" />
                <div className="absolute bottom-20 left-6 w-10 h-10 border-b-2 border-l-2 border-compustore-red/25 pointer-events-none" />
                <div className="absolute bottom-20 right-6 w-10 h-10 border-b-2 border-r-2 border-compustore-red/25 pointer-events-none" />

                <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-20 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">

                        {/* Left — Copy */}
                        <div className="flex flex-col items-start reveal reveal-left">

                            {/* Terminal badge */}
                            <div className="inline-flex items-center gap-2 border border-compustore-red/20 bg-red-50 text-compustore-red px-4 py-1.5 text-xs font-mono font-bold mb-8 tracking-[0.2em] uppercase">
                                <span className="w-1.5 h-1.5 bg-compustore-red rounded-full animate-pulse" />
                                Distribución directa de fábrica
                            </div>

                            <h1 className="text-5xl lg:text-[4.5rem] xl:text-[5.25rem] font-black text-gray-950 mb-6 leading-[1.02] tracking-tighter animate-glitch">
                                Suministros
                                <br />y Repuestos
                                <br />
                                <span
                                    className="text-compustore-red"
                                    style={{ textShadow: "0 0 40px rgba(203,27,32,0.18)" }}
                                >
                                    para Impresoras
                                </span>
                            </h1>

                            {/* Red rule */}
                            <div className="w-16 h-[3px] bg-compustore-red mb-7" />

                            <p className="text-lg lg:text-xl text-gray-500 mb-10 max-w-md leading-relaxed">
                                Partes críticas de impresión y soluciones MyQ para auditoría,
                                control y reducción de costos.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button
                                    onClick={handleScrollToProducts}
                                    className="bg-compustore-red text-white px-10 py-4 font-black text-xs tracking-[0.25em] uppercase hover:bg-red-700 transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto animate-pulse-glow"
                                >
                                    Ver Catálogo
                                </button>
                                <ContactButton className="border border-gray-300 text-gray-600 px-10 py-4 font-bold text-xs tracking-[0.25em] uppercase hover:border-gray-900 hover:text-gray-900 transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto">
                                    Cotizar Ahora
                                </ContactButton>
                            </div>
                        </div>

                        {/* Right — Carousel */}
                        <div className="flex items-center justify-center lg:justify-end reveal reveal-right">
                            <div className="relative w-full max-w-lg">
                                <div className="absolute inset-0 bg-compustore-red/[0.06] blur-3xl rounded-full scale-75 pointer-events-none" />
                                <div className="relative">
                                    <HeroCarousel />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagonal bottom cut */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50 pointer-events-none"
                    style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
                />
            </section>

            {/* ── PRODUCTS ── */}
            <section id="productos" className="bg-gray-50 py-28 lg:py-36 relative">
                <div className="container mx-auto px-6 lg:px-8">

                    <div className="mb-16 reveal reveal-up">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-[2px] bg-compustore-red" />
                            <span className="text-compustore-red text-xs font-mono font-bold tracking-[0.3em] uppercase">
                                01 — Catálogo
                            </span>
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black text-gray-950 tracking-tighter leading-none mb-4">
                            Nuestros
                            <br />
                            <span className="text-gray-400">Productos</span>
                        </h2>
                        <p className="text-gray-500 text-lg max-w-md leading-relaxed">
                            Soluciones industriales para impresión de alto volumen
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-7xl mx-auto">
                        {[
                            { n: "01", title: "Toners",               description: "Cartuchos de alta calidad para todas las marcas principales. Rendimiento superior garantizado.", imageSrc: "/images/products/toners.jpg",              delay: 0   },
                            { n: "02", title: "Paper Pick Up Rollers", description: "Rodillos de precisión. Reduce atascos y mejora la eficiencia operativa al máximo.",               imageSrc: "/images/products/pickup-rollers.png",   delay: 80  },
                            { n: "03", title: "OPC Drums",             description: "Tambores fotoconductores de larga duración. Calidad de impresión excepcional.",                   imageSrc: "/images/products/opc-drums-v2.png",     delay: 160 },
                            { n: "04", title: "Chips de Impresoras",   description: "Chips compatibles para cartuchos de tóner. Económico sin perder calidad.",                        imageSrc: "/images/products/printer-chips.jpg",    delay: 80  },
                            { n: "05", title: "Soluciones de Software",description: "Gestión avanzada de impresión. Optimiza costos y mejora la productividad.",                       imageSrc: "/images/products/software-solutions.webp",delay: 160},
                            { n: "06", title: "Kits de Mantenimiento", description: "Kits completos para mantenimiento preventivo. Extiende la vida útil de tus equipos.",             imageSrc: "/images/products/maintenance-kits.jpg", delay: 240 },
                        ].map((p) => (
                            <div key={p.title} className="reveal reveal-up" style={{ animationDelay: `${p.delay}ms` }}>
                                <LightProductCard {...p} />
                            </div>
                        ))}
                    </div>

                    {/* Brands */}
                    <div className="mt-24 reveal reveal-up">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-[2px] bg-compustore-red" />
                            <span className="text-compustore-red text-xs font-mono font-bold tracking-[0.3em] uppercase">
                                Compatibilidad
                            </span>
                        </div>
                        <div className="bg-white border border-gray-100">
                            <BrandCarousel />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ALLIES ── */}
            <section id="aliados" className="relative py-28 lg:py-36 bg-white">
                {/* Top diagonal */}
                <div
                    className="absolute top-0 left-0 right-0 h-16 bg-gray-50 pointer-events-none"
                    style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
                />

                <div className="container mx-auto px-6 lg:px-8 pt-8">
                    <div className="mb-16 reveal reveal-up">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-[2px] bg-compustore-red" />
                            <span className="text-compustore-red text-xs font-mono font-bold tracking-[0.3em] uppercase">
                                02 — Aliados
                            </span>
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black text-gray-950 tracking-tighter leading-none">
                            Respaldo
                            <br />
                            <span className="text-gray-400">Internacional</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-7xl mx-auto">
                        {[
                            { src: "/images/logos/kiot_logo.png",         alt: "Kiot",         w: 400, h: 400, subtitle: "Tintas y Toners",     delay: 0   },
                            { src: "/images/logos/fuji-electric-logo.png", alt: "Fuji Electric", w: 200, h: 80,  subtitle: "Aliado de Fábrica",   delay: 100 },
                            { src: "/images/logos/tomoegawa-logo.png",     alt: "Tomoegawa",    w: 400, h: 160, subtitle: "Especialistas Toner", delay: 200 },
                            { src: "/images/logos/myq-logo.png",           alt: "MyQ Solution", w: 200, h: 80,  subtitle: "Partner Software",    delay: 300 },
                        ].map((a) => (
                            <div key={a.alt} className="reveal reveal-up" style={{ animationDelay: `${a.delay}ms` }}>
                                <LightAllyCard {...a} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative overflow-hidden py-36 bg-compustore-red">
                <div className="absolute inset-0 hero-grid-light opacity-[0.15]" />
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: "20px 20px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/25" />

                <div className="container mx-auto px-6 lg:px-8 text-center relative z-10 reveal reveal-up">
                    <div className="inline-flex items-center gap-2 border border-white/25 text-white/70 px-4 py-1.5 text-xs font-mono font-bold tracking-[0.3em] uppercase mb-10">
                        <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" />
                        Hablemos
                    </div>
                    <h2 className="text-5xl lg:text-[5.5rem] xl:text-[6.5rem] font-black text-white tracking-tighter leading-[1.0] mb-8">
                        CompuStore,
                        <br />
                        <span className="text-white/50">tu proveedor</span>
                    </h2>
                    <p className="text-lg text-white/55 mb-12 max-w-md mx-auto font-light leading-relaxed">
                        Contáctanos y transforma tu operación de impresión
                    </p>
                    <ContactButton className="inline-flex items-center gap-3 bg-white text-compustore-red px-14 py-5 font-black text-xs tracking-[0.3em] uppercase hover:bg-gray-100 transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-95">
                        Contactar Ahora →
                    </ContactButton>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-gray-950 text-white py-16 border-t border-white/[0.04]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        <div>
                            <Image src="/logo.svg" alt="COMPUSTORE" width={150} height={30} className="h-8 w-auto mb-5 brightness-0 invert" />
                            <p className="text-white/25 text-sm font-mono leading-relaxed">
                                // Soluciones de impresión
                                <br />// directas de fábrica
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white/25 text-xs font-mono font-bold tracking-[0.25em] uppercase mb-5">
                                &gt; Navegación
                            </h4>
                            <ul className="space-y-3 text-white/35 text-sm font-mono">
                                <li><Link href="#productos" className="hover:text-white transition-colors">→ Productos</Link></li>
                                <li><Link href="#aliados" className="hover:text-white transition-colors">→ Aliados</Link></li>
                                <li><ContactButton className="hover:text-white transition-colors">→ Contacto</ContactButton></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white/25 text-xs font-mono font-bold tracking-[0.25em] uppercase mb-5">
                                &gt; Contacto
                            </h4>
                            <p className="text-white/35 text-sm font-mono leading-relaxed">
                                info@compustore.com
                                <br />Km 4 vía a Daule
                                <br />Guayaquil, Ecuador
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/20 text-xs font-mono">
                        <span>© 2026 COMPUSTORE</span>
                        <span className="tracking-[0.2em]">[ ALL RIGHTS RESERVED ]</span>
                    </div>
                </div>
            </footer>

            <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />
        </main>
    );
}

/* ── Light Product Card ── */
function LightProductCard({ n, title, description, imageSrc }: {
    n: string; title: string; description: string; imageSrc?: string;
}) {
    return (
        <div
            className="group relative bg-white border border-gray-150 hover:border-compustore-red/40 transition-all duration-300 hover:shadow-xl hover:shadow-red-50 p-6 flex flex-col h-full"
            role="article"
        >
            {/* Number */}
            <span className="absolute top-4 right-5 text-xs font-mono text-gray-300 group-hover:text-compustore-red/50 transition-colors duration-300">
                {n}
            </span>
            {/* Top red bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-compustore-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

            {imageSrc && (
                <div className="relative h-40 w-full mb-5 group-hover:scale-[1.03] transition-transform duration-300">
                    <Image src={imageSrc} alt={title} fill className="object-contain" />
                </div>
            )}

            <h3 className="text-sm font-black text-gray-700 group-hover:text-gray-950 mb-2 tracking-[0.1em] uppercase transition-colors duration-200">
                {title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed flex-grow group-hover:text-gray-600 transition-colors duration-200">
                {description}
            </p>
        </div>
    );
}

/* ── Light Ally Card ── */
function LightAllyCard({ src, alt, w, h, subtitle }: {
    src: string; alt: string; w: number; h: number; subtitle: string;
}) {
    return (
        <div className="group relative bg-white border border-gray-150 hover:border-compustore-red/35 transition-all duration-300 hover:shadow-xl hover:shadow-red-50 p-8 flex flex-col items-center gap-5">
            {/* Top red bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-compustore-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

            <div className="h-14 w-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                <Image src={src} alt={alt} width={w} height={h} className="h-full w-auto object-contain" />
            </div>
            <p className="text-gray-500 text-xs font-mono font-bold tracking-[0.2em] uppercase group-hover:text-compustore-red transition-colors duration-200">
                {subtitle}
            </p>
        </div>
    );
}
