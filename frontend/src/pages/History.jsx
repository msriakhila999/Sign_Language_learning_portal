import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import SignVisual from '../components/common/SignVisual';
import { History as HistoryIcon, Trash2, Calendar, CheckCircle, Search } from 'lucide-react';

export default function History() {
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [searchQuery]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            const data = await api.getTranslationHistory(params);
            setHistory(data);
        } catch (err) {
            setError(err.message || 'Failed to load translation history.');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        try {
            await api.clearTranslationHistory();
            setHistory([]);
            setIsClearModalOpen(false);
        } catch (err) {
            setError(err.message || 'Failed to clear history.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <HistoryIcon className="w-4 h-4" />
                        <span>Translation Archive</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Translation History
                    </h1>
                </div>

                {history.length > 0 && (
                    <Button
                        variant="secondary"
                        onClick={() => setIsClearModalOpen(true)}
                        className="gap-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear History</span>
                    </Button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search history by detected sign name or translation..."
                />
            </div>

            {/* History Table Container */}
            {loading ? (
                <LoadingSpinner message="Fetching translation log records..." />
            ) : error ? (
                <ErrorMessage message={error} onRetry={fetchHistory} />
            ) : history.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                    <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-lg font-bold text-slate-800">No translations recorded</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your saved camera translation history will appear here. Start using the Sign Translator to log translations.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Date & Time</th>
                                    <th className="py-3.5 px-6">Detected Sign</th>
                                    <th className="py-3.5 px-6">Meaning</th>
                                    <th className="py-3.5 px-6">Confidence</th>
                                    <th className="py-3.5 px-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                {history.map((row) => (
                                    <tr key={row.translation_id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-4 px-6 font-medium text-slate-500 whitespace-nowrap">
                                            {new Date(row.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden">
                                                    <SignVisual signName={row.detected_sign} className="w-full h-full" />
                                                </div>
                                                <span>{row.detected_sign}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-xs truncate text-slate-600">
                                            {row.translated_text}
                                        </td>
                                        <td className="py-4 px-6 font-semibold">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                row.confidence >= 85
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {row.confidence}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                                <CheckCircle className="w-3.5 h-3.5" /> Verified
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Clear History Confirmation Modal */}
            <Modal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                title="Clear Translation History"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to delete all translation history records? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setIsClearModalOpen(false)} size="sm">
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleClearHistory} size="sm">
                            Clear All History
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
