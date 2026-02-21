"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Space_Mono, DM_Sans } from "next/font/google"
import PixelTransition from "@/components/PixelTransition"
import GlareHover from "@/components/GlareHover"
import { Button } from "@/components/ui/button"

const LogoCarousel = dynamic(() => import("@/components/LogoCarousel"), { ssr: false })
const CurvedLoop = dynamic(() => import("@/components/CurvedLoop"), { ssr: false })

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] })
const dmSans = DM_Sans({ subsets: ["latin"] })

const LINES = [
  { text: "AgentFi v1.0.0", color: "#C9A84C" },
  { text: "Initializing multi-chain runtime...", color: "#9A8060" },
  { text: "Connecting to ADI Chain... ✓", color: "#7A9E6E" },
  { text: "Connecting to 0G Chain... ✓", color: "#7A9E6E" },
  { text: "Connecting to Hedera testnet... ✓", color: "#7A9E6E" },
  { text: "Loading agent registry... ✓", color: "#7A9E6E" },
  { text: "─────────────────────────────", color: "#3D2E1A" },
  { text: "3 agents available", color: "#F5ECD7" },
  { text: "Agent: Portfolio Analyzer", color: "#F5ECD7" },
  { text: 'Query: "Analyze my DeFi positions"', color: "#9A8060" },
  { text: "Routing to Hedera Agent Kit...", color: "#9A8060" },
  { text: "HCS-10 topic created: 0.0.5284631", color: "#818CF8" },
  { text: "Running analysis...", color: "#9A8060" },
  { text: "─────────────────────────────", color: "#3D2E1A" },
  { text: "RESULT: High ETH concentration (72%)", color: "#F5ECD7" },
  { text: "Risk Score: 7.2/10 — volatile", color: "#C47A5A" },
  { text: "Recommendation: Rebalance portfolio →", color: "#F5ECD7" },
  { text: "Spawning yield_optimizer agent...", color: "#9A8060" },
  { text: "Scanning Aave v3, Compound, Lido...", color: "#9A8060" },
  { text: "Best APY found: 12.4% (Aave v3 USDC)", color: "#7A9E6E" },
  { text: "─────────────────────────────", color: "#3D2E1A" },
  { text: "KYC check on ADI Chain... ✓ verified", color: "#7A9E6E" },
  { text: "Payment: 0.01 ADI → settled ✓", color: "#7A9E6E" },
  { text: "FATF Travel Rule: compliant ✓", color: "#7A9E6E" },
  { text: "Minting iNFT on 0G Chain...", color: "#9A8060" },
  { text: "iNFT #0042 minted (ERC-7857) ✓", color: "#C9A84C" },
  { text: "Session complete. Agent ready.", color: "#C9A84C" },
]

