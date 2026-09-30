import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ProgressBar from '../components/common/ProgressBar';
import Card from '../components/common/Card';
import { LayoutDashboard, BookOpen, Award, Camera, CheckCircle2, ArrowRight, History } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await api.getDashboardStats();
            setDashboardData(data);
        } catch (err) {
            setError(err.message || 'Failed to load dashboard metrics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage message="Loading student dashboard..." />;
    if (error) return <div className="max-w-4xl mx-auto py-12 px-4"><ErrorMessage message={error} onRetry={fetchDashboardData} /></div>;

    const stats = dashboardData?.stats || { signsLearned: 0, practiceSessions: 0, totalTranslations: 0, averageAccuracy: 0 };
    const recentTranslations = dashboardData?.recentTranslations || [];
    const categoryProgress = dashboardData?.categoryProgress || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Student Dashboard</span>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Welcome back, {user?.name || 'Learner'}! 👋
                    </h1>
                    <p className="text-sm text-blue-100 max-w-xl">
                        Track your sign language mastery, camera translation activity, and practice test accuracy.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/translate">
                        <button className="px-4 py-2.5 bg-white text-blue-700 text-xs font-bold rounded-xl shadow hover:bg-blue-50 transition-colors">
                            Open Camera Studio
                        </button>
                    </Link>
                </div>
            </div>

            {/* Statistics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Signs Learned */}
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Signs Learned</span>
                        <p className="text-2xl font-black text-slate-900">{stats.signsLearned}</p>
                    </div>
                </Card>

                {/* 2. Practice Sessions */}
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Practice Sessions</span>
                        <p className="text-2xl font-black text-slate-900">{stats.practiceSessions}</p>
                    </div>
                </Card>

                {/* 3. Total Translations */}
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Camera className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Translations</span>
                        <p className="text-2xl font-black text-slate-900">{stats.totalTranslations}</p>
                    </div>
                </Card>

                {/* 4. Average Accuracy */}
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Accuracy</span>
                        <p className="text-2xl font-black text-slate-900">{stats.averageAccuracy}%</p>
                    </div>
                </Card>
            </div>

            {/* Content Section: Category Progress & Recent History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Category Progress Breakdown */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span>Learning Category Mastery</span>
                        </h3>
                        <Link to="/learn" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                            Catalog
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {categoryProgress.length === 0 ? (
                            <p className="text-xs text-slate-400">No category progress recorded yet.</p>
                        ) : (
                            categoryProgress.map((cat) => {
                                const total = cat.total_signs || 1;
                                const learned = cat.learned_signs || 0;
                                const percent = Math.round((learned / total) * 100);

                                return (
                                    <div key={cat.category_id} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span className="text-slate-800">{cat.category_name}</span>
                                            <span className="text-slate-500">{learned} / {total} signs ({percent}%)</span>
                                        </div>
                                        <ProgressBar value={percent} showPercentage={false} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Recent Translation Log */}
                <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <History className="w-4 h-4 text-emerald-600" />
                            <span>Recent Translation History</span>
                        </h3>
                        <Link to="/history" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <span>View All</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentTranslations.length === 0 ? (
                            <div className="text-center py-8 text-xs text-slate-400">
                                No translation history found. Use the Sign Translator to get started!
                            </div>
                        ) : (
                            recentTranslations.map((item) => (
                                <div key={item.translation_id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{item.detected_sign}</p>
                                        <p className="text-slate-500 line-clamp-1">{item.translated_text}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                            {item.confidence}%
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
