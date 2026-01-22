import type { Metadata } from "next";
import "./globals.css";

import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
    title: "COMPUSTORE - Soluciones de Impresión Directas de Fábrica",
    description: "Comercialización de partes críticas de impresión y soluciones de software. Toners, OPC drums, Paper pick up rollers, Chips y más. Directo de fábrica.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body>
                {children}
                <ChatWidget />
            </body>
        </html>
    );
}
