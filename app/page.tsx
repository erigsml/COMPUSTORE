import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            {/* Navigation Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <nav className="container mx-auto px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center transition-opacity hover:opacity-80"
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
                        <div className="hidden md:flex items-center space-x-8">
                            <Link
                                href="#productos"
                                className="text-gray-700 hover:text-compustore-red transition-colors duration-200"
                                aria-label="Ver productos"
                            >
                                Productos
                            </Link>
                            <Link
                                href="#aliados"
                                className="text-gray-700 hover:text-compustore-red transition-colors duration-200"
                                aria-label="Nuestros aliados"
                            >
                                Aliados
                            </Link>
                            <button
                                className="bg-compustore-red text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                                aria-label="Contactar con COMPUSTORE"
                            >
                                Contacto
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Modern Gradient Background */}
                <div className="absolute inset-0 bg-gradient-radial from-white via-slate-50/30 to-slate-100/50"></div>

                {/* Subtle Dot Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle, #CB1B20 1px, transparent 1px)`,
                        backgroundSize: '30px 30px'
                    }}
                ></div>

                {/* Content Container */}
                <div className="container mx-auto px-6 lg:px-8 py-12 lg:py-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">

                        {/* Left Column - Text Content */}
                        <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Soluciones de Impresión{" "}
                                <span className="text-compustore-red">Directas de Fábrica</span>
                            </h1>
                            <p className="text-base lg:text-lg text-gray-600 mb-12 max-w-xl font-light">
                                Comercialización de partes críticas de impresión y soluciones de software.
                                Calidad garantizada, precios competitivos.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 w-full sm:w-auto">
                                <button
                                    className="bg-compustore-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto"
                                    aria-label="Ver catálogo de productos"
                                >
                                    Ver Catálogo
                                </button>
                                <button
                                    className="bg-white text-compustore-red border-2 border-compustore-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-compustore-red hover:text-white transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 w-full sm:w-auto"
                                    aria-label="Solicitar cotización"
                                >
                                    Cotizar Ahora
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Product Collage Image */}
                        <div className="flex items-center justify-center lg:justify-end">
                            <div className="relative w-full max-w-2xl animate-float">
                                <Image
                                    src="/Collage_Products.webp"
                                    alt="Collage de productos COMPUSTORE - Toners, OPC Drums, Chips y más"
                                    width={800}
                                    height={800}
                                    className="w-full h-auto object-contain drop-shadow-2xl"
                                    priority
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Products/Solutions Section */}
            <section id="productos" className="bg-gray-50 py-20 lg:py-32">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Nuestros Productos
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Ofrecemos las mejores soluciones para mantener su infraestructura de impresión funcionando eficientemente
                        </p>
                    </div>

                    {/* Products Grid - 3x2 Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Product Card 1 - Toners */}
                        <ProductCard
                            title="Toners"
                            description="Cartuchos de tóner de alta calidad para todas las marcas principales. Rendimiento superior y durabilidad garantizada."
                            icon="🖨️"
                        />

                        {/* Product Card 2 - Paper Pick Up Rollers */}
                        <ProductCard
                            title="Paper Pick Up Rollers"
                            description="Rodillos de alimentación de papel de precisión. Reduce atascos y mejora la eficiencia operativa."
                            icon="📄"
                        />

                        {/* Product Card 3 - OPC Drums */}
                        <ProductCard
                            title="OPC Drums"
                            description="Tambores fotoconductores de larga duración. Calidad de impresión excepcional y consistente."
                            icon="🔄"
                        />

                        {/* Product Card 4 - Chips de Impresoras */}
                        <ProductCard
                            title="Chips de Impresoras"
                            description="Chips compatibles para cartuchos de tóner. Solución económica sin comprometer la calidad."
                            icon="💾"
                        />

                        {/* Product Card 5 - Soluciones de Software */}
                        <ProductCard
                            title="Soluciones de Software"
                            description="Software de gestión de impresión avanzado. Optimiza costos y mejora la productividad."
                            icon="💻"
                        />

                        {/* Product Card 6 - Mantenimiento */}
                        <ProductCard
                            title="Kits de Mantenimiento"
                            description="Kits completos para mantenimiento preventivo. Extiende la vida útil de tus impresoras."
                            icon="🔧"
                        />
                    </div>
                </div>
            </section>

            {/* Strategic Allies Section */}
            <section id="aliados" className="py-20 lg:py-32 bg-white">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Aliados Estratégicos
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Trabajamos con los mejores socios para ofrecerte las soluciones más confiables del mercado
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        {/* Fuji Electric */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 text-center hover:border-compustore-red hover:shadow-2xl transition-all duration-300 group">
                            <div className="mb-6 text-6xl">🏭</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Fuji Electric</h3>
                            <p className="text-gray-600 mb-2 font-semibold text-compustore-red">
                                Aliado de Fábrica
                            </p>
                            <p className="text-gray-600">
                                Socios directos con Fuji Electric para garantizar la mejor calidad en componentes originales de impresión.
                            </p>
                        </div>

                        {/* MyQ Solution */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-10 text-center hover:border-compustore-red hover:shadow-2xl transition-all duration-300 group">
                            <div className="mb-6 text-6xl">💼</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">MyQ Solution</h3>
                            <p className="text-gray-600 mb-2 font-semibold text-compustore-red">
                                Partner de Software
                            </p>
                            <p className="text-gray-600">
                                Partnership certificado con MyQ para ofrecer las soluciones más avanzadas en gestión de impresión.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-compustore-red py-20">
                <div className="container mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        ¿Listo para optimizar tu infraestructura de impresión?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Contáctanos hoy y descubre cómo nuestras soluciones pueden transformar tu operación
                    </p>
                    <button
                        className="bg-white text-compustore-red px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-2xl hover:scale-105 active:scale-95"
                        aria-label="Contactar con nosotros"
                    >
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
                                <li><Link href="#productos" className="hover:text-white transition-colors">Productos</Link></li>
                                <li><Link href="#aliados" className="hover:text-white transition-colors">Aliados</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contacto</h4>
                            <p className="text-gray-400 text-sm">
                                Email: info@compustore.com<br />
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

// Product Card Component
function ProductCard({
    title,
    description,
    icon
}: {
    title: string;
    description: string;
    icon: string;
}) {
    return (
        <div
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-compustore-red group cursor-pointer"
            role="article"
            aria-label={`Producto: ${title}`}
        >
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-compustore-red transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>
            <button
                className="mt-6 text-compustore-red font-semibold flex items-center group-hover:gap-2 transition-all"
                aria-label={`Ver más sobre ${title}`}
            >
                Ver más
                <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </button>
        </div>
    );
}

