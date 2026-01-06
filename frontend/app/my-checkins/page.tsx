"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";

interface CheckIn {
  id: string;
  task_id: string;
  status: string;
  date: string;
  video_path: string;
  notes?: string;
  metrics?: any;
  created_at: string;
  pdf_url?: string;
}

export default function MyCheckIns() {
  const [user, setUser] = useState<User | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        setUser(userData);

        const response = await fetch("http://localhost:8000/api/checkin/my-checkins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCheckins(data.checkins || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        removeToken();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="px-8 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">My Check-ins</h1>
          <p className="text-gray-400">View your daily check-in history</p>
        </div>

        {checkins.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">No check-ins yet</p>
            <p className="text-gray-500 mt-2">Start your first check-in from the welcome page</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {checkins.map((checkin) => (
              <div
                key={checkin.id}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          checkin.status
                        )} text-white`}
                      >
                        {checkin.status.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(checkin.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-2">
                      <span className="font-mono text-emerald-500">Task ID:</span>{" "}
                      {checkin.task_id}
                    </p>

                    {checkin.notes && (
                      <p className="text-gray-300 mt-2">
                        <span className="text-gray-500">Notes:</span> {checkin.notes}
                      </p>
                    )}

                    {checkin.metrics && (
                      <>
                        <div className="mt-3 grid grid-cols-4 gap-4">
                          <div className="bg-gray-800 rounded p-3">
                            <p className="text-xs text-gray-500">Stress</p>
                            <p className="text-lg font-semibold">
                              {checkin.metrics.stress_avg || 0}%
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded p-3">
                            <p className="text-xs text-gray-500">Yawns</p>
                            <p className="text-lg font-semibold">
                              {checkin.metrics.yawns_count || 0}
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded p-3">
                            <p className="text-xs text-gray-500">Engagement</p>
                            <p className="text-lg font-semibold">
                              {checkin.metrics.engagement_score || 0}%
                            </p>
                          </div>
                          <div className="bg-gray-800 rounded p-3">
                            <p className="text-xs text-gray-500">Dress</p>
                            <p className="text-lg font-semibold">
                              {Math.round((checkin.metrics.dress_compliance || 0) * 100)}%
                            </p>
                          </div>
                        </div>
                        
                        {}
                        {checkin.metrics.audio && checkin.metrics.audio.has_audio && (
                          <div className="mt-3 border-t border-gray-700 pt-3">
                            <p className="text-sm text-gray-400 mb-2">🎤 Audio Analysis:</p>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gray-800 rounded p-3">
                                <p className="text-xs text-gray-500">Words Spoken</p>
                                <p className="text-lg font-semibold">
                                  {checkin.metrics.audio.word_count || 0}
                                </p>
                              </div>
                              <div className="bg-gray-800 rounded p-3">
                                <p className="text-xs text-gray-500">Speaking Pace</p>
                                <p className="text-lg font-semibold">
                                  {checkin.metrics.audio.speaking_pace_wpm || 0} wpm
                                </p>
                              </div>
                              <div className="bg-gray-800 rounded p-3">
                                <p className="text-xs text-gray-500">Sentiment</p>
                                <p className="text-lg font-semibold capitalize">
                                  {checkin.metrics.audio.sentiment === 'positive' && '😊 Positive'}
                                  {checkin.metrics.audio.sentiment === 'negative' && '😟 Negative'}
                                  {checkin.metrics.audio.sentiment === 'neutral' && '😐 Neutral'}
                                </p>
                              </div>
                            </div>
                            {checkin.metrics.audio.transcript && (
                              <div className="mt-3 bg-gray-800 rounded p-3">
                                <p className="text-xs text-gray-500 mb-1">Transcript:</p>
                                <p className="text-sm text-gray-300 italic">
                                  "{checkin.metrics.audio.transcript.slice(0, 150)}
                                  {checkin.metrics.audio.transcript.length > 150 ? '...' : ''}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {}
                  {checkin.pdf_url && (
                    <div className="ml-4">
                      <button
                        onClick={() => {
                          const token = getToken();
                          window.open(`http://localhost:8000/api/checkin/download-pdf/${checkin.id}?token=${token}`, '_blank');
                        }}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                        title="Download PDF Report"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

