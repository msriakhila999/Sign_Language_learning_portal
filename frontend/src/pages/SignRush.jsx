import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFeatures } from '../context/FeatureContext';
import { useAuth } from '../context/AuthContext';
import CameraBox from '../components/camera/CameraBox';
import SignVisual from '../components/common/SignVisual';
import { evaluateSignAttempt, classifyHandSign } from '../services/signRecognition/signClassifier';
import { api } from '../services/api';
import { 
    Zap, Timer, Trophy, Flame, Play, RotateCcw, Volume2, VolumeX, 
    Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, 
    Lightbulb, ChevronDown, ChevronUp, FastForward, Award, Sliders, Calendar
} from 'lucide-react';

// Default static fallback signs catalog (guarantees zero null pointers even before DB fetch completes)
const DEFAULT_SIGNS_CATALOG = [
    { sign_id: 1, sign_name: 'Hello', category_name: 'Greetings', description: 'Open flat hand salute at temple' },
    { sign_id: 2, sign_name: 'Thank You', category_name: 'Greetings', description: 'Flat hand touching chin extending out' },
    { sign_id: 3, sign_name: 'Please', category_name: 'Greetings', description: 'Flat palm rubbing in circle over chest' },
    { sign_id: 4, sign_name: 'Sorry', category_name: 'Greetings', description: 'Fist rubbing in circle over chest' },
    { sign_id: 5, sign_name: 'Yes', category_name: 'Common Words', description: 'Fist nodding up and down like a head nod' },
    { sign_id: 6, sign_name: 'No', category_name: 'Common Words', description: 'Index and middle fingers snapping against thumb' },
    { sign_id: 7, sign_name: 'Good', category_name: 'Common Words', description: 'Flat hand from chin into palm' },
    { sign_id: 8, sign_name: 'Bad', category_name: 'Common Words', description: 'Flat hand flipped downward' },
    { sign_id: 9, sign_name: 'Water', category_name: 'Common Words', description: 'W-handshape index finger touching chin' },
    { sign_id: 10, sign_name: 'Food', category_name: 'Common Words', description: 'Fingertips pinched together tapping lips' },
    { sign_id: 11, sign_name: 'Help', category_name: 'Common Phrases', description: 'Thumbs-up resting on opposite flat palm' },
    { sign_id: 12, sign_name: 'Friend', category_name: 'Common Phrases', description: 'Hooked index fingers linked together' },
    { sign_id: 13, sign_name: 'Letter A', category_name: 'Alphabet', description: 'Fist with thumb resting upright beside index' },
    { sign_id: 14, sign_name: 'Letter B', category_name: 'Alphabet', description: '4 fingers extended together, thumb tucked across palm' },
    { sign_id: 15, sign_name: 'Letter C', category_name: 'Alphabet', description: 'Curved C-shape arc with fingers and thumb' },
    { sign_id: 16, sign_name: 'Number 1', category_name: 'Numbers', description: 'Index finger extended straight up' },
    { sign_id: 17, sign_name: 'Number 2', category_name: 'Numbers', description: 'Index and middle fingers in V-shape' },
    { sign_id: 18, sign_name: 'Number 3', category_name: 'Numbers', description: 'Thumb, index, and middle fingers extended' }
];

// Web Audio API Synthesizer for 100% dependency-free arcade sound effects
class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
    }

    playTone(freq, duration = 0.15, type = 'sine', gainVal = 0.1) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio tone error:', e);
        }
    }

    playSuccess(streak = 1) {
        if (this.muted) return;
        const baseFreq = 523.25; // C5
        const multiplier = Math.min(2.0, 1 + streak * 0.1);
        setTimeout(() => this.playTone(baseFreq * multiplier, 0.12, 'triangle', 0.15), 0);
        setTimeout(() => this.playTone(baseFreq * 1.25 * multiplier, 0.12, 'triangle', 0.15), 90);
        setTimeout(() => this.playTone(baseFreq * 1.5 * multiplier, 0.22, 'triangle', 0.18), 180);
    }

    playTick() {
        if (this.muted) return;
        this.playTone(880, 0.05, 'sine', 0.05);
    }

    playUrgentTick() {
        if (this.muted) return;
        this.playTone(1174, 0.08, 'square', 0.08);
    }

    playFanfare() {
        if (this.muted) return;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 0.2, 'triangle', 0.18), idx * 110);
        });
    }

    playSkip() {
        if (this.muted) return;
        this.playTone(330, 0.12, 'sawtooth', 0.08);
        setTimeout(() => this.playTone(220, 0.18, 'sawtooth', 0.08), 80);
    }
}