export default function HomePage() {
  const [displayedLines, setDisplayedLines] = useState<{ text: string; color: string }[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentLine >= LINES.length) return

    const line = LINES[currentLine]

    if (currentChar < line.text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + line.text[currentChar])
        setCurrentChar(prev => prev + 1)
      }, 22)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev, { text: line.text, color: line.color }])
        setCurrentText("")
        setCurrentChar(0)
        setCurrentLine(prev => prev + 1)
      }, 60)
      return () => clearTimeout(timeout)
    }
  }, [currentLine, currentChar])

  // Auto-scroll terminal as content grows
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [displayedLines, currentText])

  // Dynamic terminal height — grows with content, no cap
  const visibleLines = displayedLines.length + (currentLine < LINES.length ? 1 : 0)
  const lineH = 21.6 // 12px font * 1.8 line-height
  const dynamicContentH = Math.max(120, visibleLines * lineH + 48 + 32)

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --bg-base: #1A1208;
              --bg-surface: #241A0E;
              --bg-surface-hover: #2E2010;
              --border: #3D2E1A;
              --border-bright: #5C4422;
              --gold: #C9A84C;
              --gold-light: #E8C97A;
              --gold-dim: #8A6E2E;
              --text-primary: #F5ECD7;
              --text-secondary: #9A8060;
              --text-muted: #5C4A32;
              --green-muted: #7A9E6E;
              --terracotta: #C47A5A;
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(24px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
            @keyframes scanline {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100vh); }
            }
            @keyframes glow {
              0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.15); }
              50% { box-shadow: 0 0 40px rgba(201,168,76,0.3); }
            }
            .fade-in-up {
              opacity: 0;
              animation: fadeInUp 0.7s ease-out forwards;
            }
            .glow-card {
              animation: glow 3s ease-in-out infinite;
            }
            .grid-bg {
              background-image:
                repeating-linear-gradient(0deg, rgba(201,168,76,0.04) 0px, rgba(201,168,76,0.04) 1px, transparent 1px, transparent 60px),
                repeating-linear-gradient(90deg, rgba(201,168,76,0.04) 0px, rgba(201,168,76,0.04) 1px, transparent 1px, transparent 60px);
            }
            .scanline-overlay::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent);
              animation: scanline 8s linear infinite;
              pointer-events: none;
            }
            .cta-secondary { transition: all 0.2s; }
            .cta-secondary:hover { background: rgba(201,168,76,0.1); }
          `,
        }}
      />

      <main className={`${dmSans.className} relative min-h-screen`}>

        {/* ── Section 1: Hero ── */}
        <section className="relative mx-auto max-w-7xl px-6" style={{ paddingTop: "100px", paddingBottom: "80px", minHeight: "100vh" }}>
          <div className="grid w-full gap-12 lg:grid-cols-5">
            {/* Left */}
            <div className="flex flex-col justify-center lg:col-span-3">
              <h1
                className={`${spaceMono.className} fade-in-up mb-6 text-4xl font-bold leading-tight lg:text-5xl xl:text-6xl`}
                style={{ animationDelay: "100ms", color: "var(--text-primary)", letterSpacing: "0.02em" }}
              >
                The Banking System
                <br />
                For Autonomous
                <br />
                <span style={{ color: "var(--gold)" }}>AI Agents</span>
              </h1>

              <p
                className="fade-in-up mb-8 max-w-lg text-lg leading-relaxed"
                style={{ animationDelay: "200ms", color: "var(--text-secondary)" }}
              >
                Hire specialized AI agents. Pay on ADI Chain.
                <br />
                Own them as iNFTs on 0G Chain. Built for the agentic economy.
              </p>

              <div
                className="fade-in-up mb-8 flex gap-4"
                style={{ animationDelay: "300ms" }}
              >
                <PixelTransition
                  gridSize={8}
                  pixelColor="#C9A84C"
                  animationStepDuration={0.25}
                  aspectRatio="0%"
                  style={{ width: 180, height: 44, borderRadius: 8, overflow: "hidden" }}
                  firstContent={
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Button
                        style={{ width: "100%", height: "100%", background: "#C9A84C", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.1em", borderRadius: 8, border: "none", cursor: "pointer" }}
                        onClick={() => window.location.href = "/marketplace"}
                      >
                        Enter Marketplace
                      </Button>
                    </div>
                  }
                  secondContent={
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Button
                        style={{ width: "100%", height: "100%", background: "#E8C97A", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.1em", borderRadius: 8, border: "none", cursor: "pointer" }}
                        onClick={() => window.location.href = "/marketplace"}
                      >
                        Enter Marketplace
                      </Button>
                    </div>
                  }
                />
                <GlareHover
                  width="180px"
                  height="44px"
                  background="#241A0E"
                  borderRadius="8px"
                  borderColor="#5C4422"
                  glareColor="#C9A84C"
                  glareOpacity={0.25}
                  glareAngle={-45}
                  glareSize={250}
                  transitionDuration={600}
                >
                  <Button
                    style={{ width: "100%", height: "100%", background: "transparent", color: "#C9A84C", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.1em", border: "none", cursor: "pointer" }}
                    onClick={() => window.location.href = "/dashboard"}
                  >
                    View Dashboard
                  </Button>
                </GlareHover>
              </div>

              {/* LogoCarousel — below CTA */}
              <div className="fade-in-up mb-6" style={{ animationDelay: "400ms" }}>
                <LogoCarousel />
              </div>

              {/* Single big info marquee */}
              <div style={{ width: "100%", overflow: "hidden" }}>
                <CurvedLoop
                  marqueeText="✦ ETHDenver 2026 ✦ AI Agent Marketplace ✦ Multi-Chain DeFAI ✦ iNFT ERC-7857 ✦ ADI Compliance ✦ Hedera Agents ✦ "
                  speed={0.4}
                  curveAmount={60}
                  direction="left"
                  className="curved-text-gold"
                  fontSize={24}
                />
              </div>
            </div>

            {/* Right — Terminal */}
            <div className="flex items-start lg:col-span-2" style={{ paddingTop: 24 }}>
              <div
                className="glow-card w-full overflow-hidden rounded-xl backdrop-blur"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-bright)" }}
              >
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-bright)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28CA41" }} />
                  <span className={`${spaceMono.className} ml-2 text-xs`} style={{ color: "var(--text-muted)" }}>
                    agentfi-terminal
                  </span>
                </div>
                {/* Terminal content — dynamic height, no maxHeight constraint */}
                <div
                  ref={terminalRef}
                  className="p-5"
                  style={{
                    height: dynamicContentH,
                    overflowY: "auto",
                    transition: "height 0.15s ease-out",
                  }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 2 }}>
                    {displayedLines.map((line, i) => (
                      <div key={i} style={{ color: line.color }}>{line.text}</div>
                    ))}
                    {currentLine < LINES.length && (
                      <div style={{ color: LINES[currentLine].color }}>
                        {currentText}<span style={{ animation: "blink 1s infinite", color: "#C9A84C" }}>▋</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
