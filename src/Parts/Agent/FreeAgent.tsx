import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiMic, FiSend, FiBookOpen } from 'react-icons/fi';
import './FreeAgent.css';

const API_BASE = process.env.REACT_APP_FREE_AGENT_API || 'http://localhost:8000';

type Role = 'user' | 'assistant';

interface Message {
    role: Role;
    content: string;
}

interface BookRef {
    title: string;
    author: string;
    genre: string;
    summary: string;
}

type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const STATUS_LABEL: Record<Status, string> = {
    idle: "Savolingizni yozing yoki mikrofonni bosing",
    listening: 'Tinglayapman...',
    thinking: 'O\'ylayapman...',
    speaking: 'Gapiryapman...',
    error: 'Xatolik yuz berdi',
};

export default function FreeAgent() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content:
                "Assalomu alaykum! Men kutubxona konsultantiman. Kitoblar haqida so'rang - masalan \"tarixiy roman tavsiya qiling\".",
        },
    ]);
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [textInput, setTextInput] = useState('');
    const [suggestedBooks, setSuggestedBooks] = useState<BookRef[]>([]);
    const [micSupported, setMicSupported] = useState(true);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const audioElRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);
    const mouthRef = useRef<SVGPathElement | null>(null);

    const chatLogRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            setMicSupported(false);
        }
    }, []);

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    // ---- Lip-sync animatsiya (audio amplitudasi asosida og'iz ochilishi) ----
    const animateMouth = useCallback(() => {
        const analyser = analyserRef.current;
        const mouth = mouthRef.current;
        if (!analyser || !mouth) return;

        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const level = Math.min(1, rms * 6);

        const openness = 4 + level * 22;
        mouth.setAttribute(
            'd',
            `M 78 128 Q 100 ${128 + openness} 122 128 Q 100 ${128 + openness * 0.4} 78 128 Z`
        );

        rafRef.current = requestAnimationFrame(animateMouth);
    }, []);

    const resetMouth = useCallback(() => {
        if (mouthRef.current) {
            mouthRef.current.setAttribute('d', 'M 78 128 Q 100 132 122 128 Q 100 130 78 128 Z');
        }
    }, []);

    const ensureAudioGraph = useCallback(() => {
        if (!audioElRef.current) return;
        if (!audioCtxRef.current) {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new Ctx();
        }
        if (!sourceRef.current) {
            const ctx = audioCtxRef.current;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            const source = ctx.createMediaElementSource(audioElRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            analyserRef.current = analyser;
            sourceRef.current = source;
        }
    }, []);

    const speak = useCallback(
        async (text: string) => {
            try {
                const res = await fetch(`${API_BASE}/api/tts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text }),
                });
                if (!res.ok) {
                    const detail = await res.json().catch(() => null);
                    throw new Error(detail?.detail || 'Ovoz sintezi ishlamadi');
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                if (!audioElRef.current) return;
                audioElRef.current.src = url;

                ensureAudioGraph();
                if (audioCtxRef.current?.state === 'suspended') {
                    await audioCtxRef.current.resume();
                }

                setStatus('speaking');
                await audioElRef.current.play();
                rafRef.current = requestAnimationFrame(animateMouth);
            } catch (err: any) {
                setStatus('idle');
                setErrorMsg(
                    err.message ||
                        'Ovozli javob ishlamadi. Backend (Piper TTS) ishga tushirilganini tekshiring.'
                );
            }
        },
        [animateMouth, ensureAudioGraph]
    );

    const handleAudioEnded = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        resetMouth();
        setStatus('idle');
    }, [resetMouth]);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;

            setErrorMsg(null);
            const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
            setMessages(nextMessages);
            setStatus('thinking');
            setSuggestedBooks([]);

            try {
                const res = await fetch(`${API_BASE}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: trimmed,
                        history: nextMessages.slice(-8),
                    }),
                });
                if (!res.ok) {
                    const detail = await res.json().catch(() => null);
                    throw new Error(detail?.detail || 'Backend bilan bog\'lanib bo\'lmadi');
                }
                const data = await res.json();
                setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
                setSuggestedBooks(data.books || []);
                await speak(data.reply);
            } catch (err: any) {
                setStatus('error');
                setErrorMsg(
                    err.message ||
                        'Backend bilan bog\'lanib bo\'lmadi. Backend ishga tushirilganini tekshiring (backend/start.ps1).'
                );
            }
        },
        [messages, speak]
    );

    const handleAudioSubmit = useCallback(
        async (blob: Blob) => {
            setStatus('thinking');
            setErrorMsg(null);
            try {
                const form = new FormData();
                form.append('file', blob, 'speech.webm');
                const res = await fetch(`${API_BASE}/api/transcribe`, {
                    method: 'POST',
                    body: form,
                });
                if (!res.ok) {
                    const detail = await res.json().catch(() => null);
                    throw new Error(detail?.detail || 'Nutqni tanib bo\'lmadi');
                }
                const data = await res.json();
                if (!data.text) {
                    setStatus('idle');
                    setErrorMsg('Gapingiz eshitilmadi, qaytadan urinib ko\'ring.');
                    return;
                }
                await sendMessage(data.text);
            } catch (err: any) {
                setStatus('error');
                setErrorMsg(
                    err.message ||
                        'Nutqni matnga aylantirib bo\'lmadi. Backend (Whisper) ishga tushirilganini tekshiring.'
                );
            }
        },
        [sendMessage]
    );

    const startRecording = useCallback(async () => {
        setErrorMsg(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];

            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                streamRef.current?.getTracks().forEach((t) => t.stop());
                handleAudioSubmit(blob);
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setStatus('listening');
        } catch (err) {
            setMicSupported(false);
            setErrorMsg('Mikrofonga ruxsat berilmadi. Brauzer sozlamalarini tekshiring.');
        }
    }, [handleAudioSubmit]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
    }, []);

    const handleMicClick = () => {
        if (status === 'listening') {
            stopRecording();
        } else if (status === 'idle' || status === 'error') {
            startRecording();
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'thinking' || status === 'speaking') return;
        const value = textInput;
        setTextInput('');
        sendMessage(value);
    };

    const isBusy = status === 'thinking' || status === 'speaking' || status === 'listening';

    return (
        <div className="free-agent">
            <div className="free-agent__panel">
                <div className="free-agent__avatar-wrap">
                    <div className={`free-agent__ring free-agent__ring--${status}`}>
                        <svg viewBox="0 0 200 220" className="free-agent__avatar-svg">
                            <ellipse cx="100" cy="205" rx="70" ry="30" fill="var(--fa-accent)" opacity="0.15" />
                            <path
                                d="M40 210 C40 150 55 190 55 150 C55 105 130 105 145 150 C145 190 160 150 160 210 Z"
                                fill="var(--fa-coat)"
                            />
                            <ellipse cx="100" cy="95" rx="52" ry="58" fill="var(--fa-skin)" />
                            <path
                                d="M48 90 C44 40 65 15 100 15 C135 15 156 40 152 90 C152 60 135 55 130 65 C118 45 82 45 70 65 C65 55 48 60 48 90 Z"
                                fill="var(--fa-hair)"
                            />
                            <path d="M42 95 C38 130 44 150 55 160" stroke="var(--fa-hair)" strokeWidth="14" fill="none" strokeLinecap="round" />
                            <path d="M158 95 C162 130 156 150 145 160" stroke="var(--fa-hair)" strokeWidth="14" fill="none" strokeLinecap="round" />
                            <ellipse cx="78" cy="95" rx="6" ry="8" fill="var(--fa-eye)" />
                            <ellipse cx="122" cy="95" rx="6" ry="8" fill="var(--fa-eye)" />
                            <path d="M68 80 Q78 74 88 80" stroke="var(--fa-brow)" strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M112 80 Q122 74 132 80" stroke="var(--fa-brow)" strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M96 100 Q100 112 96 116" stroke="var(--fa-brow)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                            <path
                                ref={mouthRef}
                                d="M78 128 Q100 132 122 128 Q100 130 78 128 Z"
                                fill="var(--fa-mouth)"
                                className="free-agent__mouth"
                            />
                        </svg>
                    </div>
                    <div className="free-agent__status">{STATUS_LABEL[status]}</div>

                    <button
                        type="button"
                        className={`free-agent__mic ${status === 'listening' ? 'is-recording' : ''}`}
                        onClick={handleMicClick}
                        disabled={!micSupported || status === 'thinking' || status === 'speaking'}
                        title={micSupported ? 'Mikrofon' : 'Mikrofon qo\'llab-quvvatlanmaydi'}
                    >
                        <FiMic size={22} />
                    </button>

                    {suggestedBooks.length > 0 && (
                        <div className="free-agent__books">
                            {suggestedBooks.map((b, i) => (
                                <div className="free-agent__book" key={i}>
                                    <FiBookOpen size={14} />
                                    <div>
                                        <div className="free-agent__book-title">{b.title}</div>
                                        <div className="free-agent__book-author">{b.author}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="free-agent__chat">
                    <div className="free-agent__log" ref={chatLogRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`free-agent__bubble free-agent__bubble--${m.role}`}>
                                {m.content}
                            </div>
                        ))}
                        {status === 'thinking' && (
                            <div className="free-agent__bubble free-agent__bubble--assistant free-agent__bubble--typing">
                                <span />
                                <span />
                                <span />
                            </div>
                        )}
                    </div>

                    {errorMsg && <div className="free-agent__error">{errorMsg}</div>}

                    <form className="free-agent__input-row" onSubmit={handleTextSubmit}>
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Xabar yozing..."
                            disabled={isBusy}
                        />
                        <button type="submit" disabled={isBusy || !textInput.trim()}>
                            <FiSend size={18} />
                        </button>
                    </form>
                </div>
            </div>

            <audio ref={audioElRef} onEnded={handleAudioEnded} hidden />
        </div>
    );
}
