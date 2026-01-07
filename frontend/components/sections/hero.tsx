"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [typedText, setTypedText] = useState("");
  const fullText = "How are my people really feeling today?";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + fullText.charAt(index));
        setIndex(index + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setTypedText("");
        setIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [index]);

  return (
    <section className="relative w-full h-[100dvh] md:h-screen flex flex-col items-center justify-center overflow-hidden pt-0 pb-0">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-height-full w-auto h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none"
          poster="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-poster-00001.jpg"
        >
          <source
            src="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-transcode.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center max-w-[1280px]">
        <h1 className="font-noe-display font-light text-[clamp(3.5rem,8vw,5.5rem)] leading-[1.05] text-white mb-10">
          Monitor your workspace.
        </h1>

        <div className="mb-10 relative z-30">
          <button
            onClick={() => router.push("/login")}
            className="group flex h-[48px] items-center justify-center bg-transparent text-white px-8 font-sans font-medium text-[14px] uppercase tracking-wider hover:bg-white hover:text-black hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 cursor-pointer relative z-30"
          >
            <span className="relative z-10">GET STARTED</span>
            <div className="absolute top-0 left-0 h-[2px] bg-white" style={{ width: 'calc(50% - 20px)' }}></div>
            <div className="absolute top-0 right-0 h-[2px] bg-white" style={{ width: 'calc(50% - 20px)' }}></div>
            <div className="absolute bottom-0 left-0 h-[2px] bg-white" style={{ width: 'calc(50% - 20px)' }}></div>
            <div className="absolute bottom-0 right-0 h-[2px] bg-white" style={{ width: 'calc(50% - 20px)' }}></div>
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white"></div>
            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white"></div>
          </button>
        </div>

        <p className="text-white/60 text-[1rem] md:text-[1.125rem] leading-relaxed max-w-[600px] relative z-30">
          Track stress, engagement, and burnout risk with daily video check-ins and AI-powered insights—privacy-first, always.
        </p>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-gradient-to-t from-[#0B0B0C] to-transparent z-10 pointer-events-none" />
    </section>
  );
}


