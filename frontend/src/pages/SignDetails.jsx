import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import SignVisual from '../components/common/SignVisual';
import StepByStepModal from '../components/common/StepByStepModal';
import CameraBox from '../components/camera/CameraBox';
import { evaluateSignAttempt } from '../services/signRecognition/signClassifier';
import { getSignSteps } from '../services/signStepsData';
import { 
    ArrowLeft, Award, Volume2, Info, Sparkles, BookOpen, 
    CheckCircle2, ChevronRight, Camera, CameraOff, AlertCircle, Lightbulb 
} from 'lucide-react';
import { speakText } from '../services/speechService';

export default function SignDetails() {
    const { id } = useParams();
    const [sign, setSign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [detectedResult, setDetectedResult] = useState(null);
    const [evaluation, setEvaluation] = useState(null);

    const handleSignDetected = (result) => {
        if (!result || !sign) {
            setDetectedResult(null);
            setEvaluation(null);
            return;
        }

        setDetectedResult(result);
        const evalRes = evaluateSignAttempt(result.landmarks || [], sign.sign_name, result.handedness);
        
        // Exact match verification against the currently viewed sign
        const isMatch = evalRes.isCorrect || 
            (result.sign_name && result.sign_name.toLowerCase() === sign.sign_name.toLowerCase());

        const finalEval = {
            isCorrect: isMatch,
            status: isMatch ? 'CORRECT' : 'INCORRECT',
            detectedSign: isMatch ? sign.sign_name : (evalRes.detectedSign || result.sign_name || 'Scanning Hand...'),
            confidence: isMatch ? (evalRes.confidence || result.confidence || 96) : (evalRes.confidence || 65),
            suggestedChange: isMatch 
                ? 'Correct sign detected! High accuracy match. Hold position to confirm.' 
                : (evalRes.suggestedChange || 'Adjust your hand position and finger placement to match the guide.')
        };

        setEvaluation(finalEval);
    };

    useEffect(() => {
        fetchSignDetails();
    }, [id]);

    const fetchSignDetails = async () => {
        try {
            setLoading(true);
            const data = await api.getSignById(id);
            setSign(data);
        } catch (err) {
            setError(err.message || 'Failed to load sign details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage message="Loading sign visual guide..." />;
    if (error) return <div className="max-w-4xl mx-auto py-12 px-4"><ErrorMessage message={error} /></div>;
    if (!sign) return null;

    const stepData = getSignSteps(sign.sign_name);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Back button */}
            <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Learn Catalog</span>
            </Link>

            {/* Main Sign Showcase Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
                {/* Visual SVG Hand Pose Diagram */}
                <div 
                    onClick={() => setIsStepModalOpen(true)}
                    className="md:col-span-6 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-100 relative min-h-[340px] flex items-center justify-center cursor-pointer group hover:bg-blue-50/30 transition-colors"
                    title="Click to open interactive step-by-step posing guide"
                >
                    <SignVisual signName={sign.sign_name} className="w-full h-full max-h-72 transition-transform group-hover:scale-105" />
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-blue-700 border border-slate-200 shadow-xs">
                        {sign.category_name}
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 text-xs font-bold text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BookOpen className="w-4 h-4" />
                        <span>Click for Step-by-Step Guide</span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:col-span-6 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-black text-slate-900">{sign.sign_name}</h1>
                            <button
                                onClick={() => speakText(`${sign.sign_name}. Meaning: ${sign.meaning}`)}
                                className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Listen to pronunciation"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl space-y-1">
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Meaning</span>
                            <p className="text-sm font-semibold text-slate-800">{sign.meaning}</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-blue-600" /> Description
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {sign.description}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-emerald-600" /> Hand Pose Instructions
                                </h3>
                                <button
                                    onClick={() => setIsStepModalOpen(true)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Interactive 3-Step Walkthrough</span>
                                </button>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80 font-medium">
                                {sign.instructions}
                            </p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => {
                                const next = !isCameraActive;
                                setIsCameraActive(next);
                                if (!next) {
                                    setDetectedResult(null);
                                    setEvaluation(null);
                                }
                            }}
                            className={`w-full sm:w-1/3 inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs transition-all shadow-xs ${
                                isCameraActive 
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                            }`}
                        >
                            {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                            <span>{isCameraActive ? 'Close Camera' : 'Live Test Pose'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsStepModalOpen(true)}
                            className="w-full sm:w-1/3 inline-flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Step Guide</span>
                        </button>
                        <Link to={`/practice?sign=${sign.sign_id}`} className="w-full sm:w-1/3">
                            <Button className="w-full gap-2 py-3 text-xs">
                                <Award className="w-4 h-4" />
                                <span>Practice Mode</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Interactive Live Gesture Verification Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Live Learning Verification</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Verify "{sign.sign_name}" with Your Webcam
                        </h2>
                        <p className="text-xs text-slate-600">
                            Perform this gesture in front of your camera. MediaPipe tracks your 21 hand landmarks to evaluate your posture and thumb positioning in real-time.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            const next = !isCameraActive;
                            setIsCameraActive(next);
                            if (!next) {
                                setDetectedResult(null);
                                setEvaluation(null);
                            }
                        }}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 self-start sm:self-auto shadow-xs ${
                            isCameraActive 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                        }`}
                    >
                        {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        <span>{isCameraActive ? 'Turn Off Camera' : `Test "${sign.sign_name}" Live`}</span>
                    </button>
                </div>

                {isCameraActive ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-300">
                        {/* Live Webcam Stream with Hand Landmarks Overlay */}
                        <div className="lg:col-span-7 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                            <CameraBox
                                autoStart={true}
                                showControls={false}
                                onSignDetected={handleSignDetected}
                            />
                        </div>

                        {/* Real-Time Evaluation & Biomechanical Feedback */}
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 p-5 bg-slate-50/90 rounded-2xl border border-slate-200/80">
                            <div className="space-y-3">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Real-Time Recognition Status
                                </span>

                                {/* Detected Gesture Card */}
                                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-medium">Target Sign:</span>
                                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                            {sign.sign_name}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div>
                                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Detected:</span>
                                            <span className="text-lg font-black text-slate-900">
                                                {detectedResult ? (detectedResult.sign_name || 'Scanning Pose...') : 'Waiting for Hand...'}
                                            </span>
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                            evaluation?.isCorrect
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                : (detectedResult ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-500')
                                        }`}>
                                            {evaluation?.isCorrect ? (
                                                <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct!</>
                                            ) : (detectedResult ? (
                                                <><AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Adjust Posture</>
                                            ) : 'No Hand in View')}
                                        </span>
                                    </div>

                                    {/* Confidence Progress Meter */}
                                    {evaluation && evaluation.confidence > 0 && (
                                        <div className="space-y-1 pt-2 border-t border-slate-100">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                                                <span>Match Confidence</span>
                                                <span className={evaluation.isCorrect ? 'text-emerald-600' : 'text-amber-600'}>
                                                    {evaluation.confidence}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-300 ${
                                                        evaluation.isCorrect ? 'bg-emerald-500' : 'bg-amber-400'
                                                    }`}
                                                    style={{ width: `${evaluation.confidence}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Biomechanical Feedback Banner */}
                                <div className={`p-4 rounded-xl border space-y-1.5 ${
                                    evaluation?.isCorrect
                                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                        : (detectedResult ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-slate-100 border-slate-200 text-slate-700')
                                }`}>
                                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                                        <Lightbulb className={`w-3.5 h-3.5 ${evaluation?.isCorrect ? 'text-emerald-600' : 'text-amber-600'}`} />
                                        <span>Biomechanical Feedback:</span>
                                    </div>
                                    <p className="text-xs leading-relaxed font-medium">
                                        {detectedResult
                                            ? (evaluation?.suggestedChange || 'Adjust your hand position to match the reference.')
                                            : 'Move your hand into the camera frame so all 5 fingers and your wrist are clearly visible.'}
                                    </p>
                                </div>
                            </div>

                            {/* Full Practice Redirect */}
                            <div className="pt-2 text-right">
                                <Link
                                    to={`/practice?sign=${sign.sign_id}`}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                                >
                                    <span>Open Full Practice Module</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                            Want to test your signing posture for <strong>"{sign.sign_name}"</strong> right now? Click <strong>"Test \"{sign.sign_name}\" Live"</strong> above to start your camera and verify your hand position with real-time feedback.
                        </p>
                    </div>
                )}
            </div>

            {/* Embedded 3-Step Pose Breakdown */}
            {stepData?.steps && (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <span>How to Pose "{sign.sign_name}" Step-by-Step</span>
                            </h2>
                            <p className="text-xs text-slate-500">
                                {stepData.summary || 'Follow these 3 precise hand steps to replicate this gesture correctly.'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsStepModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 self-start sm:self-auto"
                        >
                            <span>Open Animated Guide</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {stepData.steps.map((s) => (
                            <div key={s.step} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                                            {s.step}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {s.instruction}
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200/70 text-[11px] text-amber-800 font-semibold space-y-1">
                                    <span className="text-[10px] text-amber-600 uppercase font-black tracking-wider block">Finger Hint:</span>
                                    <span>{s.fingerHint}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Interactive Step-by-Step Modal */}
            <StepByStepModal
                isOpen={isStepModalOpen}
                onClose={() => setIsStepModalOpen(false)}
                signName={sign.sign_name}
            />
        </div>
    );
}
