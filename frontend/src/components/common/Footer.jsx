import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, Heart, ShieldCheck, Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Info */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                <Hand className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">Sign<span className="text-blue-500">Bridge</span></span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-sm">
                            Learn. Communicate. Connect. A smart platform for learning sign language and translating signs using camera-based computer vision recognition.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-700">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Supporting UN SDG 10: Reduced Inequalities</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Navigation</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link to="/learn" className="hover:text-blue-400 transition-colors">Learn Library</Link></li>
                            <li><Link to="/translate" className="hover:text-blue-400 transition-colors">Sign Translator</Link></li>
                            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About SDG 10</Link></li>
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div>
                        <h4 className="text-white text-sm font-semibold mb-3 tracking-wider uppercase">Account & Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
                            <li><Link to="/register" className="hover:text-blue-400 transition-colors">Register</Link></li>
                            <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Student Dashboard</Link></li>
                            <li><Link to="/practice" className="hover:text-blue-400 transition-colors">Practice Challenges</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
                    <p>© {new Date().getFullYear()} SignBridge. All rights reserved. Full-stack SDG 10 Academic Project.</p>
                    <div className="flex items-center gap-1">
                        <span>Designed with</span>
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
                        <span>for inclusive communication.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
