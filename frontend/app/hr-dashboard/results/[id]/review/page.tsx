"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getHRToken } from "@/lib/auth-hr";
import VideoPlayer from "@/components/VideoPlayer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface VideoResponse {
  id: number;
  question: {
    id: number;
    question_text: string;
    question_type: string;
  };
  video_file: string;
  transcript: string;
  ai_score: number;
  ai_assessment: string;
  sentiment: number | string;
  hr_override_score?: number;
  hr_comments?: string;
  status: string;
}

interface ReviewData {
  result_id: number;
  interview_id: number;
  applicant: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
  };
  position_type: string;
  overall_score: number;
  passed: boolean;
  recommendation: string;
  created_at: string;
  video_responses: VideoResponse[];
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoResponse | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    video_response_id: 0,
    score: 0,
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<"hired" | "rejected" | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");

  useEffect(() => {
    if (resultId) {
      fetchReviewData();
    }
  }, [resultId]);

  const fetchReviewData = async () => {
    try {
      const token = getHRToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_BASE_URL}/results/${resultId}/full-review/`, { headers });
      setReviewData(response.data);

      if (response.data.video_responses?.length > 0) {
        setSelectedVideo(response.data.video_responses[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load review data");
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideScore = async (videoResponse: VideoResponse) => {
    if (!overrideForm.score || overrideForm.score < 0 || overrideForm.score > 100) {
      alert("Please enter a valid score between 0 and 100");
      return;
    }

    setSubmitting(true);
    try {
      const token = getHRToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${API_BASE_URL}/results/${resultId}/override-score/`,
        {
          video_response_id: videoResponse.id,
          override_score: overrideForm.score,
          comments: overrideForm.comments,
        },
        { headers }
      );

      alert("Score override saved successfully!");
      fetchReviewData();
      setOverrideForm({ video_response_id: 0, score: 0, comments: "" });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save override");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalDecision = async () => {
    if (!decisionType) return;

    setSubmitting(true);
    try {
      const token = getHRToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${API_BASE_URL}/results/${resultId}/final-decision/`,
        {
          decision: decisionType,
          notes: decisionNotes,
        },
        { headers }
      );

      alert(`Applicant marked as ${decisionType}! This applicant will be removed from the review queue.`);
      router.push("/hr-dashboard/interviews");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to save decision");
    } finally {
      setSubmitting(false);
      setShowDecisionModal(false);
    }
  };

  const openDecisionModal = (type: "hired" | "rejected") => {
    setDecisionType(type);
    setDecisionNotes("");
    setShowDecisionModal(true);
  };

  const getSentimentColor = (sentiment: number | string) => {
    if (typeof sentiment === "number") {
      if (sentiment >= 60) return "text-green-600 bg-green-100";
      if (sentiment >= 30) return "text-yellow-600 bg-yellow-100";
      return "text-red-600 bg-red-100";
    }

    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-100";
      case "neutral":
        return "text-yellow-600 bg-yellow-100";
      case "negative":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatSentiment = (sentiment: number | string) => {
    if (typeof sentiment === "number") {
      if (sentiment >= 60) return `Positive (${sentiment.toFixed(0)})`;
      if (sentiment >= 30) return `Neutral (${sentiment.toFixed(0)})`;
      return `Negative (${sentiment.toFixed(0)})`;
    }
    return sentiment || "N/A";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error || "Review data not found"}</p>
        <Link href="/hr-dashboard/results" className="text-purple-600 hover:text-purple-800 mt-4 inline-block">
          ← Back to Results
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/hr-dashboard/interviews"
            className="text-purple-600 hover:text-purple-800 text-sm mb-2 inline-block"
          >
            ← Back to Review Queue
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Interview Review</h1>
          <p className="text-gray-600 mt-1">Detailed review of {reviewData.applicant.full_name}'s interview</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/hr-dashboard/results/${resultId}/comparison`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Comparison
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      {/* Final Decision Buttons */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Make Final Hiring Decision</h2>
        <p className="text-gray-600 mb-4">
          After reviewing the interview, make your final decision. This will remove the applicant from the review queue.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => openDecisionModal("hired")}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Hire Applicant</span>
          </button>
          <button
            onClick={() => openDecisionModal("rejected")}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reject Applicant</span>
          </button>
        </div>
      </div>

      {/* Applicant Info */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Applicant Name</p>
            <p className="text-lg font-semibold text-gray-900">{reviewData.applicant.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-semibold text-gray-900">{reviewData.applicant.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-lg font-semibold text-gray-900">{reviewData.applicant.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Position</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {reviewData.position_type?.replace("_", " ")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overall Score</p>
            <p
              className={`text-lg font-semibold px-3 py-1 rounded inline-block ${getScoreColor(
                reviewData.overall_score
              )}`}
            >
              {reviewData.overall_score.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Result</p>
            <p
              className={`text-lg font-semibold px-3 py-1 rounded inline-block ${reviewData.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
            >
              {reviewData.passed ? "✓ Passed" : "✗ Failed"}
            </p>
          </div>
        </div>
      </div>

      {/* Video Responses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video List */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Questions ({reviewData.video_responses.length})</h3>
          <div className="space-y-2">
            {reviewData.video_responses.map((video, index) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${selectedVideo?.id === video.id
                    ? "bg-purple-100 border-2 border-purple-600"
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Question {index + 1}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{video.question.question_text}</p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${getScoreColor(
                      video.hr_override_score || video.ai_score
                    )}`}
                  >
                    {(video.hr_override_score || video.ai_score).toFixed(0)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Video Player and Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedVideo && (
            <>
              {/* Video Player */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Video Response</h3>
                <VideoPlayer
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}${selectedVideo.video_file
                    }`}
                  className="w-full aspect-video"
                />
              </div>

              {/* Question Details */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Question</h3>
                <p className="text-gray-900">{selectedVideo.question.question_text}</p>
                <div className="mt-3 flex items-center space-x-3">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {selectedVideo.question.question_type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${getSentimentColor(selectedVideo.sentiment)}`}>
                    {formatSentiment(selectedVideo.sentiment)}
                  </span>
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Transcript</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedVideo.transcript || "No transcript available"}
                  </p>
                </div>
              </div>

              {/* AI Assessment Statement */}
              {selectedVideo.ai_assessment && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-indigo-900 mb-2">AI Analysis Summary</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedVideo.ai_assessment}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Scoring Section */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Scoring</h3>

                {/* AI Score */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">AI Score (Original)</span>
                    <span
                      className={`px-3 py-1 text-lg font-semibold rounded ${getScoreColor(selectedVideo.ai_score)}`}
                    >
                      {selectedVideo.ai_score?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  {!selectedVideo.hr_override_score && (
                    <p className="text-xs text-blue-700 mt-1">✓ This score is being used for final calculation</p>
                  )}
                </div>

                {/* HR Override Section */}
                {selectedVideo.hr_override_score ? (
                  <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">HR Override Score</span>
                      <span
                        className={`px-3 py-1 text-lg font-semibold rounded ${getScoreColor(
                          selectedVideo.hr_override_score
                        )}`}
                      >
                        {selectedVideo.hr_override_score.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-purple-700 mb-2">✓ This score is being used for final calculation</p>

                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-gray-600">
                        Difference: {selectedVideo.hr_override_score > selectedVideo.ai_score ? "+" : ""}
                        {(selectedVideo.hr_override_score - selectedVideo.ai_score).toFixed(1)} points
                        {selectedVideo.hr_override_score > selectedVideo.ai_score
                          ? " (HR increased score)"
                          : " (HR decreased score)"}
                      </p>
                    </div>

                    {selectedVideo.hr_comments && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">HR Comments:</p>
                        <p className="text-sm text-gray-800 bg-white p-3 rounded border border-purple-100">
                          {selectedVideo.hr_comments}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Override Score (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={overrideForm.score || ""}
                        onChange={(e) => setOverrideForm({ ...overrideForm, score: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter score"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                      <textarea
                        value={overrideForm.comments}
                        onChange={(e) => setOverrideForm({ ...overrideForm, comments: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Add your review comments..."
                      />
                    </div>
                    <button
                      onClick={() => handleOverrideScore(selectedVideo)}
                      disabled={submitting}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save Override"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm {decisionType === "hired" ? "Hire" : "Rejection"}
            </h3>
            <p className="text-gray-600 mb-4">
              {decisionType === "hired"
                ? `You are about to mark ${reviewData.applicant.full_name} as HIRED. This will remove them from the review queue.`
                : `You are about to REJECT ${reviewData.applicant.full_name}. They will be able to reapply in 30 days.`}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add any notes about this decision..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDecisionModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalDecision}
                disabled={submitting}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${decisionType === "hired" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {submitting ? "Processing..." : `Confirm ${decisionType === "hired" ? "Hire" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
