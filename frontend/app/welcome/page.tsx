"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SplineScene from "@/components/SplineScene";
import SplitText from "@/components/SplitText";
import CheckInOverlay from "@/components/CheckInOverlay";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";

export default function Welcome() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // replace with your spline scene url from spline.design
  const splineSceneUrl = "";

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        
        // Redirect admins to dashboard
        if (userData.role === "admin") {
          router.push("/dashboard");
          return;
        }

        // Only employees can access welcome page
        if (userData.role !== "employee") {
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

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  const handleCheckIn = () => {
    setShowCheckIn(true);
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
      <div className="h-screen text-white relative bg-black">
        <div className="absolute inset-0 m-6 border-2 border-emerald-500">
          {/* Corner squares */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-500"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-500"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500"></div>
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8">
            <SplitText
              text="Hey… I'm really glad you're here."
              delay={50}
              duration={1.25}
              ease="bounce.out"
              splitType="chars"
              className="text-4xl font-bold text-white"
              tag="h1"
              onLetterAnimationComplete={handleAnimationComplete}
            />
            <button
              onClick={handleCheckIn}
              className="px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors duration-200 shadow-lg hover:shadow-emerald-500/50"
            >
              Check In
            </button>
          </div>
          {splineSceneUrl && (
            <div className="absolute inset-0 z-0">
              <SplineScene scene={splineSceneUrl} />
            </div>
          )}
        </div>
      </div>

      {/* Check-in overlay */}
      {showCheckIn && <CheckInOverlay onClose={() => setShowCheckIn(false)} />}
    </>
  );
}

