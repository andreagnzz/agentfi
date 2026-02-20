"use client"

import React, { useRef, useEffect, useState } from "react"

interface BlurTextProps {
  text: string
  animateBy?: "words" | "characters"
  direction?: "top" | "bottom" | "left" | "right"
  delay?: number
  stepDuration?: number
  className?: string
  style?: React.CSSProperties
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  animateBy = "words",
  direction = "bottom",
  delay = 100,
  stepDuration = 0.4,
  className = "",
  style,
}) => {
  const containerRef = useRef<HTMLParagraphElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const units = animateBy === "words" ? text.split(" ") : text.split("")

  const getTransform = () => {
    switch (direction) {
      case "top":
        return "translateY(-20px)"
      case "bottom":
        return "translateY(20px)"
      case "left":
        return "translateX(-20px)"
      case "right":
        return "translateX(20px)"
      default:
        return "translateY(20px)"
    }
  }

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        ...style,
        margin: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: animateBy === "words" ? "0.3em" : 0,
      }}
    >
      {units.map((unit, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: isVisible ? 1 : 0,
            filter: isVisible ? "blur(0px)" : "blur(8px)",
            transform: isVisible ? "translateY(0) translateX(0)" : getTransform(),
            transition: `opacity ${stepDuration}s ease, filter ${stepDuration}s ease, transform ${stepDuration}s ease`,
            transitionDelay: `${i * delay}ms`,
          }}
        >
          {unit}
        </span>
      ))}
    </p>
  )
}

export default BlurText
