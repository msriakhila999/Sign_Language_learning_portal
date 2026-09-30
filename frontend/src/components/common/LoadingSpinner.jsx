import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', fullPage = false }) {
    const content = (
        <div className="flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-600">{message}</p>
        </div>
    );

    if (fullPage) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}
