import { classifyHandSign } from './signClassifier';

export class HandDetectionEngine {
    constructor(videoElement, canvasElement, onResultCallback) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
        this.onResult = onResultCallback;
        this.hands = null;
        this.camera = null;
        this.isRunning = false;
    }

    async initialize() {
        if (!window.Hands) {
            console.error('MediaPipe Hands library not loaded on window.');
            throw new Error('MediaPipe Hands library unavailable.');
        }

        this.hands = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        this.hands.onResults((results) => this.handleResults(results));

        if (window.Camera && this.video) {
            this.camera = new window.Camera(this.video, {
                onFrame: async () => {
                    if (this.isRunning && this.video && this.hands) {
                        await this.hands.send({ image: this.video });
                    }
                },
                width: 640,
                height: 480
            });
        }
    }

    async start() {
        if (!this.hands) {
            await this.initialize();
        }
        this.isRunning = true;
        if (this.camera) {
            await this.camera.start();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.camera) {
            try {
                this.camera.stop();
            } catch (e) {
                console.warn('Camera stop warning:', e);
            }
        }
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    handleResults(results) {
        if (!this.isRunning) return;

        // Sync canvas sizing with video dimensions
        if (this.canvas && this.video) {
            if (this.canvas.width !== this.video.videoWidth || this.canvas.height !== this.video.videoHeight) {
                this.canvas.width = this.video.videoWidth || 640;
                this.canvas.height = this.video.videoHeight || 480;
            }
        }

        if (this.ctx && this.canvas) {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                for (const landmarks of results.multiHandLandmarks) {
                    // Draw MediaPipe skeleton
                    if (window.drawConnectors && window.HAND_CONNECTIONS) {
                        window.drawConnectors(this.ctx, landmarks, window.HAND_CONNECTIONS, {
                            color: '#2563eb',
                            lineWidth: 3
                        });
                    }
                    if (window.drawLandmarks) {
                        window.drawLandmarks(this.ctx, landmarks, {
                            color: '#10b981',
                            lineWidth: 2,
                            radius: 4
                        });
                    }

                    // Perform Sign Recognition
                    const prediction = classifyHandSign(landmarks);
                    if (prediction && this.onResult) {
                        this.onResult({ ...prediction, landmarks });
                    }
                }
            } else {
                if (this.onResult) {
                    this.onResult(null);
                }
            }
            this.ctx.restore();
        }
    }
}
