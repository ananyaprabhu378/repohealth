"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ChevronRight, Bot, Cpu } from "lucide-react";

interface GlobalAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  cyclicDependenciesCount: number;
  busFactorRisk: number;
  healthScore: number;
  totalCommits: number;
}

export default function GlobalAiAssistant({
  isOpen,
  onClose,
  activeTab,
  cyclicDependenciesCount,
  busFactorRisk,
  healthScore,
  totalCommits,
}: GlobalAiAssistantProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Sync initial welcome message based on active workspace tab
  useEffect(() => {
    setResponse(getWelcomeMessage(activeTab));
  }, [activeTab, healthScore, cyclicDependenciesCount, busFactorRisk]);

  const getWelcomeMessage = (tab: string) => {
    switch (tab) {
      case "overview":
        return `Salutations, engineer. I am the AetherGraph AI Staff Strategist. I have scanned the repository telemetry. 
Current health index stands at ${healthScore}%. 
Select any interactive metric tile or deep workspace tab to explore specific repository architecture and risk boundaries.`;
      case "evolution":
        return `Temporal Evolution Lens synchronized. I am ready to audit commit history patterns, trace graph structural morphing, and analyze dependency propagation across commits. 
How would you like to replay software history?`;
      case "architecture":
        return `Architectural Drift Observatory active. Telemetry reports ${cyclicDependenciesCount} cyclic dependency loops and circular imports in active pathways.
I am focusing my context on modularity degradation, dependency topology maps, and layering violation reduction.`;
      case "hotspots":
        return `Hotspot Risk Radar engaged. Currently tracking modules with high complexity * churn * centrality weights. 
I am analyzing outward instability propagation pathways. Hover or select nodes to trace cyber-threat structures.`;
      case "bus-factor":
        return `Organizational Fragility Ledger active. Current Bus Factor departure risk is calculated at ${busFactorRisk}%. 
Let's simulate the architectural impact if key developers disappear and devise knowledge-distribution decoupling plans.`;
      case "forecast":
        return `Pre-Merge Predictive Simulator synced. Select a Pull Request branch scenario to project future technical debt drift or future timeline health score deltas.`;
      case "dev-mode":
        return `Administrative Systems Terminal synchronized. Monitoring worker threads, cache hits, and pipeline cost constraints. Ask me about system performance optimization.`;
      default:
        return `Greetings. I am synchronized with your active telemetry environment. Ask me about architectural drift, hotspot mitigation, or commit forecasts.`;
    }
  };

  const getContextLabel = (tab: string) => {
    switch (tab) {
      case "overview": return "General Telemetry";
      case "evolution": return "Temporal 3D Evolution";
      case "architecture": return "Architectural Drift & Cycles";
      case "hotspots": return "Instability & Hotspots";
      case "bus-factor": return "Organizational Bus Factor";
      case "forecast": return "PR Simulations & Forecasts";
      case "dev-mode": return "Administrative Dev Telemetry";
      default: return "Observatory Intelligence Lens";
    }
  };

  const getPresets = (tab: string) => {
    switch (tab) {
      case "overview":
        return [
          { label: "Summarize top critical risks", q: "What are the most dangerous architectural risks in this repository right now?" },
          { label: "Audit repository DNA health", q: "Explain the connection between our repository DNA index and code stability." },
        ];
      case "evolution":
        return [
          { label: "Explain commit propagation", q: "How do historical changes propagate outward across our 3D knowledge graph?" },
          { label: "Trace butterfly effect", q: "Explain the butterfly-effect tracing algorithm in our evolution timelines." },
        ];
      case "architecture":
        return [
          { label: "How do we resolve active cycles?", q: `We have ${cyclicDependenciesCount} circular cyclic import loops. How do we break these dependencies step-by-step?` },
          { label: "Assess modularity degradation", q: "Is our layering separation coefficient acceptable, and how do we prevent further architectural drift?" },
        ];
      case "hotspots":
        return [
          { label: "Mitigate top hotspot file", q: "What refactoring strategies will reduce risk in our highest-weighted hotspot node?" },
          { label: "Trace instability propagation", q: "How does code volatility in high-churn files threaten our stable boundary interfaces?" },
        ];
      case "bus-factor":
        return [
          { label: "Redistribute knowledge concentration", q: `Our top maintainer owns a high percentage of commits. What breaks if they leave, and how do we share ownership?` },
          { label: "Audit maintainer recency status", q: "Analyze the recency status of active maintainers compared to inactive ones." },
        ];
      case "forecast":
        return [
          { label: "Predict 30-day stability decay", q: "Predict the likelihood of architectural degradation and layering violations in the next 30 days." },
          { label: "Validate simulated PR delta", q: "Explain how a high-churn pull request affects our predicted health score narrative." },
        ];
      default:
        return [
          { label: "Assess global code health", q: "What is the overall stability rating of this repository?" },
          { label: "Optimize engineering velocity", q: "How can we use AetherGraph telemetry to boost developer velocity and reduce debt?" },
        ];
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setIsThinking(true);
    setQuery("");

    // Simulate specialized responses based on queries and tab contexts
    setTimeout(() => {
      let ans = "";
      const lower = text.toLowerCase();

      if (lower.includes("risk") || lower.includes("dangerous")) {
        ans = `AetherGraph Strategic Audit [RISK LEDGER]:
1. MODULAR DRIFT: Cyclic dependency loops are currently active. Decoupling parent layers from sibling helpers is Priority 1.
2. INSTABILITY SPIKE: Volatility in central files triggers impact propagation across active import paths.
3. KNOWLEDGE CONCENTRATION: Bus factor risk stands at ${busFactorRisk}%. Recommend setting up secondary maintainers for the core packages.`;
      } else if (lower.includes("cycle") || lower.includes("circular") || lower.includes("decoupling")) {
        ans = `AetherGraph Architecture Remediation Strategy:
To decouple the active circular paths:
1. Identify the shared contracts between circular imports.
2. Extract common interfaces or types into an isolated third module (e.g., '/types' or '/common').
3. Convert concrete dependencies to dynamic parameters or generic interface bindings to restore absolute layer separation.`;
      } else if (lower.includes("dna") || lower.includes("helix")) {
        ans = `AetherGraph DNA Telemetry Diagnostic:
Your Repository DNA represents the system's genetic footprint.
- Resilience Rating: ${healthScore}/100.
- Mutation Coefficient: ${(1 - healthScore / 100).toFixed(3)}.
A higher mutation coefficient correlates directly with circular imports and files changing simultaneously, causing structural degradation.`;
      } else if (lower.includes("disappear") || lower.includes("leave") || lower.includes("bus factor")) {
        ans = `AetherGraph Contributor departure simulation:
With a Bus Factor of ${busFactorRisk}%, structural fragility is localized. 
Recommendation: Establish peer programming and review rotations on the core directories. Introduce joint ownership rules for all critical system changes.`;
      } else if (lower.includes("predict") || lower.includes("forecast") || lower.includes("degradation")) {
        ans = `AetherGraph Meteorological Prediction Engine:
We forecast 30-day structural resilience with 94% confidence.
Outlook: Clear Decoupled Skies. However, high-churn integrations in db-drivers will raise cyclic limits. Avoid importing presentational controllers in core packages.`;
      } else {
        ans = `AetherGraph Observatory response synchronized:
Active Lens: '${getContextLabel(activeTab)}'
Query: '${text}'

Recommendation: Telemetry indicates that the structural metrics are at safe thresholds. Ensure that pre-merge pull request simulations are executed before merging any core structural changes.`;
      }

      setResponse(ans);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Drawer backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
          />

          {/* Assistant Slide-Out Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] max-w-full bg-[#070712]/95 border-l border-aether-primary/20 shadow-[-10px_0_30px_rgba(0,240,255,0.15)] z-50 flex flex-col pt-6 pb-6 px-6 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-aether-primary" />
                  <h3 className="font-mono text-sm font-black tracking-wider text-white flex items-center gap-1.5 uppercase">
                    AI Staff Strategist
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-aether-primary/10 border border-aether-primary/20 text-[9px] font-mono text-aether-primary">
                  <Cpu className="w-2.5 h-2.5" />
                  LENS: {getContextLabel(activeTab).toUpperCase()}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xs border border-white/10 hover:border-white/20 px-2.5 py-1 rounded font-mono transition-colors cursor-pointer"
              >
                CLOSE [✕]
              </button>
            </div>

            {/* Vocal visualizer representation bar */}
            <div className="flex items-center gap-2.5 mb-4 p-2 bg-aether-primary/5 rounded border border-aether-primary/10 font-mono text-[9px]">
              <span className="text-aether-primary font-bold uppercase tracking-wider">Equalizer Telemetry:</span>
              <div className="flex gap-1 items-end h-3">
                <span className={`w-0.5 bg-aether-primary rounded-full transition-all duration-300 ${isThinking ? "h-2.5 animate-bounce" : "h-1"}`}></span>
                <span className={`w-0.5 bg-aether-primary rounded-full transition-all duration-300 delay-75 ${isThinking ? "h-3 animate-bounce" : "h-1.5"}`}></span>
                <span className={`w-0.5 bg-aether-primary rounded-full transition-all duration-300 delay-150 ${isThinking ? "h-2 animate-bounce" : "h-1"}`}></span>
                <span className={`w-0.5 bg-aether-primary rounded-full transition-all duration-300 delay-100 ${isThinking ? "h-3 animate-bounce" : "h-1.5"}`}></span>
                <span className={`w-0.5 bg-aether-primary rounded-full transition-all duration-300 delay-50 ${isThinking ? "h-1.5 animate-bounce" : "h-1"}`}></span>
              </div>
              <span className="text-gray-500 ml-auto uppercase tracking-widest text-[8px] animate-pulse">Synced & Online</span>
            </div>

            {/* Response Section */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-[11px] leading-relaxed scrollbar-thin">
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-gray-200 whitespace-pre-line shadow-inner">
                {response}
              </div>

              {isThinking && (
                <div className="flex items-center gap-2 text-aether-primary/60 font-mono text-[10px] p-2 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-aether-primary" />
                  Staff Engineer analyzing architectural telemetry...
                </div>
              )}
            </div>

            {/* Presets Grid */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 font-mono block">Context-Based Diagnostic Queries</span>
              <div className="grid grid-cols-1 gap-1.5">
                {getPresets(activeTab).map((preset, idx) => (
                  <button
                    key={idx}
                    disabled={isThinking}
                    onClick={() => handleSend(preset.q)}
                    className="w-full text-left p-2.5 rounded-lg border border-white/5 bg-white/5 hover:border-aether-primary/30 hover:bg-aether-primary/5 transition-all text-gray-300 font-mono text-[10px] truncate flex items-center justify-between group cursor-pointer disabled:opacity-50"
                  >
                    <span className="truncate">{preset.label}</span>
                    <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-aether-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(query);
              }}
              className="flex gap-2 mt-4 pt-3 border-t border-white/10 shrink-0"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isThinking}
                className="flex-1 bg-black/60 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-aether-primary transition-colors font-mono disabled:opacity-50"
                placeholder="Ask the AI Staff Engineer..."
                required
              />
              <button
                type="submit"
                disabled={isThinking}
                className="px-3.5 bg-aether-primary text-black font-bold rounded hover:bg-white transition-colors text-xs font-mono flex items-center justify-center disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
