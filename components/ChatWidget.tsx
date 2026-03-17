"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = {
    id: string;
    role: 'user' | 'bot';
    text: string;
};

export default function ChatWidget({
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen
}: {
    isOpen?: boolean;
    setIsOpen?: (value: boolean) => void;
} = {}) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [view, setView] = useState<'menu' | 'chat'>('chat');

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalSetIsOpen || setInternalIsOpen;

    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7)); // Simple session ID

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    // Message batching state
    const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const BATCH_TIMEOUT = 500; // 0.5 seconds to wait for more messages
    const isSendingRef = useRef(false); // Lock to prevent duplicate calls

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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const sendAudioToN8N = async (audioBlob: Blob) => {
        if (isLoading || isSendingRef.current) return;

        isSendingRef.current = true;
        setIsLoading(true);

        // Show temporary message
        const tempMsgId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempMsgId, role: 'user', text: '🎤 Mensaje de voz enviado...' }]);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
            formData.append('sessionId', sessionId);
            // Opcional para distinguir en n8n
            formData.append('type', 'audio');

            const response = await fetch('http://63.180.73.191:5678/webhook-test/927f706e-189f-45fe-934a-fd7499590e14', {
                method: 'POST',
                // Content-Type is set automatically by the browser for FormData
                body: formData
            });

            if (!response.ok) throw new Error('Error de conexión');

            const responseText = await response.text();
            if (!responseText) throw new Error('No se recibió respuesta del asistente.');

            let botText = "Disculpa, no pude procesar eso.";
            let data;
            try {
                data = JSON.parse(responseText);
                if (data.response) botText = data.response;
                else if (data.output) botText = data.output;
                else if (typeof data === 'string') botText = data;
                else if (Array.isArray(data) && data[0]?.output) botText = data[0].output;
                else if (data.text) botText = data.text;
            } catch (e) {
                botText = responseText;
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: botText
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'bot',
                text: 'Lo siento, hubo un problema al enviar el audio. Por favor intenta de nuevo.'
            }]);
        } finally {
            setIsLoading(false);
            isSendingRef.current = false;
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await sendAudioToN8N(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error al acceder al micrófono:", error);
            alert("Por favor, permite el acceso al micrófono para enviar audios.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Function to send all pending messages to the AI
    const sendBatchedMessages = async (messagesToSend: Message[]) => {
        if (messagesToSend.length === 0 || isLoading || isSendingRef.current) return;

        isSendingRef.current = true;
        setIsLoading(true);

        try {
            // Combine all pending messages into one request
            const combinedMessage = messagesToSend.map(msg => msg.text).join('\n\n');

            const response = await fetch('http://63.180.73.191:5678/webhook-test/927f706e-189f-45fe-934a-fd7499590e14', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatInput: combinedMessage, sessionId })
            });

            if (!response.ok) throw new Error('Error de conexión');

            const responseText = await response.text();
            if (!responseText) {
                console.warn('Servidor respondió sin contenido');
                throw new Error('No se recibió respuesta del asistente.');
            }

            let botText = "Disculpa, no pude procesar eso.";
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error al parsear JSON:', responseText);
                // Si lo que devolvió el servidor es texto plano (ej: un error de n8n), lo usamos
                botText = responseText;
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'bot',
                    text: botText
                };
                setMessages(prev => [...prev, botMsg]);
                return; // Salimos ya que ya enviamos el mensaje
            }

            // Handle the specific N8N response format provided by the user:
            // { "response": "...", "status": "success" }
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
            isSendingRef.current = false;
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!inputValue.trim() || isLoading || isSendingRef.current) return;

        const userText = inputValue.trim();
        setInputValue("");

        // Create user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText
        };

        // Add to UI immediately
        setMessages(prev => [...prev, userMsg]);

        // Add to pending messages queue
        setPendingMessages(prev => [...prev, userMsg]);

        // Clear existing timeout if any
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout to send batched messages
        timeoutRef.current = setTimeout(() => {
            // Get current pending messages and clear the queue immediately
            setPendingMessages(currentPending => {
                if (currentPending.length > 0) {
                    sendBatchedMessages(currentPending);
                }
                return []; // Clear the queue
            });
        }, BATCH_TIMEOUT);
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
                <div className="mb-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-100 origin-bottom-right flex flex-col" style={{ maxHeight: '600px', height: '500px' }}>

                    {/* HEADER */}
                    <div className="bg-[#1B8BCC] p-4 flex items-center justify-between text-white shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                            </svg>
                            <span className="font-semibold text-lg">
                                Asistente Virtual
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
                    {/* CHAT INTERFACE */}
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
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={isRecording ? "Grabando audio..." : "Escribe tu mensaje..."}
                                    disabled={isRecording}
                                    className={`flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#1B8BCC] focus:ring-1 focus:ring-[#1B8BCC] text-gray-800 ${isRecording ? 'bg-red-50 text-red-600 placeholder-red-400 border-red-200' : ''}`}
                                />
                                {inputValue.trim() ? (
                                    <button
                                        type="submit"
                                        disabled={isLoading || !inputValue.trim()}
                                        className="bg-[#1B8BCC] text-white p-2.5 rounded-full hover:bg-[#1676ad] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                                        aria-label="Enviar mensaje"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m22 2-7 20-4-9-9-4Z" />
                                            <path d="M22 2 11 13" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isLoading}
                                        className={`p-2.5 rounded-full transition-colors shrink-0 flex items-center justify-center ${isRecording
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#1B8BCC]'
                                            }`}
                                        title={isRecording ? 'Detener grabación' : 'Enviar mensaje de voz'}
                                        aria-label={isRecording ? 'Detener grabación' : 'Enviar mensaje de voz'}
                                    >
                                        {isRecording ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                                <line x1="12" x2="12" y1="19" y2="22" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
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
