import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry, className = '' }) {
    if (!message) return null;

    return (
        <div className={`p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm ${className}`}>
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="font-medium">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 text-xs font-semibold text-red-700 underline hover:text-red-800"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
