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
    if (fromLS) {
        setCookie(COOKIE_KEY, fromLS, 30);
        return fromLS;
    }

    try {
        const fpUrl = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4/dist/fp.esm.min.js";
        const FingerprintJS = await import(/* webpackIgnore: true */ fpUrl);
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const visitorId = result.visitorId;
        setCookie(COOKIE_KEY, visitorId, 30);
        localStorage.setItem(LS_KEY, visitorId);
        return visitorId;
    } catch {
        const generateFallbackId = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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

type Message = {
    id: string;
    role: "user" | "bot";
    text: string;
    audioUrl?: string;
    imageUrl?: string;
};

function AudioMessage({ audioUrl, isUser }: { audioUrl: string; isUser: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const rafRef = useRef<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const startRAF = () => {
        const tick = () => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    };

    const stopRAF = () => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };

    useEffect(() => () => stopRAF(), []);

    const BAR_COUNT = 30;
    const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(0.15));

    useEffect(() => {
        const analyze = async () => {
            try {
                const res = await fetch(audioUrl);
                const arrayBuffer = await res.arrayBuffer();
                const ctx = new AudioContext();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                const channelData = audioBuffer.getChannelData(0);
                const samplesPerBar = Math.floor(channelData.length / BAR_COUNT);
                const amplitudes = Array.from({ length: BAR_COUNT }, (_, i) => {
                    let sum = 0;
                    for (let j = i * samplesPerBar; j < (i + 1) * samplesPerBar; j++) {
                        sum += Math.abs(channelData[j]);
                    }
                    return sum / samplesPerBar;
                });
                const max = Math.max(...amplitudes, 0.001);
                setBars(amplitudes.map(v => Math.max(0.08, v / max)));
                ctx.close();
            } catch {
            }
        };
        analyze();
    }, [audioUrl]);

    const progress = duration > 0 ? currentTime / duration : 0;
    const playedBars = Math.round(progress * BAR_COUNT);

    const formatTime = (s: number) => {
        if (!isFinite(s) || isNaN(s)) return '0:00';
        return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        isPlaying ? audioRef.current.pause() : audioRef.current.play();
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    };

    return (
        <div className="flex items-center gap-2.5 py-0.5" style={{ minWidth: '210px' }}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => { setIsPlaying(true); startRAF(); }}
                onPause={() => { setIsPlaying(false); stopRAF(); }}
                onEnded={() => { setIsPlaying(false); stopRAF(); setCurrentTime(0); }}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
            />

            <button
                onClick={togglePlay}
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isUser ? 'bg-white/20 hover:bg-white/35' : 'bg-[#1B8BCC]/15 hover:bg-[#1B8BCC]/25'}`}
            >
                {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="5" y="4" width="4" height="16" rx="1" />
                        <rect x="15" y="4" width="4" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                        <polygon points="5,3 19,12 5,21" />
                    </svg>
                )}
            </button>

            <div
                className="flex items-center gap-[2px] flex-1 h-8 cursor-pointer"
                onClick={handleSeek}
            >
                {bars.map((h, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-150 ${i < playedBars
                            ? (isUser ? 'bg-white' : 'bg-[#1B8BCC]')
                            : (isUser ? 'bg-white/35' : 'bg-gray-300')
                            }`}
                        style={{ height: `${Math.round(h * 26 + 4)}px` }}
                    />
                ))}
            </div>

            <span className={`text-[11px] font-mono tabular-nums shrink-0 ${isUser ? 'text-white/75' : 'text-gray-400'}`}>
                {formatTime(isPlaying || currentTime > 0 ? currentTime : duration)}
            </span>
        </div>
    );
}

const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const cvs = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                cvs.width = width;
                cvs.height = height;
                const ctx = cvs.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                cvs.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
                    } else {
                        reject(new Error('Compresión fallida'));
                    }
                }, 'image/jpeg', 0.7);
            };
            img.onerror = () => reject(new Error('Error al cargar la imagen'));
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
    });
};

