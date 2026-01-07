"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";
import { config } from "@/lib/config";

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

        const response = await fetch(`${config.apiUrl}/api/checkin/my-checkins`, {
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

