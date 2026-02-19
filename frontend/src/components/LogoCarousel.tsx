"use client"
import { motion } from "motion/react"
import CircularText from "./CircularText"

const OGLogo = () => (
  <svg viewBox="0 0 120 60" width="56" height="28" fill="none">
    {/* Left circle with slash */}
    <circle cx="30" cy="30" r="26" stroke="#C9A84C" strokeWidth="7" fill="none"/>
    <line x1="14" y1="46" x2="46" y2="14" stroke="#C9A84C" strokeWidth="6" strokeLinecap="round"/>
    {/* Right G shape */}
    <path
      d="M90 8 A26 26 0 1 0 90 52 L90 34 L104 34"
      stroke="#C9A84C"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const HederaLogo = () => (
  <svg viewBox="0 0 100 100" width="44" height="44" fill="none">
    <circle cx="50" cy="50" r="48" fill="#C9A84C"/>
    {/* Left pillar */}
    <rect x="24" y="22" width="11" height="56" fill="#1A1208" rx="1"/>
    {/* Right pillar */}
    <rect x="65" y="22" width="11" height="56" fill="#1A1208" rx="1"/>
    {/* Crossbar — thin, at true center */}
    <rect x="24" y="44" width="52" height="12" fill="#1A1208" rx="1"/>
  </svg>
)

const ADILogo = () => (
  <svg viewBox="0 0 100 100" width="44" height="44" fill="none">
    <path d="M50 8 L88 42 L50 92 L12 42 Z" stroke="#C9A84C" strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M50 28 L72 54 L28 54 Z" stroke="#C9A84C" strokeWidth="4" fill="none" strokeLinejoin="round"/>
    <circle cx="50" cy="48" r="5" fill="#C9A84C"/>
  </svg>
)

const CHAINS = [
  { id: "og",     Logo: OGLogo,     name: "0G Chain",  role: "Agent Ownership",    text: "iNFT · ERC-7857 · 0G CHAIN · AGENT · ",    spinDuration: 16, onHover: "speedUp"   as const },
  { id: "hedera", Logo: HederaLogo, name: "Hedera",    role: "Agent Execution",    text: "HEDERA · OPENCLAW · HCS-10 · AGENT KIT · ", spinDuration: 20, onHover: "slowDown"  as const },
  { id: "adi",    Logo: ADILogo,    name: "ADI Chain", role: "Compliant Payments", text: "ADI CHAIN · PAYMENTS · ZKSTACK · FATF · ",  spinDuration: 24, onHover: "goBonkers" as const },
]

export default function LogoCarousel() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 64, flexWrap: "wrap" }}>
      {CHAINS.map((chain, i) => {
        const Logo = chain.Logo
        return (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
          >
            {/* Spinning ring + logo */}
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <CircularText text={chain.text} spinDuration={chain.spinDuration} onHover={chain.onHover} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72 }}>
                <Logo />
              </div>
            </div>
            <p style={{ color: "#C9A84C", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {chain.name}
            </p>
            <p style={{ color: "#9A8060", fontSize: 12 }}>
              {chain.role}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}
