import fs from 'fs';
import path from 'path';

const outputDir = path.join(import.meta.dirname, '0g-storage', 'images');
fs.mkdirSync(outputDir, { recursive: true });

// Agent 0: Portfolio Analyzer
const svg0 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bg0" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a2e"/>
      <stop offset="100%" stop-color="#1a1a6e"/>
    </linearGradient>
    <linearGradient id="accent0" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00d4ff"/>
      <stop offset="100%" stop-color="#0066cc"/>
    </linearGradient>
    <filter id="glow0"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <!-- Background -->
  <rect width="500" height="500" fill="url(#bg0)" rx="20"/>
  <!-- Grid -->
  <g stroke="#1a3a6e" stroke-width="0.5" opacity="0.4">
    ${Array.from({length: 20}, (_, i) => `<line x1="${25*i}" y1="0" x2="${25*i}" y2="500"/><line x1="0" y1="${25*i}" x2="500" y2="${25*i}"/>`).join('')}
  </g>
  <!-- Pie chart ring -->
  <g transform="translate(250,210)" filter="url(#glow0)">
    <circle cx="0" cy="0" r="95" fill="none" stroke="#112244" stroke-width="40"/>
    <!-- 60% segment -->
    <circle cx="0" cy="0" r="95" fill="none" stroke="#00d4ff" stroke-width="38"
      stroke-dasharray="358 598" stroke-dashoffset="0" transform="rotate(-90)"/>
    <!-- 30% segment -->
    <circle cx="0" cy="0" r="95" fill="none" stroke="#0088cc" stroke-width="38"
      stroke-dasharray="179 777" stroke-dashoffset="-358" transform="rotate(-90)"/>
    <!-- 10% segment -->
    <circle cx="0" cy="0" r="95" fill="none" stroke="#004488" stroke-width="38"
      stroke-dasharray="60 896" stroke-dashoffset="-537" transform="rotate(-90)"/>
    <!-- Center circle -->
    <circle cx="0" cy="0" r="55" fill="#0a0a2e" stroke="#00d4ff" stroke-width="1.5"/>
    <text x="0" y="-8" text-anchor="middle" fill="#00d4ff" font-family="monospace" font-size="22" font-weight="bold">60/30</text>
    <text x="0" y="16" text-anchor="middle" fill="#66aadd" font-family="monospace" font-size="14">/10</text>
  </g>
  <!-- Allocation bars -->
  <g transform="translate(80,340)">
    <rect x="0" y="0" width="204" height="12" rx="3" fill="#00d4ff" opacity="0.9"/><text x="210" y="11" fill="#88ccff" font-family="monospace" font-size="10">ETH 60%</text>
    <rect x="0" y="20" width="102" height="12" rx="3" fill="#0088cc" opacity="0.9"/><text x="108" y="31" fill="#88ccff" font-family="monospace" font-size="10">BTC 30%</text>
    <rect x="0" y="40" width="34" height="12" rx="3" fill="#004488" opacity="0.9"/><text x="40" y="51" fill="#88ccff" font-family="monospace" font-size="10">HBAR 10%</text>
  </g>
  <!-- Data lines -->
  <g stroke="#00d4ff" stroke-width="1" opacity="0.3" fill="none">
    <polyline points="30,150 60,145 90,155 120,140 150,148 180,135 210,142"/>
    <polyline points="290,142 320,138 350,145 380,130 410,136 440,128 470,132"/>
  </g>
  <!-- Title -->
  <text x="250" y="435" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="2">PORTFOLIO ANALYZER</text>
  <!-- Branding -->
  <text x="250" y="460" text-anchor="middle" fill="#4488aa" font-family="monospace" font-size="11">AgentFi</text>
  <!-- ERC-7857 badge -->
  <g transform="translate(380,20)">
    <rect width="100" height="24" rx="5" fill="#00d4ff" opacity="0.15" stroke="#00d4ff" stroke-width="0.8"/>
    <text x="50" y="16" text-anchor="middle" fill="#00d4ff" font-family="monospace" font-size="9" font-weight="bold">ERC-7857 iNFT</text>
  </g>
  <!-- Corner accent -->
  <circle cx="30" cy="30" r="4" fill="#00d4ff" opacity="0.6"/>
  <circle cx="470" cy="470" r="4" fill="#00d4ff" opacity="0.6"/>
