"use client"

import React, { useRef, useCallback } from "react"
import "./SpotlightCard.css"

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string
  style?: React.CSSProperties
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  style,
  spotlightColor = "rgba(201, 168, 76, 0.12)",
}) => {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = divRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    el.style.setProperty("--mouse-x", `${x}%`)
    el.style.setProperty("--mouse-y", `${y}%`)
    el.style.setProperty("--spotlight-color", spotlightColor)
  }, [spotlightColor])

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export default SpotlightCard
