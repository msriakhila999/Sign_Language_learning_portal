import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label, showPercentage = true, color = 'blue', className = '' }) {
    const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

    const colors = {
        blue: 'bg-blue-600',
        green: 'bg-emerald-500',
        amber: 'bg-amber-500',
        indigo: 'bg-indigo-600'
    };

    return (
        <div className={`w-full ${className}`}>
            {(label || showPercentage) && (
                <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
                    {label && <span>{label}</span>}
                    {showPercentage && <span className="font-semibold text-slate-800">{percentage}%</span>}
                </div>
            )}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colors[color] || colors.blue}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
