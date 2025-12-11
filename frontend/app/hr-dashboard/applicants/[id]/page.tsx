"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function ApplicantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicantId = params.id as string;

  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resendLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`/api/hr/applicant/${applicantId}/resend-link/`);
      setLink(res.data?.url);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Applicant {applicantId}</h1>
      <button
        onClick={resendLink}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
      >
        {loading ? "Sending..." : "Resend Interview Link"}
      </button>
      {link && (
        <div className="mt-4">
          <p className="text-sm text-gray-700">Magic Link:</p>
          <div className="bg-gray-100 p-3 rounded mt-2 text-sm break-all">{link}</div>
        </div>
      )}
      {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
    </div>
  );
}
