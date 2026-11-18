import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CameraBox from '../components/camera/CameraBox';
import ConfidenceBar from '../components/common/ConfidenceBar';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import SignVisual from '../components/common/SignVisual';
import StepByStepModal from '../components/common/StepByStepModal';
import { evaluateSignAttempt } from '../services/signRecognition/signClassifier';
import { api } from '../services/api';
import { Award, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Target, ArrowRight, Lightbulb, BookOpen, HelpCircle } from 'lucide-react';

export default function Practice() {
    const [searchParams] = useSearchParams();
    const initialSignId = searchParams.get('sign');

    const [signs, setSigns] = useState([]);
    const [targetSign, setTargetSign] = useState(null);
    const [detectedResult, setDetectedResult] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recording, setRecording] = useState(false);
    const [error, setError] = useState('');
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);

    useEffect(() => {
        fetchSigns();
    }, []);

    const fetchSigns = async () => {
        try {
            setLoading(true);
            const data = await api.getSigns();
            setSigns(data);

            if (data.length > 0) {
                if (initialSignId) {
                    const match = data.find((s) => s.sign_id === parseInt(initialSignId, 10));
                    setTargetSign(match || data[0]);
                } else {
                    setTargetSign(data[0]);
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to load practice challenge signs.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignDetected = (result) => {
        if (!result || !targetSign) {
            setDetectedResult(null);
            setEvaluation(null);
            return;
        }

        setDetectedResult(result);
        const evalRes = evaluateSignAttempt(result.landmarks || [], targetSign.sign_name, result.handedness);
        
        // Match if either dedicated sign evaluation is correct OR classifier directly matches
        const isMatch = evalRes.isCorrect || 
            (result.sign_name && result.sign_name.toLowerCase() === targetSign.sign_name.toLowerCase());

        const finalEval = {
            isCorrect: isMatch,
            status: isMatch ? 'CORRECT' : 'INCORRECT',
            detectedSign: isMatch ? targetSign.sign_name : (evalRes.detectedSign || result.sign_name || 'Detected Gesture'),
            confidence: isMatch ? (evalRes.confidence || result.confidence || 96) : (evalRes.confidence || 75),
            suggestedChange: isMatch ? 'Hold position to complete verification!' : evalRes.suggestedChange
        };

        setEvaluation(finalEval);

        if (isMatch && !recording) {
            savePracticeResult(finalEval, true);
        }
    };

    const savePracticeResult = async (evalData, isCorrect) => {
        if (!targetSign || recording) return;

        try {
            setRecording(true);
            await api.recordPractice({
                sign_id: targetSign.sign_id,
                detected_sign: targetSign.sign_name,
                confidence: evalData.confidence || 95,
                is_correct: isCorrect
            });
            console.log('✅ Practice result saved to DB and user_progress updated for sign:', targetSign.sign_name);
        } catch (err) {
            console.warn('Error saving practice attempt:', err.message);
        } finally {
            // Set 3-second cooldown to avoid duplicate DB insertions per video frame
            setTimeout(() => {
                setRecording(false);
            }, 3000);
        }
    };

    const nextChallenge = () => {
        if (signs.length === 0) return;
        const randomIndex = Math.floor(Math.random() * signs.length);
        setTargetSign(signs[randomIndex]);
        setDetectedResult(null);
        setEvaluation(null);
    };

    if (loading) return <LoadingSpinner fullPage message="Loading practice challenge studio..." />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        <Award className="w-4 h-4" />
                        <span>Interactive Practice Challenge</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Practice & Hand Adjustment Evaluation
                    </h1>
                </div>

                <Button onClick={nextChallenge} variant="secondary" className="gap-2 text-xs">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span>Random Challenge</span>
                </Button>
            </div>

            {/* Main Challenge Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Challenge Target Card & Camera */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Challenge Banner with Visual Hand Shape */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-md flex items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Your Challenge</span>
                            <h2 className="text-3xl font-black">{targetSign?.sign_name || 'THANK YOU'}</h2>
                            <p className="text-xs text-blue-100 max-w-sm">{targetSign?.meaning}</p>
                            <button
                                onClick={() => setIsStepModalOpen(true)}
                                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm transition-all shadow-xs"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>How to Pose (Step-by-Step)</span>
                            </button>
                        </div>
                        <div 
                            onClick={() => setIsStepModalOpen(true)}
                            className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md border border-white/30 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            title="Click to view step-by-step instructions"
                        >
                            <SignVisual signName={targetSign?.sign_name} className="w-full h-full" />
                        </div>
                    </div>

                    {/* Camera View */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <CameraBox onSignDetected={handleSignDetected} />
                    </div>
                </div>

                {/* Challenge Feedback & Evaluation */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Evaluation & Suggested Change</span>
                    </h3>

                    {/* Evaluation Status Banner */}
                    {evaluation?.isCorrect ? (
                        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                            <h3 className="text-xl font-black text-emerald-900">CORRECT! PERFECT GESTURE</h3>
                            <p className="text-xs text-emerald-700 font-medium">
                                You performed <strong>{targetSign?.sign_name}</strong> accurately. Result logged to your dashboard.
                            </p>
                            <Button onClick={nextChallenge} size="sm" variant="success" className="mt-3 gap-1.5 text-xs">
                                <span>Next Challenge</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ) : evaluation ? (
                        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                            <div className="flex items-center gap-2 font-black text-base text-amber-900">
                                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                                <span>INCORRECT (Detected: {evaluation.detectedSign})</span>
                            </div>

                            {/* Explicit Adjustment Guidance Tip */}
                            <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Suggested Physical Change:</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-semibold">
                                    {evaluation.suggestedChange}
                                </p>
                                <button
                                    onClick={() => setIsStepModalOpen(true)}
                                    className="pt-1 text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                                >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>Open Step-by-Step Posing Guide →</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                            <Target className="w-8 h-8 text-slate-400 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-700">Ready for Evaluation</h4>
                            <p className="text-xs text-slate-500">
                                Start the webcam and execute the sign gesture for <strong>{targetSign?.sign_name}</strong>. Real-time feedback and suggested changes will display here.
                            </p>
                            <button
                                onClick={() => setIsStepModalOpen(true)}
                                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>View Step-by-Step Guide</span>
                            </button>
                        </div>
                    )}

                    {/* Breakdown */}
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected Sign</span>
                                <p className="font-bold text-slate-800 text-sm">{targetSign?.sign_name}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Detected Sign</span>
                                <p className="font-bold text-slate-800 text-sm">
                                    {detectedResult ? detectedResult.sign_name : '—'}
                                </p>
                            </div>
                        </div>

                        {detectedResult && (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <ConfidenceBar confidence={detectedResult.confidence} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Interactive Step-by-Step Pose Guide Modal */}
            <StepByStepModal
                isOpen={isStepModalOpen}
                onClose={() => setIsStepModalOpen(false)}
                signName={targetSign?.sign_name}
                onSelectTry={(sign) => {
                    const match = signs.find(s => s.sign_name.toLowerCase() === sign.toLowerCase());
                    if (match) setTargetSign(match);
                    setIsStepModalOpen(false);
                }}
            />
        </div>
    );
}