export default function ChatWidget({
    apiKey = "biz_compustore",
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

    useEffect(() => {
        getOrCreateDeviceId().then(setSessionId);
    }, []);

    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "bot", text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [waveformBars, setWaveformBars] = useState<number[]>(Array(32).fill(0.08));
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const cancelRecordingRef = useRef(false);

    const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const BATCH_TIMEOUT = 500;
    const isSendingRef = useRef(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingImage, setPendingImage] = useState<File | null>(null);
    const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const dragCounterRef = useRef(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

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
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, []);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounterRef.current++;
        if (e.dataTransfer.types.includes('Files')) setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) setIsDraggingOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounterRef.current = 0;
        setIsDraggingOver(false);
        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
        if (!file) return;
        if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
        setPendingImage(file);
        setPendingImageUrl(URL.createObjectURL(file));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
        setPendingImage(file);
        setPendingImageUrl(URL.createObjectURL(file));
        e.target.value = '';
    };

    const clearPendingImage = () => {
        if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
        setPendingImage(null);
        setPendingImageUrl(null);
    };

    const sendImageToN8N = async (imageFile: File, caption: string = '') => {
        isSendingRef.current = true;
        setIsLoading(true);

        const imageUrl = URL.createObjectURL(imageFile);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: caption, imageUrl }]);
        setInputValue('');
        clearPendingImage();

        try {
            const compressedFile = await compressImage(imageFile);

            const formData = new FormData();
            formData.append('image', compressedFile, compressedFile.name);
            formData.append('sessionId', sessionId);
            formData.append('apiKey', apiKey);
            formData.append('userAgent', navigator.userAgent);
            formData.append('type', 'image');
            if (caption) formData.append('caption', caption);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error de conexión');

            const responseText = await response.text();
            if (!responseText) throw new Error('Sin respuesta');

            let botText = "Disculpa, no pude procesar eso.";
            try {
                const data = JSON.parse(responseText);
                if (data.response) botText = data.response;
                else if (data.output) botText = data.output;
                else if (data.text) botText = data.text;
                else if (typeof data === 'string') botText = data;
            } catch { botText = responseText; }

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', text: botText }]);
        } catch (error) {
            console.warn('[ChatWidget] sendImageToN8N error:', error instanceof Error ? error.message : error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: 'Lo siento, hubo un problema al enviar la imagen.' }]);
        } finally {
            setIsLoading(false);
            isSendingRef.current = false;
        }
    };

    const sendAudioToN8N = async (audioBlob: Blob) => {
        if (isLoading || isSendingRef.current) return;

        isSendingRef.current = true;
        setIsLoading(true);

        const audioUrl = URL.createObjectURL(audioBlob);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: '', audioUrl }]);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
            formData.append('sessionId', sessionId);
            formData.append('apiKey', apiKey);
            formData.append('userAgent', navigator.userAgent);
            formData.append('type', 'audio');

            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error de conexión');

            const responseText = await response.text();
            if (!responseText) throw new Error('No se recibió respuesta del asistente.');

            let botText = "Disculpa, no pude procesar eso.";
            try {
                const data = JSON.parse(responseText);
                if (data.response) botText = data.response;
                else if (data.output) botText = data.output;
                else if (typeof data === 'string') botText = data;
                else if (Array.isArray(data) && data[0]?.output) botText = data[0].output;
                else if (data.text) botText = data.text;
            } catch { botText = responseText; }

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', text: botText }]);
        } catch (error) {
            console.warn('[ChatWidget] sendAudioToN8N error:', error instanceof Error ? error.message : error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: 'Lo siento, hubo un problema al enviar el audio. Por favor intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
            isSendingRef.current = false;
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 128;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const BAR_COUNT = 32;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let smoothed = Array(BAR_COUNT).fill(0.08);
            const animate = () => {
                analyser.getByteFrequencyData(dataArray);
                smoothed = smoothed.map((curr, i) => {
                    const index = Math.floor(i * dataArray.length / BAR_COUNT);
                    const target = Math.max(0.08, dataArray[index] / 255);
                    return curr + (target - curr) * 0.25;
                });
                setWaveformBars([...smoothed]);
                animationFrameRef.current = requestAnimationFrame(animate);
            };
            animate();

            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev + 1 >= 35) {
                        setTimeout(() => stopRecording(), 50);
                        return 35;
                    }
                    return prev + 1;
                });
            }, 1000);

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            cancelRecordingRef.current = false;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                if (!cancelRecordingRef.current) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    await sendAudioToN8N(audioBlob);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error: any) {
            console.error("Error al acceder al micrófono:", error);

            let errorMessage = "No pudimos acceder al micrófono. Por favor verifica tus permisos.";
            if (error.name === "NotFoundError" || error.message?.includes("Requested device not found")) {
                errorMessage = "Lo siento, no detectamos ningún micrófono conectado. Por favor asegúrate de tener uno antes de grabar audios.";
            } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                errorMessage = "Parece que el navegador ha bloqueado el acceso al micrófono. Por favor, permite el acceso en la configuración de la página.";
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: errorMessage }]);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setWaveformBars(Array(32).fill(0.08));
            setRecordingTime(0);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            cancelRecordingRef.current = true;
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            setWaveformBars(Array(32).fill(0.08));
            setRecordingTime(0);
        }
    };

    const sendBatchedMessages = async (messagesToSend: Message[]) => {
        if (messagesToSend.length === 0 || isLoading || isSendingRef.current || !sessionId) return;

        isSendingRef.current = true;
        setIsLoading(true);

        try {
            const combinedMessage = messagesToSend.map((m) => m.text).join("\n\n");

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatInput: combinedMessage,
                    sessionId,
                    apiKey,
                    userAgent: navigator.userAgent,
                }),
            });

            if (!response.ok) throw new Error("Error de conexión");

            const responseText = await response.text();
            if (!responseText) {
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
                return setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 1).toString(), role: "bot", text: responseText }
                ]);
            }

            if (data.response) botText = data.response;
            else if (data.output) botText = data.output;
            else if (typeof data === 'string') botText = data;
            else if (Array.isArray(data) && data[0]?.output) botText = data[0].output;
            else if (data.text) botText = data.text;

            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "bot", text: botText },
            ]);
        } catch (error) {
            console.warn('[ChatWidget] sendBatchedMessages error:', error instanceof Error ? error.message : error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "bot", text: "Lo siento, hubo un problema al conectar. Por favor intenta de nuevo." },
            ]);
        } finally {
            setIsLoading(false);
            isSendingRef.current = false;
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isLoading || isSendingRef.current) return;

        if (pendingImage) {
            await sendImageToN8N(pendingImage, inputValue.trim());
            return;
        }

        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        setInputValue("");

        const userMsg: Message = { id: Date.now().toString(), role: "user", text: userText };
        setMessages(prev => [...prev, userMsg]);
        setPendingMessages(prev => [...prev, userMsg]);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            setPendingMessages(currentPending => {
                if (currentPending.length > 0) sendBatchedMessages(currentPending);
                return [];
            });
        }, BATCH_TIMEOUT);
    };

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[60] flex flex-col items-end gap-4">
            {!isOpen && (
                <div
                    className={`absolute bottom-20 right-0 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap transition-all duration-500 transform ${showTooltip
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                        }`}
                >
                    <div className="text-gray-700 font-medium text-sm">👋 ¿Necesitas ayuda con algo?</div>
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                </div>
            )}

            {isOpen && (
                <div
                    className="mb-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-100 origin-bottom-right flex flex-col relative"
                    style={{ maxHeight: '600px', height: '500px' }}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {isDraggingOver && (
                        <div className="absolute inset-0 z-10 rounded-lg bg-[#1B8BCC]/10 border-2 border-dashed border-[#1B8BCC] flex flex-col items-center justify-center gap-2 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1B8BCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                            <span className="text-[#1B8BCC] font-medium text-sm">Suelta la imagen aquí</span>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-[#1B8BCC] p-4 flex items-center justify-between text-white shrink-0 rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                            </svg>
                            <div>
                                <span className="font-semibold text-lg block leading-tight">Asistente Virtual</span>
                                <span className="text-xs text-white/60 font-mono">{apiKey}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                            aria-label="Cerrar chat"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-col h-full bg-gray-50 overflow-hidden rounded-b-lg">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-[80%] rounded-2xl text-sm overflow-hidden ${msg.role === 'user'
                                            ? 'bg-[#1B8BCC] text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                            } ${msg.imageUrl ? 'p-0' : msg.audioUrl ? 'p-1.5' : 'p-3'}`}
                                    >
                                        {msg.imageUrl ? (
                                            <>
                                                <img src={msg.imageUrl} alt="Imagen adjunta" className="max-w-full block" />
                                                {msg.text && <p className="px-3 py-2 text-sm">{msg.text}</p>}
                                            </>
                                        ) : msg.audioUrl ? (
                                            <AudioMessage audioUrl={msg.audioUrl} isUser={msg.role === 'user'} />
                                        ) : (
                                            msg.text
                                        )}
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

                        {/* Input area */}
                        <div className="px-3 pt-2 pb-3 bg-white border-t border-gray-200">
                            {pendingImageUrl && !isRecording && (
                                <div className="mb-2 relative inline-block">
                                    <img src={pendingImageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={clearPendingImage}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold leading-none"
                                    >×</button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                                {!isRecording && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-400 hover:text-[#1B8BCC] transition-colors shrink-0"
                                        aria-label="Adjuntar imagen"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                        </svg>
                                    </button>
                                )}
                                {isRecording ? (
                                    <div className="flex items-center gap-2 flex-1 px-1">
                                        <button
                                            type="button"
                                            onClick={cancelRecording}
                                            className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors shrink-0"
                                            title="Cancelar grabación"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                                        <div className="flex items-center justify-between flex-1 h-8">
                                            {waveformBars.map((scale, i) => (
                                                <div
                                                    key={i}
                                                    className="w-[2px] h-full bg-red-400 rounded-full"
                                                    style={{ transform: `scaleY(${scale})`, transformOrigin: 'center' }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-red-400 text-xs font-mono shrink-0 tabular-nums">
                                            {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                                        </span>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#1B8BCC] focus:ring-1 focus:ring-[#1B8BCC] text-gray-800"
                                    />
                                )}
                                {!isRecording && (inputValue.trim() || pendingImage) ? (
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-[#1B8BCC] text-white p-2.5 rounded-full hover:bg-[#1676ad] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                                        aria-label="Enviar mensaje"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isLoading}
                                        className={`p-2.5 rounded-full transition-colors shrink-0 flex items-center justify-center ${isRecording
                                            ? 'bg-red-500 text-white'
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

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-[#1B8BCC] text-white p-4 rounded-full shadow-lg hover:bg-[#1676ad] transition-all hover:scale-110 active:scale-95 flex items-center justify-center animate-bounce-subtle"
                    aria-label="Abrir asistente"
                    style={{ width: "60px", height: "60px" }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                </button>
            )}
        </div>
    );
}