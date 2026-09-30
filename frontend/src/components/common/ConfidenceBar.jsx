import React from 'react';

export default function ConfidenceBar({ confidence = 0 }) {
    const score = Math.min(100, Math.max(0, Math.round(confidence)));
    
    // Determine color based on threshold
    let colorClass = 'bg-emerald-500';
    let textClass = 'text-emerald-700';
    let label = 'High Confidence';

    if (score < 70) {
        colorClass = 'bg-amber-500';
        textClass = 'text-amber-700';
        label = 'Moderate Confidence';
    }
    if (score < 50) {
        colorClass = 'bg-red-500';
        textClass = 'text-red-700';
        label = 'Low Confidence';
    }

    return (
        <div className="space-y-1.5 w-full">
            <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Model Confidence</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
                    <span className={`text-sm font-bold ${textClass}`}>{score}%</span>
                </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 overflow-hidden border border-slate-200/50">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}
