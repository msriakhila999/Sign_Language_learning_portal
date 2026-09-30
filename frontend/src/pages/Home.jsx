import React from 'react';
import { Link } from 'react-router-dom';
import { Hand, Camera, BookOpen, Award, Globe, ArrowRight, CheckCircle2, HeartHandshake, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';

export default function Home() {
    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 pt-16 pb-20 border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>UN SDG 10 Initiative — Reduced Inequalities</span>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                                Learn. Communicate. <br className="hidden sm:inline" />
                                <span className="text-blue-600">Connect.</span>
                            </h1>
                            
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                                A smart platform for learning sign language and translating signs in real time using browser-based computer vision recognition.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                                <Link to="/learn">
                                    <Button size="lg" className="w-full sm:w-auto gap-2 shadow-blue-500/20">
                                        <BookOpen className="w-5 h-5" />
                                        <span>Start Learning</span>
                                    </Button>
                                </Link>
                                <Link to="/translate">
                                    <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                                        <Camera className="w-5 h-5 text-blue-600" />
                                        <span>Try Sign Translator</span>
                                    </Button>
                                </Link>
                            </div>

                            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> WebRTC Webcam Ready</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Hand AI</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Text-to-Speech</span>
                            </div>
                        </div>

                        {/* Visual Card Illustration */}
                        <div className="lg:col-span-5 relative">
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 relative z-10">
                                <div className="aspect-[4/3] rounded-2xl bg-slate-900 overflow-hidden relative flex items-center justify-center border border-slate-800">
                                    <img
                                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                                        alt="Sign Language Person"
                                        className="w-full h-full object-cover opacity-85"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 flex items-center justify-between text-white">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Detected Sign</p>
                                            <p className="text-base font-bold text-emerald-400">HELLO 👋</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-medium">Confidence</p>
                                            <p className="text-xs font-bold text-blue-400">96.5%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Empowering Inclusive Communication
                    </h2>
                    <p className="text-slate-600 text-sm mt-2">
                        Three key pillars designed to help learners and non-signers bridge communication gaps seamlessly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Learn Feature */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Learn</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Interactive sign-language lessons categorized into Alphabets, Numbers, Greetings, and Phrases with step-by-step visual guides.
                            </p>
                        </div>
                        <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
                            <span>Explore Lessons</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Translate Feature */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                                <Camera className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Translate</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Access your camera to detect hand gestures in real time, display predicted meaning, confidence ratings, and listen with audio speech output.
                            </p>
                        </div>
                        <Link to="/translate" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                            <span>Open Camera Studio</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Practice Feature */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                                <Award className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Practice</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Test your skills with interactive camera challenges. Perform signs to verify accuracy against target words and track progress over time.
                            </p>
                        </div>
                        <Link to="/practice" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                            <span>Start Practice Challenge</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* SDG 10 Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-navy-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                            <Globe className="w-3.5 h-3.5" />
                            <span>United Nations Sustainable Development Goal 10</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            SDG 10: Reduced Inequalities
                        </h2>

                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            Communication barriers isolate millions of Deaf and hard-of-hearing individuals worldwide. 
                            <strong> SignBridge</strong> leverages modern browser AI technology to democratize sign language education and break down societal accessibility barriers, ensuring equal opportunity for all.
                        </p>

                        <div className="pt-2">
                            <Link to="/about">
                                <Button variant="secondary" className="gap-2 text-xs">
                                    <HeartHandshake className="w-4 h-4 text-blue-600" />
                                    <span>Read Full SDG 10 Mission Statement</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
