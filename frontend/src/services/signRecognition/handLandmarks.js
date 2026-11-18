import { classifyHandSign } from './signClassifier';

// MediaPipe 21 Hand Landmark Connections
const HAND_CONNECTIONS = [
    // Palm base
    [0, 1], [0, 5], [0, 17], [5, 9], [9, 13], [13, 17],
    // Thumb
    [1, 2], [2, 3], [3, 4],
    // Index finger
    [5, 6], [6, 7], [7, 8],
    // Middle finger
    [9, 10], [10, 11], [11, 12],
    // Ring finger
    [13, 14], [14, 15], [15, 16],
    // Pinky finger
    [17, 18], [18, 19], [19, 20]
];

// Tip indices for glowing highlight
const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

/**
 * Ensures MediaPipe Hands library is loaded in the browser window.
 */
async function ensureMediaPipeLoaded() {
    if (window.Hands) return window.Hands;

    // Wait up to 3 seconds for script tags in index.html to finish loading
    for (let i = 0; i < 15; i++) {
        if (window.Hands) return window.Hands;
        await new Promise((r) => setTimeout(r, 200));
    }

    // Dynamic fallback injection if CDN script tag failed or blocked
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            if (window.Hands) resolve(window.Hands);
            else reject(new Error('MediaPipe Hands script loaded but window.Hands is unavailable.'));
        };
        script.onerror = () => reject(new Error('Failed to load MediaPipe Hands from CDN.'));
        document.head.appendChild(script);
    });
}

export class HandDetectionEngine {
    constructor(videoElement, canvasElement, onResultCallback) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
        this.onResult = onResultCallback;

        this.hands = null;
        this.isRunning = false;
        this.isProcessingFrame = false;
        this.animationFrameId = null;

