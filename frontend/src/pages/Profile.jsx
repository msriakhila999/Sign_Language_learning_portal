import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { User, Mail, Calendar, BookOpen, Award, Camera, CheckCircle2, Save, Check } from 'lucide-react';

export default function Profile() {
    const { user, updateUserState } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await api.getProfile();
            setProfileData(data);
            setName(data.user.name || '');
            setEmail(data.user.email || '');
        } catch (err) {
            setError(err.message || 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            setError('');
            setSuccessMessage('');

            const updated = await api.updateProfile({ name, email });
            updateUserState(updated.user);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage message="Loading student profile..." />;

    const stats = profileData?.stats || { signsLearned: 0, practiceSessions: 0, translationCount: 0, averageAccuracy: 0 };
    const userInfo = profileData?.user || {};

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <User className="w-4 h-4" />
                    <span>Account Overview</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    User Profile & Performance
                </h1>
            </div>

            {/* Profile Info Card & Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Account Details & Edit Form */}
                <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Edit Profile Details</span>
                    </h3>

                    {successMessage && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {error && <ErrorMessage message={error} />}

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={updating} className="w-full gap-2">
                                <Save className="w-4 h-4" />
                                <span>{updating ? 'Saving...' : 'Save Profile Changes'}</span>
                            </Button>
                        </div>
                    </form>

                    <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Account Created: {userInfo.created_at ? new Date(userInfo.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>

                {/* Stats Summary Sidebar */}
                <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                        Achievement Summary
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <span className="text-xs font-semibold text-slate-700">Signs Learned</span>
                            </div>
                            <span className="text-base font-black text-blue-700">{stats.signsLearned}</span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-indigo-600" />
                                <span className="text-xs font-semibold text-slate-700">Practice Sessions</span>
                            </div>
                            <span className="text-base font-black text-indigo-700">{stats.practiceSessions}</span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <Camera className="w-5 h-5 text-emerald-600" />
                                <span className="text-xs font-semibold text-slate-700">Translations</span>
                            </div>
                            <span className="text-base font-black text-emerald-700">{stats.translationCount}</span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                                <span className="text-xs font-semibold text-slate-700">Avg Accuracy</span>
                            </div>
                            <span className="text-base font-black text-amber-700">{stats.averageAccuracy}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
