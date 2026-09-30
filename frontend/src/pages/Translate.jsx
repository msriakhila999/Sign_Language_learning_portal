import React, { useState, useEffect, useRef } from 'react';
import CameraBox from '../components/camera/CameraBox';
import ConfidenceBar from '../components/common/ConfidenceBar';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import SignVisual from '../components/common/SignVisual';
import StepByStepModal from '../components/common/StepByStepModal';
import { api } from '../services/api';
import { speakText } from '../services/speechService';
import { evaluateSignAttempt, classifyHandSign } from '../services/signRecognition/signClassifier';
import { Camera, Volume2, Save, Trash2, CheckCircle2, AlertCircle, Sparkles, Activity, Lightbulb, Target, BookOpen, Layers, Zap } from 'lucide-react';

const CATEGORIES = [
    { id: 'All', name: 'All 21 Signs' },
    { id: 'Greetings', name: 'Greetings (4)' },
    { id: 'Common Words', name: 'Common Words (6)' },
    { id: 'Common Phrases', name: 'Phrases (5)' },
    { id: 'Alphabet', name: 'Alphabet (3)' },
    { id: 'Numbers', name: 'Numbers (3)' }
];

export default function Translate() {
    // Mode: 'auto' (Live Translate any sign) or 'practice' (verify against target sign)
    const [mode, setMode] = useState('auto');
    const [currentPrediction, setCurrentPrediction] = useState(null);
    const [targetSign, setTargetSign] = useState('Hello');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [evaluation, setEvaluation] = useState(null);
    const [savedStatus, setSavedStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [signsList, setSignsList] = useState([]);
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);
    
    // Auto-save stability tracking
    const lastSavedSignRef = useRef('');
    const stabilityCounterRef = useRef({ sign: '', count: 0 });

    useEffect(() => {
        api.getSigns().then(data => setSignsList(data)).catch(() => {});
    }, []);

    const triggerAutoSave = async (signName, confidence, meaning) => {
        if (!signName || signName === 'Detected Gesture') return;
        
        // Prevent duplicate saves of the same sign until the user changes signs
        if (lastSavedSignRef.current === signName) return;

        lastSavedSignRef.current = signName;

        try {
            const matched = signsList.find(s => s.sign_name.toLowerCase() === signName.toLowerCase());
            await api.saveTranslation({
                sign_id: matched?.sign_id || null,
                detected_sign: signName,
                confidence: confidence || 95,
                translated_text: matched?.meaning || meaning || `Detected sign: ${signName}`
            });
            setSavedStatus(`Auto-saved "${signName}" to History & DB! ✅`);
            setTimeout(() => setSavedStatus(''), 4000);
        } catch (err) {
            console.warn('Auto-save error:', err.message);
        }
    };

    const handleSignDetected = (result) => {
        if (!result) {
            setCurrentPrediction(null);
            setEvaluation(null);
            stabilityCounterRef.current = { sign: '', count: 0 };
            return;
        }

        // 1. In Live Auto-Translate Mode:
        if (mode === 'auto') {
            const detectedName = result.sign_name;
            const matched = signsList.find(s => s.sign_name.toLowerCase() === detectedName.toLowerCase()) || {};
            const pred = {
                ...result,
                sign_name: detectedName,
                meaning: matched.meaning || result.meaning || `Detected gesture: ${detectedName}`,
                confidence: result.confidence || 94
            };
            setCurrentPrediction(pred);
            setEvaluation(null);

            // Stability check for auto-save: require 3 consecutive frames of same sign
            if (stabilityCounterRef.current.sign === detectedName) {
                stabilityCounterRef.current.count += 1;
                if (stabilityCounterRef.current.count >= 3 && lastSavedSignRef.current !== detectedName) {
                    triggerAutoSave(detectedName, pred.confidence, pred.meaning);
                }
            } else {
                stabilityCounterRef.current = { sign: detectedName, count: 1 };
            }
        } 
        // 2. In Target Practice Mode:
        else {
            if (result.landmarks) {
                const evalResult = evaluateSignAttempt(result.landmarks, targetSign);
                setEvaluation(evalResult);

                const matched = signsList.find(s => s.sign_name.toLowerCase() === targetSign.toLowerCase()) || {};
                const resolvedPred = {
                    ...result,
                    sign_name: evalResult.isCorrect ? targetSign : result.sign_name,
                    meaning: matched.meaning || result.meaning,
                    confidence: evalResult.isCorrect ? evalResult.confidence : (result.confidence || 85)
                };
                setCurrentPrediction(resolvedPred);

                if (evalResult.isCorrect && lastSavedSignRef.current !== targetSign) {
                    triggerAutoSave(targetSign, evalResult.confidence, matched.meaning);
                }
            }
        }
    };

    const handleSpeak = () => {
        if (currentPrediction) {
            const textToSpeak = `${currentPrediction.sign_name}. ${currentPrediction.meaning || ''}`;
            speakText(textToSpeak);
        }
    };

    const handleManualSave = async () => {
        const signToSave = mode === 'practice' && evaluation?.isCorrect ? targetSign : currentPrediction?.sign_name;
        if (!signToSave) return;

        try {
            setIsSaving(true);
            setError('');
            const matched = signsList.find(s => s.sign_name.toLowerCase() === signToSave.toLowerCase());
            await api.saveTranslation({
                sign_id: matched?.sign_id || null,
                detected_sign: signToSave,
                confidence: currentPrediction?.confidence || 95,
                translated_text: matched?.meaning || currentPrediction?.meaning || `Detected sign: ${signToSave}`
            });
            setSavedStatus(`Saved "${signToSave}" to History! ✅`);
            setTimeout(() => setSavedStatus(''), 4000);
        } catch (err) {
            setError(err.message || 'Failed to save translation history.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear your translation history?')) return;
        try {
            await api.clearTranslationHistory();
            setSavedStatus('Translation history cleared! 🗑️');
            lastSavedSignRef.current = '';
            setTimeout(() => setSavedStatus(''), 3000);
        } catch (err) {
            setError('Failed to clear history: ' + err.message);
        }
    };

    const handleClear = () => {
        setCurrentPrediction(null);
        setEvaluation(null);
        setSavedStatus('');
        setError('');
        lastSavedSignRef.current = '';
        stabilityCounterRef.current = { sign: '', count: 0 };
    };

    const filteredSigns = signsList.filter(sign => {
        if (selectedCategory === 'All') return true;
        return sign.category_name === selectedCategory;
    });

    const displayedSignForVisual = mode === 'auto' 
        ? (currentPrediction?.sign_name || 'Hello')
        : targetSign;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header & Mode Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <Camera className="w-4 h-4" />
                        <span>Real-time Vision & Translation Studio</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Sign Language Translator
                    </h1>
                    <p className="text-slate-600 text-sm max-w-2xl">
                        {mode === 'auto'
                            ? 'Live Auto-Translator actively detects whatever sign you perform from all 21 signs and saves it to history.'
                            : `Evaluating your hand posture against the target sign: "${targetSign}".`}
                    </p>
                </div>

                {/* Mode Switch Tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                    <button
                        onClick={() => { setMode('auto'); setEvaluation(null); lastSavedSignRef.current = ''; }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            mode === 'auto'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Zap className="w-4 h-4" />
                        <span>Live Auto-Translate</span>
                    </button>
                    <button
                        onClick={() => { setMode('practice'); lastSavedSignRef.current = ''; }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            mode === 'practice'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Target className="w-4 h-4" />
                        <span>Target Practice Mode</span>
                    </button>
                </div>
            </div>

            {/* Target Sign Selector Bar (Only in Practice Mode) */}
            {mode === 'practice' && (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Category:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-blue-600" />
                                <span>Choose Sign to Verify ({filteredSigns.length} Signs):</span>
                            </span>
                            <button
                                onClick={() => setIsStepModalOpen(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>View Step-by-Step Guide for {targetSign}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {filteredSigns.map((sign) => {
                                const isSelected = targetSign.toLowerCase() === sign.sign_name.toLowerCase();
                                return (
                                    <button
                                        key={sign.sign_id}
                                        onClick={() => { 
                                            setTargetSign(sign.sign_name); 
                                            setEvaluation(null); 
                                            lastSavedSignRef.current = '';
                                        }}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/30'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {sign.sign_name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Translation Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Camera View */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span>Live Camera Feed</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            {mode === 'auto' ? (
                                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Auto-Detecting Any Sign</span>
                                </span>
                            ) : (
                                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
                                    Target: <span className="font-black">{targetSign}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <CameraBox onSignDetected={handleSignDetected} />
                </div>

                {/* Translation & Feedback Panel */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>{mode === 'auto' ? 'Live Translation Result' : 'Postural Evaluation'}</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            {currentPrediction && (
                                <button
                                    onClick={handleClear}
                                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Clear
                                </button>
                            )}
                            <button
                                onClick={handleClearHistory}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 ml-2"
                                title="Clear translation history"
                            >
                                Reset History
                            </button>
                        </div>
                    </div>

                    {/* Visual Natural Gesture Illustration Card */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-slate-200/90 flex items-center gap-4">
                        <div 
                            onClick={() => setIsStepModalOpen(true)}
                            className="w-24 h-24 shrink-0 bg-white rounded-2xl p-1 border border-slate-200 shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all group relative"
                            title="Click to view step-by-step posing guide"
                        >
                            <SignVisual signName={displayedSignForVisual} className="w-full h-full" />
                            <div className="absolute inset-0 bg-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-700 drop-shadow" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {mode === 'auto' ? 'Detected Hand Gesture' : 'Target Gesture'}
                            </span>
                            <h4 className="text-2xl font-black text-slate-900">{displayedSignForVisual}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1">
                                {signsList.find(s => s.sign_name.toLowerCase() === displayedSignForVisual.toLowerCase())?.meaning || 'Perform hand pose in camera frame.'}
                            </p>
                            <button
                                onClick={() => setIsStepModalOpen(true)}
                                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors border border-blue-200"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>How to Pose (3 Steps)</span>
                            </button>
                        </div>
                    </div>

                    {/* Result Status: Auto-mode or Practice-mode */}
                    {mode === 'auto' ? (
                        currentPrediction ? (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-black text-xl text-blue-900">
                                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                            <span>{currentPrediction.sign_name}</span>
                                        </div>
                                        <button
                                            onClick={handleSpeak}
                                            className="p-2 rounded-xl bg-white text-blue-600 hover:bg-blue-100 shadow-xs border border-blue-200 transition-colors"
                                            title="Pronounce translation"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                        {currentPrediction.meaning}
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <ConfidenceBar confidence={currentPrediction.confidence} />
                                </div>

                                {savedStatus && (
                                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>{savedStatus}</span>
                                    </div>
                                )}

                                {error && <ErrorMessage message={error} />}

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button
                                        variant="secondary"
                                        onClick={handleSpeak}
                                        className="gap-2 py-2.5 text-xs"
                                    >
                                        <Volume2 className="w-4 h-4 text-blue-600" />
                                        <span>Speak</span>
                                    </Button>

                                    <Button
                                        onClick={handleManualSave}
                                        disabled={isSaving}
                                        className="gap-2 py-2.5 text-xs"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{isSaving ? 'Saving...' : 'Save to DB'}</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4 space-y-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700">Awaiting Hand Sign in Camera</h4>
                                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                    Hold up your hand and perform any sign (Water, Hello, Number 1, Food, Help, etc.). Real-time translation will appear instantly.
                                </p>
                            </div>
                        )
                    ) : (
                        evaluation ? (
                            <div className="space-y-4 animate-in fade-in">
                                {evaluation.isCorrect ? (
                                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
                                        <div className="flex items-center gap-2 font-black text-lg text-emerald-900">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                            <span>CORRECT! GESTURE MATCH</span>
                                        </div>
                                        <p className="text-xs font-medium text-emerald-700">
                                            Your hand pose matches <strong>{targetSign}</strong> accurately! Result recorded.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                                        <div className="flex items-center gap-2 font-black text-base text-amber-900">
                                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                            <span>INCORRECT (Detected: {evaluation.detectedSign || currentPrediction?.sign_name})</span>
                                        </div>
                                        <div className="bg-white/85 p-3.5 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1.5">
                                            <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                                                <span>Suggested Hand Adjustment:</span>
                                            </div>
                                            <p className="text-slate-700 leading-relaxed font-semibold">
                                                {evaluation.suggestedChange}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <ConfidenceBar confidence={evaluation.confidence} />
                                </div>

                                {savedStatus && (
                                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>{savedStatus}</span>
                                    </div>
                                )}

                                {error && <ErrorMessage message={error} />}

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button
                                        variant="secondary"
                                        onClick={handleSpeak}
                                        className="gap-2 py-2.5 text-xs"
                                    >
                                        <Volume2 className="w-4 h-4 text-blue-600" />
                                        <span>Speak</span>
                                    </Button>

                                    <Button
                                        onClick={handleManualSave}
                                        disabled={isSaving}
                                        className="gap-2 py-2.5 text-xs"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{isSaving ? 'Saving...' : 'Save to DB'}</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4 space-y-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-700">Awaiting Target Gesture: {targetSign}</h4>
                                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                    Present your sign for <strong>{targetSign}</strong>. Live postural feedback will appear here.
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Interactive Step-by-Step Pose Modal */}
            <StepByStepModal
                isOpen={isStepModalOpen}
                onClose={() => setIsStepModalOpen(false)}
                signName={displayedSignForVisual}
                onSelectTry={(sign) => {
                    setTargetSign(sign);
                    setIsStepModalOpen(false);
                }}
            />
        </div>
    );
}
