"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trainingAPI } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { TrainingModule } from "@/types";
import { Loader2, BookOpen, PlayCircle, ArrowRight, Award } from "lucide-react";

export default function TrainingCenterPage() {
    const router = useRouter();
    const { currentApplicant } = useStore();
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [startingSession, setStartingSession] = useState<number | null>(null);

    useEffect(() => {
        // Check if applicant is logged in
        if (!currentApplicant) {
            // If not logged in, redirect to register or login
            // For now, we'll just show a message or redirect to register
            router.push("/register");
            return;
        }

        fetchModules();
    }, [currentApplicant, router]);

    const fetchModules = async () => {
        try {
            const response = await trainingAPI.getModules();
            console.log('Training modules response:', response.data);

            // Ensure we always set an array
            const modulesData = Array.isArray(response.data)
                ? response.data
                : (response.data?.results || response.data?.modules || []);

            setModules(modulesData);
        } catch (err) {
            console.error("Failed to fetch modules:", err);
            setError("Failed to load training modules. Please try again.");
            setModules([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    const startSession = async (moduleId: number) => {
        if (!currentApplicant) return;

        setStartingSession(moduleId);
        try {
            const response = await trainingAPI.createSession({
                applicant_id: currentApplicant.id,
                module_id: moduleId,
            });

            const session = response.data;
            router.push(`/training/session/${session.id}`);
        } catch (err) {
            console.error("Failed to start session:", err);
            setError("Failed to start training session. Please try again.");
            setStartingSession(null);
        }
    };

    if (!currentApplicant) {
        return null; // Or a loading spinner while redirecting
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Interview Training Center
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Practice your interview skills with our AI coach. Get instant feedback on your answers, clarity, and confidence.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.isArray(modules) && modules.length > 0 ? (
                            modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                                >
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-100 rounded-full">
                                                <BookOpen className="w-6 h-6 text-blue-600" />
                                            </div>
                                            {module.is_active && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{module.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{module.description}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Award className="w-4 h-4 mr-2 text-yellow-500" />
                                                <span>AI Feedback Included</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <PlayCircle className="w-4 h-4 mr-2 text-green-500" />
                                                <span>Unlimited Practice</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                                        <button
                                            onClick={() => startSession(module.id)}
                                            disabled={startingSession === module.id}
                                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {startingSession === module.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Starting...
                                                </>
                                            ) : (
                                                <>
                                                    Start Practice
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No training modules available at the moment.</p>
                                <p className="text-gray-400 text-sm mt-2">Please check back later or contact support.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
