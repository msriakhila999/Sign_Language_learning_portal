import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, AlertTriangle, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';
import { HandDetectionEngine } from '../../services/signRecognition/handLandmarks';

export default function CameraBox({ 
    onSignDetected, 
    autoStart = false, 
    showControls = true, 
    compact = false,
    onCameraStateChange
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const streamRef = useRef(null);

    // Keep callback references stable across parent re-renders
    const onSignDetectedRef = useRef(onSignDetected);
    const onCameraStateChangeRef = useRef(onCameraStateChange);

    useEffect(() => {
        onSignDetectedRef.current = onSignDetected;
        onCameraStateChangeRef.current = onCameraStateChange;
    });

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStatus, setCameraStatus] = useState('Camera Off'); // 'Camera Off', 'Starting...', 'Camera Active', 'Error'
    const [errorMessage, setErrorMessage] = useState('');
    const [isHandDetected, setIsHandDetected] = useState(false);
    const [detectedHandSide, setDetectedHandSide] = useState('');
    const [aspectRatio, setAspectRatio] = useState('4/3');

    // Helper: Safely release any active stream across portal modules
    const releaseActiveStream = useCallback(() => {
        if (streamRef.current) {
            try {
                streamRef.current.getTracks().forEach((track) => {
                    track.stop();
                    track.enabled = false;
                });
            } catch (err) {
                console.warn('Track stop error:', err);
            }
            streamRef.current = null;
        }

        if (window.__signbridge_active_stream) {
            try {
                window.__signbridge_active_stream.getTracks().forEach((track) => {
                    track.stop();
                    track.enabled = false;
                });
            } catch (err) {}
            window.__signbridge_active_stream = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const stopCamera = useCallback(() => {
        // 1. Stop Hand Detection Processing Loop
        if (engineRef.current) {
            try {
                engineRef.current.stop();
            } catch (e) {
                console.warn('Engine stop warning:', e);
            }
            engineRef.current = null;
        }

        // 2. Stop hardware camera stream
        releaseActiveStream();

        setIsCameraActive(false);
        setIsHandDetected(false);
        setDetectedHandSide('');
        setCameraStatus('Camera Off');
        if (onSignDetectedRef.current) onSignDetectedRef.current(null);
        if (onCameraStateChangeRef.current) onCameraStateChangeRef.current(false);
    }, [releaseActiveStream]);

    const startCamera = useCallback(async () => {
        setErrorMessage('');
        setCameraStatus('Starting...');

        // Stop any currently running stream to prevent Windows hardware lock
        releaseActiveStream();

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Webcam access is not supported by your browser or connection is not secure (localhost/HTTPS required).');
            }

            // Request camera stream with automatic fallback for diverse webcams
            let stream = null;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    },
                    audio: false
                });
            } catch (constraintErr) {
                console.warn('FacingMode/resolution constraints rejected, attempting basic video: true fallback...', constraintErr);
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }

            streamRef.current = stream;
            window.__signbridge_active_stream = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                videoRef.current.playsInline = true;

                // Wait for video metadata to initialize dimensions with 1.5s timeout protection
                await Promise.race([
                    new Promise((resolve) => {
                        if (videoRef.current.readyState >= 1) {
                            resolve();
                        } else {
                            videoRef.current.onloadedmetadata = () => resolve();
                        }
                    }),
                    new Promise((resolve) => setTimeout(resolve, 1500))
                ]);

                try {
                    await videoRef.current.play();
                } catch (playErr) {
                    console.warn('Video play attempt warning:', playErr);
                }

                const w = videoRef.current.videoWidth || 640;
                const h = videoRef.current.videoHeight || 480;
                setAspectRatio(`${w}/${h}`);
                if (canvasRef.current) {
                    canvasRef.current.width = w;
                    canvasRef.current.height = h;
                }

                setIsCameraActive(true);
                setCameraStatus('Camera Active');
                if (onCameraStateChangeRef.current) onCameraStateChangeRef.current(true);

                // Initialize the real-time Hand Detection Engine
                try {
                    engineRef.current = new HandDetectionEngine(
                        videoRef.current,
                        canvasRef.current,
                        (result) => {
                            if (result && result.landmarks) {
                                setIsHandDetected(true);
                                setDetectedHandSide(result.handedness || 'Hand');
                                if (onSignDetectedRef.current) onSignDetectedRef.current(result);
                            } else {
                                setIsHandDetected(false);
                                setDetectedHandSide('');
                                if (onSignDetectedRef.current) onSignDetectedRef.current(null);
                            }
                        }
                    );
                    await engineRef.current.start();
                } catch (mlErr) {
                    console.error('Hand detection initialization error:', mlErr);
                    // Video continues streaming even if vision models take a moment to download
                    setErrorMessage('MediaPipe Hand Vision is initializing. Please hold hand in view...');
                }
            }
        } catch (error) {
            console.error('Camera access error:', error);
            setIsCameraActive(false);
            setCameraStatus('Error');
            if (onCameraStateChangeRef.current) onCameraStateChangeRef.current(false);

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setErrorMessage('Camera access was denied. Please click the camera icon in your browser address bar and select "Allow".');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setErrorMessage('No camera device was detected on this computer.');
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                setErrorMessage('Webcam is currently in use by another application or tab (e.g. Zoom, Teams). Please close it and retry.');
            } else if (error.name === 'OverconstrainedError') {
                setErrorMessage('The requested camera resolution is not supported by your webcam device.');
            } else if (error.name === 'SecurityError') {
                setErrorMessage('Camera access is restricted due to browser security policies.');
            } else {
                setErrorMessage(error.message || 'Unable to start camera.');
            }
        }
    }, [releaseActiveStream]);

    // Handle autoStart prop cleanly: only triggers on mount or if autoStart changes (ZERO re-render loops)
    useEffect(() => {
        if (autoStart) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="w-full flex flex-col items-center">
            {/* Camera Viewport Container */}
            <div
                className={`relative w-full bg-slate-950 rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center transition-all ${
                    compact ? 'min-h-[220px]' : 'min-h-[280px]'
                }`}
                style={{ aspectRatio: aspectRatio }}
            >
                {/* Live Video Stream - always mounted in DOM to preserve decoder pipeline and natural dimensions */}
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-contain transform -scale-x-100"
                />

                {/* Canvas Overlay for Hand Skeleton and Landmarks */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
                />

                {/* Live Status Badges */}
                <div className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 ${
                    compact ? 'text-[10px]' : 'text-xs'
                } font-semibold text-white shadow-sm`}>
                    <span
                        className={`w-2 h-2 rounded-full ${
                            isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                        }`}
                    />
                    <span>{cameraStatus}</span>
                    {isCameraActive && isHandDetected && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-600/90 text-[9px] text-blue-100 font-bold flex items-center gap-1 shadow-xs animate-in fade-in">
                            <Activity className="w-2.5 h-2.5 text-cyan-300" />
                            <span>{detectedHandSide ? `${detectedHandSide}` : 'Hand'} Tracked</span>
                        </span>
                    )}
                </div>

                {/* Placeholder Overlay when Camera Inactive (sits on top without unmounting video element) */}
                {!isCameraActive && (
                    <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                        <div className={`${compact ? 'w-12 h-12 mb-2' : 'w-16 h-16 mb-4'} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner`}>
                            <CameraOff className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
                        </div>
                        <h4 className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm'} mb-1`}>
                            {cameraStatus === 'Starting...' ? 'Connecting to Webcam...' : 'Camera Inactive'}
                        </h4>
                        <p className={`text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'} mb-3 max-w-xs leading-relaxed`}>
                            {cameraStatus === 'Starting...' 
                                ? 'Initializing video stream and MediaPipe hand tracking...' 
                                : 'Camera is currently stopped. Click "Start Camera" to activate.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Error Message Alert with Actionable Retry */}
            {errorMessage && (
                <div className="mt-3 w-full p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={startCamera}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase shrink-0 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Camera Controls */}
            {showControls && (
                <div className="mt-4 flex items-center justify-center gap-3 w-full">
                    {!isCameraActive ? (
                        <button
                            type="button"
                            onClick={startCamera}
                            className="flex-1 sm:flex-initial px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            <span>Start Camera</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <CameraOff className="w-4 h-4" />
                            <span>Stop Camera</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
