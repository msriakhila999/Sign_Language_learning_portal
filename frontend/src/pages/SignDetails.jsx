import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import SignVisual from '../components/common/SignVisual';
import StepByStepModal from '../components/common/StepByStepModal';
import { getSignSteps } from '../services/signStepsData';
import { ArrowLeft, Award, Volume2, Info, Sparkles, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { speakText } from '../services/speechService';

export default function SignDetails() {
    const { id } = useParams();
    const [sign, setSign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);

    useEffect(() => {
        fetchSignDetails();
    }, [id]);

    const fetchSignDetails = async () => {
        try {
            setLoading(true);
            const data = await api.getSignById(id);
            setSign(data);
        } catch (err) {
            setError(err.message || 'Failed to load sign details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage message="Loading sign visual guide..." />;
    if (error) return <div className="max-w-4xl mx-auto py-12 px-4"><ErrorMessage message={error} /></div>;
    if (!sign) return null;

    const stepData = getSignSteps(sign.sign_name);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Back button */}
            <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Learn Catalog</span>
            </Link>

            {/* Main Sign Showcase Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
                {/* Visual SVG Hand Pose Diagram */}
                <div 
                    onClick={() => setIsStepModalOpen(true)}
                    className="md:col-span-6 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-100 relative min-h-[340px] flex items-center justify-center cursor-pointer group hover:bg-blue-50/30 transition-colors"
                    title="Click to open interactive step-by-step posing guide"
                >
                    <SignVisual signName={sign.sign_name} className="w-full h-full max-h-72 transition-transform group-hover:scale-105" />
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-700 border border-slate-200 shadow-xs">
                        {sign.category_name}
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BookOpen className="w-4 h-4" />
                        <span>Click for Step-by-Step Guide</span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:col-span-6 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-black text-slate-900">{sign.sign_name}</h1>
                            <button
                                onClick={() => speakText(`${sign.sign_name}. Meaning: ${sign.meaning}`)}
                                className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Listen to pronunciation"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl space-y-1">
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Meaning</span>
                            <p className="text-sm font-semibold text-slate-800">{sign.meaning}</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-blue-600" /> Description
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {sign.description}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-emerald-600" /> Hand Pose Instructions
                                </h3>
                                <button
                                    onClick={() => setIsStepModalOpen(true)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Interactive 3-Step Walkthrough</span>
                                </button>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-medium">
                                {sign.instructions}
                            </p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsStepModalOpen(true)}
                            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Step-by-Step Guide</span>
                        </button>
                        <Link to={`/practice?sign=${sign.sign_id}`} className="w-full sm:w-1/2">
                            <Button className="w-full gap-2 py-3">
                                <Award className="w-5 h-5" />
                                <span>Practice Pose</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Embedded 3-Step Pose Breakdown */}
            {stepData?.steps && (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <span>How to Pose "{sign.sign_name}" Step-by-Step</span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                {stepData.summary || 'Follow these 3 precise hand steps to replicate this gesture correctly.'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsStepModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 self-start sm:self-auto"
                        >
                            <span>Open Animated Guide</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {stepData.steps.map((s) => (
                            <div key={s.step} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                                            {s.step}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {s.instruction}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200/70 text-[11px] text-amber-800 font-semibold space-y-1">
                                    <span className="text-[10px] text-amber-600 uppercase font-black tracking-wider block">Finger Hint:</span>
                                    <span>{s.fingerHint}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interactive Step-by-Step Modal */}
            <StepByStepModal
                isOpen={isStepModalOpen}
                onClose={() => setIsStepModalOpen(false)}
                signName={sign.sign_name}
            />
        </div>
    );
}
