// Product data with brands and categories

// Type definitions
interface ProductType {
    name: string;
    description: string;
    emoji?: string;
    image?: string;
}

interface Brand {
    name: string;
    logo: string;
}

interface CategoryData {
    title: string;
    description: string;
    brands: Brand[];
    types?: ProductType[];
}

export const allBrandSVGs: Brand[] = [
    { name: "HP", logo: "/images/brands/hp-2.svg" },
    { name: "Canon", logo: "/images/brands/canon-office-prod.svg" },
    { name: "Lexmark", logo: "/images/brands/lexmark-3.svg" },
    { name: "Xerox", logo: "/images/brands/xerox-9.svg" },
    { name: "Kyocera", logo: "/images/brands/Kyocera_print.svg" },
    { name: "Konica Minolta", logo: "/images/brands/Konica_Minolta_(Print).svg" },
    { name: "Ricoh", logo: "/images/brands/WEB-Logos-RICOH-1-1024x410-convertido-de-png.svg" },
];

export const productCategories: Record<string, CategoryData> = {
    toners: {
        title: "Toners",
        description: "Cartuchos de tóner de alta calidad para todas las marcas principales",
        brands: [...allBrandSVGs],
    },
    "pickup-rollers": {
        title: "Paper Pick Up Rollers",
        description: "Rodillos de alimentación de papel de precisión",
        types: [
            {
                name: "Pick Up Roller",
                image: "/images/roller-types/pickup-roller.png",
                description: "Rodillo principal que toma la primera hoja desde la bandeja de papel y la introduce al sistema de impresión."
            },
            {
                name: "Feed Roller",
                image: "/images/roller-types/feed-roller.png",
                description: "Continúa el arrastre del papel después de ser recogido, asegurando un desplazamiento uniforme dentro de la impresora."
            },
            {
                name: "Separation Roller",
                image: "/images/roller-types/separation-roller.png",
                description: "Evita que entren varias hojas al mismo tiempo, permitiendo el paso de una sola hoja por fricción controlada."
            },
            {
                name: "Separation Pad",
                image: "/images/roller-types/separation-pad.png",
                description: "Elemento de fricción que cumple la misma función que el rodillo de separación, común en impresoras compactas."
            },
            {
                name: "ASF Roller",
                image: "/images/roller-types/asf-roller.png",
                description: "Rodillo utilizado en bandejas de alimentación automática, especialmente en impresoras de inyección de tinta."
            },
            {
                name: "Cassette Pick Up Roller",
                image: "/images/roller-types/cassette-roller.png",
                description: "Rodillo diseñado para bandejas tipo cassette (bandejas inferiores), más robusto y usado en equipos empresariales."
            },
            {
                name: "MP Tray Pick Up Roller",
                image: "/images/roller-types/mp-tray-roller.png",
                description: "Rodillo para bandejas manuales o multipropósito, ideal para sobres, etiquetas y papeles especiales."
            },
            {
                name: "Pickup Roller Kit",
                image: "/images/roller-types/roller-kit.png",
                description: "Conjunto de rodillos y/o almohadillas que permite realizar mantenimiento completo del sistema de alimentación de papel."
            }
        ],
        brands: [...allBrandSVGs],
    },
    "opc-drums": {
        title: "OPC Drums",
        description: "Tambores fotoconductores de larga duración",
        brands: [...allBrandSVGs],
    },
    "printer-chips": {
        title: "Chips de Impresoras",
        description: "Chips compatibles para cartuchos de tóner",
        brands: [...allBrandSVGs],
    },
    "software-solutions": {
        title: "Soluciones de Software",
        description: "Software de gestión de impresión avanzado",
        brands: [
            { name: "MyQ", logo: "/images/logos/myq-logo.png" },
        ],
    },
    "maintenance-kits": {
        title: "Kits de Mantenimiento",
        description: "Kits completos para mantenimiento preventivo",
        brands: [...allBrandSVGs],
    },
};

export type ProductCategory = keyof typeof productCategories;
