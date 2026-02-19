"use client"
import { useState } from "react"
import GlareHover from "@/components/GlareHover"
import PixelTransition from "@/components/PixelTransition"
import BlurText from "@/components/BlurText"
import {
  ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem,
  ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub,
  ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger,
} from "@/components/ui/context-menu"

type Step = 1 | 2 | 3

const CAPABILITIES = [
  { id: "defi", label: "DeFi Analysis", description: "Portfolio scanning & rebalancing" },
  { id: "yield", label: "Yield Optimization", description: "APY scanning across protocols" },
  { id: "risk", label: "Risk Scoring", description: "Real-time risk assessment" },
  { id: "arbitrage", label: "Arbitrage", description: "Cross-chain opportunity detection" },
  { id: "compliance", label: "Compliance", description: "FATF Travel Rule monitoring" },
  { id: "liquidity", label: "Liquidity Management", description: "LP position automation" },
]

const CHAINS = [
  { id: "0g", label: "0G Chain", description: "iNFT ownership & state", color: "#C9A84C" },
  { id: "hedera", label: "Hedera", description: "Agent execution via HCS-10", color: "#7A9E6E" },
  { id: "adi", label: "ADI Chain", description: "Compliant payments", color: "#9A8060" },
]

const MODELS = ["gpt-4o-mini", "gpt-4o", "claude-3-haiku", "claude-3-sonnet"]

const PROMPT_TEMPLATES = [
  { label: "DeFi Analyzer", prompt: "You are a DeFi portfolio analyzer. Analyze the user's wallet positions, identify concentration risks, and suggest rebalancing strategies based on current market conditions." },
  { label: "Yield Hunter", prompt: "You are a yield optimization agent. Scan DeFi protocols to find the highest APY opportunities for the user's assets, accounting for risk and gas costs." },
  { label: "Risk Monitor", prompt: "You are a risk scoring agent. Monitor DeFi positions in real-time, compute risk scores from 1-10, and send alerts when thresholds are breached." },
  { label: "Arbitrage Bot", prompt: "You are a cross-chain arbitrage agent. Identify price discrepancies across 0G, ADI Chain, and EVM networks and flag profitable opportunities." },
]

const inputStyle: React.CSSProperties = {
  background: "#1A1208",
  border: "1px solid #3D2E1A",
  borderRadius: 8,
  padding: "10px 16px",
  color: "#F5ECD7",
  fontFamily: "monospace",
  fontSize: 13,
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
}

const labelStyle: React.CSSProperties = {
  color: "#5C4A32",
  fontFamily: "monospace",
  fontSize: 10,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  marginBottom: 8,
  display: "block",
}

const cardStyle: React.CSSProperties = {
  background: "#241A0E",
  border: "1px solid #3D2E1A",
  borderRadius: 12,
  padding: 24,
}

