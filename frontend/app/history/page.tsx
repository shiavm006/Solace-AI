"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CallDetailCard from "@/components/ui/call-detail-card";

interface CallRecord {
  id: string;
  date: string;
  time: string;
  duration: string;
  mood: string;
  topic: string;
}

export default function CallHistory() {
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const calls: CallRecord[] = [
    {
      id: "1",
      date: "28 Dec",
      time: "10:30 PM",
      duration: "12 min",
      mood: "Sad",
      topic: "Relationship stress"
    },
    {
      id: "2",
      date: "27 Dec",
      time: "2:15 PM",
      duration: "8 min",
      mood: "Anxious",
      topic: "Work pressure"
    },
    {
      id: "3",
      date: "26 Dec",
      time: "9:45 AM",
      duration: "15 min",
      mood: "Calm",
      topic: "Daily check-in"
    },
    {
      id: "4",
      date: "25 Dec",
      time: "11:20 PM",
      duration: "10 min",
      mood: "Happy",
      topic: "Holiday reflection"
    },
    {
      id: "5",
      date: "24 Dec",
      time: "4:30 PM",
      duration: "18 min",
      mood: "Neutral",
      topic: "Family concerns"
    }
  ];

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      "Sad": "bg-blue-500",
      "Anxious": "bg-orange-500",
      "Calm": "bg-green-500",
      "Happy": "bg-yellow-500",
      "Neutral": "bg-gray-500"
    };
    return colors[mood] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="px-8 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Call History</h1>
          <p className="text-gray-400">A full log of all calls.</p>
        </div>

        {/* Minimalistic Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-500 hover:bg-emerald-500 border-b border-emerald-600/30">
                <TableHead className="h-9 py-2 text-white font-medium border-r border-emerald-600/30">Date</TableHead>
                <TableHead className="h-9 py-2 text-white font-medium border-r border-emerald-600/30">Time</TableHead>
                <TableHead className="h-9 py-2 text-white font-medium border-r border-emerald-600/30">Duration</TableHead>
                <TableHead className="h-9 py-2 text-white font-medium border-r border-emerald-600/30">Mood Detected</TableHead>
                <TableHead className="h-9 py-2 text-white font-medium border-r border-emerald-600/30">Topic</TableHead>
                <TableHead className="h-9 py-2 text-right text-white font-medium">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id} className="hover:bg-gray-50/50 border-b border-gray-200/30">
                  <TableCell className="py-3 font-medium text-black border-r border-gray-200/30">{call.date}</TableCell>
                  <TableCell className="py-3 text-gray-600 border-r border-gray-200/30">{call.time}</TableCell>
                  <TableCell className="py-3 text-gray-600 border-r border-gray-200/30">{call.duration}</TableCell>
                  <TableCell className="py-3 border-r border-gray-200/30">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getMoodColor(call.mood)} text-white`}>
                      {call.mood}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 border-r border-gray-200/30">{call.topic}</TableCell>
                  <TableCell className="py-3 text-right">
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium inline-flex items-center gap-1"
                    >
                      <span>▶</span>
                      <span>View</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal for Call Details */}
      {selectedCall && (
        <CallDetailCard call={selectedCall} onClose={() => setSelectedCall(null)} />
      )}
    </div>
  );
}

