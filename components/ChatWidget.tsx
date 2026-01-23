"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = {
    id: string;
    role: 'user' | 'bot';
    text: string;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [view, setView] = useState<'menu' | 'chat'>('menu');

    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7)); // Simple session ID

    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, view]);

    // Periodic tooltip animation
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isOpen) {
                setShowTooltip(true);
                // Hide after 5 seconds
                setTimeout(() => setShowTooltip(false), 5000);
            }
        }, 15000); // Show every 15 seconds

        return () => clearInterval(interval);
    }, [isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue.trim();
        setInputValue("");

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, sessionId })
            });

            if (!response.ok) throw new Error('Error de conexión');

            const data = await response.json();

            // Handle the specific N8N response format provided by the user:
            // { "response": "...", "status": "success" }
            let botText = "Disculpa, no pude procesar eso.";

            if (data.response) {
                botText = data.response;
            } else if (data.output) {
                botText = data.output;
            } else if (typeof data === 'string') {
                botText = data;
            } else if (Array.isArray(data) && data[0]?.output) {
                botText = data[0].output;
            } else if (data.text) {
                botText = data.text;
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: botText
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'bot',
                text: 'Lo siento, hubo un problema al conectar con el servidor. Por favor intenta de nuevo.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[60] flex flex-col items-end gap-4">
            {/* Engagement Tooltip */}
            {!isOpen && (
                <div
                    className={`absolute bottom-20 right-0 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap transition-all duration-500 transform ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                >
                    <div className="text-gray-700 font-medium text-sm">
                        👋 ¿Necesitas ayuda con algo?
                    </div>
                    {/* Arrow pointing down-right */}
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                </div>
            )}

            {/* Widget Container */}
            {isOpen && (
                <div className="mb-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-100 origin-bottom-right flex flex-col" style={{ maxHeight: '600px', height: view === 'chat' ? '500px' : 'auto' }}>

                    {/* HEADER */}
                    <div className="bg-[#1B8BCC] p-4 flex items-center justify-between text-white shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            {view === 'chat' ? (
                                <button
                                    onClick={() => setView('menu')}
                                    className="hover:bg-white/20 rounded-full p-1 mr-1 transition-colors"
                                    aria-label="Volver al menú"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m15 18-6-6 6-6" />
                                    </svg>
                                </button>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                </svg>
                            )}
                            <span className="font-semibold text-lg">
                                {view === 'chat' ? 'Asistente Virtual' : 'Ayuda'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                            aria-label="Cerrar chat"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* CONTENT */}
                    {view === 'menu' ? (
                        <div className="rounded-b-lg overflow-hidden">
                            {/* Subheader */}
                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                <p className="text-gray-600 text-sm">
                                    Por favor elige una de las opciones:
                                </p>
                            </div>

                            {/* Options */}
                            <div className="p-4 space-y-3">
                                {/* WhatsApp Option */}
                                <button className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all hover:border-green-500 group text-left">
                                    <div className="bg-green-100 rounded-full p-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">Chatea por WhatsApp</h4>
                                    </div>
                                </button>

                                {/* N8N Chatbot Option */}
                                <button
                                    onClick={() => setView('chat')}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all hover:border-[#1B8BCC] group text-left"
                                >
                                    <div className="bg-blue-100 rounded-full p-2 relative overflow-hidden h-10 w-10 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B8BCC]">
                                            <path d="M12 8V4H8" />
                                            <rect width="16" height="12" x="4" y="8" rx="2" />
                                            <path d="M2 14h2" />
                                            <path d="M20 14h2" />
                                            <path d="M15 13v2" />
                                            <path d="M9 13v2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 group-hover:text-[#1B8BCC] transition-colors">¡Hola!</h4>
                                        <p className="text-sm text-gray-500">¿En qué puedo ayudarte?</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* CHAT INTERFACE */
                        <div className="flex flex-col h-full bg-gray-50 overflow-hidden rounded-b-lg">
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                ? 'bg-[#1B8BCC] text-white rounded-br-none'
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#1B8BCC] focus:ring-1 focus:ring-[#1B8BCC] text-gray-800"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !inputValue.trim()}
                                        className="bg-[#1B8BCC] text-white p-2.5 rounded-full hover:bg-[#1676ad] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m22 2-7 20-4-9-9-4Z" />
                                            <path d="M22 2 11 13" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={toggleOpen}
                    className="bg-[#1B8BCC] text-white p-4 rounded-full shadow-lg hover:bg-[#1676ad] transition-all hover:scale-110 active:scale-95 flex items-center justify-center animate-bounce-subtle"
                    aria-label="Abrir opciones de ayuda"
                    style={{ width: '60px', height: '60px' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}
