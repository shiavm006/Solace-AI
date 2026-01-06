"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";

export default function CallHistory() {
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
        
        if (userData.role === "employee") {
          router.push("/welcome");
          return;
        }

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="px-8 py-8">
        <h1 className="text-4xl font-bold mb-2">Reports</h1>
        <p className="text-gray-400 mb-6">Coming soon: Admin dashboard for all employee check-ins</p>
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-500">No reports available yet</p>
        </div>
      </div>
    </div>
  );
}

