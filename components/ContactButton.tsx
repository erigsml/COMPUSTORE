"use client";

import { useState, ReactNode } from "react";
import ContactModal from "./ContactModal";

interface ContactButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void; // Optional additional click handler
}

export default function ContactButton({ children, className = "", onClick }: ContactButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default link behavior if wrapped
        setIsOpen(true);
        if (onClick) onClick();
    };

    return (
        <>
            <button className={className} onClick={handleClick}>
                {children}
            </button>
            <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
