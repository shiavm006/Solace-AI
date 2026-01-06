"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OnboardingStep = "intro" | "name" | "phone" | "about";

export default function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [about, setAbout] = useState("");
  const router = useRouter();

  const handleNext = () => {
    if (step === "intro") {
      setStep("name");
    } else if (step === "name") {
      setStep("phone");
    } else if (step === "phone") {
      setStep("about");
    } else if (step === "about") {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step === "name") {
      setStep("intro");
    } else if (step === "phone") {
      setStep("name");
    } else if (step === "about") {
      setStep("phone");
    }
  };

  const canProceed = () => {
    if (step === "name") return name.trim().length > 0;
    if (step === "phone") return phone.trim().length > 0;
    if (step === "about") return about.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {step === "intro" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Please Enter Your Details
            </h1>
            <p className="text-gray-600 text-lg">
              We'll help you get started with a few quick questions
            </p>
            <button
              onClick={handleNext}
              className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Let's Begin
            </button>
          </div>
        )}

        {step === "name" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your name?</h2>
              <p className="text-gray-600">We'd like to know how to address you</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
              autoFocus
            />
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "phone" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your phone number?</h2>
              <p className="text-gray-600">We'll use this to connect you with Solace-AI</p>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
              autoFocus
            />
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === "about" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Share anything you'd like us to know</p>
            </div>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Share your thoughts, feelings, or anything you'd like Solace-AI to know about you..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              autoFocus
            />
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

