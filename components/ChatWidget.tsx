"use client";

import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// Helpers: cookie + fingerprint
// ─────────────────────────────────────────────

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Genera o recupera un ID de dispositivo estable.
 * Orden de prioridad:
 *   1. Cookie existente (sobrevive limpiezas de caché)
 *   2. localStorage (fallback si no hay cookie)
 *   3. FingerprintJS (genera uno nuevo y lo persiste)
 */
async function getOrCreateDeviceId(): Promise<string> {
    const COOKIE_KEY = "dox_did";
    const LS_KEY = "dox_did";

    // 1. Cookie
    const fromCookie = getCookie(COOKIE_KEY);
    if (fromCookie) return fromCookie;

    // 2. localStorage
    const fromLS = localStorage.getItem(LS_KEY);
    if (fromLS) {
        setCookie(COOKIE_KEY, fromLS, 30);
        return fromLS;
    }

    // 3. FingerprintJS (carga dinámica para no bloquear el bundle)
    try {
        const FingerprintJS = await import(
            // @ts-ignore — librería sin tipos oficiales en algunas versiones
            "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4/dist/fp.esm.min.js"
        );
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;
        setCookie(COOKIE_KEY, visitorId, 30);
        localStorage.setItem(LS_KEY, visitorId);
        return visitorId;
    } catch {
        // Fallback robusto si FingerprintJS falla y crypto.randomUUID() no está disponible (ej. en HTTP o navegadores muy antiguos)
        const generateFallbackId = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        const fallback = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
            ? crypto.randomUUID() 
            : generateFallbackId();
        setCookie(COOKIE_KEY, fallback, 30);
        localStorage.setItem(LS_KEY, fallback);
        return fallback;
    }
}

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Message = {
    id: string;
    role: "user" | "bot";
    text: string;
};

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export default function ChatWidget({
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen,
}: {
    isOpen?: boolean;
    setIsOpen?: (value: boolean) => void;
} = {}) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalSetIsOpen || setInternalIsOpen;

    // ── sessionId estable ──────────────────────
    const [sessionId, setSessionId] = useState<string>("");

    useEffect(() => {
        getOrCreateDeviceId().then(setSessionId);
    }, []);
    // ──────────────────────────────────────────

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const BATCH_TIMEOUT = 500;
    const isSendingRef = useRef(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Tooltip periódico
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isOpen) {
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 5000);
            }
        }, 15000);
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // ── Envío al webhook ───────────────────────
    const sendBatchedMessages = async (messagesToSend: Message[]) => {
        if (messagesToSend.length === 0 || isLoading || isSendingRef.current) return;

        // Esperar a que el sessionId esté listo (raro, pero posible en primer render)
        if (!sessionId) return;

        isSendingRef.current = true;
        setIsLoading(true);

        try {
            const combinedMessage = messagesToSend.map((m) => m.text).join("\n\n");

            const response = await fetch(
                "https://n8n.mediclick.us/webhook/7a795449-952f-488c-a668-6716d3f37318",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chatInput: combinedMessage,
                        sessionId,          // ← ID estable de dispositivo
                        userAgent: navigator.userAgent,   // contexto adicional para n8n
                    }),
                }
            );

            if (!response.ok) throw new Error("Error de conexión");

            const responseText = await response.text();
            if (!responseText) {
                console.warn("Respuesta vacía del webhook. Es posible que el flujo esté demorando o el nodo Respond To Webhook no se haya ejecutado.");
                return setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 1).toString(), role: "bot", text: "Procesando... (El servidor recibió el mensaje pero no ha respondido con texto)." },
                ]);
            }

            let botText = "Disculpa, no pude procesar eso.";
            let data: any;

            try {
                data = JSON.parse(responseText);
            } catch {
                botText = responseText;
                setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 1).toString(), role: "bot", text: botText },
                ]);
                return;
            }

            if (data.response) botText = data.response;
            else if (data.output) botText = data.output;
            else if (typeof data === "string") botText = data;
            else if (Array.isArray(data) && data[0]?.output) botText = data[0].output;
            else if (data.text) botText = data.text;

            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "bot", text: botText },
            ]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "bot",
                    text: "Lo siento, hubo un problema al conectar. Por favor intenta de nuevo.",
                },
            ]);
        } finally {
            setIsLoading(false);
            isSendingRef.current = false;
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isLoading || isSendingRef.current) return;

        const userText = inputValue.trim();
        setInputValue("");

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: userText,
        };

        setMessages((prev) => [...prev, userMsg]);
        setPendingMessages((prev) => [...prev, userMsg]);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            setPendingMessages((currentPending) => {
                if (currentPending.length > 0) sendBatchedMessages(currentPending);
                return [];
            });
        }, BATCH_TIMEOUT);
    };

    // ─────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[60] flex flex-col items-end gap-4">
            {/* Tooltip */}
            {!isOpen && (
                <div
                    className={`absolute bottom-20 right-0 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap transition-all duration-500 transform ${
                        showTooltip
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                >
                    <div className="text-gray-700 font-medium text-sm">
                        👋 ¿Necesitas ayuda con algo?
                    </div>
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                </div>
            )}

            {/* Widget */}
            {isOpen && (
                <div
                    className="mb-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-100 origin-bottom-right flex flex-col"
                    style={{ maxHeight: "600px", height: "500px" }}
                >
                    {/* Header */}
                    <div className="bg-[#1B8BCC] p-4 flex items-center justify-between text-white shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                            </svg>
                            <span className="font-semibold text-lg">Asistente Virtual</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                            aria-label="Cerrar chat"
                            type="button"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat */}
                    <div className="flex flex-col h-full bg-gray-50 overflow-hidden rounded-b-lg">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                            msg.role === "user"
                                                ? "bg-[#1B8BCC] text-white rounded-br-none"
                                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
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

                        {/* Input */}
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
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 2-7 20-4-9-9-4Z" />
                                        <path d="M22 2 11 13" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Botón flotante */}
            {!isOpen && (
                <button
                    onClick={toggleOpen}
                    className="bg-[#1B8BCC] text-white p-4 rounded-full shadow-lg hover:bg-[#1676ad] transition-all hover:scale-110 active:scale-95 flex items-center justify-center animate-bounce-subtle"
                    aria-label="Abrir asistente"
                    style={{ width: "60px", height: "60px" }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}