</svg>`;

// Agent 1: Yield Optimizer
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#041a0e"/>
      <stop offset="100%" stop-color="#0a4a2e"/>
    </linearGradient>
    <linearGradient id="accent1" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#0a4a2e"/>
      <stop offset="100%" stop-color="#4ade80"/>
    </linearGradient>
    <filter id="glow1"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <!-- Background -->
  <rect width="500" height="500" fill="url(#bg1)" rx="20"/>
  <!-- Grid -->
  <g stroke="#0a3a1e" stroke-width="0.5" opacity="0.3">
    ${Array.from({length: 20}, (_, i) => `<line x1="${25*i}" y1="0" x2="${25*i}" y2="500"/><line x1="0" y1="${25*i}" x2="500" y2="${25*i}"/>`).join('')}
  </g>
  <!-- Ascending bar chart -->
  <g transform="translate(80,120)" filter="url(#glow1)">
    ${[
      {x:0, h:60, label:'Q1'}, {x:55, h:100, label:'Q2'}, {x:110, h:140, label:'Q3'},
      {x:165, h:170, label:'Q4'}, {x:220, h:210, label:'Q5'}, {x:275, h:260, label:'Q6'}
    ].map(b => `
      <rect x="${b.x}" y="${280-b.h}" width="40" height="${b.h}" rx="4" fill="url(#accent1)" opacity="0.85"/>
      <text x="${b.x+20}" y="${295}" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="10">${b.label}</text>
    `).join('')}
    <!-- Trend line -->
    <polyline points="20,220 75,180 130,140 185,110 240,70 295,20" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-dasharray="6,3" opacity="0.8"/>
    <circle cx="295" cy="20" r="5" fill="#4ade80"/>
  </g>
  <!-- Yield percentages -->
  <g fill="#4ade80" font-family="monospace" font-size="13" opacity="0.7">
    <text x="400" y="180">+12.4%</text>
    <text x="400" y="210">+8.7%</text>
    <text x="400" y="240">+15.2%</text>
    <text x="400" y="270" fill="#7aee9a" font-size="16" font-weight="bold">APY</text>
  </g>
  <!-- Sprouting seed icon -->
  <g transform="translate(250,370)" filter="url(#glow1)">
    <ellipse cx="0" cy="20" rx="20" ry="8" fill="#2a5a3e"/>
    <path d="M0,20 Q0,-10 -15,-30 Q0,-15 0,-30 Q0,-15 15,-30 Q0,-10 0,20" fill="none" stroke="#4ade80" stroke-width="2.5"/>
    <circle cx="-12" cy="-25" r="3" fill="#4ade80" opacity="0.5"/>
    <circle cx="12" cy="-25" r="3" fill="#4ade80" opacity="0.5"/>
    <circle cx="0" cy="-35" r="2" fill="#7aee9a" opacity="0.7"/>
  </g>
  <!-- Title -->
  <text x="250" y="435" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="2">YIELD OPTIMIZER</text>
  <!-- Branding -->
  <text x="250" y="460" text-anchor="middle" fill="#3a8a5e" font-family="monospace" font-size="11">AgentFi</text>
  <!-- ERC-7857 badge -->
  <g transform="translate(380,20)">
    <rect width="100" height="24" rx="5" fill="#4ade80" opacity="0.15" stroke="#4ade80" stroke-width="0.8"/>
    <text x="50" y="16" text-anchor="middle" fill="#4ade80" font-family="monospace" font-size="9" font-weight="bold">ERC-7857 iNFT</text>
  </g>
  <!-- Corner accents -->
  <circle cx="30" cy="30" r="4" fill="#4ade80" opacity="0.6"/>
  <circle cx="470" cy="470" r="4" fill="#4ade80" opacity="0.6"/>
</svg>`;

