import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFeatures } from '../../context/FeatureContext';
import { Hand, Menu, X, LogOut, User, LayoutDashboard, BookOpen, Camera, Award, History, Info, Sliders, Zap } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const { features, openSettingsModal } = useFeatures();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) => `
        px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5
        ${isActive(path) 
            ? 'bg-blue-50 text-blue-700 font-semibold' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
    `;

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <RouterLink to="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <Hand className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">Sign<span className="text-blue-600">Bridge</span></span>
                            <span className="block text-[10px] font-semibold text-slate-500 tracking-wider uppercase -mt-1">SDG 10 Portal</span>
                        </div>
                    </RouterLink>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <RouterLink to="/" className={navLinkClass('/')}>
                            Home
                        </RouterLink>
                        <RouterLink to="/learn" className={navLinkClass('/learn')}>
                            <BookOpen className="w-4 h-4" /> Learn
                        </RouterLink>
                        <RouterLink to="/translate" className={navLinkClass('/translate')}>
                            <Camera className="w-4 h-4" /> Translate
                        </RouterLink>
                        <RouterLink to="/practice" className={navLinkClass('/practice')}>
                            <Award className="w-4 h-4" /> Practice
                        </RouterLink>
                        <RouterLink to="/dashboard" className={navLinkClass('/dashboard')}>
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </RouterLink>
                        <RouterLink to="/history" className={navLinkClass('/history')}>
                            <History className="w-4 h-4" /> History
                        </RouterLink>
                        <RouterLink to="/about" className={navLinkClass('/about')}>
                            <Info className="w-4 h-4" /> About
                        </RouterLink>
                        {features.signRush && (
                            <RouterLink to="/rush" className={navLinkClass('/rush')}>
                                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Sign Rush
                            </RouterLink>
                        )}
                    </nav>

                    {/* Auth User Action & Feature Settings */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Feature Settings Modal Trigger */}
                        <button
                            type="button"
                            onClick={openSettingsModal}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative"
                            title="Feature Activation Settings (Control optional modules)"
                        >
                            <Sliders className="w-4 h-4" />
                            {(features.signBot || features.signRush) && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                            )}
                        </button>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <RouterLink to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium transition-colors bg-slate-50">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span>{user?.name || 'User'}</span>
                                </RouterLink>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <RouterLink
                                    to="/profile"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium transition-colors bg-slate-50"
                                >
                                    <User className="w-4 h-4 text-blue-600" />
                                    <span>Demo Student</span>
                                </RouterLink>
                                <RouterLink
                                    to="/login"
                                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                                >
                                    Login / Register
                                </RouterLink>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
                    <RouterLink to="/" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/')}>
                        Home
                    </RouterLink>
                    <RouterLink to="/learn" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/learn')}>
                        Learn
                    </RouterLink>
                    <RouterLink to="/translate" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/translate')}>
                        Translate
                    </RouterLink>
                    <RouterLink to="/practice" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/practice')}>
                        Practice
                    </RouterLink>
                    <RouterLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/dashboard')}>
                        Dashboard
                    </RouterLink>
                    <RouterLink to="/history" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/history')}>
                        History
                    </RouterLink>
                    <RouterLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/profile')}>
                        Profile
                    </RouterLink>
                    <RouterLink to="/about" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/about')}>
                        About
                    </RouterLink>
                    {features.signRush && (
                        <RouterLink to="/rush" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/rush')}>
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Sign Rush ⚡
                        </RouterLink>
                    )}
                    <button
                        onClick={() => { setMobileMenuOpen(false); openSettingsModal(); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-between"
                    >
                        <span className="flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-indigo-600" /> Feature Settings
                        </span>
                        {(features.signBot || features.signRush) && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Active
                            </span>
                        )}
                    </button>

                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        {isAuthenticated ? (
                            <button
                                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                Sign Out ({user?.name})
                            </button>
                        ) : (
                            <RouterLink
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                            >
                                Login / Register
                            </RouterLink>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
