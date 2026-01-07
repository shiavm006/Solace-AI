"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const fullText = "Where am I overspending this month?";
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
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-[120px] pb-[80px]">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-height-full w-auto h-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
          poster="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-poster-00001.jpg"
        >
          <source
            src="https://cdn.prod.website-files.com/68acbc076b672f730e0c77b9%2F68bb73e8d95f81619ab0f106_Clouds1-transcode.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center max-w-[1280px]">
        <div className="mb-8">
          <div className="glass-pill px-[16px] py-[6px] bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-full">
            <p className="text-[12px] uppercase tracking-[0.1em] font-medium text-white/90">
              $1 for 1 year — limited time
            </p>
          </div>
        </div>

        <h1 className="font-display font-light text-[clamp(3.5rem,8vw,5.5rem)] leading-[1.05] text-white mb-6">
          <em className="font-serif-italic">Own</em> your wealth.
        </h1>

        <div className="max-w-[600px] mb-10 flex flex-col gap-2">
          <p className="text-[1.125rem] font-medium text-white">
            Origin is your personal AI Financial Advisor.
          </p>
          <p className="text-[1rem] text-white/60 leading-[1.6]">
            Track your spending, investments, net worth and optimize your financial future—all in one place.
          </p>
        </div>

        <a
          href="https://app.useorigin.com/sign-up/dtc"
          className="group flex h-[48px] items-center justify-center bg-white text-black px-8 rounded-full font-sans font-medium text-[14px] uppercase tracking-wider mb-12 hover:scale-[1.02] transition-transform duration-200"
        >
          Get Started
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa857170-3070-42eb-a34a-feedce229158-useorigin-com/assets/svgs/68acbf05f9c3214369b19570_ArrowRight-2.svg"
            alt=""
            width={16}
            height={16}
            className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
          />
        </a>

        <div className="w-full max-w-[640px] px-4 mb-8">
          <a
            href="https://app.useorigin.com/sign-up/dtc"
            className="flex items-center w-full h-[64px] px-6 bg-black/40 backdrop-blur-[24px] rounded-full border border-white/10 text-left group"
          >
            <div className="flex-1 overflow-hidden">
              <span className="text-white/80 text-[16px] font-sans">
                {typedText}
              </span>
              <span className="inline-block w-[2px] h-[18px] bg-white/60 ml-px animate-pulse align-middle" />
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-white transition-colors duration-200">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa857170-3070-42eb-a34a-feedce229158-useorigin-com/assets/svgs/68acc0dd9b190be3a4886ccb_up-arrow-3.svg"
                alt="Search"
                width={16}
                height={16}
                className="w-4 h-4 invert group-hover:invert-0"
              />
            </div>
          </a>
        </div>

        <div className="mb-12">
          <p className="text-[14px] text-white/60 tracking-tight">
            Track everything. Ask anything.
          </p>
        </div>

        <div className="flex items-center justify-center gap-12 sm:gap-16 opacity-80 scale-90 sm:scale-100">
          <div className="flex items-center">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa857170-3070-42eb-a34a-feedce229158-useorigin-com/assets/svgs/68acd7a5e5cde3d99e192e5e_54389a561455c6d1a4fd45db9-4.svg"
              alt="Awards Certification"
              width={140}
              height={56}
              className="h-14 w-auto"
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-gradient-to-t from-[#0B0B0C] to-transparent z-10" />
    </section>
  );
}