// Agent 2: Risk Scorer
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a0808"/>
      <stop offset="100%" stop-color="#4a0a0a"/>
    </linearGradient>
    <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="glow2"><feGaussianBlur stdDeviation="3" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <!-- Background -->
  <rect width="500" height="500" fill="url(#bg2)" rx="20"/>
  <!-- Grid -->
  <g stroke="#3a1515" stroke-width="0.5" opacity="0.3">
    ${Array.from({length: 20}, (_, i) => `<line x1="${25*i}" y1="0" x2="${25*i}" y2="500"/><line x1="0" y1="${25*i}" x2="500" y2="${25*i}"/>`).join('')}
  </g>
  <!-- Shield outline -->
  <g transform="translate(250,195)" filter="url(#glow2)">
    <path d="M0,-120 L80,-85 L85,10 Q85,80 0,120 Q-85,80 -85,10 L-80,-85 Z"
      fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.4"/>
    <path d="M0,-100 L65,-70 L68,8 Q68,65 0,98 Q-68,65 -68,8 L-65,-70 Z"
      fill="#1a0808" fill-opacity="0.5" stroke="#f59e0b" stroke-width="1" opacity="0.3"/>
  </g>
  <!-- Risk gauge (semicircle) -->
  <g transform="translate(250,240)" filter="url(#glow2)">
    <!-- Gauge track -->
    <path d="M-100,0 A100,100 0 0,1 100,0" fill="none" stroke="#2a1515" stroke-width="25" stroke-linecap="round"/>
    <!-- Green zone -->
    <path d="M-100,0 A100,100 0 0,1 -50,-86.6" fill="none" stroke="#22c55e" stroke-width="23" stroke-linecap="round" opacity="0.8"/>
    <!-- Yellow zone -->
    <path d="M-50,-86.6 A100,100 0 0,1 50,-86.6" fill="none" stroke="#f59e0b" stroke-width="23" stroke-linecap="round" opacity="0.8"/>
    <!-- Red zone -->
    <path d="M50,-86.6 A100,100 0 0,1 100,0" fill="none" stroke="#ef4444" stroke-width="23" stroke-linecap="round" opacity="0.8"/>
    <!-- Needle (pointing to yellow/moderate) -->
    <line x1="0" y1="5" x2="-15" y2="-80" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
    <!-- Labels -->
    <text x="-110" y="20" text-anchor="middle" fill="#22c55e" font-family="monospace" font-size="10">LOW</text>
    <text x="0" y="-108" text-anchor="middle" fill="#f59e0b" font-family="monospace" font-size="10">MED</text>
    <text x="110" y="20" text-anchor="middle" fill="#ef4444" font-family="monospace" font-size="10">HIGH</text>
    <!-- Score display -->
    <text x="0" y="45" text-anchor="middle" fill="#f59e0b" font-family="monospace" font-size="28" font-weight="bold">6.2</text>
    <text x="0" y="65" text-anchor="middle" fill="#aa7733" font-family="monospace" font-size="12">/10 RISK</text>
  </g>
  <!-- Alert markers -->
  <g fill="#f59e0b" opacity="0.5">
    <polygon points="60,85 65,75 70,85" stroke="#f59e0b" stroke-width="1"/>
    <polygon points="430,85 435,75 440,85" stroke="#f59e0b" stroke-width="1"/>
  </g>
  <!-- Title -->
  <text x="250" y="435" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="2">RISK SCORER</text>
  <!-- Branding -->
  <text x="250" y="460" text-anchor="middle" fill="#8a5533" font-family="monospace" font-size="11">AgentFi</text>
  <!-- ERC-7857 badge -->
  <g transform="translate(380,20)">
    <rect width="100" height="24" rx="5" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" stroke-width="0.8"/>
    <text x="50" y="16" text-anchor="middle" fill="#f59e0b" font-family="monospace" font-size="9" font-weight="bold">ERC-7857 iNFT</text>
  </g>
  <!-- Corner accents -->
  <circle cx="30" cy="30" r="4" fill="#f59e0b" opacity="0.6"/>
  <circle cx="470" cy="470" r="4" fill="#f59e0b" opacity="0.6"/>
</svg>`;

const files = [
  { name: 'agent-0-portfolio.svg', content: svg0 },
  { name: 'agent-1-yield.svg', content: svg1 },
  { name: 'agent-2-risk.svg', content: svg2 },
];

for (const f of files) {
  const filePath = path.join(outputDir, f.name);
  fs.writeFileSync(filePath, f.content.trim());
  console.log(`Generated: ${filePath}`);
}

console.log('\nAll 3 SVGs generated successfully.');
