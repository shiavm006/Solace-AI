"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SecondsMode = "smooth" | "tick1" | "tick2" | "highFreq"

interface ClockProps {
  initialTime?: Date
  timeZone?: string
  initialSecondsMode?: SecondsMode
}

export function Clock({
  initialTime = new Date(),
  timeZone = "Asia/Calcutta",
  initialSecondsMode = "smooth",
}: ClockProps) {
  const [time, setTime] = useState(initialTime)
  const [secondsMode] = useState<SecondsMode>(initialSecondsMode)

  const hourHandRef = useRef<HTMLDivElement>(null)
  const minuteHandRef = useRef<HTMLDivElement>(null)
  const secondHandContainerRef = useRef<HTMLDivElement>(null)
  const secondHandShadowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log(
      "Clock component mounted. Initial secondsMode prop:",
      initialSecondsMode
    )
    console.log("Clock component state secondsMode:", secondsMode)
  }, [initialSecondsMode, secondsMode])

  useEffect(() => {
    console.log(
      "Clock component mounted. Initial secondsMode prop:",
      initialSecondsMode
    )
    console.log("Clock component state secondsMode:", secondsMode)
  }, [initialSecondsMode, secondsMode])

  const updateClockHands = useCallback(() => {
    const now = new Date()
    const displayTime = new Date(
      now.toLocaleString("en-US", {
        timeZone: timeZone,
      })
    )
    setTime(displayTime)

    const hours = displayTime.getHours() % 12
    const minutes = displayTime.getMinutes()
    const seconds = displayTime.getSeconds()
    const milliseconds = displayTime.getMilliseconds()

    const hoursDegrees = hours * 30 + (minutes / 60) * 30
    const minutesDegrees = minutes * 6 + (seconds / 60) * 0.1

    if (hourHandRef.current) {
      hourHandRef.current.style.transform = `rotate(${hoursDegrees}deg)`
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.style.transform = `rotate(${minutesDegrees}deg)`
    }

    let currentSecondsAngle = 0
    console.log(
      "--- updateClockHands called. Current secondsMode:",
      secondsMode
    )

    switch (secondsMode) {
      case "tick1": // Tick every second (60 ticks per minute)
        currentSecondsAngle = seconds * 6
        console.log(
          `Mode: Tick1, Seconds: ${seconds}, Calculated Angle: ${currentSecondsAngle}deg`
        )
        break
      case "tick2": // Half-second ticks (120 ticks per minute)
        currentSecondsAngle =
          Math.floor((seconds * 1000 + milliseconds) / 500) * 3
        console.log(
          `Mode: Tick2, Seconds: ${seconds}, Milliseconds: ${milliseconds}, Calculated Angle: ${currentSecondsAngle}deg`
        )
        break
      case "highFreq": // High-frequency sweep (8 ticks per second)
        currentSecondsAngle = ((seconds * 1000 + milliseconds) / 125) * 0.75
        console.log(
          `Mode: HighFreq, Seconds: ${seconds}, Milliseconds: ${milliseconds}, Calculated Angle: ${currentSecondsAngle}deg`
        )
        break
      case "smooth": // Smooth movement over 60 seconds
      default:
        currentSecondsAngle = seconds * 6 + (milliseconds / 1000) * 6
        console.log(
          `Mode: Smooth, Seconds: ${seconds}, Milliseconds: ${milliseconds}, Calculated Angle: ${currentSecondsAngle}deg`
        )
        break
    }

    const secondHandTransform = `rotate(${currentSecondsAngle}deg)`
    if (secondHandContainerRef.current) {
      secondHandContainerRef.current.style.transform = secondHandTransform
      console.log(`Applied transform to second hand: ${secondHandTransform}`)
    } else {
      console.warn(
        "secondHandContainerRef.current is null, cannot apply transform."
      )
    }

    if (secondHandShadowRef.current) {
      secondHandShadowRef.current.style.transform = `rotate(${currentSecondsAngle + 0.5}deg)`
    }
  }, [secondsMode, timeZone])

  useEffect(() => {
    updateClockHands()

    const minuteInterval = setInterval(() => {
      updateClockHands()
    }, 60000)

    let animationFrameId: number
    const animateSeconds = () => {
      updateClockHands()
      animationFrameId = requestAnimationFrame(animateSeconds)
    }
    animateSeconds()

    return () => {
      clearInterval(minuteInterval)
      cancelAnimationFrame(animationFrameId)
    }
  }, [updateClockHands])

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const dateDisplay = `${months[time.getMonth()]} ${time.getDate()}`

  const hourMarks = []
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) {
      const hourIndex = i / 5
      const angle = (i * 6 * Math.PI) / 180
      const radius = 145
      const left = 175 + Math.sin(angle) * radius - 15
      const top = 175 - Math.cos(angle) * radius - 10
      hourMarks.push(
        <div
          key={`num-${i}`}
          className="pointer-events-none absolute h-[20px] w-[30px] text-center leading-[20px] select-none"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            fontSize: "16px",
            fontWeight: 400, 
            textShadow: "0 1px 1px rgba(255, 255, 255, 0.2)",
            zIndex: 15,  
          }}
        >
          {hourIndex === 0 ? "12" : hourIndex.toString()}
        </div>
      )
    } else {
      hourMarks.push(
        <div
          key={`mark-${i}`}
          className="absolute top-[10px] left-[175px] h-[10px] w-[1px] shadow-[0_0_2px_rgba(255,255,255,0.02)]"
          style={{
            backgroundColor: "rgba(80, 80, 80, 0.5)",
            transformOrigin: "center 165px",
            transform: `rotate(${i * 6}deg)`,
            opacity: 1,
          }}
        />
      )
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative z-10 mt-5 flex h-[350px] w-[350px] items-center justify-center">
        <div className="transform-style-preserve-3d group pointer-events-none relative z-10 rounded-full bg-transparent transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform backface-hidden perspective-[1000px]">
          <div
            className="transform-style-preserve-3d will-change-transform-box-shadow pointer-events-auto relative z-20 h-[350px] w-[350px] cursor-pointer overflow-hidden rounded-full bg-[rgba(255,255,255,0.03)] shadow-[inset_0_0.4em_0.4em_rgba(0,0,0,0.1),inset_0_-0.4em_0.4em_rgba(255,255,255,0.5)] backdrop-blur-[1px] transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] select-none backface-hidden"
            style={{
              backgroundImage:
                "linear-gradient(-75deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))",
              boxShadow: `inset 0 0.4em 0.4em rgba(0, 0, 0, 0.1), inset 0 -0.4em 0.4em rgba(255, 255, 255, 0.2), 10px 5px 10px rgba(0, 0, 0, 0.1), 10px 20px 20px rgba(0, 0, 0, 0.02), 10px 55px 50px rgba(0, 0, 0, 0.02)`,
            }}
          >
            <div className="border-foreground pointer-events-none absolute top-0 left-0 z-10 h-[350px] w-[350px] rounded-full border opacity-60 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />

            <div className="border-foreground pointer-events-none absolute top-[-3px] left-[-3px] z-10 h-[356px] w-[356px] rounded-full border opacity-60 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />

            <div
              className="pointer-events-none absolute top-0 left-0 z-10 h-[350px] w-[350px] rounded-full shadow-[inset_-5px_5px_15px_rgba(0,0,0,0.3),inset_-8px_8px_20px_rgba(0,0,0,0.2)]"
              style={{ opacity: 0.15 }}
            />
            <div className="pointer-events-none absolute top-0 left-0 z-10 h-[175px] w-[350px] rounded-t-[175px] mix-blend-soft-light blur-md" />

            <div className="pointer-events-none absolute top-[10px] left-[10px] z-20 h-[330px] w-[330px] rounded-full mix-blend-overlay blur-md" />
            <div className="absolute top-0 left-0 z-10 h-full w-full">
              {hourMarks}
            </div>
            <div
              ref={hourHandRef}
              className="absolute bottom-[175px] left-[175px] z-20 ml-[-3px] h-[70px] w-[6px] rounded-[3px] shadow-[0_0_5px_rgba(220,38,38,0.5)] will-change-transform"
              style={{
                transformOrigin: "center bottom",
                backgroundColor: "rgba(220, 38, 38, 0.9)",
              }}
            />
            <div
              ref={minuteHandRef}
              className="absolute bottom-[175px] left-[175px] z-20 ml-[-2px] h-[100px] w-[4px] rounded-[2px] shadow-[0_0_5px_rgba(220,38,38,0.5)] will-change-transform"
              style={{
                transformOrigin: "center bottom",
                backgroundColor: "rgba(220, 38, 38, 0.9)",
              }}
            />
            <div
              ref={secondHandContainerRef}
              className="absolute top-[55px] left-[174px] z-20 h-[120px] w-[2px] will-change-transform"
              style={{ transformOrigin: "1px 120px" }}
            >
              <div
                className={`absolute bottom-0 left-0 h-[120px] w-[2px] shadow-[0_0_5px_rgba(234,179,8,0.5)]`}
                style={{ backgroundColor: "rgba(234, 179, 8, 1)" }}
              />
              <div
                className={`absolute bottom-[-14px] left-[-2px] h-[14px] w-[6px] rounded-b-[4px] shadow-[0_0_5px_rgba(234,179,8,0.5)]`}
                style={{ backgroundColor: "rgba(234, 179, 8, 1)" }}
              />
            </div>

            <div
              className="pointer-events-none absolute top-[157px] left-[157px] z-20 h-[36px] w-[36px] rounded-full backdrop-blur-[2px]"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.35)",
                boxShadow:
                  "0 0 20px rgba(255, 255, 255, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.6)",
              }}
            />
            <div className="text-primary/60 pointer-events-none absolute bottom-[115px] left-[105px] z-10 h-auto w-[140px] text-center text-xs leading-none font-semibold select-none">
              {dateDisplay}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

