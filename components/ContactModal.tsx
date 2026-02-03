"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    const [mounted, setMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Trigger animation after a small delay to ensure smooth entrance
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const [errors, setErrors] = useState({
        email: '',
        phone: '',
        name: '',
        message: ''
    });

    // Regular Expressions
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0]{1}[9]{1}[0-9]{8}$/;
    const nombreRegex = /^[a-zA-ZÑñÁÉÍÓÚáéíóúÜü\s]{3,50}$/;
    const messageRegex = /^[a-zA-Z0-9ÑñÁÉÍÓÚáéíóúÜü¿?!¡.,;:\s]{10,500}$/;


    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', phone: '', name: '', message: '' };

        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Por favor ingresa un correo electrónico válido.';
            isValid = false;
        }

        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Por favor ingresa un número de teléfono válido 0999999999';
            isValid = false;
        }

        if (!nombreRegex.test(formData.name)) {
            newErrors.name = 'Por favor ingresa un nombre válido';
            isValid = false;
        }

        if (!messageRegex.test(formData.message)) {
            newErrors.message = 'Por favor ingresa un mensaje válido';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setTimeout(() => {
                setSubmitStatus('idle');
                onClose();
                setFormData({ name: '', email: '', phone: '', message: '' });
                setErrors({ email: '', phone: '', name: '', message: '' });
            }, 2000);
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // For phone field, only allow numeric characters
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }


        // Real-time validation - use the filtered value for phone
        const valueToValidate = name === 'phone' ? value.replace(/[^0-9]/g, '') : value;
        let errorMsg = '';
        if (name === 'email') {
            if (valueToValidate && !emailRegex.test(valueToValidate)) {
                errorMsg = 'Por favor ingresa un correo electrónico válido.';
            }
        } else if (name === 'phone') {
            if (valueToValidate && !phoneRegex.test(valueToValidate)) {
                errorMsg = 'Por favor ingresa un número de teléfono válido (ej: 0999999999).';
            }
        } else if (name === 'name') {
            if (valueToValidate && !nombreRegex.test(valueToValidate)) {
                errorMsg = 'Por favor ingresa un nombre válido';
            }
        } else if (name === 'message') {
            if (valueToValidate && !messageRegex.test(valueToValidate) && valueToValidate.length < 10) {
                errorMsg = 'Por favor ingresa un mensaje válido con mínimo 10 caracteres';
            } else if (valueToValidate && valueToValidate.length >= 500) {
                errorMsg = 'Se ha alcanzado el límite de caracteres (500)';
            } else if (valueToValidate && !messageRegex.test(valueToValidate)) {
                errorMsg = 'Por favor ingresa solo letras, números, espacios y signos de puntuación';
            }
        }

        if (name === 'email' || name === 'phone' || name === 'name' || name === 'message') {
            setErrors(prev => ({
                ...prev,
                [name]: errorMsg
            }));
        }
    };

    if (!mounted) return null;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out"
                style={{
                    opacity: isAnimating ? 1 : 0
                }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Card */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                style={{
                    transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(0.95)',
                    opacity: isAnimating ? 1 : 0,
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {/* Header */}
                <div className="bg-[#CB1B20] p-6 text-white flex justify-between items-center">
                    <h3 className="text-2xl font-bold">Contáctanos</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 sm:p-8">
                    {submitStatus === 'success' ? (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">¡Mensaje Enviado!</h4>
                            <p className="text-gray-600">Gracias por contactarnos. Te responderemos a la brevedad.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={50}
                                        className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#CB1B20] focus:border-transparent focus:ring-2'}`}
                                        placeholder="Tu nombre"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength={10}
                                        inputMode="numeric"

                                        className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#CB1B20] focus:border-transparent focus:ring-2'}`}
                                        placeholder="0999999999"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    maxLength={50}
                                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#CB1B20] focus:border-transparent focus:ring-2'}`}
                                    placeholder="tu@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#CB1B20] focus:border-transparent focus:ring-2'}`}
                                    placeholder="¿En qué podemos ayudarte?"
                                    maxLength={500}
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#CB1B20] text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Mensaje'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
