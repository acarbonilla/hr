"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trainingAPI, questionAPI } from "@/lib/api";
import { useStore } from "@/store/useStore";
import VideoRecorder from "@/components/VideoRecorder";
import { TrainingSession, TrainingResponse } from "@/types";
import { Loader2, ArrowLeft, MessageSquare, Sparkles, CheckCircle, AlertTriangle, RefreshCw, Volume2 } from "lucide-react";

const SAMPLE_QUESTIONS = [
    "Tell me about yourself.",
    "What are your greatest strengths?",
    "Describe a challenging situation you faced and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why do you want to work here?",
    "Tell me about a time you failed.",
    "How do you handle stress and pressure?",
    "What is your preferred work style?",
];

export default function TrainingSessionPage() {
    const params = useParams();
    const router = useRouter();
    const { currentApplicant } = useStore();
    const [session, setSession] = useState<TrainingSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [questionText, setQuestionText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentResponse, setCurrentResponse] = useState<TrainingResponse | null>(null);
    const [error, setError] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!currentApplicant) {
            router.push("/register");
            return;
        }
        fetchSession();
    }, [params.id, currentApplicant]);

    const fetchSession = async () => {
        try {
            const response = await trainingAPI.getSession(Number(params.id));
            setSession(response.data);
            const initialQuestion = SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)];
            setQuestionText(initialQuestion);
            setTimeout(() => speakQuestion(initialQuestion), 500);
        } catch (err) {
            console.error("Failed to load session:", err);
            setError("Failed to load session details.");
        } finally {
            setIsLoading(false);
        }
    };

    const speakQuestion = (text: string) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('karen') ||
            voice.name.toLowerCase().includes('victoria') ||
            voice.name.toLowerCase().includes('susan')
        );

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const generateQuestion = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const randomQ = SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)];
            setQuestionText(randomQ);
            setCurrentResponse(null);
            speakQuestion(randomQ);
            setIsGenerating(false);
        }, 300);
    };

    const handleRecordingComplete = async (blob: Blob) => {
        if (!questionText.trim()) {
            setError("Please enter or select a question first.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await trainingAPI.submitResponse(Number(params.id), {
                question_text: questionText,
                video: blob,
            });

            setCurrentResponse(response.data);
        } catch (err) {
            console.error("Failed to submit response:", err);
            setError("Failed to process your response. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Session Not Found</h2>
                    <button
                        onClick={() => router.push("/training")}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Back to Training Center
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <button
                        onClick={() => router.push("/training")}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Modules
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {session.module ? session.module.name : "General Practice"}
                    </h1>
                    <div className="hidden sm:block w-24" />
                </div>

                {/* Responsive Grid: Single column on small/medium, 2 columns on xl */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {/* Left Column: Question & Recording */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Question Card */}
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                <label className="block text-sm font-semibold text-gray-900">
                                    Practice Question
                                </label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => speakQuestion(questionText)}
                                        disabled={isSpeaking}
                                        className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 border border-blue-200"
                                    >
                                        <Volume2 className={`w-4 h-4 mr-1.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                                        {isSpeaking ? 'Playing...' : 'Listen'}
                                    </button>
                                    <button
                                        onClick={generateQuestion}
                                        disabled={isGenerating}
                                        className="flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 border border-green-200"
                                    >
                                        <Sparkles className={`w-4 h-4 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
                                        New Question
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base sm:text-lg font-medium text-gray-900 bg-gray-50"
                                    rows={3}
                                    placeholder="Type a question or generate one..."
                                />
                                <div className="absolute top-3 right-3">
                                    <MessageSquare className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Recorder */}
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Record Your Answer</h3>
                            <VideoRecorder
                                onRecordingComplete={handleRecordingComplete}
                                isProcessing={isSubmitting}
                            />
                            {isSubmitting && (
                                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                                    <span className="text-blue-900 font-semibold text-sm sm:text-base">AI is analyzing your response...</span>
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-red-900 text-sm font-medium">{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Feedback */}
                    <div className="space-y-4 sm:space-y-6">
                        {currentResponse ? (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-100">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4">
                                    <div className="flex items-center text-white">
                                        <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3" />
                                        <h2 className="text-lg sm:text-xl font-bold">AI Coach Feedback</h2>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                    {/* Error Warning */}
                                    {currentResponse.ai_feedback.error && (
                                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-bold text-orange-900 mb-1">Analysis Issue</h4>
                                                    <p className="text-sm text-orange-800">
                                                        We couldn't analyze your response. This is usually because:
                                                    </p>
                                                    <ul className="text-sm text-orange-800 mt-2 space-y-1 list-disc list-inside">
                                                        <li>No audio was detected in your video (check your microphone)</li>
                                                        <li>The recording was too short</li>
                                                        <li>Technical issue with the AI service</li>
                                                    </ul>
                                                    {currentResponse.ai_feedback.error_type && (
                                                        <p className="text-xs text-orange-700 mt-3 font-mono bg-orange-100 p-2 rounded">
                                                            Error: {currentResponse.ai_feedback.error_type} - {currentResponse.ai_feedback.error}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-orange-800 mt-2 font-semibold">
                                                        Please try recording again and make sure to speak clearly into your microphone.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scores */}
                                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                        {Object.entries(currentResponse.ai_feedback.scores || {}).map(([key, score]) => (
                                            <div key={key} className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                                <div className="text-xs sm:text-sm text-gray-600 capitalize mb-1 font-medium">{key}</div>
                                                <div className={`text-xl sm:text-2xl font-bold ${score >= 80 ? 'text-green-600' :
                                                    score >= 60 ? 'text-yellow-600' : score > 0 ? 'text-red-600' : 'text-gray-400'
                                                    }`}>
                                                    {score === 0 ? 'N/A' : score}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Strengths */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide mb-3 flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                            Strengths
                                        </h3>
                                        <ul className="space-y-2">
                                            {currentResponse.ai_feedback.strengths.map((point, i) => (
                                                <li key={i} className="flex items-start text-sm text-green-900">
                                                    <span className="mr-2 text-green-600 font-bold">•</span>
                                                    <span className="font-medium">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Improvements */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wide mb-3 flex items-center">
                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                                            Areas for Improvement
                                        </h3>
                                        <ul className="space-y-2">
                                            {currentResponse.ai_feedback.improvements.map((point, i) => (
                                                <li key={i} className="flex items-start text-sm text-yellow-900">
                                                    <span className="mr-2 text-yellow-600 font-bold">•</span>
                                                    <span className="font-medium">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Coaching Tips */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">
                                            💡 Coaching Tips
                                        </h3>
                                        <ul className="space-y-2">
                                            {currentResponse.ai_feedback.coaching_tips.map((tip, i) => (
                                                <li key={i} className="text-sm text-blue-900 italic font-medium">
                                                    "{tip}"
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Video Playback & Transcript */}
                                    <div className="border-t-2 border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                                            <MessageSquare className="w-5 h-5 mr-2 text-gray-700" />
                                            Your Response Review
                                        </h3>

                                        {/* Video Playback */}
                                        {currentResponse.video_file && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Video Recording</h4>
                                                <div className="bg-black rounded-lg overflow-hidden shadow-md">
                                                    <video
                                                        src={`http://localhost:8000${currentResponse.video_file}`}
                                                        controls
                                                        className="w-full"
                                                        style={{ maxHeight: '300px' }}
                                                    >
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </div>
                                            </div>
                                        )}

                                        {/* Transcript */}
                                        {currentResponse.transcript && (
                                            <div className="bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-300 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                                    <MessageSquare className="w-4 h-4 mr-1.5 text-gray-600" />
                                                    Transcript
                                                </h4>
                                                <p className="text-sm text-gray-900 leading-relaxed italic font-medium">
                                                    "{currentResponse.transcript}"
                                                </p>
                                                <p className="text-xs text-gray-600 mt-2 font-medium">
                                                    {currentResponse.transcript.length} characters
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center border-2 border-dashed border-gray-300 h-full flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Feedback?</h3>
                                <p className="text-gray-600 max-w-xs mx-auto text-sm sm:text-base">
                                    Record your answer to get instant AI analysis on your delivery, content, and confidence.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
