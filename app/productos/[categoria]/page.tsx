import Image from "next/image";
import Link from "next/link";
import { productCategories, ProductCategory } from "@/lib/productData";
import { notFound } from "next/navigation";
import BrandCarousel from "@/components/BrandCarousel";

import Header from "@/components/Header";

export function generateStaticParams() {
    return Object.keys(productCategories).map((categoria) => ({
        categoria,
    }));
}

export default function ProductCategoryPage({
    params,
}: {
    params: { categoria: string };
}) {
    const categoryData = productCategories[params.categoria as ProductCategory];

    if (!categoryData) {
        notFound();
    }

    const hasTypes = "types" in categoryData && categoryData.types && categoryData.types.length > 0;

    return (
        <main className="min-h-screen bg-white relative">
            <Header />

            {/* Floating Back Button */}
            <Link
                href="/"
                className="fixed left-6 top-28 z-[60] inline-flex items-center text-gray-700 hover:text-compustore-red transition-all group"
                title="Volver al inicio"
            >
                <span className="p-3 rounded-full border border-gray-200 group-hover:border-compustore-red transition-all bg-white shadow-lg group-hover:shadow-xl group-hover:scale-110 active:scale-95">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </span>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out">
                    <span className="ml-3 font-bold text-sm uppercase tracking-wider whitespace-nowrap bg-white py-2 px-4 rounded-full shadow-lg border border-gray-100">
                        Inicio
                    </span>
                </span>
            </Link>

            {/* Hero Section */}
            <section className="bg-compustore-red pt-20 pb-16 lg:pt-24 lg:pb-24 relative overflow-hidden">
                {/* Subtle Background Decoration */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
                            {categoryData.title}
                        </h1>
                        <p className="text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
                            {categoryData.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Product Types Section (if available) */}
            {hasTypes && (
                <section className="pt-20 lg:pt-32 pb-10 lg:pb-16 bg-gray-50">
                    <div className="container mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                Tipos de {categoryData.title}
                            </h2>
                            <p className="text-lg text-gray-600">
                                Conoce los diferentes tipos disponibles
                            </p>
                        </div>

                        {/* Types Grid - 4 columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {categoryData.types!.map((type, index) => (
                                <div
                                    key={index}
                                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-compustore-red hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="h-32 mb-4 flex items-center justify-center">
                                        {type.image ? (
                                            <Image
                                                src={type.image}
                                                alt={type.name}
                                                width={120}
                                                height={120}
                                                className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : type.emoji ? (
                                            <div className="text-4xl group-hover:scale-110 transition-transform">
                                                {type.emoji}
                                            </div>
                                        ) : null}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-compustore-red transition-colors">
                                        {type.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {type.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Brands Carousel Section */}
            <section className={`pt-10 lg:pt-16 pb-20 lg:pb-32 ${hasTypes ? 'bg-white' : ''}`}>
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Marcas Disponibles
                        </h2>
                        <p className="text-lg text-gray-600">
                            Trabajamos con las mejores marcas del mercado
                        </p>
                    </div>

                    <BrandCarousel brands={categoryData.brands} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-compustore-red py-20">
                <div className="container mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        ¿Necesitas más información?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Contáctanos para obtener una cotización personalizada
                    </p>
                    <button className="bg-white text-compustore-red px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-95">
                        Contactar Ahora
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <Image
                                src="/logo.svg"
                                alt="COMPUSTORE Logo"
                                width={150}
                                height={30}
                                className="h-8 w-auto mb-4 brightness-0 invert"
                            />
                            <p className="text-gray-400 text-sm">
                                Soluciones de impresión directas de fábrica
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Enlaces</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li>
                                    <Link href="/#productos" className="hover:text-white transition-colors">
                                        Productos
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/#aliados" className="hover:text-white transition-colors">
                                        Aliados
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white transition-colors">
                                        Contacto
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contacto</h4>
                            <p className="text-gray-400 text-sm">
                                Email: info@compustore.com
                                <br />
                                Tel: +1 234 567 8900
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                        © 2026 COMPUSTORE. Todos los derechos reservados.
                    </div>
                </div>
            </footer>
        </main>
    );
}
