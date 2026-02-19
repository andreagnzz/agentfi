"use client"
import dynamic from "next/dynamic"
import GlareHover from "@/components/GlareHover"

const CircularGallery = dynamic(() => import("@/components/CircularGallery"), { ssr: false })

const AGENT_ITEMS = [
  {
    image: "https://picsum.photos/seed/101/800/600?grayscale",
    text: "Portfolio Analyzer #0042"
  },
  {
    image: "https://picsum.photos/seed/102/800/600?grayscale",
    text: "Yield Optimizer #0043"
  },
  {
    image: "https://picsum.photos/seed/103/800/600?grayscale",
    text: "Risk Scorer #0044"
  },
]

export default function MyAgentsPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "32px 48px", position: "relative", zIndex: 1 }}>

      {/* Page title */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "monospace", fontSize: 28, color: "#F5ECD7", margin: 0, letterSpacing: "0.02em" }}>
          My Agents
        </h1>
        <p style={{ color: "#9A8060", fontSize: 14, marginTop: 8 }}>
          Your iNFT collection on 0G Chain
        </p>
      </div>

      {/* Wallet Summary bar */}
      <div style={{ background: "#241A0E", border: "1px solid #3D2E1A", borderRadius: 12, padding: 20, marginBottom: 40, display: "flex", gap: 32, alignItems: "center" }}>
        {[
          { label: "3 iNFTs Owned", color: "#F5ECD7" },
          { label: "0.031 ADI Earned Total", color: "#C9A84C" },
          { label: "0G Chain \u00B7 Testnet", color: "#9A8060" },
        ].map((stat, i) => (
          <span key={i} style={{ fontFamily: "monospace", fontSize: 13, color: stat.color, paddingRight: 32, borderRight: i < 2 ? "1px solid #3D2E1A" : "none" }}>
            {stat.label}
          </span>
        ))}
      </div>

      {/* CircularGallery — agent iNFTs */}
      <div style={{ width: "100%", height: 500, marginBottom: 48, borderRadius: 16, overflow: "hidden", border: "1px solid #3D2E1A" }}>
        <CircularGallery
          items={AGENT_ITEMS}
          bend={3}
          textColor="#C9A84C"
          borderRadius={0.05}
          font="bold 28px monospace"
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </div>

      {/* Activity timeline */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "monospace", color: "#C9A84C", fontSize: 16, marginBottom: 24, letterSpacing: "0.1em" }}>
          iNFT Activity
        </h2>
        <div style={{ position: "relative", paddingLeft: 24 }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 5, top: 0, bottom: 0, width: 1, background: "#3D2E1A" }} />
          {[
            { time: "14:32", title: "iNFT #0044 executed", detail: "Risk score computed: 7.2/10" },
            { time: "14:28", title: "Payment settled", detail: "0.005 ADI received from 0x8b...c3" },
            { time: "14:15", title: "iNFT #0043 executed", detail: "APY 12.4% found on Aave v3" },
            { time: "13:50", title: "iNFT #0042 executed", detail: "Rebalance recommendation generated" },
            { time: "13:20", title: "iNFT #0044 registered", detail: "Agent registered on Hedera via HCS-10" },
            { time: "12:00", title: "Collection minted", detail: "3 iNFTs minted on 0G Chain \u2713" },
          ].map((event, i) => (
            <div key={i} style={{ position: "relative", marginBottom: 24, paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: -20, top: 4, width: 10, height: 10, borderRadius: "50%", background: "#C9A84C" }} />
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#5C4A32" }}>{event.time}</span>
              <p style={{ color: "#F5ECD7", fontSize: 13, margin: "4px 0 2px" }}>{event.title}</p>
              <p style={{ color: "#9A8060", fontSize: 12, margin: 0 }}>{event.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hire More CTA */}
      <div style={{ background: "#2E2010", border: "1px solid #5C4422", borderRadius: 12, padding: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "monospace", color: "#F5ECD7", fontSize: 18, margin: "0 0 8px" }}>Expand your fleet</h3>
          <p style={{ color: "#9A8060", fontSize: 14, margin: 0 }}>Add specialized agents to your iNFT collection</p>
        </div>
        <GlareHover width="200px" height="44px" background="#241A0E" borderRadius="8px" borderColor="#5C4422" glareColor="#C9A84C" glareOpacity={0.25} transitionDuration={600}>
          <a href="/marketplace" style={{ color: "#C9A84C", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", textDecoration: "none", letterSpacing: "0.1em" }}>
            Browse Marketplace {"\u2192"}
          </a>
        </GlareHover>
      </div>

    </main>
  )
}