export default function AgentCreationPage() {
  const [mode, setMode] = useState<"template" | "custom">("template")
  const [customPrompt, setCustomPrompt] = useState("")
  const [customName, setCustomName] = useState("")
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({
    name: "",
    description: "",
    model: "gpt-4o-mini",
    pricePerQuery: "0.01",
    capabilities: [] as string[],
    chains: [] as string[],
    mintAsNFT: true,
    systemPrompt: "",
  })

  const updateForm = (key: string, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleCapability = (id: string) =>
    updateForm("capabilities", form.capabilities.includes(id)
      ? form.capabilities.filter(c => c !== id)
      : [...form.capabilities, id])

  const toggleChain = (id: string) =>
    updateForm("chains", form.chains.includes(id)
      ? form.chains.filter(c => c !== id)
      : [...form.chains, id])

  const stepTitles = ["Agent Identity", "Capabilities & Chain", "Review & Deploy"]

  return (
    <main style={{ minHeight: "100vh", padding: "32px 48px", position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>

      {/* Title */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ color: "#F5ECD7", fontFamily: "monospace", fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
          <BlurText text="Agent Creation" animateBy="words" direction="bottom" delay={100} stepDuration={0.4} />
        </div>
        <p style={{ color: "#9A8060", fontSize: 14, margin: 0 }}>Deploy a new autonomous AI agent as an iNFT</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 2, background: "#1A1208", border: "1px solid #3D2E1A", borderRadius: 10, padding: 4, marginBottom: 32, width: "fit-content" }}>
        {(["template", "custom"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "monospace", fontSize: 12, fontWeight: "bold", letterSpacing: "0.08em",
            background: mode === m ? "#C9A84C" : "transparent",
            color: mode === m ? "#1A1208" : "#5C4A32",
            transition: "all 0.2s",
            textTransform: "uppercase",
          }}>
            {m === "template" ? "\u2B21 Template" : "\u2726 Custom Prompt"}
          </button>
        ))}
      </div>

      {/* Custom mode */}
      {mode === "custom" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "monospace", color: "#C9A84C", fontSize: 14, margin: "0 0 6px", letterSpacing: "0.1em" }}>CUSTOM AGENT</h2>
            <p style={{ color: "#9A8060", fontSize: 12, margin: "0 0 20px" }}>Right-click the prompt area for quick actions and templates</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Agent Name</label>
                <input
                  style={inputStyle}
                  placeholder="My Custom Agent"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e => (e.target.style.borderColor = "#3D2E1A")}
                />
              </div>

              <div>
                <label style={labelStyle}>Agent Prompt</label>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <textarea
                      style={{
                        ...inputStyle,
                        height: 240,
                        resize: "vertical",
                        lineHeight: 1.7,
                        borderStyle: customPrompt ? "solid" : "dashed",
                      }}
                      placeholder={"Describe your agent's behavior, goals, and capabilities...\n\nRight-click for templates and quick actions."}
                      value={customPrompt}
                      onChange={e => setCustomPrompt(e.target.value)}
                      onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                      onBlur={e => (e.target.style.borderColor = "#3D2E1A")}
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuGroup>
                      <ContextMenuLabel>Quick Actions</ContextMenuLabel>
                      <ContextMenuItem onClick={() => setCustomPrompt("")}>
                        Clear Prompt
                        <ContextMenuShortcut>{"\u2318"}K</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => setCustomPrompt(prev => prev.trim() + "\n\nAlways respond in JSON format.")}>
                        Append JSON output
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => setCustomPrompt(prev => prev.trim() + "\n\nKeep responses concise and actionable.")}>
                        Append concise style
                      </ContextMenuItem>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuGroup>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>Use Template</ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                          <ContextMenuGroup>
                            {PROMPT_TEMPLATES.map(t => (
                              <ContextMenuItem key={t.label} onClick={() => setCustomPrompt(t.prompt)}>
                                {t.label}
                              </ContextMenuItem>
                            ))}
                          </ContextMenuGroup>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuGroup>
                      <ContextMenuItem onClick={() => navigator.clipboard?.writeText(customPrompt)}>
                        Copy Prompt
                        <ContextMenuShortcut>{"\u2318"}C</ContextMenuShortcut>
                      </ContextMenuItem>
                    </ContextMenuGroup>
                  </ContextMenuContent>
                </ContextMenu>
                <p style={{ color: "#5C4A32", fontFamily: "monospace", fontSize: 10, margin: "8px 0 0", letterSpacing: "0.08em" }}>
                  {customPrompt.length} chars {"\u00B7"} right-click for templates
                </p>
              </div>
            </div>
          </div>

          {/* Deploy button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <PixelTransition
              gridSize={7} pixelColor="#C9A84C" animationStepDuration={0.2} aspectRatio="0%"
              style={{ width: 200, height: 44, borderRadius: 8, overflow: "hidden" }}
              firstContent={<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#C9A84C", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.08em", cursor: "pointer" }}>{"\u26A1"} Deploy Custom Agent</div>}
              secondContent={<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#E8C97A", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.08em", cursor: "pointer" }}>{"\u26A1"} Deploy Custom Agent</div>}
            />
          </div>
        </div>
      )}

      {/* Template mode — Step indicator */}
      {mode === "template" && <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: s < 3 ? 1 : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => s < step && setStep(s)}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: step === s ? "#C9A84C" : step > s ? "#5C4422" : "#1A1208",
                border: `1px solid ${step >= s ? "#C9A84C" : "#3D2E1A"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "monospace", fontSize: 12, fontWeight: "bold",
                color: step === s ? "#1A1208" : step > s ? "#C9A84C" : "#5C4A32",
                flexShrink: 0,
                transition: "all 0.3s",
              }}>
                {step > s ? "\u2713" : s}
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: step >= s ? "#C9A84C" : "#5C4A32", whiteSpace: "nowrap" }}>
                {stepTitles[i]}
              </span>
            </div>
            {s < 3 && <div style={{ flex: 1, height: 1, background: step > s ? "#C9A84C" : "#3D2E1A", margin: "0 16px", transition: "background 0.3s" }} />}
          </div>
        ))}
      </div>}

      {/* Step 1 — Agent Identity */}
      {mode === "template" && step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "monospace", color: "#C9A84C", fontSize: 14, margin: "0 0 20px", letterSpacing: "0.1em" }}>
              AGENT IDENTITY
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Agent Name</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Portfolio Analyzer"
                  value={form.name}
                  onChange={e => updateForm("name", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e => (e.target.style.borderColor = "#3D2E1A")}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, height: 80, resize: "vertical" }}
                  placeholder="What does this agent do?"
                  value={form.description}
                  onChange={e => updateForm("description", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e => (e.target.style.borderColor = "#3D2E1A")}
                />
              </div>

              <div>
                <label style={labelStyle}>System Prompt</label>
                <textarea
                  style={{ ...inputStyle, height: 120, resize: "vertical" }}
                  placeholder="Define the agent's behavior and instructions..."
                  value={form.systemPrompt}
                  onChange={e => updateForm("systemPrompt", e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={e => (e.target.style.borderColor = "#3D2E1A")}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>AI Model</label>
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.model}
                    onChange={e => updateForm("model", e.target.value)}
                  >
                    {MODELS.map(m => <option key={m} value={m} style={{ background: "#1A1208" }}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Price per Query (ADI)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.01"
                    value={form.pricePerQuery}
                    onChange={e => updateForm("pricePerQuery", e.target.value)}
                    onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={e => (e.target.style.borderColor = "#3D2E1A")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mint as iNFT toggle */}
          <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#F5ECD7", fontFamily: "monospace", fontSize: 14, margin: "0 0 4px" }}>Mint as iNFT</p>
              <p style={{ color: "#9A8060", fontSize: 12, margin: 0 }}>Deploy agent as ERC-7857 on 0G Chain {"\u2014"} transferable ownership</p>
            </div>
            <div
              onClick={() => updateForm("mintAsNFT", !form.mintAsNFT)}
              style={{
                width: 48, height: 26, borderRadius: 13,
                background: form.mintAsNFT ? "#C9A84C" : "#241A0E",
                border: `1px solid ${form.mintAsNFT ? "#C9A84C" : "#3D2E1A"}`,
                cursor: "pointer", position: "relative", transition: "all 0.3s", flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute", top: 3,
                left: form.mintAsNFT ? 24 : 3,
                width: 18, height: 18, borderRadius: "50%",
                background: form.mintAsNFT ? "#1A1208" : "#5C4A32",
                transition: "left 0.3s",
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Capabilities & Chain */}
      {mode === "template" && step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "monospace", color: "#C9A84C", fontSize: 14, margin: "0 0 20px", letterSpacing: "0.1em" }}>
              CAPABILITIES
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {CAPABILITIES.map(cap => {
                const selected = form.capabilities.includes(cap.id)
                return (
                  <div
                    key={cap.id}
                    onClick={() => toggleCapability(cap.id)}
                    style={{
                      padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                      background: selected ? "rgba(201,168,76,0.08)" : "#1A1208",
                      border: `1px solid ${selected ? "#C9A84C" : "#3D2E1A"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ color: selected ? "#C9A84C" : "#F5ECD7", fontFamily: "monospace", fontSize: 13, margin: "0 0 4px", fontWeight: "bold" }}>
                        {cap.label}
                      </p>
                      {selected && <span style={{ color: "#C9A84C", fontSize: 14 }}>{"\u2713"}</span>}
                    </div>
                    <p style={{ color: "#9A8060", fontSize: 11, margin: 0 }}>{cap.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontFamily: "monospace", color: "#C9A84C", fontSize: 14, margin: "0 0 20px", letterSpacing: "0.1em" }}>
              CHAINS
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CHAINS.map(chain => {
                const selected = form.chains.includes(chain.id)
                return (
                  <div
                    key={chain.id}
                    onClick={() => toggleChain(chain.id)}
                    style={{
                      padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                      background: selected ? "rgba(201,168,76,0.06)" : "#1A1208",
                      border: `1px solid ${selected ? chain.color : "#3D2E1A"}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: chain.color }} />
                      <div>
                        <p style={{ color: "#F5ECD7", fontFamily: "monospace", fontSize: 13, margin: "0 0 2px", fontWeight: "bold" }}>{chain.label}</p>
                        <p style={{ color: "#9A8060", fontSize: 11, margin: 0 }}>{chain.description}</p>
                      </div>
                    </div>
                    {selected && <span style={{ color: chain.color, fontSize: 14 }}>{"\u2713"}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Review & Deploy */}
      {mode === "template" && step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "monospace", color: "#C9A84C", fontSize: 14, margin: "0 0 20px", letterSpacing: "0.1em" }}>
              REVIEW
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "AGENT NAME", value: form.name || "\u2014" },
                { label: "MODEL", value: form.model },
                { label: "PRICE PER QUERY", value: `${form.pricePerQuery} ADI` },
                { label: "CAPABILITIES", value: form.capabilities.length > 0 ? form.capabilities.join(", ") : "None selected" },
                { label: "CHAINS", value: form.chains.length > 0 ? form.chains.join(", ") : "None selected" },
                { label: "MINT AS iNFT", value: form.mintAsNFT ? "Yes \u2014 ERC-7857 on 0G Chain" : "No" },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #3D2E1A", paddingBottom: 12 }}>
                  <span style={{ color: "#5C4A32", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em" }}>{f.label}</span>
                  <span style={{ color: "#F5ECD7", fontFamily: "monospace", fontSize: 13, textAlign: "right", maxWidth: "60%" }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment cost */}
          <div style={{ ...cardStyle, background: "#2E2010", border: "1px solid #5C4422" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "#9A8060", fontFamily: "monospace", fontSize: 11, margin: "0 0 4px" }}>ESTIMATED DEPLOYMENT COST</p>
                <p style={{ color: "#C9A84C", fontFamily: "monospace", fontSize: 22, fontWeight: "bold", margin: 0 }}>0.05 ADI</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "#5C4A32", fontFamily: "monospace", fontSize: 10, margin: "0 0 4px" }}>GAS + iNFT MINT</p>
                <p style={{ color: "#9A8060", fontSize: 12, margin: 0 }}>{"\u2248"} $0.15</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      {mode === "template" && <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        {step > 1 ? (
          <GlareHover width="130px" height="44px" background="#1A1208" borderRadius="8px" borderColor="#3D2E1A" glareColor="#C9A84C" glareOpacity={0.15} transitionDuration={500}>
            <button onClick={() => setStep(s => (s - 1) as Step)} style={{ background: "transparent", border: "none", color: "#9A8060", fontFamily: "monospace", fontSize: 13, cursor: "pointer", width: "100%", height: "100%" }}>
              {"\u2190"} Back
            </button>
          </GlareHover>
        ) : <div />}

        {step < 3 ? (
          <PixelTransition
            gridSize={7} pixelColor="#C9A84C" animationStepDuration={0.2} aspectRatio="0%"
            style={{ width: 160, height: 44, borderRadius: 8, overflow: "hidden" }}
            firstContent={<div onClick={() => setStep(s => (s + 1) as Step)} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#C9A84C", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.08em", cursor: "pointer" }}>Continue {"\u2192"}</div>}
            secondContent={<div onClick={() => setStep(s => (s + 1) as Step)} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#E8C97A", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.08em", cursor: "pointer" }}>Continue {"\u2192"}</div>}
          />
        ) : (
          <PixelTransition
            gridSize={7} pixelColor="#C9A84C" animationStepDuration={0.2} aspectRatio="0%"
            style={{ width: 180, height: 44, borderRadius: 8, overflow: "hidden" }}
            firstContent={<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#C9A84C", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.08em", cursor: "pointer" }}>{"\u26A1"} Deploy Agent</div>}
            secondContent={<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#E8C97A", color: "#1A1208", fontFamily: "monospace", fontSize: 13, fontWeight: "bold", letterSpacing: "0.08em", cursor: "pointer" }}>{"\u26A1"} Deploy Agent</div>}
          />
        )}
      </div>}

    </main>
  )
}
