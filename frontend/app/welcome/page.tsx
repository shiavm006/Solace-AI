"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SplitText from "@/components/SplitText";
import CheckInOverlay from "@/components/CheckInOverlay";
import { getToken, getCurrentUser, removeToken } from "@/lib/api";
import type { User } from "@/lib/api";
import { LogOut } from "lucide-react";


export default function Welcome() {
  const [showCheckIn, setShowCheckIn] = useState(false);
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
        
        if (userData.role === "admin") {
          router.push("/dashboard");
          return;
        }

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
                        className="w-full px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors duration-200 shadow-lg hover:shadow-emerald-500/50 text-lg"
                      >
                        Check In
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCheckIn && <CheckInOverlay onClose={() => {
        setShowCheckIn(false);
      }} />}
    </>
  );
}

