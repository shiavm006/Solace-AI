"use client";

import { Navigation } from "@/components/Navigation";

export default function Dashboard() {
  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-8 px-8 pb-0 overflow-hidden flex flex-col">

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
