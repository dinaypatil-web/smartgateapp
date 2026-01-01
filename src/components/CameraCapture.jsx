import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RotateCcw, Check, X } from 'lucide-react';

const CameraCapture = ({ onCapture, onCancel }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const startCameraWithBasicConstraints = useCallback(async () => {
        try {
            setError('');
            const basicConstraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsStreaming(true);
            }
        } catch (err) {
            console.error('Basic camera error:', err);
            setError('Unable to access camera even with basic settings. Please check your browser permissions and ensure no other app is using the camera.');
        }
    }, []);

    const startCamera = useCallback(async () => {
        try {
            setError('');
            // Check if device is mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            const constraints = {
                video: {
                    width: { ideal: isMobile ? 1280 : 640 },
                    height: { ideal: isMobile ? 720 : 480 },
                    facingMode: 'user' // Front camera for selfies
                }
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsStreaming(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission denied. Please click the camera icon in your browser address bar and select "Allow".');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera found on this device. Please ensure your camera is connected and not being used by another application.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera is already in use by another application. Please close other apps using the camera and try again.');
            } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                setError('Camera does not support the required settings. Trying with default settings...');
                // Retry with basic constraints
                setTimeout(() => {
                    startCameraWithBasicConstraints();
                }, 1000);
            } else if (err.name === 'TypeError') {
                setError('Camera access is not supported in this browser or in HTTP. Please use HTTPS or try a different browser like Chrome, Firefox, or Edge.');
            } else {
                setError(`Camera access failed: ${err.message || 'Unknown error'}. Please ensure you are using a secure connection (HTTPS) and camera permissions are granted.`);
            }
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsStreaming(false);
        }
    }, [stream]);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        setPhoto(dataUrl);
        stopCamera();
    }, [stopCamera]);

    const retakePhoto = useCallback(() => {
        setPhoto(null);
        startCamera();
    }, [startCamera]);

    const confirmPhoto = useCallback(() => {
        if (photo) {
            onCapture(photo);
        }
    }, [photo, onCapture]);

    const handleCancel = useCallback(() => {
        stopCamera();
        onCancel();
    }, [stopCamera, onCancel]);

    // Start camera on mount - fix flickering by using refs and proper cleanup
    useEffect(() => {
        let mounted = true;
        let currentStream = null;

        const initializeCamera = async () => {
            try {
                setError('');
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                
                const constraints = {
                    video: {
                        width: { ideal: isMobile ? 1280 : 640 },
                        height: { ideal: isMobile ? 720 : 480 },
                        facingMode: 'user'
                    }
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (mounted && videoRef.current) {
                    currentStream = mediaStream;
                    videoRef.current.srcObject = mediaStream;
                    setStream(mediaStream);
                    setIsStreaming(true);
                } else {
                    // Component unmounted, stop the stream
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                if (mounted) {
                    console.error('Camera error:', err);
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        setError('Camera permission denied. Please click the camera icon in your browser address bar and select "Allow".');
                    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                        setError('No camera found on this device. Please ensure your camera is connected and not being used by another application.');
                    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                        setError('Camera is already in use by another application. Please close other apps using the camera and try again.');
                    } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                        setError('Camera does not support the required settings. Trying with basic settings...');
                        // Retry with basic constraints
                        setTimeout(() => {
                            startCameraWithBasicConstraints();
                        }, 1000);
                    } else if (err.name === 'TypeError') {
                        setError('Camera access is not supported in this browser or in HTTP. Please use HTTPS or try a different browser like Chrome, Firefox, or Edge.');
                    } else {
                        setError(`Camera access failed: ${err.message || 'Unknown error'}. Please ensure you are using a secure connection (HTTPS) and camera permissions are granted.`);
                    }
                }
            }
        };

        initializeCamera();

        return () => {
            mounted = false;
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, []); // Empty dependency array - only run on mount/unmount

    return (
        <div className="camera-container">
            {error ? (
                <div className="camera-error-container" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                    <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Camera Access Error</div>
                        <div>{error}</div>
                    </div>
                    
                    <div className="camera-troubleshooting" style={{ 
                        background: 'var(--bg-glass)', 
                        padding: 'var(--space-4)', 
                        borderRadius: 'var(--radius-lg)', 
                        marginBottom: 'var(--space-4)',
                        textAlign: 'left'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: 'var(--space-3)' }}>Troubleshooting Steps:</div>
                        <ol style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                            <li style={{ marginBottom: 'var(--space-2)' }}>Click the camera icon 📷 in your browser address bar and select "Allow"</li>
                            <li style={{ marginBottom: 'var(--space-2)' }}>Ensure no other app is using your camera (Zoom, Teams, etc.)</li>
                            <li style={{ marginBottom: 'var(--space-2)' }}>Check if your browser supports camera access (Chrome, Firefox, Edge work best)</li>
                            <li style={{ marginBottom: 'var(--space-2)' }}>Make sure you're on a secure connection (HTTPS)</li>
                            <li style={{ marginBottom: 'var(--space-2)' }}>Try refreshing the page and granting permission when prompted</li>
                        </ol>
                    </div>
                    
                    <div className="camera-error-actions" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            onClick={startCamera}
                        >
                            <Camera size={18} />
                            Try Again
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={startCameraWithBasicConstraints}
                        >
                            Try Basic Settings
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={handleCancel}
                        >
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : photo ? (
                <>
                    <img src={photo} alt="Captured" className="camera-preview" style={{ transform: 'scaleX(-1)' }} />
                    <div className="camera-controls">
                        <button className="btn btn-secondary" onClick={retakePhoto}>
                            <RotateCcw size={18} />
                            Retake
                        </button>
                        <button className="btn btn-success" onClick={confirmPhoto}>
                            <Check size={18} />
                            Use Photo
                        </button>
                        <button className="btn btn-ghost" onClick={handleCancel}>
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="camera-video"
                        autoPlay
                        playsInline
                        muted
                        style={{ 
                            width: '100%', 
                            height: 'auto',
                            minHeight: '300px',
                            maxHeight: '60vh',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)'
                        }}
                        onLoadedMetadata={() => {
                            // Ensure video plays properly
                            if (videoRef.current) {
                                videoRef.current.play().catch(err => {
                                    console.error('Video play error:', err);
                                });
                            }
                        }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className="camera-controls">
                        {isStreaming ? (
                            <>
                                <button className="btn btn-primary" onClick={capturePhoto}>
                                    <Camera size={18} />
                                    Capture
                                </button>
                                <button className="btn btn-ghost" onClick={handleCancel}>
                                    <X size={18} />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-primary" onClick={startCamera}>
                                <Camera size={18} />
                                Start Camera
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CameraCapture;
