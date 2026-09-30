import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import { Hand, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
                {/* Brand */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white mx-auto shadow-md">
                        <Hand className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                    <p className="text-xs text-slate-500">Sign in to your SignBridge account to access your practice history.</p>
                </div>

                {error && <ErrorMessage message={error} />}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="demo@signbridge.org"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={loading} className="w-full py-3 gap-2">
                            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </form>

                {/* Demo Credentials Box */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-blue-800 block">Default Demo Student Login:</span>
                    <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700 font-mono">demo@signbridge.org</code></p>
                    <p>Password: <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700 font-mono">Password123!</code></p>
                </div>

                <div className="text-center pt-2 text-xs text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
