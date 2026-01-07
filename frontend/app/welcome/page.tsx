"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SplitText from "@/components/SplitText";
import CheckInOverlay from "@/components/CheckInOverlay";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";
import { config } from "@/lib/config";
import { format } from "date-fns";
import { LogOut } from "lucide-react";

interface LatestCheckIn {
  id: string;
  date: string;
  status: string;
  metrics: {
    stress_avg: number;
    stress_max: number;
    stress_min: number;
    yawns_count: number;
    engagement_score: number;
    head_pose_variance: number;
    duration_seconds: number;
    face_detected: boolean;
    audio?: {
      transcript: string;
      word_count: number;
      speaking_pace_wpm: number;
      voice_energy: number;
      pitch_variance: number;
      pauses_count: number;
      sentiment: string;
      sentiment_confidence?: number;
      emotions?: Record<string, number>;
      dominant_emotion?: string;
      duration_seconds: number;
      has_audio: boolean;
    };
  };
  insights: {
    summary: string;
    actions: string[];
  };
  notes: string;
  pdf_url?: string;
}

export default function Welcome() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestCheckIn, setLatestCheckIn] = useState<LatestCheckIn | null>(null);
  const [showReport, setShowReport] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        
        if (userData.role === "admin") {
          router.push("/dashboard");
          return;
        }

        if (userData.role !== "employee") {
          router.push("/login");
          return;
        }

        setUser(userData);
        
        fetchLatestCheckIn(token);
      } catch (error) {
        removeToken();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchLatestCheckIn = async (token: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/checkin/my-checkins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkins && data.checkins.length > 0) {
          const completed = data.checkins.filter((c: LatestCheckIn) => c.status === "completed");
          if (completed.length > 0) {
            setLatestCheckIn(completed[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching latest check-in:", error);
    }
  };

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  const handleCheckIn = () => {
    setShowCheckIn(true);
  };

  const getStressColor = (stress: number) => {
    if (stress < 40) return "text-green-500";
    if (stress < 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getStressBg = (stress: number) => {
    if (stress < 40) return "bg-green-500";
    if (stress < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
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
    <>
      <div className="min-h-screen text-white relative bg-black overflow-y-auto">
        <div className="absolute inset-0 m-6">
          <div className="absolute inset-0 z-10 overflow-y-auto">
            <div className="absolute top-2 right-8 z-20">
              <button
                onClick={() => {
                  removeToken();
                  router.push("/login");
                }}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 transition-all duration-200 hover:border-white/40 group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-white group-hover:text-red-400 transition-colors" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-start gap-8 p-8 min-h-full">
              <div className="flex flex-col items-center gap-8 mt-12">
                <SplitText
                  text={`Welcome ${user.first_name}`}
                  delay={50}
                  duration={1.25}
                  ease="bounce.out"
                  splitType="chars"
                  className="text-6xl md:text-7xl font-noe-display font-light text-white"
                  tag="h1"
                  onLetterAnimationComplete={handleAnimationComplete}
                />
              </div>

              <div className="w-full flex justify-center items-center mt-12">
                <div className="w-full max-w-2xl">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-8 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-3xl font-semibold text-white font-noe-display">
                        Daily Check-in
                      </h3>
                      <p className="text-base text-white/70 leading-relaxed">
                        Complete your today's check-in before the day ends to track your wellbeing and get insights.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleCheckIn}
                        className="flex-1 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors duration-200 shadow-lg hover:shadow-emerald-500/50 text-lg"
                      >
                        Check In
                      </button>
                      {latestCheckIn && (
                        <button
                          onClick={() => setShowReport(!showReport)}
                          className="flex-1 px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/20 transition-colors duration-200 border border-emerald-500/50 text-lg"
                        >
                          {showReport ? "Hide Report" : "View Latest Report"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full mt-12">
                {showReport && latestCheckIn && (
                  <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
                  <div className="bg-white/5 backdrop-blur rounded-xl border border-emerald-500/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl font-bold text-emerald-500">Your Latest Report</h2>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">
                          {format(new Date(latestCheckIn.date), "MMM dd, yyyy 'at' hh:mm a")}
                        </span>
                        {latestCheckIn.pdf_url && (
                          <button
                            onClick={() => {
                              const token = getToken();
                              window.open(`${config.apiUrl}/api/checkin/download-pdf/${latestCheckIn.id}?token=${token}`, '_blank');
                            }}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {latestCheckIn.notes && (
                      <div className="mb-4 p-4 bg-black/30 rounded-lg">
                        <p className="text-sm text-gray-300"><span className="font-semibold text-emerald-500">Your notes:</span> {latestCheckIn.notes}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-black/40 rounded-lg p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full ${getStressBg(latestCheckIn.metrics.stress_avg)} flex items-center justify-center`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Stress Level</p>
                            <p className={`text-3xl font-bold ${getStressColor(latestCheckIn.metrics.stress_avg)}`}>
                              {latestCheckIn.metrics.stress_avg}%
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-400">
                          <p>Max: {latestCheckIn.metrics.stress_max}%</p>
                          <p>Min: {latestCheckIn.metrics.stress_min}%</p>
                        </div>
                      </div>

                      {}
                      <div className="bg-black/40 rounded-lg p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full ${latestCheckIn.metrics.engagement_score >= 70 ? 'bg-green-500' : latestCheckIn.metrics.engagement_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'} flex items-center justify-center`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Engagement</p>
                            <p className={`text-3xl font-bold ${getEngagementColor(latestCheckIn.metrics.engagement_score)}`}>
                              {latestCheckIn.metrics.engagement_score}%
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>Focus & Attention Level</p>
                        </div>
                      </div>

                      {}
                      <div className="bg-black/40 rounded-lg p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full ${latestCheckIn.metrics.yawns_count > 5 ? 'bg-red-500' : latestCheckIn.metrics.yawns_count > 2 ? 'bg-yellow-500' : 'bg-green-500'} flex items-center justify-center`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Yawns Detected</p>
                            <p className="text-3xl font-bold text-white">
                              {latestCheckIn.metrics.yawns_count}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>Duration: {latestCheckIn.metrics.duration_seconds.toFixed(1)}s</p>
                        </div>
                      </div>
                    </div>

                    {}
                    {latestCheckIn.metrics.audio && latestCheckIn.metrics.audio.has_audio && (
                      <div className="mb-6 bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <h3 className="text-xl font-bold text-purple-500">🎤 Audio Analysis</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Words Spoken</p>
                            <p className="text-2xl font-bold text-white">{latestCheckIn.metrics.audio.word_count}</p>
                          </div>
                          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Speaking Pace</p>
                            <p className="text-2xl font-bold text-white">{latestCheckIn.metrics.audio.speaking_pace_wpm} <span className="text-sm">wpm</span></p>
                          </div>
                          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Sentiment</p>
                            <p className="text-2xl font-bold capitalize">
                              {latestCheckIn.metrics.audio.sentiment === 'positive' && <span className="text-green-500">😊 Positive</span>}
                              {latestCheckIn.metrics.audio.sentiment === 'negative' && <span className="text-red-500">😟 Negative</span>}
                              {latestCheckIn.metrics.audio.sentiment === 'neutral' && <span className="text-gray-400">😐 Neutral</span>}
                            </p>
                            {latestCheckIn.metrics.audio.sentiment_confidence && (
                              <p className="text-xs text-gray-500 mt-1">
                                {(latestCheckIn.metrics.audio.sentiment_confidence * 100).toFixed(0)}% confidence
                              </p>
                            )}
                          </div>
                          {latestCheckIn.metrics.audio.dominant_emotion && (
                            <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                              <p className="text-sm text-gray-400">Dominant Emotion</p>
                              <p className="text-2xl font-bold capitalize text-purple-400">
                                {latestCheckIn.metrics.audio.dominant_emotion}
                              </p>
                            </div>
                          )}
                          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400">Pauses</p>
                            <p className="text-2xl font-bold text-white">{latestCheckIn.metrics.audio.pauses_count}</p>
                          </div>
                        </div>
                        
                        {latestCheckIn.metrics.audio.emotions && Object.keys(latestCheckIn.metrics.audio.emotions).length > 0 && (
                          <div className="bg-black/40 rounded-lg p-4 border border-white/10 mb-4">
                            <p className="text-sm text-gray-400 mb-2">Emotion Breakdown:</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(latestCheckIn.metrics.audio.emotions)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([emotion, score]) => (
                                  <span 
                                    key={emotion}
                                    className="px-3 py-1 bg-purple-500/20 rounded-full text-sm text-purple-300"
                                  >
                                    {emotion}: {(score as number * 100).toFixed(0)}%
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        {latestCheckIn.metrics.audio.transcript && (
                          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Transcript:</p>
                            <p className="text-white italic">
                              "{latestCheckIn.metrics.audio.transcript.slice(0, 200)}
                              {latestCheckIn.metrics.audio.transcript.length > 200 ? '...' : ''}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-lg p-6 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="text-xl font-bold text-emerald-500">AI-Generated Insights</h3>
                      </div>
                      <p className="text-white mb-4 leading-relaxed">{latestCheckIn.insights.summary}</p>
                      
                      {latestCheckIn.insights.actions && latestCheckIn.insights.actions.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-emerald-500 mb-2">Recommended Actions:</p>
                          <ul className="space-y-2">
                            {latestCheckIn.insights.actions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                                <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {}
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => router.push('/my-checkins')}
                        className="text-emerald-500 hover:text-emerald-400 transition-colors duration-200 font-medium text-sm flex items-center gap-2 mx-auto"
                      >
                        View All Check-ins
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                    </div>
                  )}

                  {}
                  {!latestCheckIn && !showCheckIn && (
                    <div className="w-full bg-white/5 backdrop-blur rounded-xl border border-emerald-500/30 p-8 text-center">
                      <svg className="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-xl font-bold text-white mb-2">No Reports Yet</h3>
                      <p className="text-gray-400 mb-4">Complete your first check-in to generate your AI-powered wellness report!</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {showCheckIn && <CheckInOverlay onClose={() => {
        setShowCheckIn(false);
        const token = getToken();
        if (token) {
          setTimeout(() => fetchLatestCheckIn(token), 2000);
        }
      }} />}
    </>
  );
}

