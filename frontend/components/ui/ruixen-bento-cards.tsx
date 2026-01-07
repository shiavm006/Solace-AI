"use client"

import React from "react"
import { cn } from "@/lib/utils"

const cardContents = [
  {
    title: "Daily Video Check-ins",
    description:
      "Employees record short 30-120 second videos answering simple questions. Quick, non-invasive, and privacy-first—videos are deleted immediately after processing.",
  },
  {
    title: "Multimodal AI Analysis",
    description:
      "Our ML pipeline analyzes facial expressions, voice tone, and language patterns to detect stress, engagement, and burnout indicators with objective precision.",
  },
  {
    title: "Real-Time Wellness Signals",
    description:
      "Get instant insights into team wellbeing. Track stress levels, engagement scores, and energy patterns across individuals and teams. Spot burnout risk before it becomes a problem, with actionable recommendations delivered in real-time.",
  },  
  {
    title: "Privacy-First Design",
    description:
      "Every video is deleted immediately after processing. Only anonymized metrics are stored, ensuring compliance with GDPR, HIPAA, and your organization's privacy standards.",
  },
  {
    title: "Manager & HR Dashboards",
    description:
      "Comprehensive dashboards for managers and HR teams. View team health trends, identify struggling employees early, and make data-driven decisions about wellness programs.",
  },
]

const PlusCard: React.FC<{
  className?: string
  title: string
  description: string
}> = ({
  className = "",
  title,
  description,
}) => {
  return (
    <div
      className={cn(
        "relative border border-dashed border-white/20 rounded-lg p-6 bg-[#161617] min-h-[200px]",
        "flex flex-col justify-between hover:bg-[#1a1a1b] transition-colors",
        className
      )}
    >
      <CornerPlusIcons />
      <div className="relative z-10 space-y-2">
        <h3 className="text-xl font-bold text-white font-noe-display">
          {title}
        </h3>
        <p className="text-white/70 text-[15px] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

const CornerPlusIcons = () => (
  <>
    <PlusIcon className="absolute -top-3 -left-3" />
    <PlusIcon className="absolute -top-3 -right-3" />
    <PlusIcon className="absolute -bottom-3 -left-3" />
    <PlusIcon className="absolute -bottom-3 -right-3" />
  </>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    strokeWidth="1"
    stroke="currentColor"
    className={`text-white/40 size-6 ${className}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
  </svg>
)

export default function RuixenBentoCards() {
  return (
    <section className="bg-[#0b0b0c]">
      <div className="mx-auto container py-12 md:py-20 px-4 md:px-8 max-w-[1280px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-4">
          <PlusCard {...cardContents[0]} className="lg:col-span-3 lg:row-span-2" />
          <PlusCard {...cardContents[1]} className="lg:col-span-2 lg:row-span-2" />
          <PlusCard {...cardContents[2]} className="lg:col-span-4 lg:row-span-1" />
          <PlusCard {...cardContents[3]} className="lg:col-span-2 lg:row-span-1" />
          <PlusCard {...cardContents[4]} className="lg:col-span-2 lg:row-span-1" />
        </div>

        <div className="max-w-2xl ml-auto text-right px-4 mt-6 lg:-mt-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 font-noe-display font-light">
            Built for privacy. Designed for insight.
          </h2>
          <p className="text-white/60 dark:text-gray-400 text-lg leading-relaxed">
            Solace AI gives you the tools to understand your team's wellbeing with objective, data-driven clarity. Each feature is thoughtfully designed to be privacy-first, actionable, and accessible—so you can support your people before they need to ask.
          </p>
        </div>
      </div>
    </section>
  )
}

