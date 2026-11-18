import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFeatures } from '../../context/FeatureContext';
import { 
    Bot, X, Send, Sparkles, Volume2, Mic, MicOff, RefreshCw, 
    Lightbulb, MessageSquare, Hand, Check, Zap, Camera, CameraOff,
    Activity, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle,
    Maximize2, Minimize2, KeyRound, ExternalLink, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import CameraBox from '../camera/CameraBox';
import { extractHandFeatures, evaluateSignAttempt, classifyHandSign } from '../../services/signRecognition/signClassifier';

const QUICK_PROMPTS = [
    "How do I pose 'Water'?",
    "Why is my 'Letter B' failing?",
    "What signs should I practice next?",
    "Explain the difference between Yes and Sorry."
];

const COMMON_SIGNS = [
    'General Posture Check',
    'Letter A',
    'Letter B',
    'Letter C',
    'Number 1',
    'Number 2',
    'Number 3',
    'Water',
    'Food',
    'Help',
    'Please',
    'Sorry',
    'Yes',
    'No',
    'Good',
    'Bad',
    'Friend'
];

export default function SignBotAssistant() {
    const { features } = useFeatures();

    // STRICT REQUIREMENT: If SignBot is disabled in Feature Settings, do not render or run anything
    if (!features?.signBot) {
        return null;
    }

    return <SignBotAssistantActive />;
}

function SignBotAssistantActive() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'posture'

    // AI Provider Status
    const [aiStatus, setAiStatus] = useState({ configured: false, provider: 'Unknown' });

    // Chat state
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'bot',
            text: "Hello! I am **SignBot**, your AI Sign Language Assistant. Ask me how to pose any sign, resolve practice doubts, or switch to **Posture Check** for real-time camera feedback on your hand positioning!",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);

    // Biomechanical Posture Camera state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [selectedTargetSign, setSelectedTargetSign] = useState('General Posture Check');
    const [biomechanicsData, setBiomechanicsData] = useState(null);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Check backend AI provider configuration status on mount
    useEffect(() => {
        async function checkStatus() {
            try {
                const status = await api.getAIStatus();
                setAiStatus(status);
            } catch (e) {
                console.warn('Failed to retrieve AI provider status:', e.message);
            }
        }
        checkStatus();
    }, []);

    // Auto-scroll chat to latest message
    useEffect(() => {
        if (isOpen && activeTab === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, activeTab, isMaximized]);

    // STRICT CAMERA CONFLICT RESOLUTION: Stop camera whenever assistant closes or tab changes
    useEffect(() => {
        if (!isOpen || activeTab !== 'posture') {
            setIsCameraActive(false);
            setBiomechanicsData(null);
        }
    }, [isOpen, activeTab]);

    // Initialize Web Speech Recognition if supported
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
                handleSend(transcript);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.warn('Speech recognition start error:', err);
                setIsListening(false);
            }
        }
    };

    const handleSend = async (manualText) => {
        const textToSend = manualText || inputValue;
        if (!textToSend || !textToSend.trim() || isLoading) return;

        const userMsg = {
            id: 'user-' + Date.now(),
            sender: 'user',
            text: textToSend.trim(),
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const context = {
                currentPage: location.pathname
            };

            const data = await api.chatWithAI(userMsg.text, context);
            const botMsg = {
                id: 'bot-' + Date.now(),
                sender: 'bot',
                text: data.reply || "I didn't receive an answer from the AI provider. Please try again.",
                provider: data.provider || 'Google Gemini',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            let errorText = "⚠️ **AI Assistant Service Notice**\n\n";

            if (error.message && error.message.includes('No AI API Key is configured')) {
                errorText += "No live AI API key is configured in `backend/.env`.\n\n" +
                    "**To enable live Gemini AI answers:**\n" +
                    "1. Open `backend/.env`\n" +
                    "2. Add your key: `GEMINI_API_KEY=your_key_here`\n" +
                    "3. Restart the backend server (`npm run dev`)";
            } else {
                errorText += `${error.message || 'Unable to connect to AI service. Please verify backend server and API key.'}`;
            }

            const errorMsg = {
                id: 'bot-err-' + Date.now(),
                sender: 'bot',
                isError: true,
                text: errorText,
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeak = (text, id) => {
        if (!('speechSynthesis' in window)) return;

        if (speakingId === id) {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
            return;
        }

        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);

        setSpeakingId(id);
        window.speechSynthesis.speak(utterance);
    };

    const handleClearChat = () => {
        if (window.confirm('Clear conversation history?')) {
            setMessages([
                {
                    id: 'welcome-reset',
                    sender: 'bot',
                    text: "Conversation reset! What sign language topic would you like assistance with?",
                    timestamp: new Date()
                }
            ]);
        }
    };

    // Real-time Hand Posture & Biomechanical Evaluation from MediaPipe landmarks
    const handleBiomechanicsDetection = (result) => {
        if (!result || !result.landmarks || result.landmarks.length < 21) {
            setBiomechanicsData(null);
            return;
        }

        const landmarks = result.landmarks;
        const handedness = result.handedness || 'Right';
        const f = extractHandFeatures(landmarks, handedness);

        if (!f) {
            setBiomechanicsData(null);
            return;
        }

        // 1. Distance & Scale check
        let framing = "OPTIMAL";
        let framingFeedback = "Optimal distance. Hand is clearly visible.";
        if (f.palmSize < 0.12) {
            framing = "TOO_FAR";
            framingFeedback = "Hand is too far from camera. Move closer for clear tracking.";
        } else if (f.palmSize > 0.42) {
            framing = "TOO_CLOSE";
            framingFeedback = "Hand is too close to camera. Move slightly back.";
        }

        // 2. Centering check
        let centeringFeedback = "Hand is nicely centered.";
        let isCentered = true;
        if (f.wrist.x < 0.18 || f.wrist.x > 0.82 || f.wrist.y < 0.15 || f.wrist.y > 0.88) {
            centeringFeedback = "Try positioning your hand within the camera center.";
            isCentered = false;
        }

        // 3. Target sign comparison if user selected a sign
        let targetEval = null;
        if (selectedTargetSign && selectedTargetSign !== 'General Posture Check') {
            targetEval = evaluateSignAttempt(landmarks, selectedTargetSign, handedness);
        }

        // 4. Detected gesture
        const detected = classifyHandSign(landmarks, handedness);

        setBiomechanicsData({
            hasHand: true,
            palmSize: Math.round(f.palmSize * 100),
            framing,
            framingFeedback,
            isCentered,
            centeringFeedback,
            handedness,
            orientation: f.isPointingDown ? "Fingers Pointing Down" : (f.isThumbUp ? "Thumb Pointing Up" : "Facing Forward"),
            fingers: {
                thumb: f.isThumbExtended ? "Extended" : "Folded / Tucked",
                index: f.index.isExtended ? "Straight" : (f.index.isCurled ? "Curled" : "Bent"),
                middle: f.middle.isExtended ? "Straight" : (f.middle.isCurled ? "Curled" : "Bent"),
                ring: f.ring.isExtended ? "Straight" : (f.ring.isCurled ? "Curled" : "Bent"),
                pinky: f.pinky.isExtended ? "Straight" : (f.pinky.isCurled ? "Curled" : "Bent")
            },
            detectedSign: detected ? detected.sign_name : 'Pose Unclassified',
            targetEval
        });
    };

    const formatBotMessage = (text) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            if (line.startsWith('• ') || line.startsWith('- ')) {
                const content = line.substring(2);
                return (
                    <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
                        <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
                    </li>
                );
            }
            if (/^\d+\.\s/.test(line)) {
                return (
                    <div key={idx} className="text-xs leading-relaxed font-semibold my-1 text-slate-800">
                        <span dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
                    </div>
                );
            }
            return (
                <p key={idx} className="text-xs leading-relaxed my-1">
                    <span dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
                </p>
            );
        });
    };

    const parseBold = (str) => {
        return str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    };

    return (
        <div className="z-50">
            {/* Floating Trigger Button (when closed) */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
                        title="Open SignBot AI Assistant"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                <Bot className="w-5 h-5 text-cyan-200" />
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-blue-700 animate-pulse" />
                        </div>
                        <div className="text-left hidden sm:block pr-1">
                            <span className="block text-xs font-black tracking-wide flex items-center gap-1">
                                <span>SignBot AI</span>
                                <Sparkles className="w-3 h-3 text-amber-300" />
                            </span>
                            <span className="block text-[10px] text-blue-100 font-medium">Tutor & Biomechanics</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Main Window Container (Compact Drawer or Maximized Workspace) */}
            {isOpen && (
                <div className={`${
                    isMaximized 
                        ? 'fixed inset-3 sm:inset-6 z-50 max-w-5xl mx-auto h-[92vh]' 
                        : 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[460px] h-[600px] max-h-[88vh]'
                } bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
                    
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shadow-md shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                                    <span>SignBot AI Assistant</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                                        aiStatus.configured 
                                            ? 'bg-emerald-500/20 text-emerald-300' 
                                            : 'bg-amber-500/20 text-amber-300'
                                    }`}>
                                        {aiStatus.configured ? 'AI Connected' : 'Setup Required'}
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-300 font-normal">
                                    {aiStatus.configured ? `${aiStatus.provider} (${aiStatus.model})` : 'Grounded 21 Signs & Biomechanics'}
                                </p>
                            </div>
                        </div>

                        {/* Window Controls: Clear, Maximize/Minimize, Close */}
                        <div className="flex items-center gap-1">
                            {activeTab === 'chat' && (
                                <button
                                    onClick={handleClearChat}
                                    className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title="Clear conversation"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                            
                            {/* Expand / Collapse Button */}
                            <button
                                onClick={() => setIsMaximized(!isMaximized)}
                                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title={isMaximized ? "Collapse panel" : "Expand panel"}
                            >
                                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={() => { setIsOpen(false); setIsMaximized(false); }}
                                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Close SignBot"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="bg-slate-100/90 p-1.5 flex gap-1 border-b border-slate-200/80 shrink-0">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === 'chat'
                                    ? 'bg-white text-blue-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>AI Chat Tutor</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('posture')}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === 'posture'
                                    ? 'bg-white text-indigo-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Hand className="w-3.5 h-3.5" />
                            <span>Biomechanics Check</span>
                        </button>
                    </div>

                    {/* TAB 1: Chat Tutor */}
                    {activeTab === 'chat' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Messages Body */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-xs ${
                                                msg.sender === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-xs'
                                                    : msg.isError
                                                        ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-bl-xs'
                                                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                                            }`}
                                        >
                                            {msg.sender === 'user' ? (
                                                <p className="text-xs leading-relaxed">{msg.text}</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {formatBotMessage(msg.text)}
                                                    <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 mt-2">
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {msg.provider ? `Model: ${msg.provider}` : 'SignBot Tutor'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleSpeak(msg.text, msg.id)}
                                                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-[10px]"
                                                            title="Read response aloud"
                                                        >
                                                            <Volume2 className="w-3.5 h-3.5" />
                                                            <span>{speakingId === msg.id ? 'Stop' : 'Listen'}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200/80 max-w-[70%] shadow-xs">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                                        <span className="text-xs text-slate-400 ml-1">SignBot is querying AI model...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Prompts Bar */}
                            <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
                                {QUICK_PROMPTS.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(prompt)}
                                        className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium transition-colors shrink-0 border border-slate-200/60"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>

                            {/* Input Bar */}
                            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`p-2.5 rounded-xl border transition-all ${
                                        isListening
                                            ? 'bg-red-500 text-white border-red-600 animate-pulse'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                    }`}
                                    title={isListening ? "Listening... click to stop" : "Speak question with microphone"}
                                >
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>

                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={isListening ? "Listening to your voice..." : "Ask SignBot about any sign..."}
                                    className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                                    disabled={isLoading}
                                />

                                <button
                                    type="button"
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-xs"
                                    title="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Biomechanical Feedback */}
                    {activeTab === 'posture' && (
                        <div className={`flex-1 p-4 overflow-y-auto bg-slate-50 ${
                            isMaximized ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'space-y-3.5 flex flex-col'
                        }`}>
                            {/* Left Pane: Camera & Posture Controls */}
                            <div className="space-y-3">
                                {/* Header Controls: Sign Selector & Start/Stop Camera */}
                                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            <Activity className="w-4 h-4 text-indigo-600" />
                                            <span>Target Sign Posture:</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400">MediaPipe Vision 3D</span>
                                    </div>

                                    <select
                                        value={selectedTargetSign}
                                        onChange={(e) => setSelectedTargetSign(e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 font-medium"
                                    >
                                        {COMMON_SIGNS.map((s, idx) => (
                                            <option key={idx} value={s}>{s}</option>
                                        ))}
                                    </select>

                                    {/* Explicit Start / Stop Camera Button */}
                                    <div className="pt-1">
                                        {!isCameraActive ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsCameraActive(true)}
                                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                                            >
                                                <Camera className="w-4 h-4" />
                                                <span>Start Hand Camera</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setIsCameraActive(false)}
                                                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                                            >
                                                <CameraOff className="w-4 h-4" />
                                                <span>Stop Camera (Release Stream)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Live Video Stream Area */}
                                {isCameraActive ? (
                                    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-md">
                                        <CameraBox 
                                            autoStart={true}
                                            compact={true}
                                            showControls={false}
                                            onSignDetected={handleBiomechanicsDetection}
                                        />
                                    </div>
                                ) : (
                                    <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-xs">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                            <Hand className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">Live Posture Diagnosis</h4>
                                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                            Click <strong>Start Hand Camera</strong> above to enable MediaPipe landmark tracking and inspect your hand positioning in real time.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Pane: Biomechanical Diagnostics Dashboard */}
                            <div className="space-y-3">
                                {biomechanicsData && biomechanicsData.hasHand ? (
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5 animate-in fade-in">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-bold text-slate-900">
                                                    {biomechanicsData.handedness} Hand Tracked (21 Landmarks)
                                                </span>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                                {biomechanicsData.orientation}
                                            </span>
                                        </div>

                                        {/* Distance & Centering Diagnostics */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className={`p-2.5 rounded-xl border ${
                                                biomechanicsData.framing === 'OPTIMAL' 
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                            }`}>
                                                <div className="font-bold text-[10px] uppercase">Distance Check</div>
                                                <div className="text-[11px] font-medium mt-0.5">{biomechanicsData.framingFeedback}</div>
                                            </div>

                                            <div className={`p-2.5 rounded-xl border ${
                                                biomechanicsData.isCentered 
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                                    : 'bg-amber-50 border-amber-200 text-amber-800'
                                            }`}>
                                                <div className="font-bold text-[10px] uppercase">Frame Alignment</div>
                                                <div className="text-[11px] font-medium mt-0.5">{biomechanicsData.centeringFeedback}</div>
                                            </div>
                                        </div>

                                        {/* Finger Joint States Breakdown */}
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                                                <span>Finger Joint States:</span>
                                                <span className="text-slate-400 font-normal">3D MCP-PIP-TIP Angles</span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-1.5 text-[10px] text-center font-medium">
                                                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                    <span className="text-slate-400 block text-[9px]">Thumb</span>
                                                    <span className="text-slate-800 font-bold block mt-0.5">{biomechanicsData.fingers.thumb}</span>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                    <span className="text-slate-400 block text-[9px]">Index</span>
                                                    <span className="text-slate-800 font-bold block mt-0.5">{biomechanicsData.fingers.index}</span>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                    <span className="text-slate-400 block text-[9px]">Middle</span>
                                                    <span className="text-slate-800 font-bold block mt-0.5">{biomechanicsData.fingers.middle}</span>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                    <span className="text-slate-400 block text-[9px]">Ring</span>
                                                    <span className="text-slate-800 font-bold block mt-0.5">{biomechanicsData.fingers.ring}</span>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                                                    <span className="text-slate-400 block text-[9px]">Pinky</span>
                                                    <span className="text-slate-800 font-bold block mt-0.5">{biomechanicsData.fingers.pinky}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Target Sign Evaluation & Corrections */}
                                        {biomechanicsData.targetEval && (
                                            <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                                                biomechanicsData.targetEval.isCorrect
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                    : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                                            }`}>
                                                {biomechanicsData.targetEval.isCorrect ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                                )}
                                                <div className="text-xs leading-relaxed">
                                                    <div className="font-bold flex items-center justify-between">
                                                        <span>{selectedTargetSign} Posture Evaluation:</span>
                                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70">
                                                            {biomechanicsData.targetEval.confidence}% match
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 font-medium">{biomechanicsData.targetEval.suggestedChange}</p>
                                                </div>
                                            </div>
                                        )}

                                        {!biomechanicsData.targetEval && (
                                            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                                                <span>Active Gesture Pose:</span>
                                                <strong className="text-slate-900 font-bold">{biomechanicsData.detectedSign}</strong>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 space-y-1.5 shadow-xs">
                                        <Hand className="w-6 h-6 text-slate-300 mx-auto" />
                                        <p className="font-semibold text-slate-700">
                                            {isCameraActive ? 'Waiting for hand in camera frame...' : 'Camera is currently stopped.'}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Hold your hand clearly in front of the camera lens with fingers visible to evaluate posture.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
