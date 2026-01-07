"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/line-charts-1";
import { ChartConfig as RadarChartConfig, ChartContainer as RadarChartContainer, ChartTooltip as RadarChartTooltip, ChartTooltipContent as RadarChartTooltipContent } from "@/components/ui/radar-chart";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis, PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardMetrics {
  wellness_score: number;
  wellness_change: number;
  active_employees: number;
  total_employees: number;
  at_risk_count: number;
  at_risk_percentage: number;
  avg_stress: number;
  stress_change: number;
  avg_engagement: number;
  engagement_change: number;
  dominant_emotion: string;
  checkins_this_week: number;
  checkins_this_month: number;
  completion_rate: number;
  stress_trend: number[];
  engagement_trend: number[];
  emotion_distribution: Record<string, number>;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
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
        
        if (userData.role === "employee") {
          router.push("/welcome");
          return;
        }

        if (userData.role !== "admin") {
          removeToken();
          router.push("/login");
          return;
        }

        setUser(userData);

        // Fetch dashboard metrics
        const response = await fetch("http://localhost:8000/api/checkin/dashboard-metrics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else if (response.status === 401) {
          // Token expired or invalid
          removeToken();
          router.push("/login");
          return;
        } else {
          // Show error state instead of mock data
          console.error("Failed to fetch dashboard metrics:", response.status);
          setMetrics(null);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard:", error);
        
        // If unauthorized, redirect to login
        if (error.message === "Unauthorized" || error.message?.includes("Unauthorized")) {
          removeToken();
          router.push("/login");
          return;
        }
        
        // Don't use mock data - show error state instead
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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

  if (!user) return null;
  
  if (!metrics) {
    return (
      <div className="h-screen bg-black text-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4 text-lg">Failed to load dashboard metrics</p>
            <p className="text-gray-400 mb-6 text-sm">Please check your connection and try again</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-emerald-500 rounded hover:bg-emerald-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStressLabel = (stress: number) => {
    if (stress < 30) return "Low";
    if (stress < 60) return "Moderate";
    if (stress < 80) return "High";
    return "Critical";
  };

  const getStressColor = (stress: number) => {
    if (stress < 30) return "bg-emerald-500";
    if (stress < 60) return "bg-yellow-500";
    if (stress < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStressColorHex = (stress: number) => {
    if (stress < 30) return "#10b981"; // emerald
    if (stress < 60) return "#f59e0b"; // yellow
    if (stress < 80) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: "bg-yellow-500",
      calm: "bg-blue-500",
      neutral: "bg-gray-500",
      anxious: "bg-orange-500",
      sad: "bg-purple-500",
      stressed: "bg-red-500",
    };
    return colors[emotion.toLowerCase()] || "bg-gray-500";
  };

  // Calculate emotion percentages
  const totalEmotions = Object.values(metrics.emotion_distribution).reduce((a, b) => a + b, 0);
  const emotionPercentages = Object.entries(metrics.emotion_distribution).map(([emotion, count]) => ({
    emotion,
    percentage: totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0,
  })).sort((a, b) => b.percentage - a.percentage);

  // Prepare radar chart data for emotional wellness
  const emotionalWellnessData = [
    { dimension: "Joy", value: emotionPercentages.find(e => e.emotion.toLowerCase() === 'happy' || e.emotion.toLowerCase() === 'joy')?.percentage || 0 },
    { dimension: "Calm", value: emotionPercentages.find(e => e.emotion.toLowerCase() === 'calm')?.percentage || 0 },
    { dimension: "Neutral", value: emotionPercentages.find(e => e.emotion.toLowerCase() === 'neutral')?.percentage || 0 },
    { dimension: "Anxious", value: emotionPercentages.find(e => e.emotion.toLowerCase() === 'anxious')?.percentage || 0 },
    { dimension: "Sad", value: emotionPercentages.find(e => e.emotion.toLowerCase() === 'sad' || e.emotion.toLowerCase() === 'sadness')?.percentage || 0 },
    { dimension: "Stressed", value: emotionPercentages.find(e => e.emotion.toLowerCase() === 'stressed')?.percentage || 0 },
  ];

  const radarChartConfig = {
    wellness: {
      label: "Wellness Score",
      color: metrics.wellness_score >= 70 ? "#10b981" : metrics.wellness_score >= 50 ? "#f59e0b" : "#ef4444",
    },
  } satisfies RadarChartConfig;

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-8 px-8 pb-0 overflow-hidden flex flex-col">
        {/* Top Summary Bar with Charts */}
        <div className="mb-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Wellness Score - Radar Chart */}
            <div className="flex flex-col col-span-7">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold font-noe-display text-white mb-2">Emotional Wellness</h2>
                <p className="text-sm text-white/60">Overall Wellness Score: {Math.round(metrics.wellness_score)}/100</p>
              </div>
              <div className="h-64">
                <RadarChartContainer
                  config={radarChartConfig}
                  className="h-full w-full"
                >
                  <RadarChart data={emotionalWellnessData}>
                    <RadarChartTooltip cursor={false} content={<RadarChartTooltipContent />} />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                    />
                    <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                    <Radar
                      name="Wellness"
                      dataKey="value"
                      stroke={radarChartConfig.wellness.color}
                      fill={radarChartConfig.wellness.color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <defs>
                      <filter
                        id="wellness-glow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                  </RadarChart>
                </RadarChartContainer>
              </div>
            </div>

            {/* Stress & Engagement - Line Chart */}
            <div className="flex flex-col col-span-4 mr-8">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold font-noe-display text-white mb-2">Stress & Engagement Trends</h2>
                <p className="text-sm text-white/60">7-day average trends</p>
              </div>
              <div className="h-64">
                {(() => {
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const chartData = metrics.stress_trend.map((stress, idx) => ({
                    day: days[idx] || `Day ${idx + 1}`,
                    stress: Math.round(stress),
                    engagement: Math.round(metrics.engagement_trend[idx] || 0),
                    stressArea: Math.round(stress),
                    engagementArea: Math.round(metrics.engagement_trend[idx] || 0),
                  }));

                  const chartConfig = {
                    stress: {
                      label: 'Stress',
                      color: getStressColorHex(metrics.avg_stress),
                    },
                    engagement: {
                      label: 'Engagement',
                      color: metrics.avg_engagement >= 70 ? '#10b981' : metrics.avg_engagement >= 50 ? '#f59e0b' : '#ef4444',
                    },
                  } satisfies ChartConfig;

                  return (
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={getStressColorHex(metrics.avg_stress)} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={getStressColorHex(metrics.avg_stress)} stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartConfig.engagement.color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={chartConfig.engagement.color} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.1)"
                          strokeOpacity={0.3}
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.6)' }}
                          dy={5}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.6)' }}
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 100]}
                          width={35}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="bg-black/90 border border-white/20 rounded-lg p-2 text-xs">
                                {payload.map((entry: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-white">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span>{entry.name}: {entry.value}%</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }}
                          cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                        />
                        <Area
                          type="linear"
                          dataKey="stressArea"
                          stroke="transparent"
                          fill="url(#stressGradient)"
                          strokeWidth={0}
                          dot={false}
                        />
                        <Area
                          type="linear"
                          dataKey="engagementArea"
                          stroke="transparent"
                          fill="url(#engagementGradient)"
                          strokeWidth={0}
                          dot={false}
                        />
                        <Line
                          type="linear"
                          dataKey="stress"
                          stroke={getStressColorHex(metrics.avg_stress)}
                          strokeWidth={2}
                          dot={{ fill: 'var(--background)', strokeWidth: 2, r: 3, stroke: getStressColorHex(metrics.avg_stress) }}
                        />
                        <Line
                          type="linear"
                          dataKey="engagement"
                          stroke={chartConfig.engagement.color}
                          strokeWidth={2}
                          dot={{ fill: 'var(--background)', strokeWidth: 2, r: 3, stroke: chartConfig.engagement.color }}
                        />
                      </ComposedChart>
                    </ChartContainer>
                  );
                })()}
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStressColorHex(metrics.avg_stress) }}></div>
                  <span className="text-white/60">Stress</span>
                  <span className="text-white/40">({Math.round(metrics.avg_stress)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metrics.avg_engagement >= 70 ? '#10b981' : metrics.avg_engagement >= 50 ? '#f59e0b' : '#ef4444' }}></div>
                  <span className="text-white/60">Engagement</span>
                  <span className="text-white/40">({Math.round(metrics.avg_engagement)}%)</span>
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 pb-0 items-end mt-auto">
          {/* Card 1: Dominant Mood */}
        <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Dominant Mood</h3>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
            <div className="text-5xl font-bold mb-6 capitalize">{metrics.dominant_emotion}</div>
          <div className="space-y-2 mb-4">
              {emotionPercentages.map((item) => (
                <div key={item.emotion} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${getEmotionColor(item.emotion)} rounded-full`}></div>
                    <span className="text-sm text-gray-600 capitalize">{item.emotion}</span>
              </div>
                  <span className="text-sm font-medium">{item.percentage}%</span>
            </div>
              ))}
          </div>
          <div className="flex items-end h-24 gap-1">
              {metrics.stress_trend.map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-1">
                  <div className={`${getStressColor(height)} rounded-t`} style={{ height: `${Math.min(height, 100)}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>

          {/* Card 2: Check-ins Completed */}
        <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Check-ins Completed</h3>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
            <div className="text-4xl font-bold mb-2">{metrics.checkins_this_month}</div>
            <div className="text-sm text-gray-500 mb-6">This Month</div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Completion Rate</span>
                <span>{Math.round(metrics.completion_rate)}%</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${metrics.completion_rate}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>50</span>
                <span>100</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">This Week</span>
                <span className="font-medium">{metrics.checkins_this_week}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">This Month</span>
                <span className="font-medium">{metrics.checkins_this_month}</span>
            </div>
          </div>
        </div>

          {/* Card 3: Stress Level */}
        <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-600">Stress Level</h3>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
            <div className="text-4xl font-bold mb-2">{Math.round(metrics.avg_stress)}%</div>
            <div className="text-sm text-gray-500 mb-6">{getStressLabel(metrics.avg_stress)}</div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Average Stress</span>
                <span className={`${metrics.stress_change <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {metrics.stress_change <= 0 ? '↓' : '↑'} {Math.abs(metrics.stress_change)}%
                </span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${getStressColor(metrics.avg_stress)}`} style={{ width: `${Math.min(metrics.avg_stress, 100)}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
            <div className="flex items-end h-20 gap-1">
              {metrics.stress_trend.map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end gap-1">
                  <div className={`${getStressColor(height)} rounded-t`} style={{ height: `${Math.min(height, 100)}%` }}></div>
        </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Mon</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Card 4: Engagement Score */}
          <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Engagement Score</h3>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              </div>
            <div className="text-4xl font-bold mb-2">{Math.round(metrics.avg_engagement)}%</div>
            <div className="text-sm text-gray-500 mb-6">
              {metrics.avg_engagement >= 70 ? "High" : metrics.avg_engagement >= 50 ? "Moderate" : "Low"}
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Average Engagement</span>
                <span className={`${metrics.engagement_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {metrics.engagement_change >= 0 ? '↑' : '↓'} {Math.abs(metrics.engagement_change)}%
                </span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${metrics.avg_engagement >= 70 ? "bg-emerald-500" : metrics.avg_engagement >= 50 ? "bg-yellow-500" : "bg-orange-500"}`} style={{ width: `${Math.min(metrics.avg_engagement, 100)}%` }}></div>
            </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
            <div className="flex items-end h-20 gap-1">
              {metrics.engagement_trend.map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end gap-1">
                  <div className="bg-emerald-500 rounded-t" style={{ height: `${Math.min(height, 100)}%` }}></div>
          </div>
              ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
