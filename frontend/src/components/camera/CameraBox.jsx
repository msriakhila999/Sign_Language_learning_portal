import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, RefreshCw, Activity } from 'lucide-react';
import { HandDetectionEngine } from '../../services/signRecognition/handLandmarks';

export default function CameraBox({ onSignDetected, isActive: externalActive = false }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const engineRef = useRef(null);

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStatus, setCameraStatus] = useState('Camera Off'); // 'Camera Off', 'Camera Active', 'Starting...', 'Error'
    const [errorMessage, setErrorMessage] = useState('');
    const [isHandDetected, setIsHandDetected] = useState(false);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        setErrorMessage('');
        setCameraStatus('Starting...');

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Webcam access is not supported by your browser.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                setIsCameraActive(true);
                setCameraStatus('Camera Active');

                // Initialize Hand Detection Engine
                try {
                    engineRef.current = new HandDetectionEngine(
                        videoRef.current,
                        canvasRef.current,
                        (result) => {
                            if (result) {
                                setIsHandDetected(true);
                                if (onSignDetected) onSignDetected(result);
                            } else {
                                setIsHandDetected(false);
                                if (onSignDetected) onSignDetected(null);
                            }
                        }
                    );
                    await engineRef.current.start();
                } catch (mlErr) {
                    console.warn('Hand detection initialization fallback:', mlErr);
                    // Standard frame fallback simulator if MediaPipe CDN unavailable
                }
            }
        } catch (error) {
            console.error('Camera access error:', error);
            setIsCameraActive(false);
            setCameraStatus('Error');

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setErrorMessage('Camera permission was denied. Please allow camera access in browser settings.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setErrorMessage('No camera device was found on your machine.');
            } else {
                setErrorMessage(error.message || 'Unable to start camera.');
            }
        }
    };

    const stopCamera = () => {
        if (engineRef.current) {
            engineRef.current.stop();
            engineRef.current = null;
        }

        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }

        setIsCameraActive(false);
        setIsHandDetected(false);
        setCameraStatus('Camera Off');
        if (onSignDetected) onSignDetected(null);
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Camera Viewport Container */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center">
                {/* Video Stream */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {/* Canvas Overlay for Hand Landmarks */}
                <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {/* Status Indicator Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-white shadow-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{cameraStatus}</span>
                    {isCameraActive && isHandDetected && (
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-600/80 text-[10px] text-blue-100 font-medium flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Hand Detected
                        </span>
                    )}
                </div>

                {/* Placeholder Overlay when Camera Off or Error */}
                {!isCameraActive && (
                    <div className="p-8 text-center flex flex-col items-center justify-center max-w-sm">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
                            <CameraOff className="w-8 h-8" />
                        </div>
                        <h4 className="text-white font-bold text-base mb-1">Webcam Inactive</h4>
                        <p className="text-slate-400 text-xs mb-4">
                            Click "Start Camera" below to grant browser webcam access and start recognizing sign language gestures.
                        </p>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
                <div className="mt-4 w-full p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Camera Control Buttons */}
            <div className="mt-5 flex items-center justify-center gap-3 w-full">
                {!isCameraActive ? (
                    <button
                        onClick={startCamera}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Camera className="w-4 h-4" />
                        <span>Start Camera</span>
                    </button>
                ) : (
                    <button
                        onClick={stopCamera}
                        className="flex-1 sm:flex-initial px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <CameraOff className="w-4 h-4" />
                        <span>Stop Camera</span>
                    </button>
                )}
            </div>
        </div>
    );
}
