import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSignSteps } from '../../services/signStepsData';
import SignVisual from './SignVisual';
import { X, ArrowLeft, ArrowRight, Camera, Lightbulb, CheckCircle2, Sparkles, Hand } from 'lucide-react';

export default function StepByStepModal({ isOpen, onClose, signName, onSelectTry }) {
    const navigate = useNavigate();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const signData = getSignSteps(signName);

    useEffect(() => {
        // Reset to first step whenever a new sign is loaded
        setCurrentStepIndex(0);
    }, [signName, isOpen]);

    if (!isOpen || !signData) return null;

    const steps = signData.steps || [];
    const totalSteps = steps.length;
    const currentStep = steps[currentStepIndex] || steps[0];

    const handleNext = () => {
        if (currentStepIndex < totalSteps - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleTryOnCamera = () => {
        onClose();
        if (onSelectTry) {
            onSelectTry(signData.sign_name);
        } else {
            navigate(`/translate`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm">
                                {signData.category}
                            </span>
                            <span className="text-xs text-blue-200 font-medium">Interactive Guide</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <span>How to Pose: {signData.sign_name}</span>
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        title="Close Guide"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Step Progress Pills */}
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        {steps.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStepIndex(idx)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    currentStepIndex === idx
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : idx < currentStepIndex
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {idx < currentStepIndex ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                    <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                                        {idx + 1}
                                    </span>
                                )}
                                <span>Step {idx + 1}</span>
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                        {currentStepIndex + 1} of {totalSteps}
                    </span>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    {/* Visual Hand Pose Preview & Step Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        {/* Hand Illustration */}
                        <div className="sm:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 rounded-2xl border border-slate-200/90 shadow-inner flex flex-col items-center justify-center aspect-square">
                            <SignVisual signName={signData.sign_name} className="w-full h-full max-h-48" />
                            <span className="mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Target Hand Shape
                            </span>
                        </div>

                        {/* Step Details */}
                        <div className="sm:col-span-7 space-y-4">
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                    Step {currentStep.step}: {currentStep.title}
                                </span>
                                <h4 className="text-lg font-extrabold text-slate-900 pt-1 leading-snug">
                                    {currentStep.instruction}
                                </h4>
                            </div>

                            {/* Finger Placement Hint Callout */}
                            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-slate-800 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Finger Placement Tip:</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium">
                                    {currentStep.fingerHint}
                                </p>
                            </div>

                            <p className="text-xs text-slate-500 italic">
                                "{signData.summary}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation Bar */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentStepIndex === 0}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentStepIndex === 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-700 hover:bg-slate-200/80 bg-white border border-slate-200 shadow-xs'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {currentStepIndex < totalSteps - 1 ? (
                            <button
                                onClick={handleNext}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow transition-all flex items-center gap-1.5"
                            >
                                <span>Next Step</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleTryOnCamera}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 animate-pulse"
                            >
                                <Camera className="w-4 h-4" />
                                <span>Try On Camera Now</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
