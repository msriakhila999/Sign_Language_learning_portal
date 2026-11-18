import React from 'react';
import { useFeatures } from '../context/FeatureContext';
import { Sliders, Bot, Zap, ShieldCheck, Check, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureSettings() {
    const { features, toggleFeature, resetFeatures } = useFeatures();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <Sliders className="w-4 h-4" />
                        <span>Optional Feature System</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Feature Activation Settings
                    </h1>
                    <p className="text-sm text-slate-600">
                        Independently control optional features. Both modules are completely disabled by default.
                    </p>
                </div>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors self-start sm:self-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* Zero-interference Guarantee Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-start gap-3.5 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-slate-600">
                    <h3 className="font-bold text-slate-900 text-sm">Protected Core Architecture</h3>
                    <p className="leading-relaxed">
                        When features are toggled OFF, they consume zero system resources, initialize no webcam streams, and make zero network requests. Your core modules (Translate, Practice, Learn, Dashboard) operate completely untouched.
                    </p>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SignBot AI Assistant Card */}
                <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                    features.signBot 
                        ? 'border-blue-300 bg-blue-50/30 shadow-md ring-1 ring-blue-200' 
                        : 'border-slate-200 bg-white shadow-xs'
                }`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                features.signBot 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                    : 'bg-slate-100 text-slate-500'
                            }`}>
                                <Bot className="w-7 h-7" />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                features.signBot 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                                {features.signBot ? 'Active (ON)' : 'Disabled (OFF)'}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">SignBot AI Assistant</h2>
                            <p className="text-xs text-slate-500 mt-1">Chatbot + Biomechanical Hand Feedback</p>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            A smart tutor that answers questions about sign vocabulary, offers voice input/speech synthesis, and performs on-demand camera posture checks to diagnose finger positions and distance.
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Grounded Knowledge</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Speech TTS</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Posture Diagnostics</span>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Enable SignBot</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={features.signBot}
                            onClick={() => toggleFeature('signBot')}
                            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                                features.signBot ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                    features.signBot ? 'translate-x-7' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Sign Rush Time-Attack Game Card */}
                <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                    features.signRush 
                        ? 'border-indigo-300 bg-indigo-50/30 shadow-md ring-1 ring-indigo-200' 
                        : 'border-slate-200 bg-white shadow-xs'
                }`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                features.signRush 
                                    ? 'bg-gradient-to-br from-amber-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                    : 'bg-slate-100 text-slate-500'
                            }`}>
                                <Zap className="w-7 h-7" />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                features.signRush 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                                {features.signRush ? 'Active (ON)' : 'Disabled (OFF)'}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Sign Rush – Time Attack</h2>
                            <p className="text-xs text-slate-500 mt-1">Gamification + Streaks & Badges</p>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Race against the clock in 30-second or 60-second modes. Test real ASL signing speed with streak multipliers, combo audio chimes, celebratory particle confetti, and progress recording.
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">30s / 60s Blitz</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Streak Multipliers</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">Arcade Sounds</span>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">Enable Sign Rush</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={features.signRush}
                            onClick={() => toggleFeature('signRush')}
                            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                                features.signRush ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                    features.signRush ? 'translate-x-7' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <span>Preferences are automatically saved to your browser storage.</span>
                <button
                    type="button"
                    onClick={resetFeatures}
                    className="font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                    Reset All Features to OFF
                </button>
            </div>
        </div>
    );
}
