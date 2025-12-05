import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // List of public endpoints that don't require auth
    // We use partial matching, so "/applicants/" matches "/api/applicants/"
    const publicEndpoints = [
      "/applicants/",
      "/auth/login/",
      "/auth/register/",
      "/training/modules/",
      "/training/sessions/",
      "/interviews/",
      "/questions/",
      "/analysis/",
    ];

    const isPublic = config.url && publicEndpoints.some(endpoint => config.url!.includes(endpoint));

    // Add auth token if available (check both regular and HR tokens)
    // Only add token if it's NOT a public endpoint
    if (typeof window !== "undefined" && !isPublic) {
      const token = localStorage.getItem("authToken") || localStorage.getItem("hr_authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Only redirect to login if on admin/HR routes
      // Allow applicants to continue without authentication
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        // Only redirect to login if user is on HR/admin routes
        if (path.startsWith("/hr-dashboard") || path.startsWith("/admin")) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const applicantAPI = {
  // Register new applicant
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    application_source?: string;
    latitude?: number;
    longitude?: number;
  }) => api.post("/applicants/", data),
};

export const interviewAPI = {
  // Create new interview
  createInterview: (data: { applicant_id: number; interview_type: string; position_type?: string }) =>
    api.post("/interviews/", data),

  // Get interview details
  getInterview: (id: number) => api.get(`/interviews/${id}/`),

  // Upload video response (no immediate analysis)
  uploadVideoResponse: (
    interviewId: number,
    formData: FormData
  ) => {
    return api.post(`/interviews/${interviewId}/video-response/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Submit interview for processing
  submitInterview: (id: number) => api.post(`/interviews/${id}/submit/`),

  // Complete interview
  completeInterview: (id: number) => api.post(`/interviews/${id}/complete/`),

  // List interviews
  listInterviews: (params?: any) => api.get("/interviews/", { params }),

  // Get interview analysis
  getAnalysis: (id: number) => api.get(`/interviews/${id}/analysis/`),
};

export const trainingAPI = {
  // Get all training modules
  getModules: () => api.get("/training/modules/"),

  // Create a new training session
  createSession: (data: { applicant_id: number; module_id: number }) =>
    api.post("/training/sessions/", data),

  // Get session details
  getSession: (id: number) => api.get(`/training/sessions/${id}/`),

  // Submit a practice response
  submitResponse: (
    sessionId: number,
    data: { question_text: string; video: Blob }
  ) => {
    const formData = new FormData();
    formData.append("question_text", data.question_text);

    // Determine file extension from blob type
    const blobType = data.video.type;
    let extension = 'webm'; // default
    if (blobType.includes('mp4')) {
      extension = 'mp4';
    } else if (blobType.includes('webm')) {
      extension = 'webm';
    } else if (blobType.includes('mov') || blobType.includes('quicktime')) {
      extension = 'mov';
    }

    formData.append("video", data.video, `practice_response.${extension}`);

    return api.post(`/training/sessions/${sessionId}/submit_response/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const questionAPI = {
  // Get all active questions (with optional position and type filters)
  getQuestions: (params?: { position?: string; type?: string }) => api.get("/questions/", { params }),

  // Get single question
  getQuestion: (id: number) => api.get(`/questions/${id}/`),
};

export const authAPI = {
  // Login
  login: (data: { username: string; password: string }) => api.post("/auth/login/", data),

  // Logout
  logout: (refreshToken: string) => api.post("/auth/logout/", { refresh_token: refreshToken }),

  // Register
  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    user_type?: string;
    first_name?: string;
    last_name?: string;
  }) => api.post("/auth/register/", data),

  // Refresh token
  refreshToken: (refreshToken: string) => api.post("/auth/token/refresh/", { refresh: refreshToken }),

  // Check authentication status
  checkAuth: () => api.get("/auth/check/"),

  // Get user profile
  getProfile: () => api.get("/auth/profile/"),

  // Update user profile
  updateProfile: (data: { first_name?: string; last_name?: string; email?: string }) =>
    api.patch("/auth/profile/", data),

  // Change password
  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.patch("/auth/change-password/", data),
};

export default api;
