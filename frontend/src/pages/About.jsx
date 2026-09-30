import React from 'react';
import { Globe, Heart, Shield, Sparkles, CheckCircle2, Hand } from 'lucide-react';

export default function About() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
            {/* Title */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
                    <Globe className="w-4 h-4" />
                    <span>UN SDG 10 Project Alignment</span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    About SignBridge
                </h1>
                <p className="text-slate-600 text-sm max-w-xl mx-auto">
                    Learn. Communicate. Connect. Breaking barriers through artificial intelligence and accessible web technology.
                </p>
            </div>

            {/* SDG 10 Mission Highlight */}
            <div className="bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
                        10
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">UN Sustainable Development Goal 10</h3>
                        <p className="text-xs text-emerald-400 font-semibold">Reduced Inequalities</p>
                    </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                    Sustainable Development Goal 10 aims to reduce inequality within and among countries by empowering and promoting the social, economic, and political inclusion of all persons regardless of age, sex, disability, race, ethnicity, or origin.
                </p>

                <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                    <div className="space-y-1">
                        <span className="font-bold text-white block">Equal Access</span>
                        <p className="text-slate-400">Free web-based sign language learning for everyone.</p>
                    </div>
                    <div className="space-y-1">
                        <span className="font-bold text-white block">Real-time Vision</span>
                        <p className="text-slate-400">Browser computer vision for instant gesture translation.</p>
                    </div>
                    <div className="space-y-1">
                        <span className="font-bold text-white block">Speech Output</span>
                        <p className="text-slate-400">Speech synthesis bridging non-signers and Deaf signers.</p>
                    </div>
                </div>
            </div>

            {/* Key Technical Features */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Technical Architecture</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-blue-600 block">Frontend Stack</span>
                        <p className="text-slate-600 text-xs">
                            Built with React.js, Tailwind CSS, Lucide icons, Inter typography, and React Router for seamless single-page navigation.
                        </p>
                    </div>
                    <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-blue-600 block">Computer Vision & AI</span>
                        <p className="text-slate-600 text-xs">
                            MediaPipe 21 3D hand landmark detection engine with real-time geometric sign classifier for instant browser predictions.
                        </p>
                    </div>
                    <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-blue-600 block">Express REST API</span>
                        <p className="text-slate-600 text-xs">
                            Node.js and Express.js REST API providing secure JWT authentication, categories, sign catalog, history, and practice score recording.
                        </p>
                    </div>
                    <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-blue-600 block">MySQL Relational DB</span>
                        <p className="text-slate-600 text-xs">
                            MySQL database (`signbridge_db`) utilizing normalized tables, foreign key integrity, password hashing (bcrypt), and query optimization.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
