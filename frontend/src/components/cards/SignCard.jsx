import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import Card from '../common/Card';
import SignVisual from '../common/SignVisual';
import StepByStepModal from '../common/StepByStepModal';

export default function SignCard({ sign }) {
    const { sign_id, sign_name, category_name, meaning } = sign;
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);

    return (
        <>
            <Card hover className="flex flex-col h-full group bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
                {/* Visual Hand Gesture Display - Click anywhere on the visual to see step-by-step instructions */}
                <div 
                    onClick={() => setIsStepModalOpen(true)}
                    className="relative h-48 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center p-3 overflow-hidden cursor-pointer group/visual hover:bg-blue-50/40 transition-colors"
                    title="Click to view step-by-step posing guide"
                >
                    {/* Natural Human Hand Pose Representation */}
                    <SignVisual signName={sign_name} className="w-full h-full max-h-40 rounded-xl transition-transform duration-200 group-hover/visual:scale-105" />

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" />
                        <span>{category_name}</span>
                    </div>

                    {/* Step-by-step pose overlay button */}
                    <div className="absolute bottom-2 right-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStepModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 bg-white/90 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs border border-slate-200 transition-colors"
                        >
                            <BookOpen className="w-3 h-3 text-blue-600 group-hover/visual:text-white" />
                            <span>Pose Steps</span>
                        </button>
                    </div>
                </div>

                {/* Sign Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                        <h3 
                            onClick={() => setIsStepModalOpen(true)}
                            className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight cursor-pointer"
                            title="Click to view step-by-step posing guide"
                        >
                            {sign_name}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {meaning}
                        </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => setIsStepModalOpen(true)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <span>Step Guide</span>
                        </button>
                        <Link
                            to={`/sign/${sign_id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
                        >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </Card>

            {/* Interactive Step-by-Step Modal */}
            <StepByStepModal
                isOpen={isStepModalOpen}
                onClose={() => setIsStepModalOpen(false)}
                signName={sign_name}
            />
        </>
    );
}
