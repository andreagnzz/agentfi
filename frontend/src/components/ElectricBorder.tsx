"use client"

import React, { useRef, useEffect, useCallback } from "react"
import "./ElectricBorder.css"

interface ElectricBorderProps extends React.PropsWithChildren {
  color?: string
  speed?: number
  chaos?: number
  borderRadius?: number
  style?: React.CSSProperties
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(201,168,76,${alpha})`
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`
}

const ElectricBorder: React.FC<ElectricBorderProps> = ({
  children,
  color = "#C9A84C",
  speed = 1,
  chaos = 0.05,
  borderRadius = 8,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const pad = 20
    const w = rect.width + pad * 2
    const h = rect.height + pad * 2
    const dpr = window.devicePixelRatio || 1

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const ox = pad
    const oy = pad
    const bw = rect.width
    const bh = rect.height
    const r = Math.min(borderRadius, bw / 2, bh / 2)

    // Generate points along the rounded rectangle border
    const points: [number, number][] = []
    const seg = 30

    // Top edge
    for (let i = 0; i <= seg; i++) {
      points.push([ox + r + (i / seg) * (bw - 2 * r), oy])
    }
    // Top-right corner
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2)
      points.push([ox + bw - r + Math.cos(a) * r, oy + r + Math.sin(a) * r])
    }
    // Right edge
    for (let i = 0; i <= seg; i++) {
      points.push([ox + bw, oy + r + (i / seg) * (bh - 2 * r)])
    }
    // Bottom-right corner
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2)
      points.push([ox + bw - r + Math.cos(a) * r, oy + bh - r + Math.sin(a) * r])
    }
    // Bottom edge
    for (let i = 0; i <= seg; i++) {
      points.push([ox + bw - r - (i / seg) * (bw - 2 * r), oy + bh])
    }
    // Bottom-left corner
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI / 2 + (i / 8) * (Math.PI / 2)
      points.push([ox + r + Math.cos(a) * r, oy + bh - r + Math.sin(a) * r])
    }
    // Left edge
    for (let i = 0; i <= seg; i++) {
      points.push([ox, oy + bh - r - (i / seg) * (bh - 2 * r)])
    }
    // Top-left corner
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI + (i / 8) * (Math.PI / 2)
      points.push([ox + r + Math.cos(a) * r, oy + r + Math.sin(a) * r])
    }

    const time = Date.now() * 0.001 * speed

    const drawArc = (offset: number, alpha: number, lineWidth: number) => {
      ctx.beginPath()
      ctx.strokeStyle = hexToRgba(color, alpha)
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      for (let i = 0; i < points.length; i++) {
        const [px, py] = points[i]
        const noise =
          Math.sin(time * 3 + i * 0.5 + offset) * chaos * 30 +
          Math.cos(time * 5 + i * 0.7 + offset) * chaos * 15
        const nx = px + noise * (Math.sin(i * 0.3 + time) > 0 ? 1 : -1)
        const ny = py + noise * (Math.cos(i * 0.4 + time) > 0 ? 1 : -1)
        if (i === 0) ctx.moveTo(nx, ny)
        else ctx.lineTo(nx, ny)
      }
      ctx.closePath()
      ctx.stroke()
    }

    drawArc(0, 0.6, 1.5)
    drawArc(2, 0.3, 3)
    drawArc(4, 0.15, 5)

    animRef.current = requestAnimationFrame(draw)
  }, [color, speed, chaos, borderRadius])

  useEffect(() => {
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <div
      ref={containerRef}
      className="electric-border"
      style={{ ...style, "--electric-border-color": color } as React.CSSProperties}
    >
      <div className="eb-canvas-container">
        <canvas ref={canvasRef} className="eb-canvas" />
      </div>
      <div className="eb-layers">
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-background-glow" />
      </div>
      <div className="eb-content">
        {children}
      </div>
    </div>
  )
}

export default ElectricBorder
