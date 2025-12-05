"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getHRToken } from "@/lib/auth-hr";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Applicant {
  id: number;
  status: string;
  application_date: string;
}

interface Interview {
  id: number;
  status: string;
  created_at: string;
  position_type?: string;
}

interface Result {
  id: number;
  overall_score: number;
  communication_score: number;
  technical_score: number;
  problem_solving_score: number;
  passed: boolean;
  created_at: string;
  position_type: string;
  hr_reviewed_at?: string;
}

interface AnalyticsData {
  totalApplicants: number;
  totalInterviews: number;
  totalResults: number;
  passRate: number;
  avgScore: number;
  statusBreakdown: { [key: string]: number };
  positionBreakdown: { [key: string]: number };
  scoresByPosition: { [key: string]: number };
  weeklyTrends: { week: string; applicants: number; interviews: number }[];
  recentActivity: { date: string; applicants: number; interviews: number; results: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (applicants.length > 0 || interviews.length > 0 || results.length > 0) {
      calculateAnalytics();
    }
  }, [applicants, interviews, results, selectedPeriod]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = getHRToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [applicantsRes, interviewsRes, resultsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/applicants/`, { headers }),
        axios.get(`${API_BASE_URL}/interviews/`, { headers }),
        axios.get(`${API_BASE_URL}/results/`, { headers }),
      ]);

      setApplicants(applicantsRes.data.results || applicantsRes.data || []);
      setInterviews(interviewsRes.data.results || interviewsRes.data || []);
      setResults(resultsRes.data.results || resultsRes.data || []);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Redirecting to login...");
        setTimeout(() => router.push("/hr-login"), 1500);
      } else {
        setError(err.response?.data?.detail || "Failed to load analytics data");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = <T extends { created_at?: string; application_date?: string }>(items: T[]): T[] => {
    if (selectedPeriod === "all") return items;

    const now = new Date();
    const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return items.filter((item) => {
      const date = new Date(item.created_at || item.application_date || "");
      return date >= cutoff;
    });
  };

  const calculateAnalytics = () => {
    const filteredApplicants = filterByPeriod(applicants);
    const filteredInterviews = filterByPeriod(interviews);
    const filteredResults = filterByPeriod(results);

    // Status breakdown
    const statusBreakdown: { [key: string]: number } = {};
    filteredApplicants.forEach((app) => {
      statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
    });

    // Position breakdown
    const positionBreakdown: { [key: string]: number } = {};
    const scoresByPosition: { [key: string]: { total: number; count: number } } = {};

    filteredInterviews.forEach((interview) => {
      if (interview.position_type) {
        positionBreakdown[interview.position_type] = (positionBreakdown[interview.position_type] || 0) + 1;
      }
    });

    filteredResults.forEach((result) => {
      if (!scoresByPosition[result.position_type]) {
        scoresByPosition[result.position_type] = { total: 0, count: 0 };
      }
      scoresByPosition[result.position_type].total += result.overall_score;
      scoresByPosition[result.position_type].count += 1;
    });

    const avgScoresByPosition: { [key: string]: number } = {};
    Object.keys(scoresByPosition).forEach((pos) => {
      avgScoresByPosition[pos] = scoresByPosition[pos].total / scoresByPosition[pos].count;
    });

    // Calculate pass rate and average score
    const passedCount = filteredResults.filter((r) => r.passed).length;
    const passRate = filteredResults.length > 0 ? (passedCount / filteredResults.length) * 100 : 0;
    const avgScore =
      filteredResults.length > 0
        ? filteredResults.reduce((sum, r) => sum + r.overall_score, 0) / filteredResults.length
        : 0;

    // Recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayApplicants = applicants.filter(
        (a) => new Date(a.application_date).toISOString().split("T")[0] === dateStr
      ).length;
      const dayInterviews = interviews.filter(
        (i) => new Date(i.created_at).toISOString().split("T")[0] === dateStr
      ).length;
      const dayResults = results.filter((r) => new Date(r.created_at).toISOString().split("T")[0] === dateStr).length;

      recentActivity.push({
        date: dateStr,
        applicants: dayApplicants,
        interviews: dayInterviews,
        results: dayResults,
      });
    }

    setAnalytics({
      totalApplicants: filteredApplicants.length,
      totalInterviews: filteredInterviews.length,
      totalResults: filteredResults.length,
      passRate,
      avgScore,
      statusBreakdown,
      positionBreakdown,
      scoresByPosition: avgScoresByPosition,
      weeklyTrends: [],
      recentActivity,
    });
  };

  const formatPositionType = (type: string) => {
    return type.replace(/_/g, " ").toUpperCase();
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="text-gray-600 mt-1">Comprehensive hiring metrics and performance data</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "7d" | "30d" | "90d" | "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Applicants</h3>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-4xl font-bold text-blue-600">{analytics.totalApplicants}</p>
          <p className="text-xs text-gray-500 mt-2">Total applications received</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Interviews Completed</h3>
            <span className="text-3xl">🎥</span>
          </div>
          <p className="text-4xl font-bold text-green-600">{analytics.totalInterviews}</p>
          <p className="text-xs text-gray-500 mt-2">
            {analytics.totalApplicants > 0
              ? `${((analytics.totalInterviews / analytics.totalApplicants) * 100).toFixed(1)}% conversion rate`
              : "No conversion data"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pass Rate</h3>
            <span className="text-3xl">✅</span>
          </div>
          <p className="text-4xl font-bold text-purple-600">{analytics.passRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">{results.filter((r) => r.passed).length} candidates passed</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-orange-600">{analytics.avgScore.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">Overall interview performance</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Applicant Status Breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(analytics.statusBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count], index) => {
                const percentage = ((count / analytics.totalApplicants) * 100).toFixed(1);
                const colors = [
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-purple-500",
                  "bg-orange-500",
                  "bg-red-500",
                  "bg-pink-500",
                  "bg-indigo-500",
                  "bg-teal-500",
                ];
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{formatStatusLabel(status)}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Position Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Interviews by Position</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(analytics.positionBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([position, count]) => {
                const percentage = ((count / analytics.totalInterviews) * 100).toFixed(1);
                const avgScore = analytics.scoresByPosition[position] || 0;
                return (
                  <div key={position} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{formatPositionType(position)}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Avg: {avgScore.toFixed(1)}%</span>
                        <span className="text-sm font-bold text-purple-600">{count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-900">Activity Trend (Last 7 Days)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Applicants</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Interviews</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.recentActivity.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1.5 text-base font-bold rounded-full bg-blue-100 text-blue-700">
                      {day.applicants}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1.5 text-base font-bold rounded-full bg-green-100 text-green-700">
                      {day.interviews}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1.5 text-base font-bold rounded-full bg-purple-100 text-purple-700">
                      {day.results}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Distribution Histogram */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-bold text-gray-900">Score Distribution</h3>
        </div>
        <div className="flex items-end justify-between h-64 space-x-2">
          {[
            { range: "0-20", min: 0, max: 20, color: "bg-red-500" },
            { range: "21-40", min: 21, max: 40, color: "bg-orange-500" },
            { range: "41-60", min: 41, max: 60, color: "bg-yellow-500" },
            { range: "61-80", min: 61, max: 80, color: "bg-blue-500" },
            { range: "81-100", min: 81, max: 100, color: "bg-green-500" },
          ].map((bucket) => {
            const count = results.filter((r) => r.overall_score >= bucket.min && r.overall_score <= bucket.max).length;
            const maxCount = Math.max(
              ...["0-20", "21-40", "41-60", "61-80", "81-100"].map((_, i) => {
                const ranges = [
                  { min: 0, max: 20 },
                  { min: 21, max: 40 },
                  { min: 41, max: 60 },
                  { min: 61, max: 80 },
                  { min: 81, max: 100 },
                ];
                return results.filter((r) => r.overall_score >= ranges[i].min && r.overall_score <= ranges[i].max)
                  .length;
              })
            );
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={bucket.range} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-2" style={{ height: "200px" }}>
                  <div
                    className={`w-full ${bucket.color} rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {count} candidates
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-600 mt-1">{bucket.range}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* HR Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">HR Review Progress</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Reviewed</span>
              <span className="text-2xl font-bold text-indigo-600">
                {results.filter((r) => r.hr_reviewed_at).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Pending Review</span>
              <span className="text-2xl font-bold text-orange-600">
                {results.filter((r) => !r.hr_reviewed_at).length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div
                className="bg-gradient-to-r from-indigo-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    results.length > 0 ? (results.filter((r) => r.hr_reviewed_at).length / results.length) * 100 : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              {results.length > 0
                ? `${((results.filter((r) => r.hr_reviewed_at).length / results.length) * 100).toFixed(1)}% complete`
                : "No reviews yet"}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Hiring Funnel</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Applied</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{applicants.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Interviewed</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{interviews.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Passed</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{results.filter((r) => r.passed).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Hired</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {applicants.filter((a) => a.status === "hired").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