        // Temporal smoothing buffer for stable predictions
        this.predictionHistory = [];
        this.historySize = 3;
        this.currentConfirmedSign = null;
    }

    async initialize() {
        const HandsClass = await ensureMediaPipeLoaded();

        this.hands = new HandsClass({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        });

        this.hands.setOptions({
            maxNumHands: 2, // Detect both left and right hands
            modelComplexity: 1, // Balanced speed and high landmark precision
            minDetectionConfidence: 0.55,
            minTrackingConfidence: 0.55
        });

        this.hands.onResults((results) => this.handleResults(results));
    }

    async start() {
        if (!this.hands) {
            await this.initialize();
        }

        this.isRunning = true;
        this.startProcessingLoop();
    }

    startProcessingLoop() {
        const processFrame = async () => {
            if (!this.isRunning) return;

            if (
                this.video &&
                this.video.readyState >= 2 && // HAVE_CURRENT_DATA
                !this.video.paused &&
                !this.isProcessingFrame &&
                this.hands
            ) {
                this.isProcessingFrame = true;
                try {
                    await this.hands.send({ image: this.video });
                } catch (err) {
                    console.warn('MediaPipe hands.send error:', err.message);
                } finally {
                    this.isProcessingFrame = false;
                }
            }

            if (this.isRunning) {
                this.animationFrameId = requestAnimationFrame(processFrame);
            }
        };

        this.animationFrameId = requestAnimationFrame(processFrame);
    }

    stop() {
        this.isRunning = false;
        this.isProcessingFrame = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.hands) {
            try {
                this.hands.close();
            } catch (e) {
                console.warn('MediaPipe hands.close warning:', e);
            }
            this.hands = null;
        }

        this.predictionHistory = [];
        this.currentConfirmedSign = null;
    }

    handleResults(results) {
        if (!this.isRunning) return;

        // Synchronize canvas internal buffer size with actual video stream resolution
        if (this.canvas && this.video) {
            const vWidth = this.video.videoWidth || 640;
            const vHeight = this.video.videoHeight || 480;
            if (this.canvas.width !== vWidth || this.canvas.height !== vHeight) {
                this.canvas.width = vWidth;
                this.canvas.height = vHeight;
            }
        }

        if (this.ctx && this.canvas) {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;

            if (hasHands) {
                let bestPrediction = null;
                let activeLandmarks = null;
                let activeHandedness = 'Right';

                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const handednessInfo = results.multiHandedness && results.multiHandedness[i];
                    // MediaPipe handedness label ('Left' or 'Right')
                    const handednessLabel = handednessInfo ? handednessInfo.label : 'Right';

                    // Draw the 21 hand landmarks and connecting skeleton
                    this.drawSkeleton(landmarks, handednessLabel);

                    // Classify the sign
                    const pred = classifyHandSign(landmarks, handednessLabel);
                    if (pred) {
                        if (!bestPrediction || pred.confidence > bestPrediction.confidence) {
                            bestPrediction = pred;
                            activeLandmarks = landmarks;
                            activeHandedness = handednessLabel;
                        }
                    } else if (!activeLandmarks) {
                        // Hand detected but pose unrecognized
                        activeLandmarks = landmarks;
                        activeHandedness = handednessLabel;
                    }
                }

                // Temporal smoothing filter: require consistent prediction across frames
                const stableResult = this.smoothPrediction(bestPrediction, activeLandmarks, activeHandedness);
                if (this.onResult) {
                    this.onResult(stableResult);
                }
            } else {
                // No hands detected in frame
                this.predictionHistory = [];
                this.currentConfirmedSign = null;
                if (this.onResult) {
                    this.onResult(null);
                }
            }

            this.ctx.restore();
        }
    }

    /**
     * Temporal smoothing to stabilize predictions and eliminate frame-by-frame flicker.
     */
    smoothPrediction(candidate, landmarks, handedness) {
        const signName = candidate ? candidate.sign_name : null;
        this.predictionHistory.push(signName);

        if (this.predictionHistory.length > this.historySize) {
            this.predictionHistory.shift();
        }

        // Check if last frames all agree
        const allAgree = this.predictionHistory.length >= this.historySize &&
                         this.predictionHistory.every((s) => s !== null && s === signName);

        if (allAgree && candidate) {
            this.currentConfirmedSign = candidate;
            return {
                ...candidate,
                landmarks,
                handedness,
                isRecognized: true
            };
        }

        // If hand is clearly visible but pose is not recognized as a known sign:
        if (landmarks) {
            return {
                sign_name: candidate ? candidate.sign_name : null,
                meaning: candidate ? candidate.meaning : null,
                confidence: candidate ? candidate.confidence : 0,
                landmarks,
                handedness,
                isRecognized: !!candidate,
                unrecognized: !candidate
            };
        }

        return null;
    }

    /**
     * High-performance Canvas 2D skeleton renderer for all 21 hand landmarks.
     */
    drawSkeleton(landmarks, handedness) {
        if (!this.ctx || !this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;

        // 1. Draw Bones / Connector Lines
        ctx.strokeStyle = '#0284c7'; // Vivid Cyan/Blue
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
            const p1 = landmarks[startIdx];
            const p2 = landmarks[endIdx];
            if (p1 && p2) {
                ctx.beginPath();
                ctx.moveTo(p1.x * w, p1.y * h);
                ctx.lineTo(p2.x * w, p2.y * h);
                ctx.stroke();
            }
        }

        // 2. Draw Landmark Joints (Knuckles & Finger Bones)
        for (let i = 0; i < landmarks.length; i++) {
            const pt = landmarks[i];
            if (!pt) continue;

            const x = pt.x * w;
            const y = pt.y * h;
            const isFingertip = FINGERTIP_INDICES.includes(i);

            ctx.beginPath();
            if (isFingertip) {
                // Glowing Emerald for fingertips
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#059669';
                ctx.shadowBlur = 8;
                ctx.fill();

                // White core dot
                ctx.beginPath();
                ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 0;
                ctx.fill();
            } else if (i === 0) {
                // Amber for Wrist base
                ctx.arc(x, y, 6.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#f59e0b';
                ctx.shadowBlur = 6;
                ctx.fill();
            } else {
                // Amber/Gold for intermediate joints
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#fde047';
                ctx.shadowBlur = 0;
                ctx.fill();
            }
        }

        // 3. Handedness Badge (Rendered near wrist)
        const wrist = landmarks[0];
        if (wrist) {
            const badgeX = wrist.x * w;
            const badgeY = Math.min(wrist.y * h + 24, h - 10);

            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const labelText = `${handedness} Hand`;
            const textWidth = ctx.measureText(labelText).width;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(badgeX - textWidth / 2 - 8, badgeY - 10, textWidth + 16, 20, 6);
            ctx.fill();

            ctx.fillStyle = '#38bdf8';
            ctx.fillText(labelText, badgeX, badgeY);
        }
    }
}
