"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewAPI } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Home,
  BarChart3,
  MessageSquare,
  Brain,
  Mic,
  Target,
} from "lucide-react";

interface InterviewAnalysis {
  interview_id: number;
  applicant_name: string;
  overall_score: number;
  sentiment_score: number;
  confidence_score: number;
  speech_clarity_score: number;
  content_relevance_score: number;
  total_questions: number;
  answered_questions: number;
  recommendation: "pass" | "fail" | "review";
  video_responses: any[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = parseInt(params.id as string);

  const [analysis, setAnalysis] = useState<InterviewAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 60; // 60 attempts = 2 minutes (checking every 2 seconds)

    const loadResults = async () => {
      try {
        setIsLoading(true);

        // Fetch analysis results
        const response = await interviewAPI.getAnalysis(interviewId);
        const analysisData = response.data.analysis || response.data;

        console.log("Analysis data:", analysisData);

        // Check if AI analysis is complete (scores > 0)
        const hasAIAnalysis =
          analysisData.overall_score > 0 || analysisData.sentiment_score > 0 || analysisData.confidence_score > 0;

        if (!hasAIAnalysis && pollAttempts < MAX_POLL_ATTEMPTS) {
          // AI analysis not ready yet, show processing message
          pollAttempts++;
          const remainingTime = Math.ceil(((MAX_POLL_ATTEMPTS - pollAttempts) * 2) / 60);
          setError(
            `🤖 AI is analyzing your interview responses... This may take 30-60 seconds. (${remainingTime} min remaining)`
          );

          // Poll again after 2 seconds
          pollInterval = setTimeout(() => {
            loadResults();
          }, 2000);
        } else {
          // Analysis is ready or max attempts reached
          setAnalysis(analysisData);
          setError("");
          setIsLoading(false);

          if (pollInterval) {
            clearTimeout(pollInterval);
          }
        }
      } catch (err: any) {
        console.error("Error loading results:", err);

        // Check if analysis is not ready yet
        if (err.response?.status === 404 || err.response?.data?.message?.includes("not completed")) {
          if (pollAttempts < MAX_POLL_ATTEMPTS) {
            pollAttempts++;
            setError("Your interview is being processed. Results will be available shortly.");

            // Poll again after 2 seconds
            pollInterval = setTimeout(() => {
              loadResults();
            }, 2000);
          } else {
            setError("Analysis is taking longer than expected. Please refresh the page in a moment.");
            setIsLoading(false);
          }
        } else {
          setError(err.response?.data?.message || "Failed to load results. Please try again.");
          setIsLoading(false);
        }
      }
    };

    loadResults();

    // Cleanup function to clear polling interval
    return () => {
      if (pollInterval) {
        clearTimeout(pollInterval);
      }
    };
  }, [interviewId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRecommendationConfig = (recommendation: string) => {
    switch (recommendation) {
      case "pass":
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-600" />,
          title: "Congratulations!",
          message: "You have successfully passed the interview.",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-900",
        };
      case "fail":
        return {
          icon: <XCircle className="w-16 h-16 text-red-600" />,
          title: "Interview Not Passed",
          message: "Unfortunately, you did not meet the requirements this time.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-900",
        };
      case "review":
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-600" />,
          title: "Under Review",
          message: "Your interview requires additional review by our team.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-900",
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-gray-600" />,
          title: "Results Pending",
          message: "Your interview is being analyzed.",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-900",
        };
    }
  };

  if (isLoading || (error && error.includes("AI is analyzing"))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-2xl">
          {/* Animated AI Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <Brain className="w-20 h-20 text-blue-600 animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-gray-800">AI Analysis in Progress</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
              <p className="text-lg text-gray-700">Processing your interview responses...</p>
            </div>

            <div className="space-y-3 text-left text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                <span>Transcribing video responses</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse delay-100"></div>
                <span>Analyzing sentiment and confidence</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse delay-200"></div>
                <span>Evaluating speech clarity and content</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse delay-300"></div>
                <span>Calculating final scores</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>⏱️ Estimated time:</strong> 30-60 seconds per video response
              </p>
            </div>
          </div>

          {error && <p className="text-gray-600 italic">{error}</p>}
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Results Not Available</h1>
          <p className="text-gray-600 mb-6">
            {error || "Your interview results are not available yet. Please check back later."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const recommendationConfig = getRecommendationConfig(analysis.recommendation);
  const scores = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: "Overall Score",
      value: analysis.overall_score,
      description: "Combined assessment of all factors",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      label: "Sentiment & Attitude",
      value: analysis.sentiment_score,
      description: "Positive attitude, enthusiasm, and emotional tone",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: "Confidence Level",
      value: analysis.confidence_score,
      description: "Self-assurance and conviction in responses",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: "Speech Clarity",
      value: analysis.speech_clarity_score,
      description: "Articulation, pace, and communication clarity",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: "Content Relevance",
      value: analysis.content_relevance_score,
      description: "How well answers address the question",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
          <p className="text-gray-600">Applicant: {analysis.applicant_name}</p>
          <p className="text-sm text-gray-500">
            Questions Answered: {analysis.answered_questions} / {analysis.total_questions}
          </p>
        </div>

        {/* Recommendation Card */}
        <div
          className={`${recommendationConfig.bgColor} border ${recommendationConfig.borderColor} rounded-lg p-8 mb-8 text-center`}
        >
          <div className="flex justify-center mb-4">{recommendationConfig.icon}</div>
          <h2 className={`text-2xl font-bold mb-2 ${recommendationConfig.textColor}`}>{recommendationConfig.title}</h2>
          <p className={`text-lg ${recommendationConfig.textColor}`}>{recommendationConfig.message}</p>
        </div>

        {/* AI Analysis Banner */}
        <div className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Brain className="w-5 h-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">AI-Powered Interview Analysis</h3>
              <p className="text-sm text-blue-800">
                Your responses have been analyzed using advanced AI (Gemini 2.5 Flash) to evaluate sentiment,
                confidence, speech clarity, and content relevance across all dimensions.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Issue Warning */}
        {analysis.overall_score === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-orange-600 mr-3 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">No Audio Detected</h3>
                <p className="text-orange-800">
                  We were unable to detect any audio in your responses. This may be due to a microphone issue or technical problem during recording.
                  Please ensure your microphone is working correctly and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Score Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {scores.map((score, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`${getScoreBgColor(score.value)} p-3 rounded-lg mr-4`}>
                    <div className={getScoreColor(score.value)}>{score.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{score.label}</h3>
                    <p className="text-sm text-gray-500">{score.description}</p>
                  </div>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(score.value)}`}>
                  {score.value === 0 ? "N/A" : score.value}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${score.value >= 80 ? "bg-green-600" : score.value >= 60 ? "bg-yellow-600" : "bg-red-600"
                    }`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
          <div className="space-y-3">
            {analysis.recommendation === "pass" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-900">Our team will contact you via email with next steps.</p>
              </div>
            )}
            {analysis.recommendation === "review" && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-900">
                  Your interview is under review. We'll notify you via email once a decision has been made.
                </p>
              </div>
            )}
            {analysis.recommendation === "fail" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900">
                  We appreciate your interest. You may reapply after 30 days to try again.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            If you have any questions about your results, please contact our HR team.
          </p>
        </div>
      </div>
    </div>
  );
}
