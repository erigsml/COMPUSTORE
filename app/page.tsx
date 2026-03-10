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
        const elements = document.querySelectorAll(".reveal");
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

export default function Home() {
    const [chatOpen, setChatOpen] = useState(false);
    useReveal();

    const handleScrollToProducts = () => {
        const productsSection = document.getElementById("productos");
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            {/* ── Navigation ── */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100/80 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
                <nav className="container mx-auto px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center transition-opacity hover:opacity-75"
                            aria-label="Volver al inicio de COMPUSTORE"
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

                        <div className="hidden md:flex items-center gap-8">
                            <Link
                                href="#productos"
                                className="text-gray-500 hover:text-compustore-red transition-colors duration-200 text-sm font-medium"
                            >
                                Productos
                            </Link>
                            <Link
                                href="#aliados"
                                className="text-gray-500 hover:text-compustore-red transition-colors duration-200 text-sm font-medium"
                            >
                                Aliados
                            </Link>
                            <ContactButton className="bg-compustore-red text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:shadow-red-200/60 hover:scale-105 active:scale-95">
                                Contacto
                            </ContactButton>
                        </div>
                    </div>
                </nav>
            </header>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden min-h-[88vh] flex items-center bg-white">

                <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-20 relative z-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">

                        {/* Left — Text */}
                        <div
                            className="text-center lg:text-left flex flex-col items-center lg:items-start reveal reveal-left"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-compustore-red rounded-full px-4 py-1.5 text-xs font-semibold mb-6 tracking-wide">
                                <span className="w-1.5 h-1.5 bg-compustore-red rounded-full animate-pulse" />
                                Distribución directa de fábrica
                            </div>

                            <h1 className="text-5xl lg:text-[4rem] xl:text-[4.5rem] font-bold text-gray-900 mb-6 leading-[1.08] tracking-tight">
                                Suministros y Repuestos{" "}
                                <span className="text-compustore-red">
                                    para Impresoras
                                </span>
                            </h1>

                            <p className="text-lg lg:text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
                                Partes críticas de impresión y soluciones MyQ para auditoría,
                                control y reducción de costos. Calidad garantizada, precios
                                competitivos.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 w-full sm:w-auto">
                                <button
                                    onClick={handleScrollToProducts}
                                    className="bg-compustore-red text-white px-9 py-4 rounded-full font-semibold text-base hover:bg-red-700 transition-all duration-200 hover:shadow-xl hover:shadow-red-200/60 hover:scale-105 active:scale-95 w-full sm:w-auto"
                                    aria-label="Ver catálogo de productos"
                                >
                                    Ver Catálogo
                                </button>
                                <ContactButton className="bg-white text-compustore-red border border-gray-200 px-9 py-4 rounded-full font-semibold text-base hover:border-compustore-red hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto">
                                    Cotizar Ahora
                                </ContactButton>
                            </div>
                        </div>

                        {/* Right — Carousel */}
                        <div
                            className="flex items-center justify-center lg:justify-end reveal reveal-right"
                        >
                            <HeroCarousel />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Products ── */}
            <section id="productos" className="bg-gray-50/80 py-24 lg:py-32">
                <div className="container mx-auto px-6 lg:px-8">

                    {/* Section header */}
                    <div className="text-center mb-16 reveal reveal-up">
                        <span className="text-compustore-red text-xs font-semibold tracking-[0.2em] uppercase mb-3 block">
                            Lo que ofrecemos
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                            Nuestros Productos
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Las mejores soluciones para mantener su infraestructura de
                            impresión funcionando eficientemente
                        </p>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {[
                            { title: "Toners", description: "Cartuchos de tóner de alta calidad para todas las marcas principales. Rendimiento superior y durabilidad garantizada.", imageSrc: "/images/products/toners.jpg", delay: 100 },
                            { title: "Paper Pick Up Rollers", description: "Rodillos de alimentación de papel de precisión. Reduce atascos y mejora la eficiencia operativa.", imageSrc: "/images/products/pickup-rollers.png", delay: 175 },
                            { title: "OPC Drums", description: "Tambores fotoconductores de larga duración. Calidad de impresión excepcional y consistente.", imageSrc: "/images/products/opc-drums-v2.png", delay: 250 },
                            { title: "Chips de Impresoras", description: "Chips compatibles para cartuchos de tóner. Solución económica sin comprometer la calidad.", imageSrc: "/images/products/printer-chips.jpg", delay: 100 },
                            { title: "Soluciones de Software", description: "Software de gestión de impresión avanzado. Optimiza costos y mejora la productividad.", imageSrc: "/images/products/software-solutions.webp", delay: 175 },
                            { title: "Kits de Mantenimiento", description: "Kits completos para mantenimiento preventivo. Extiende la vida útil de tus impresoras.", imageSrc: "/images/products/maintenance-kits.jpg", delay: 250 },
                        ].map((product) => (
                            <div
                                key={product.title}
                                className="reveal reveal-up"
                                style={{ animationDelay: `${product.delay}ms` }}
                            >
                                <ProductCard
                                    title={product.title}
                                    description={product.description}
                                    imageSrc={product.imageSrc}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Brands */}
                    <div className="mt-24 reveal reveal-up">
                        <div className="text-center mb-10">
                            <span className="text-compustore-red text-xs font-semibold tracking-[0.2em] uppercase mb-3 block">
                                Compatibilidad
                            </span>
                            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                                Marcas con las que trabajamos
                            </h3>
                            <div className="w-14 h-[3px] bg-compustore-red mx-auto rounded-full mt-4" />
                        </div>
                        <BrandCarousel />
                    </div>
                </div>
            </section>

            {/* ── Allies ── */}
            <section id="aliados" className="py-24 lg:py-32 bg-white">
                <div className="container mx-auto px-6 lg:px-8">

                    <div className="text-center mb-16 reveal reveal-up">
                        <span className="text-compustore-red text-xs font-semibold tracking-[0.2em] uppercase mb-3 block">
                            Respaldo internacional
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                            Aliados estratégicos
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Trabajamos con los mejores socios para ofrecerte las soluciones
                            más confiables del mercado
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {[
                            { src: "/images/logos/kiot_logo.png", alt: "Kiot Logo", w: 400, h: 400, subtitle: "Especialista en tintas y toners", description: "Líderes en la distribución de tintas y toners para impresoras.", delay: 0 },
                            { src: "/images/logos/fuji-electric-logo.png", alt: "Fuji Electric Logo", w: 200, h: 80, subtitle: "Aliado de fábrica", description: "Socios directos con Fuji Electric para garantizar la mejor calidad en componentes originales.", delay: 100 },
                            { src: "/images/logos/tomoegawa-logo.png", alt: "Tomoegawa Logo", w: 400, h: 160, subtitle: "Especialistas en toner", description: "Líderes mundiales en fabricación de toner de alta precisión para impresión impecable.", delay: 200 },
                            { src: "/images/logos/myq-logo.png", alt: "MyQ Solution Logo", w: 200, h: 80, subtitle: "Partner de software", description: "Partnership certificado con MyQ para las soluciones más avanzadas en gestión de impresión.", delay: 300 },
                        ].map((ally) => (
                            <div
                                key={ally.alt}
                                className="reveal reveal-up"
                                style={{ animationDelay: `${ally.delay}ms` }}
                            >
                                <AllyCard {...ally} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative overflow-hidden bg-compustore-red py-24 lg:py-32">
                {/* Dot pattern */}
                <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                        backgroundSize: "22px 22px",
                    }}
                />

                <div className="container mx-auto px-6 lg:px-8 text-center relative z-10 reveal reveal-up">
                    <span className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">
                        Hablemos
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                        CompuStore,{" "}
                        <span className="text-white/80">tu proveedor de confianza</span>
                    </h2>
                    <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
                        Contáctanos hoy y descubre cómo nuestras soluciones pueden
                        transformar tu operación
                    </p>
                    <ContactButton className="inline-flex items-center gap-2 bg-white text-compustore-red px-10 py-4 rounded-full font-bold text-base hover:bg-gray-100 transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-95">
                        Contactar Ahora →
                    </ContactButton>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-gray-950 text-white py-16 border-t border-white/[0.04]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                        <div>
                            <Image
                                src="/logo.svg"
                                alt="COMPUSTORE Logo"
                                width={150}
                                height={30}
                                className="h-8 w-auto mb-4 brightness-0 invert"
                            />
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Soluciones de impresión directas de fábrica
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-5 text-xs tracking-[0.15em] uppercase text-gray-400">
                                Enlaces
                            </h4>
                            <ul className="space-y-3 text-gray-500 text-sm">
                                <li>
                                    <Link href="#productos" className="hover:text-white transition-colors">
                                        Productos
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#aliados" className="hover:text-white transition-colors">
                                        Aliados
                                    </Link>
                                </li>
                                <li>
                                    <ContactButton className="hover:text-white transition-colors">
                                        Contacto
                                    </ContactButton>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-5 text-xs tracking-[0.15em] uppercase text-gray-400">
                                Contacto
                            </h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                info@compustore.com
                                <br />
                                Km 4 vía a Daule, Guayaquil, Ecuador
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-white/[0.06] pt-8 text-center text-gray-600 text-sm">
                        © 2026 COMPUSTORE. Todos los derechos reservados.
                    </div>
                </div>
            </footer>

            <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />
        </main>
    );
}

/* ── ProductCard ── */
function ProductCard({
    title,
    description,
    imageSrc,
}: {
    title: string;
    description: string;
    imageSrc?: string;
}) {
    return (
        <div
            className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-compustore-red/30 group flex flex-col h-full"
            role="article"
            aria-label={`Producto: ${title}`}
        >
            <div className="mb-6 flex items-center justify-center">
                {imageSrc && (
                    <div className="relative h-44 w-full group-hover:scale-[1.04] transition-transform duration-300">
                        <Image src={imageSrc} alt={title} fill className="object-contain" />
                    </div>
                )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-compustore-red transition-colors duration-200">
                {title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                {description}
            </p>
        </div>
    );
}

/* ── AllyCard ── */
function AllyCard({
    src,
    alt,
    w,
    h,
    subtitle,
    description,
}: {
    src: string;
    alt: string;
    w: number;
    h: number;
    subtitle: string;
    description: string;
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center hover:border-compustore-red/40 hover:shadow-xl transition-all duration-300 group flex flex-col items-center h-full">
            <div className="mb-6 h-16 w-full flex items-center justify-center">
                <Image
                    src={src}
                    alt={alt}
                    width={w}
                    height={h}
                    className="h-full w-auto object-contain"
                />
            </div>
            <p className="text-compustore-red text-sm font-semibold mb-2">
                {subtitle}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
}