const sfx = new SoundFX();

// Calculate genuine Daily Streak using localStorage dates (pure helper function)
function calculateDailyStreak() {
    try {
        const lastPlayed = localStorage.getItem('signrush_last_played_date');
        const storedStreak = parseInt(localStorage.getItem('signrush_daily_streak') || '0', 10);
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (!lastPlayed) return 0;
        if (lastPlayed === today) return storedStreak;
        if (lastPlayed === yesterday) return storedStreak;
        // More than 1 day missed: streak reset
        return 0;
    } catch (e) {
        return 0;
    }
}

export default function SignRush() {
    const { features, openSettingsModal } = useFeatures();
    const { isAuthenticated } = useAuth();

    // STRICT REQUIREMENT: If Sign Rush is disabled, render only the inactive notice
    if (!features?.signRush) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <Zap className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        Optional Feature Disabled
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Sign Rush is Currently OFF
                    </h1>
                    <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                        Sign Rush is an optional gamification module. To maintain zero background resource consumption, it remains completely inactive until you explicitly enable it in Feature Settings.
                    </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={openSettingsModal}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                        <Sliders className="w-4 h-4" />
                        <span>Enable in Feature Settings</span>
                    </button>
                    <Link
                        to="/"
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return <SignRushActive isAuthenticated={isAuthenticated} openSettingsModal={openSettingsModal} />;
}

