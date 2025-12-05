"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Position {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  order: number;
}

// Icon mapping based on position code
const getPositionIcon = (code: string): string => {
  const iconMap: { [key: string]: string } = {
    "virtual-assistant": "💼",
    VA: "💼",
    "customer-service": "📞",
    CS: "📞",
    "data-entry": "⌨️",
    DE: "⌨️",
    "social-media": "📱",
    IT: "💻",
  };
  return iconMap[code] || "💼";
};

export default function OpenPositionsPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/position-types/`);
      const data = response.data.results || response.data;
      // Only show active positions
      const activePositions = data.filter((p: Position) => p.is_active);
      setPositions(activePositions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setLoading(false);
    }
  };

  const handleApply = (positionCode: string) => {
    setSelectedPosition(positionCode);
    setShowModal(true);
  };

  const handleNewApplication = () => {
    if (selectedPosition) {
      localStorage.setItem("selectedPosition", selectedPosition);
      router.push(`/register?position=${selectedPosition}`);
    }
  };

  const handleReturningUser = () => {
    if (selectedPosition) {
      localStorage.setItem("selectedPosition", selectedPosition);
      router.push(`/login?position=${selectedPosition}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HireNow Pro</h1>
                <p className="text-sm text-gray-500">Open Positions</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            We're hiring talented professionals for remote positions. Apply now and start your journey with us!
          </p>
        </div>
      </div>

      {/* Positions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Positions</h2>
          <p className="text-gray-600">
            {positions.length} open positions • Click "Apply Now" to start your application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positions.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600">No positions available at the moment. Please check back later.</p>
            </div>
          ) : (
            positions.map((position) => (
              <div
                key={position.id}
                className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-purple-400 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{getPositionIcon(position.code)}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{position.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            Full-time
                          </span>
                          <span className="text-sm text-gray-500">📍 Remote</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{position.description || "Join our team!"}</p>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Click "Apply Now" to start your application process for this position.
                    </p>
                  </div>

                  <button
                    onClick={() => handleApply(position.code)}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="font-bold text-gray-900 mb-2">100% Remote</h3>
              <p className="text-gray-600">Work from anywhere in the world</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Hiring</h3>
              <p className="text-gray-600">Quick AI-powered interview process</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Competitive Pay</h3>
              <p className="text-gray-600">Fair compensation for your skills</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Apply?</h2>
              <p className="text-gray-600">Choose how you'd like to proceed</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleNewApplication}
                className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span>New Application</span>
              </button>

              <button
                onClick={handleReturningUser}
                className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Returning User Sign In</span>
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              By continuing, you'll be directed to complete your application for the selected position.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
