"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Mic, Video, Square, Play, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";

interface VideoRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    isProcessing?: boolean;
    maxDuration?: number; // in seconds, default 120
}

export default function VideoRecorder({
    onRecordingComplete,
    isProcessing = false,
    maxDuration = 120
}: VideoRecorderProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [permissionError, setPermissionError] = useState("");
    const [hasAudio, setHasAudio] = useState(false);
    const [recordingFormat, setRecordingFormat] = useState<string>("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setPermissionError("");

            // Setup audio analysis
            setupAudioAnalysis(mediaStream);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setPermissionError("Could not access camera or microphone. Please allow permissions.");
        }
    };

    const setupAudioAnalysis = (mediaStream: MediaStream) => {
        if (!window.AudioContext && !(window as any).webkitAudioContext) return;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(mediaStream);

        microphone.connect(analyser);
        analyser.fftSize = 256;

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudio = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);

            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            setAudioLevel(average);

            // Check if we have meaningful audio (threshold > 10)
            if (average > 10) {
                setHasAudio(true);
            }

            animationFrameRef.current = requestAnimationFrame(checkAudio);
        };

        checkAudio();
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startRecording = () => {
        if (!stream) return;

        // Try to use MP4 format (better Gemini support), fallback to WebM
        let mimeType = 'video/webm;codecs=vp8,opus'; // Default fallback

        if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
            mimeType = 'video/webm;codecs=h264,opus'; // H.264 codec is better supported
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
            mimeType = 'video/webm;codecs=vp9,opus'; // VP9 is newer than VP8
        }

        console.log(`📹 Recording with format: ${mimeType}`);
        setRecordingFormat(mimeType);

        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                setRecordedChunks((prev) => [...prev, e.data]);
            }
        };

        recorder.onstop = () => {
            // Extract the base mime type for the blob
            const blobType = mimeType.split(';')[0];
            const blob = new Blob(recordedChunks, { type: blobType });
            const url = URL.createObjectURL(blob);
            setRecordedVideo(url);
            onRecordingComplete(blob);
        };

        setRecordedChunks([]);
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setRecordingDuration(0);
        setHasAudio(false); // Reset audio check for this recording

        timerRef.current = setInterval(() => {
            setRecordingDuration(prev => {
                if (prev >= maxDuration) {
                    stopRecording();
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const retake = () => {
        setRecordedVideo(null);
        setRecordedChunks([]);
        setRecordingFormat("");
        startCamera();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (permissionError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Camera Access Error</h3>
                <p className="text-red-600">{permissionError}</p>
                <button
                    onClick={() => startCamera()}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl relative">
            {/* Recording Format Debug Indicator */}
            {recordingFormat && (
                <div className="absolute top-2 left-2 z-10 bg-green-500/90 text-white text-xs px-2 py-1 rounded-md font-mono">
                    {recordingFormat.includes('mp4') ? '✅ MP4' :
                        recordingFormat.includes('h264') ? '✅ H.264' :
                            recordingFormat.includes('vp9') ? '⚠️ VP9' : '❌ VP8'}
                </div>
            )}

            {/* Video Preview/Playback */}
            <div className="relative aspect-video bg-gray-900">
                {!recordedVideo ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                    />
                ) : (
                    <video
                        src={recordedVideo}
                        controls
                        className="w-full h-full object-contain"
                    />
                )}

                {/* Overlays */}
                {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600/80 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="font-mono font-medium">{formatTime(recordingDuration)}</span>
                    </div>
                )}

                {/* Audio Visualizer (Simple Bar) */}
                {!recordedVideo && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                            <Mic className={`w-4 h-4 ${audioLevel > 5 ? 'text-green-400' : 'text-gray-400'}`} />
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-75 ${audioLevel > 80 ? 'bg-red-500' :
                                        audioLevel > 40 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(100, (audioLevel / 255) * 200)}%` }}
                                />
                            </div>
                            {hasAudio && <CheckCircle className="w-4 h-4 text-green-400" />}
                        </div>
                        {!hasAudio && isRecording && recordingDuration > 2 && (
                            <p className="text-xs text-yellow-400 mt-1 ml-1">
                                ⚠️ No audio detected. Check your microphone.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-4 border-t border-gray-800">
                <div className="flex items-center justify-center space-x-6">
                    {!recordedVideo ? (
                        !isRecording ? (
                            <button
                                onClick={startRecording}
                                className="group flex flex-col items-center space-y-1"
                            >
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-all shadow-lg group-hover:scale-105">
                                    <div className="w-6 h-6 bg-white rounded-sm" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">Record</span>
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="group flex flex-col items-center space-y-1"
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-red-500 flex items-center justify-center group-hover:bg-gray-700 transition-all">
                                    <Square className="w-6 h-6 text-red-500 fill-current" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">Stop</span>
                            </button>
                        )
                    ) : (
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={retake}
                                disabled={isProcessing}
                                className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retake
                            </button>
                            {/* Confirmation is handled by parent via onRecordingComplete */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
