"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        
        // Employees can only access welcome page - redirect them
        if (userData.role === "employee") {
          router.push("/welcome");
          return;
        }

        // Only admins can access this page
        if (userData.role !== "admin") {
          router.push("/login");
          return;
        }

        setUser(userData);
      } catch (error) {
        removeToken();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-8 px-8 pb-0 overflow-hidden flex flex-col">

      {/* Main Title */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-4xl font-bold mb-2">Your Emotional Health</h1>
        <p className="text-gray-500 text-sm">Session ID: #449836</p>
      </div>

      {/* Wellness Visualization */}
      <div className="relative mb-4 h-48 flex items-center justify-center flex-shrink-0">
        {/* Heart/Brain Wellness Visualization */}
        <div className="relative w-full max-w-4xl">
          <div className="flex items-center justify-center">
            <svg className="w-64 h-64" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
              {/* Heart shape */}
              <path
                d="M100,180 C60,140 20,100 20,70 C20,50 40,30 60,30 C80,30 100,50 100,70 C100,50 120,30 140,30 C160,30 180,50 180,70 C180,100 140,140 100,180 Z"
                fill="#1a1a1a"
                stroke="#444"
                strokeWidth="2"
              />
              {/* Pulse waves */}
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={30 + i * 20}
                  fill="none"
                  stroke="#666"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity={0.5 - i * 0.15}
                />
              ))}
            </svg>
          </div>

          {/* Icon Buttons */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex gap-2">
            <button aria-label="View image" className="p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button aria-label="View location" className="p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Mood Level Card */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-gray-800/80 backdrop-blur rounded-xl p-4 w-48">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Mood level, %</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="text-4xl font-bold mb-3">80</div>
            <div className="h-12 relative">
              <svg className="w-full h-full" viewBox="0 0 150 40" preserveAspectRatio="none">
                <polyline
                  points="0,30 20,25 40,28 60,20 80,15 100,18 120,22 140,12 150,15"
                  fill="none"
                  stroke="#888"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="absolute bottom-0 right-0 text-xs text-gray-500">stable</span>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute right-8 bottom-0 flex flex-col gap-2">
            <button aria-label="Zoom in" className="p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button aria-label="Zoom out" className="p-2 bg-gray-800/80 backdrop-blur rounded-lg hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-4 gap-1 pb-0 items-end mt-auto">
        {/* Current Mood Card */}
        <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-600">Current Mood</h3>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="text-5xl font-bold mb-6">Calm</div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Happy</span>
              </div>
              <span className="text-sm font-medium">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <span className="text-sm text-gray-600">Calm</span>
              </div>
              <span className="text-sm font-medium">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Anxious</span>
              </div>
              <span className="text-sm font-medium">20%</span>
            </div>
          </div>
          <div className="flex items-end h-24 gap-1">
            {[45, 30, 50, 25, 60, 85, 40, 20, 35, 70, 25, 15].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-1">
                <div className={`${idx === 5 ? 'bg-orange-500' : 'bg-gray-800'} rounded-t`} style={{ height: `${height}%` }}></div>
                <div className="bg-gray-300 rounded-t h-[20%]"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-600">Sessions Completed</h3>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-8">28</div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>This Month</span>
              <span></span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[56%]"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* Stress Level Card */}
        <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-600">Stress Level</h3>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-8">32%</div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span></span>
              <span>Moderate</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[32%]"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Call Engagement Card */}
        <div className="bg-white text-black rounded-t-2xl p-6 flex flex-col" style={{ height: '35vh' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-600">Call Engagement</h3>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="flex gap-4 mb-6">
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-gray-500">Total Calls</div>
            </div>
            <div>
              <div className="text-2xl font-bold">8.5</div>
              <div className="text-xs text-gray-500">Avg Min</div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">This Week</span>
              </div>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">This Month</span>
              </div>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                <span className="text-gray-600">Total Time</span>
              </div>
              <span className="font-medium">102m</span>
            </div>
          </div>
          <div className="h-20 flex items-center gap-8">
            <div className="flex-1 h-1 bg-orange-500 rounded"></div>
            <div className="flex-1 h-1 bg-orange-500 rounded"></div>
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
