import React from 'react';
import { useFeatures } from '../../context/FeatureContext';
import { X, Sliders, Bot, Zap, ShieldCheck, Sparkles, Check, Power, HelpCircle } from 'lucide-react';

export default function FeatureSettingsModal() {
    const { features, toggleFeature, setFeature, resetFeatures, isSettingsModalOpen, closeSettingsModal } = useFeatures();

    if (!isSettingsModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                                <span>Feature Activation Settings</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-semibold border border-blue-400/30">
                                    Control Panel
                                </span>
                            </h2>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Enable or disable optional modules. Both are OFF by default.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeSettingsModal}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Close settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Security & Non-interference Notice */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 leading-relaxed">
                            <strong className="text-blue-950 font-semibold block mb-0.5">Zero-Interference Architecture</strong>
                            These modules are completely modular. When toggled OFF, no background camera loops, timers, or API calls run. Existing core modules (Translate, Practice, Learn) remain 100% untouched.
                        </div>
                    </div>

                    {/* Feature 1: SignBot AI Assistant */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        features.signBot 
                            ? 'border-blue-300 bg-blue-50/40 shadow-xs ring-1 ring-blue-200' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                    features.signBot 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                        : 'bg-slate-100 text-slate-500'
                                }`}>
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900">SignBot AI Assistant</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            features.signBot 
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {features.signBot ? 'Enabled' : 'Disabled (Default)'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Interactive conversational AI tutor with voice synthesis, grounded in ASL vocabulary, plus real-time biomechanical hand posture diagnosis via webcam.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Chatbot</span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Voice Speech</span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Biomechanics</span>
                                    </div>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={features.signBot}
                                onClick={() => toggleFeature('signBot')}
                                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                                    features.signBot ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        features.signBot ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Feature 2: Sign Rush Time-Attack Game */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                        features.signRush 
                            ? 'border-indigo-300 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-200' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3.5">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                    features.signRush 
                                        ? 'bg-gradient-to-br from-amber-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                        : 'bg-slate-100 text-slate-500'
                                }`}>
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900">Sign Rush – Time-Attack Game</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            features.signRush 
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {features.signRush ? 'Enabled' : 'Disabled (Default)'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Fast-paced arcade gamification with 30s/60s time modes, streak multipliers, combo audio cues, celebratory confetti, and high-score tracking.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">30s / 60s Modes</span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Multipliers</span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Badges</span>
                                    </div>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                type="button"
                                role="switch"
                                aria-checked={features.signRush}
                                onClick={() => toggleFeature('signRush')}
                                className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                                    features.signRush ? 'bg-indigo-600' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        features.signRush ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={resetFeatures}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        Reset to Defaults (All OFF)
                    </button>
                    <button
                        type="button"
                        onClick={closeSettingsModal}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                    >
                        Done & Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
