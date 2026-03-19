"use client";

import { useState, useEffect, useRef } from "react";

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

async function getOrCreateDeviceId(): Promise<string> {
    const COOKIE_KEY = "dox_did";
    const LS_KEY = "dox_did";
    const fromCookie = getCookie(COOKIE_KEY);
    if (fromCookie) return fromCookie;
    const fromLS = localStorage.getItem(LS_KEY);
    if (fromLS) { setCookie(COOKIE_KEY, fromLS, 30); return fromLS; }
    try {
        const FingerprintJS = await import("https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4/dist/fp.esm.min.js" as any);
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setCookie(COOKIE_KEY, result.visitorId, 30);
        localStorage.setItem(LS_KEY, result.visitorId);
        return result.visitorId;
    } catch {
        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; return (c === "x" ? r : (r & 0x3) | 0x8).toString(16); });
        setCookie(COOKIE_KEY, id, 30);
        localStorage.setItem(LS_KEY, id);
        return id;
    }
}

type Message = { id: string; role: "user" | "bot"; text: string };

export default function ChatWidget({
    apiKey = "biz_clinica",
    webhookUrl = "https://n8n.mediclick.us/webhook/7a795449-952f-488c-a668-6716d3f37318",
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen,
}: {
    apiKey?: string;
    webhookUrl?: string;
    isOpen?: boolean;
    setIsOpen?: (value: boolean) => void;
} = {}) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalSetIsOpen || setInternalIsOpen;

    const [sessionId, setSessionId] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([{ id: "1", role: "bot", text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" }]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSendingRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { getOrCreateDeviceId().then(setSessionId); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    useEffect(() => {
        const i = setInterval(() => { if (!isOpen) { setShowTooltip(true); setTimeout(() => setShowTooltip(false), 5000); } }, 15000);
        return () => clearInterval(i);
    }, [isOpen]);
    useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);

    const sendBatchedMessages = async (messagesToSend: Message[]) => {
        if (!messagesToSend.length || isLoading || isSendingRef.current || !sessionId) return;
        isSendingRef.current = true;
        setIsLoading(true);
        try {
            const res = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatInput: messagesToSend.map((m) => m.text).join("\n\n"),
                    sessionId,
                    apiKey,
                    userAgent: navigator.userAgent,
                }),
            });
            if (!res.ok) throw new Error("Error de conexión");
            const text = await res.text();
            if (!text) { setMessages((p) => [...p, { id: Date.now().toString(), role: "bot", text: "Procesando..." }]); return; }
            let botText = "Disculpa, no pude procesar eso.";
            try {
                const data = JSON.parse(text);
                if (data.response) botText = data.response;
                else if (data.output) botText = data.output;
                else if (typeof data === "string") botText = data;
                else if (Array.isArray(data) && data[0]?.output) botText = data[0].output;
                else if (data.text) botText = data.text;
            } catch { botText = text; }
            setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "bot", text: botText }]);
        } catch {
            setMessages((p) => [...p, { id: Date.now().toString(), role: "bot", text: "Lo siento, hubo un problema al conectar. Por favor intenta de nuevo." }]);
        } finally { setIsLoading(false); isSendingRef.current = false; }
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isLoading || isSendingRef.current) return;
        const msg: Message = { id: Date.now().toString(), role: "user", text: inputValue.trim() };
        setInputValue("");
        setMessages((p) => [...p, msg]);
        setPendingMessages((p) => [...p, msg]);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setPendingMessages((cur) => { if (cur.length) sendBatchedMessages(cur); return []; });
        }, 500);
    };

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[60] flex flex-col items-end gap-4">
            {!isOpen && (
                <div className={`absolute bottom-20 right-0 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap transition-all duration-500 transform ${showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                    <div className="text-gray-700 font-medium text-sm">👋 ¿Necesitas ayuda con algo?</div>
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100" />
                </div>
            )}

            {isOpen && (
                <div className="mb-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-100 flex flex-col" style={{ maxHeight: "600px", height: "500px" }}>
                    <div className="bg-[#1B8BCC] p-4 flex items-center justify-between text-white shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                            <div>
                                <span className="font-semibold text-lg block leading-tight">Asistente Virtual</span>
                                <span className="text-xs text-white/60 font-mono">{apiKey}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col h-full bg-gray-50 overflow-hidden rounded-b-lg">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-[#1B8BCC] text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Escribe tu mensaje..." className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#1B8BCC] focus:ring-1 focus:ring-[#1B8BCC] text-gray-800" />
                                <button type="submit" disabled={isLoading || !inputValue.trim()} className="bg-[#1B8BCC] text-white p-2.5 rounded-full hover:bg-[#1676ad] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {!isOpen && (
                <button onClick={() => setIsOpen(!isOpen)} className="bg-[#1B8BCC] text-white p-4 rounded-full shadow-lg hover:bg-[#1676ad] transition-all hover:scale-110 active:scale-95 flex items-center justify-center" style={{ width: "60px", height: "60px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                </button>
            )}
        </div>
    );
}