function SignRushActive({ isAuthenticated, openSettingsModal: propOpenSettingsModal }) {
    const { openSettingsModal: ctxOpenSettingsModal } = useFeatures();
    const openSettingsModal = propOpenSettingsModal || ctxOpenSettingsModal;

    // Game States: 'LOBBY' | 'PLAYING' | 'GAMEOVER'
    const [gameState, setGameState] = useState('LOBBY');
    const [gameDuration, setGameDuration] = useState(30); // 30s Blitz or 60s Marathon
    const [difficulty, setDifficulty] = useState('all');   // 'alphabet', 'words', 'all'
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Live Gameplay State
    const [timeLeft, setTimeLeft] = useState(30);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreakInRun, setBestStreakInRun] = useState(0);
    const [signsCleared, setSignsCleared] = useState(0);
    const [signsAttempted, setSignsAttempted] = useState(0);
    const [targetSign, setTargetSign] = useState(DEFAULT_SIGNS_CATALOG[0]);
    const [detectedResult, setDetectedResult] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [successFlash, setSuccessFlash] = useState(false);

    // Persistent Records
    const [highScore, setHighScore] = useState(() => {
        return parseInt(localStorage.getItem('signrush_high_score') || '0', 10);
    });
    const [allTimeBestStreak, setAllTimeBestStreak] = useState(() => {
        return parseInt(localStorage.getItem('signrush_best_streak') || '0', 10);
    });
    const [dailyStreak, setDailyStreak] = useState(() => {
        return calculateDailyStreak();
    });

    const [allSigns, setAllSigns] = useState(DEFAULT_SIGNS_CATALOG);
    const canvasConfettiRef = useRef(null);
    const isHandlingSuccessRef = useRef(false);

    // Load signs from MySQL API on mount
    useEffect(() => {
        async function loadSigns() {
            try {
                const data = await api.getSigns();
                if (data && Array.isArray(data) && data.length > 0) {
                    setAllSigns(data);
                }
            } catch (err) {
                console.warn('Using default sign catalog:', err.message);
            }
        }
        loadSigns();
    }, []);

    // Record today's play in daily streak
    const recordDailyPlay = () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const lastPlayed = localStorage.getItem('signrush_last_played_date');
            const currentDaily = parseInt(localStorage.getItem('signrush_daily_streak') || '0', 10);

            let newStreak = 1;
            if (lastPlayed === today) {
                newStreak = Math.max(1, currentDaily);
            } else if (lastPlayed === yesterday) {
                newStreak = currentDaily + 1;
            } else {
                newStreak = 1;
            }

            localStorage.setItem('signrush_last_played_date', today);
            localStorage.setItem('signrush_daily_streak', newStreak.toString());
            setDailyStreak(newStreak);
        } catch (e) {
            console.warn('Error recording daily streak:', e);
        }
    };

    // Filter signs based on chosen difficulty
    const getFilteredSigns = useCallback(() => {
        const pool = allSigns && allSigns.length > 0 ? allSigns : DEFAULT_SIGNS_CATALOG;
        if (difficulty === 'alphabet') {
            return pool.filter((s) => 
                s.sign_name.toLowerCase().startsWith('letter') || 
                s.sign_name.toLowerCase().startsWith('number')
            );
        }
        if (difficulty === 'words') {
            return pool.filter((s) => 
                !s.sign_name.toLowerCase().startsWith('letter') && 
                !s.sign_name.toLowerCase().startsWith('number')
            );
        }
        return pool;
    }, [allSigns, difficulty]);

    const getRandomSign = useCallback((excludeSignName = null) => {
        const pool = getFilteredSigns();
        if (!pool || pool.length === 0) return DEFAULT_SIGNS_CATALOG[0];
        const validPool = excludeSignName ? pool.filter(s => s.sign_name !== excludeSignName) : pool;
        const list = validPool.length > 0 ? validPool : pool;
        return list[Math.floor(Math.random() * list.length)];
    }, [getFilteredSigns]);

    // Confetti Animation Canvas
    const triggerConfetti = () => {
        const canvas = canvasConfettiRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const particles = [];
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.7) * 14,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }

        let animationFrame;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.35; // gravity
                p.life -= p.decay;
                if (p.life > 0) {
                    alive = true;
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = p.life;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            if (alive) {
                animationFrame = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
        render();
    };

    // Start Game Functionality
    const startGame = () => {
        sfx.muted = !soundEnabled;
        sfx.init();

        const initialSign = getRandomSign();
        setTargetSign(initialSign);
        setTimeLeft(gameDuration);
        setScore(0);
        setStreak(0);
        setBestStreakInRun(0);
        setSignsCleared(0);
        setSignsAttempted(1);
        setDetectedResult(null);
        setShowHint(false);
        isHandlingSuccessRef.current = false;
        setGameState('PLAYING');

        recordDailyPlay();
    };

    // End Game & Update Records (defined before timer effect to ensure clean invocation)
    const handleGameOver = useCallback(() => {
        setGameState('GAMEOVER');
        sfx.playFanfare();

        // Update high score & best streak in localStorage
        setHighScore((prevHigh) => {
            if (score > prevHigh) {
                try {
                    localStorage.setItem('signrush_high_score', score.toString());
                } catch (e) {}
                return score;
            }
            return prevHigh;
        });

        setAllTimeBestStreak((prevStreak) => {
            if (bestStreakInRun > prevStreak) {
                try {
                    localStorage.setItem('signrush_best_streak', bestStreakInRun.toString());
                } catch (e) {}
                return bestStreakInRun;
            }
            return prevStreak;
        });
    }, [score, bestStreakInRun]);

    // Bulletproof Timer Loop with automatic clean game-over trigger
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        if (timeLeft <= 0) {
            handleGameOver();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                if (prev <= 6) {
                    sfx.playUrgentTick();
                } else if (prev % 5 === 0) {
                    sfx.playTick();
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, timeLeft <= 0, handleGameOver]);

    // Real-Time Gesture Detection Hook
    const handleGestureDetected = (result) => {
        if (gameState !== 'PLAYING' || !targetSign || isHandlingSuccessRef.current) {
            setDetectedResult(null);
            return;
        }

        if (!result || !result.landmarks || result.landmarks.length < 21) {
            setDetectedResult(null);
            return;
        }

        setDetectedResult(result);

        if (!targetSign || !targetSign.sign_name) return;

        const evalRes = evaluateSignAttempt(result.landmarks, targetSign.sign_name, result.handedness);
        const directClassified = classifyHandSign(result.landmarks, result.handedness);

        // Match only if dedicated evaluation confirms correctness OR classifier matches target with high confidence
        const isMatch = (evalRes && evalRes.isCorrect && (evalRes.confidence || 0) >= 80) || 
            (directClassified && directClassified.sign_name && directClassified.sign_name.toLowerCase() === targetSign.sign_name.toLowerCase() && (directClassified.confidence || 0) >= 80);

        if (isMatch) {
            handleSignSuccess();
        }
    };

    // Correct Sign Cleared Handler
    const handleSignSuccess = () => {
        if (isHandlingSuccessRef.current) return;
        isHandlingSuccessRef.current = true;

        const currentStreak = streak + 1;
        setStreak(currentStreak);
        if (currentStreak > bestStreakInRun) {
            setBestStreakInRun(currentStreak);
        }

        // Multipliers: 1-2 => 1x, 3-4 => 1.5x, 5-6 => 2x, 7+ => 3x
        let multiplier = 1.0;
        if (currentStreak >= 7) multiplier = 3.0;
        else if (currentStreak >= 5) multiplier = 2.0;
        else if (currentStreak >= 3) multiplier = 1.5;

        // Base 100 pts + remaining time bonus
        const speedBonus = Math.round(timeLeft * 5);
        const pointsAwarded = Math.round((100 + speedBonus) * multiplier);

        setScore((prev) => prev + pointsAwarded);
        setSignsCleared((prev) => prev + 1);

        // Visual and Audio Celebrations
        sfx.playSuccess(currentStreak);
        triggerConfetti();
        setSuccessFlash(true);
        setTimeout(() => setSuccessFlash(false), 350);

        // Async log practice attempt if user is authenticated (does not block gameplay)
        if (isAuthenticated && targetSign.sign_id) {
            api.recordPractice({
                sign_id: targetSign.sign_id,
                detected_sign: targetSign.sign_name,
                confidence: 96,
                is_correct: true
            }).catch(e => console.warn('Practice log sync:', e.message));
        }

        // Transition to next sign after brief 350ms pause
        setTimeout(() => {
            const next = getRandomSign(targetSign.sign_name);
            setTargetSign(next);
            setSignsAttempted((prev) => prev + 1);
            setShowHint(false);
            setDetectedResult(null);
            isHandlingSuccessRef.current = false;
        }, 350);
    };

    // Skip Sign Handler
    const handleSkip = () => {
        if (gameState !== 'PLAYING') return;
        sfx.playSkip();
        setStreak(0); // Reset streak on skip
        setTimeLeft((prev) => Math.max(1, prev - 4)); // 4s time penalty
        const next = getRandomSign(targetSign?.sign_name);
        setTargetSign(next);
        setSignsAttempted((prev) => prev + 1);
        setShowHint(false);
        setDetectedResult(null);
    };

    const toggleSound = () => {
        const nextState = !soundEnabled;
        setSoundEnabled(nextState);
        sfx.muted = !nextState;
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Confetti Fullscreen Overlay */}
            <canvas
                ref={canvasConfettiRef}
                width={800}
                height={600}
                className="fixed inset-0 pointer-events-none z-50 w-full h-full"
            />

            {/* SCREEN 1: LOBBY */}
            {gameState === 'LOBBY' && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
                    {/* Hero Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300/40 text-amber-700 text-xs font-bold uppercase tracking-wider shadow-xs">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>Speed ASL Challenge</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                            Sign <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Rush</span> ⚡
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                            Race against the clock! Form prompted sign language gestures in front of your camera to score points, build streaks, and conquer the leaderboard.
                        </p>
                    </div>

                    {/* Stats Highlights: High Score, Best Streak, Daily Streak */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-1">
                            <Trophy className="w-5 h-5 text-amber-500 mx-auto" />
                            <div className="text-2xl font-black text-slate-900">{highScore}</div>
                            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">All-Time High</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-1">
                            <Flame className="w-5 h-5 text-rose-500 mx-auto" />
                            <div className="text-2xl font-black text-slate-900">{allTimeBestStreak}x</div>
                            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Best Streak</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center space-y-1">
                            <Calendar className="w-5 h-5 text-indigo-500 mx-auto" />
                            <div className="text-2xl font-black text-slate-900">{dailyStreak} Days</div>
                            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Daily Streak</div>
                        </div>
                    </div>

                    {/* Game Configuration Panel */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-6">
                        {/* Time Mode Selection */}
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Timer className="w-4 h-4 text-indigo-600" />
                                <span>1. Select Challenge Duration:</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setGameDuration(30)}
                                    className={`p-4 rounded-2xl border text-left transition-all ${
                                        gameDuration === 30
                                            ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black">30 Seconds</span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-800">
                                            Blitz
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-normal mt-1">High-intensity sprint challenge.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setGameDuration(60)}
                                    className={`p-4 rounded-2xl border text-left transition-all ${
                                        gameDuration === 60
                                            ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black">60 Seconds</span>
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800">
                                            Marathon
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-normal mt-1">Test your sustained signing endurance.</p>
                                </button>
                            </div>
                        </div>

                        {/* Difficulty Selection */}
                        <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-indigo-600" />
                                <span>2. Select Vocabulary Pool:</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'alphabet', label: 'Alphabets & Numbers', sub: 'A, B, C, 1, 2, 3' },
                                    { id: 'words', label: 'Everyday Signs', sub: 'Water, Help, Yes, No...' },
                                    { id: 'all', label: 'Full Mastery', sub: 'All 21 signs mixed' }
                                ].map((d) => (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() => setDifficulty(d.id)}
                                        className={`p-3 rounded-2xl border text-center transition-all ${
                                            difficulty === d.id
                                                ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                                                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700'
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{d.label}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{d.sub}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sound & Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={toggleSound}
                                className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                                <span>Arcade Audio Cues: {soundEnabled ? 'ON' : 'MUTED'}</span>
                            </button>

                            <button
                                onClick={openSettingsModal}
                                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1"
                            >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Settings</span>
                            </button>
                        </div>

                        {/* Start Game CTA */}
                        <button
                            type="button"
                            onClick={startGame}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-base shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
                        >
                            <Play className="w-5 h-5 fill-white" />
                            <span>Start Sign Rush ({gameDuration}s)</span>
                        </button>
                    </div>
                </div>
            )}

            {/* SCREEN 2: ACTIVE GAMEPLAY */}
            {gameState === 'PLAYING' && (
                <div className={`space-y-4 animate-in fade-in duration-200 ${
                    successFlash ? 'ring-4 ring-emerald-400/80 rounded-3xl transition-all' : ''
                }`}>
                    {/* Top Game Bar */}
                    <div className="p-4 rounded-3xl bg-slate-900 text-white flex items-center justify-between shadow-lg border border-slate-800">
                        {/* Countdown Timer */}
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-colors ${
                                timeLeft <= 5 
                                    ? 'bg-rose-600 text-white animate-pulse' 
                                    : (timeLeft <= 10 ? 'bg-amber-500 text-white' : 'bg-indigo-600/50 text-indigo-200 border border-indigo-400/30')
                            }`}>
                                {timeLeft}s
                            </div>
                            <div>
                                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining Time</span>
                                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${
                                            timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-400'
                                        }`}
                                        style={{ width: `${(timeLeft / gameDuration) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Streak & Multiplier */}
                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border ${
                                streak >= 3 
                                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 animate-bounce' 
                                    : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}>
                                <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                                <span className="text-xs font-black">
                                    {streak} Streak {streak >= 7 ? '(3x!)' : (streak >= 5 ? '(2x!)' : (streak >= 3 ? '(1.5x)' : ''))}
                                </span>
                            </div>
                        </div>

                        {/* Current Score */}
                        <div className="text-right">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Score</span>
                            <span className="text-2xl font-black text-emerald-400">{score.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Main Arena Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Target Sign Prompt Card (Left 5 Cols) */}
                        <div className="lg:col-span-5 flex flex-col space-y-4">
                            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                                            Current Sign Prompt
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">#{signsAttempted}</span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                        {targetSign?.sign_name || 'Loading...'}
                                    </h2>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {targetSign?.description || 'Form this gesture in front of your camera!'}
                                    </p>
                                </div>

                                {/* Visual Reference Hint Toggle */}
                                <div className="my-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowHint(!showHint)}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
                                    >
                                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{showHint ? 'Hide Pose Guide' : 'Need a hint? Show Pose Guide'}</span>
                                        {showHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>

                                    {showHint && targetSign && (
                                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-4 animate-in fade-in duration-200">
                                            <div className="w-20 h-20 bg-white rounded-xl border border-slate-200 p-1 shrink-0 overflow-hidden shadow-xs">
                                                <SignVisual signName={targetSign.sign_name} />
                                            </div>
                                            <div className="text-[11px] text-slate-600 leading-tight">
                                                <strong className="text-slate-800 block mb-0.5">{targetSign.sign_name} Handshape:</strong>
                                                {targetSign.description}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Skip Button & Action */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1.5"
                                        title="Skip this sign (-4s penalty)"
                                    >
                                        <FastForward className="w-3.5 h-3.5" />
                                        <span>Skip Sign (-4s)</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleGameOver}
                                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        End Game Early
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Live Webcam & Landmark Arena (Right 7 Cols) */}
                        <div className="lg:col-span-7 space-y-3">
                            <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
                                {/* CameraBox mounts with autoStart=true to power on webcam immediately */}
                                <CameraBox 
                                    autoStart={true}
                                    showControls={false}
                                    onSignDetected={handleGestureDetected}
                                />
                            </div>

                            {/* Live Detection Feedback Bar */}
                            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${
                                        detectedResult?.sign_name ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'
                                    }`} />
                                    <span className="text-slate-500">Live Detected Pose:</span>
                                    <strong className="text-slate-900 font-bold">
                                        {detectedResult?.sign_name || 'Scanning Hand...'}
                                    </strong>
                                </div>

                                {detectedResult?.sign_name && targetSign && (
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                                        detectedResult.sign_name.toLowerCase() === targetSign.sign_name.toLowerCase()
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}>
                                        {detectedResult.sign_name.toLowerCase() === targetSign.sign_name.toLowerCase()
                                            ? 'Match! Hold Position'
                                            : 'Adjust to Target'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SCREEN 3: GAME OVER & SUMMARY */}
            {gameState === 'GAMEOVER' && (
                <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl text-center space-y-6">
                        {/* Trophy Icon & Header */}
                        <div className="space-y-2">
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-400/30">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Time's Up!</h2>
                            <p className="text-xs text-slate-500">Here is your Sign Rush performance summary:</p>
                        </div>

                        {/* Final Score Banner */}
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 space-y-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Final Score</span>
                            <div className="text-4xl sm:text-5xl font-black text-indigo-950">{score.toLocaleString()}</div>
                            {score >= highScore && score > 0 && (
                                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                                    ⭐ New Personal High Score!
                                </span>
                            )}
                        </div>

                        {/* Stats Breakdown Grid */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                <div className="text-xl font-black text-slate-900">{signsCleared}</div>
                                <div className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Signs Cleared</div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                <div className="text-xl font-black text-slate-900">{bestStreakInRun}x</div>
                                <div className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Max Streak</div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                <div className="text-xl font-black text-slate-900">
                                    {signsAttempted > 0 ? Math.round((signsCleared / signsAttempted) * 100) : 0}%
                                </div>
                                <div className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Accuracy</div>
                            </div>
                        </div>

                        {/* Earned Achievement Badges */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-left space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                                Badges Earned in this Run:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {signsCleared >= 1 && (
                                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>First Blood</span>
                                    </span>
                                )}
                                {bestStreakInRun >= 3 && (
                                    <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 border border-amber-200">
                                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Hot Streak (3+)</span>
                                    </span>
                                )}
                                {bestStreakInRun >= 5 && (
                                    <span className="px-2.5 py-1 rounded-xl bg-indigo-100 text-indigo-800 text-xs font-semibold flex items-center gap-1 border border-indigo-200">
                                        <Zap className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Lightning Hands (5+)</span>
                                    </span>
                                )}
                                {score >= 1000 && (
                                    <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-1 border border-purple-200">
                                        <Trophy className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Century Club (1,000+ pts)</span>
                                    </span>
                                )}
                                {signsCleared === 0 && (
                                    <span className="text-xs text-slate-400 italic">No badges earned. Try again!</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                            <button
                                type="button"
                                onClick={startGame}
                                className="w-full sm:flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Play Again ({gameDuration}s)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGameState('LOBBY')}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                            >
                                Back to Lobby
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
