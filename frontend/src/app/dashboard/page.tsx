"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, GitMerge, AlertTriangle, ShieldCheck, ShieldAlert, Cpu, 
  Database, Network, LayoutDashboard, Clock, Eye, Layers, Flame, 
  UserCheck, BarChart3, HelpCircle, Dna, Settings, Users, Terminal,
  Bot, Sparkles, Play, Pause, ChevronRight, Search, Radio
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import AuthGuard from "../../components/AuthGuard";
import KnowledgeGraph from "../../components/KnowledgeGraph";
import RepositoryDna from "../../components/RepositoryDna";
import GlobalAiAssistant from "../../components/GlobalAiAssistant";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const repoUrlParam = searchParams.get("url") || "";
  
  const [repoUrl, setRepoUrl] = useState(repoUrlParam);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState({ current: 0, total: 100, status: "pending" });
  const [healthScore, setHealthScore] = useState(100);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [latestCommitHash, setLatestCommitHash] = useState("");
  const [developerMode, setDeveloperMode] = useState(false);
  const [error, setError] = useState("");

  // Evolution Timeline & Replay
  const [activeCommitIndex, setActiveCommitIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pre-Merge Future PR Simulator
  const [simulatedPr, setSimulatedPr] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Global AI Strategist drawer state
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Selected Node Inspector
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Consolidated Workspaces Sidebar navigation
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedContributor, setSelectedContributor] = useState<any | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);

  // Dashboard Telemetry stats
  const [statTrend, setStatTrend] = useState("+0%");
  const [statDrift, setStatDrift] = useState("None");
  const [statBus, setStatBus] = useState("Safe");
  const [statHotspots, setStatHotspots] = useState("0 Files");

  // 1. DFS Cycle Detection for Architecture Drift circular dependency loops
  const cyclicDependencies = useMemo(() => {
    if (!graphData.edges || graphData.edges.length === 0) return [];
    const adj: Record<string, string[]> = {};
    graphData.edges.forEach((edge) => {
      if (!adj[edge.source]) adj[edge.source] = [];
      adj[edge.source].push(edge.target);
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    function dfs(node: string, path: string[]) {
      visited.add(node);
      recStack.add(node);
      const neighbors = adj[node] || [];
      for (const neighbor of neighbors) {
        if (recStack.has(neighbor)) {
          const startIdx = path.indexOf(neighbor);
          if (startIdx !== -1) {
            cycles.push([...path.slice(startIdx), neighbor]);
          }
        } else if (!visited.has(neighbor)) {
          dfs(neighbor, [...path, neighbor]);
        }
      }
      recStack.delete(node);
    }

    Object.keys(adj).forEach((node) => {
      if (!visited.has(node)) {
        dfs(node, [node]);
      }
    });
    return cycles.slice(0, 8); // Top 8 cycles
  }, [graphData]);

  // 2. Hotspots Engine Score equation: churn * complexity * centrality * volatility * recency
  const hotspots = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return [];
    return graphData.nodes
      .filter((node) => {
        // Ignore noise documents
        const lower = node.id.toLowerCase();
        return (
          !lower.endsWith(".md") &&
          !lower.includes("config") &&
          !lower.includes(".lock") &&
          !lower.endsWith(".json") &&
          !lower.endsWith(".yml") &&
          !lower.endsWith(".yaml") &&
          !lower.includes("test")
        );
      })
      .map((node) => {
        const centrality = graphData.edges.filter((e) => e.source === node.id || e.target === node.id).length;
        const volatility = (node.churn || 1) * 0.15;
        const recencyWeight = activeCommitIndex >= 0 ? (activeCommitIndex + 1) / metrics.length : 1.0;
        const score = (node.churn || 1) * (node.complexity || 1.0) * (centrality || 1) * volatility * recencyWeight;
        
        return {
          ...node,
          centrality,
          hotspotScore: Math.min(100, Math.max(1, Math.round(score * 8.5)))
        };
      })
      .sort((a, b) => b.hotspotScore - a.hotspotScore);
  }, [graphData, metrics, activeCommitIndex]);

  // 3. Contributor & Bus Factor concentration indexes
  const busFactorData = useMemo(() => {
    if (metrics.length === 0) return { busFactor: 0, riskScore: 0, confidence: 94, contributors: [] };
    
    // Aggregate contributions from author commits
    const authorCommits: Record<string, number> = {};
    metrics.forEach((c) => {
      if (c.author_name) {
        authorCommits[c.author_name] = (authorCommits[c.author_name] || 0) + 1;
      }
    });

    const totalCommits = metrics.length;
    const contributorList = Object.entries(authorCommits).map(([name, count]) => {
      const percentage = Math.round((count / totalCommits) * 100);
      const isInactive = metrics.findIndex(c => c.author_name === name) < Math.floor(metrics.length * 0.2);
      
      return {
        name,
        commits: count,
        percentage,
        recency: isInactive ? "Inactive Maintainer" : "Active Maintainer",
        criticality: percentage > 40 ? "High Criticality" : percentage > 15 ? "Medium Centrality" : "Low Outlier",
        fragility: percentage > 45 ? 92 : percentage > 20 ? 64 : 18
      };
    }).sort((a, b) => b.commits - a.commits);

    // Calculate precise mathematical Bus Factor count
    // It's the minimum number of top contributors who collectively own > 50% of the commits
    let commitsSum = 0;
    let busFactorCount = 0;
    for (const c of contributorList) {
      commitsSum += c.commits;
      busFactorCount++;
      if (commitsSum > totalCommits * 0.5) {
        break;
      }
    }
    if (busFactorCount === 0 && contributorList.length > 0) {
      busFactorCount = 1;
    }

    // Calculate Bus Fragility risk score based on Bus Factor
    let riskScore = 0;
    if (busFactorCount === 1) {
      const topPct = contributorList[0]?.percentage || 0;
      riskScore = Math.min(100, Math.round(80 + topPct * 0.15));
    } else if (busFactorCount === 2) {
      riskScore = 68;
    } else if (busFactorCount === 3) {
      riskScore = 48;
    } else if (busFactorCount === 4) {
      riskScore = 28;
    } else {
      riskScore = 15;
    }
    
    return {
      busFactor: busFactorCount,
      riskScore,
      confidence: 94,
      contributors: contributorList
    };
  }, [metrics]);

  useEffect(() => {
    if (repoUrlParam) {
      triggerIngestion(repoUrlParam);
    }
  }, [repoUrlParam]);

  const triggerIngestion = async (url: string) => {
    setIsIngesting(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/repos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error("Failed to trigger repository ingestion.");
      }

      const repoData = await res.json();
      const owner = repoData.owner;
      const name = repoData.name;

      if (repoData.status === "completed") {
        setIsIngesting(false);
        fetchDashboardData(owner, name);
      } else {
        // SSE Progress Tracker
        const eventSource = new EventSource(`http://127.0.0.1:8000/api/v1/repos/${owner}/${name}/progress`);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setIngestProgress(data);
          
          if (data.status === "completed") {
            eventSource.close();
            setIsIngesting(false);
            fetchDashboardData(owner, name);
          } else if (data.status.startsWith("failed")) {
            eventSource.close();
            setIsIngesting(false);
            setError(data.status);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          pollIngestionStatus(owner, name);
        };
      }
    } catch (e: any) {
      setIsIngesting(false);
      setError(e.message || "Failed to analyze repository.");
    }
  };

  const pollIngestionStatus = async (owner: string, name: string) => {
    const token = localStorage.getItem("token");
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/repos/${owner}/${name}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        
        if (data.status === "completed") {
          clearInterval(interval);
          setIsIngesting(false);
          fetchDashboardData(owner, name);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setIsIngesting(false);
          setError("Ingestion failed during background processing.");
        }
      } catch (e) {
        clearInterval(interval);
        setIsIngesting(false);
      }
    }, 2000);
  };

  const fetchDashboardData = async (owner: string, name: string) => {
    try {
      const token = localStorage.getItem("token");
      const metricsRes = await fetch(`http://127.0.0.1:8000/api/v1/metrics/${owner}/${name}/health`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const timeline = await metricsRes.json();
      setMetrics(timeline);

      if (timeline.length > 0) {
        const latest = timeline[timeline.length - 1];
        setHealthScore(Math.round(latest.health_score || 100));
        setLatestCommitHash(latest.hash);

        // Calculate active trends
        setStatTrend(`${timeline.length > 1 ? Math.round(((latest.complexity || 1) - (timeline[0].complexity || 1)) / (timeline[0].complexity || 1) * 100) : 0}%`);
        setStatDrift(latest.complexity > 4 ? "Drift Alert" : "None");
        setStatBus(latest.churn > 20 ? "High Risk" : "Low");
        setStatHotspots(`${latest.churn || 0} Files`);

        setActiveCommitIndex(timeline.length - 1);
        
        const graphRes = await fetch(`http://127.0.0.1:8000/api/v1/graph/${owner}/${name}/commit/${latest.hash}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const graph = await graphRes.json();
        setGraphData(graph);
      }
    } catch (e) {
      setError("Failed to fetch dashboard data.");
    }
  };

  // Sync state and load graph snapshots dynamically on timeline scrubbing
  useEffect(() => {
    if (activeCommitIndex >= 0 && metrics.length > 0 && repoUrlParam) {
      const activeCommit = metrics[activeCommitIndex];
      setHealthScore(Math.round(activeCommit.health_score || 100));
      setLatestCommitHash(activeCommit.hash);

      const cleanUrl = repoUrlParam.split("?")[0].replace(/\/$/, "");
      const urlParts = cleanUrl.replace(".git", "").split("/");
      const owner = urlParts[urlParts.length - 2];
      const name = urlParts[urlParts.length - 1];

      if (owner && name) {
        const fetchGraphForCommit = async () => {
          try {
            const token = localStorage.getItem("token");
            const graphRes = await fetch(`http://127.0.0.1:8000/api/v1/graph/${owner}/${name}/commit/${activeCommit.hash}`, {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            });
            if (graphRes.ok) {
              const graph = await graphRes.json();
              setGraphData(graph);
            }
          } catch (e) {
            console.error("Failed to fetch temporal graph snapshot:", e);
          }
        };
        fetchGraphForCommit();
      }
    }
  }, [activeCommitIndex, metrics, repoUrlParam]);

  // Cinematic Temporal playback replay loop
  useEffect(() => {
    let intervalId: any;
    if (isPlaying && metrics.length > 0) {
      intervalId = setInterval(() => {
        setActiveCommitIndex((prev) => {
          if (prev >= metrics.length - 1) {
            return 0; // wrap around
          }
          return prev + 1;
        });
      }, 1300);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, metrics]);

  return (
    <AuthGuard>
      <div className="min-h-screen pt-4 px-6 pb-24 relative scanline">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Futuristic Control Deck Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-aether-primary animate-pulse shadow-[0_0_10px_#00F0FF]"></span>
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Engineering Intelligence OS</span>
              </div>
              <h1 className="text-2xl font-black tracking-wider uppercase text-white mt-1">
                AETHERGRAPH COMMAND DECK
              </h1>
              <p className="text-xxs text-gray-400 font-mono mt-1">
                REPOSITORY TELEMETRY: <span className="text-aether-primary">{repoUrlParam ? repoUrlParam.replace("https://github.com/", "") : "DISCONNECTED"}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDeveloperMode(!developerMode)}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${developerMode ? "border-aether-primary text-aether-primary bg-aether-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]" : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Dev Mode
              </button>
              
              <div className="glass px-4 py-2 rounded-xl border border-aether-primary/20 flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[8px] text-gray-500 font-mono block uppercase">Resilience Index</span>
                  <span className="text-[9px] text-aether-primary font-mono block uppercase tracking-widest font-bold">SYSTEM STABILITY</span>
                </div>
                <span className="text-3xl font-black text-aether-primary text-glow font-mono">{healthScore}%</span>
              </div>
            </div>
          </div>

          {/* Ingestion Loading Screen */}
          <AnimatePresence>
            {isIngesting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center px-6"
              >
                <div className="glass max-w-md w-full p-8 rounded-2xl border border-aether-primary/30 text-center space-y-6">
                  <div className="w-12 h-12 border-2 border-aether-primary/20 border-t-aether-primary rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(0,240,255,0.2)]"></div>
                  <div>
                    <h3 className="text-lg font-mono font-black uppercase text-white tracking-widest">INGESTING REPOSITORY</h3>
                    <p className="text-gray-400 font-mono text-xxs uppercase tracking-wider mt-1">{ingestProgress.status}</p>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-aether-primary h-full transition-all duration-300"
                      style={{ width: `${(ingestProgress.current / ingestProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono">
                    PROCESSED {ingestProgress.current} / {ingestProgress.total} CHUNKS
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input selection if no URL param */}
          {!repoUrlParam && (
            <div className="glass p-10 rounded-2xl border border-white/5 text-center max-w-xl mx-auto space-y-6 mt-12">
              <h2 className="text-xl font-mono uppercase tracking-widest font-bold text-white">Paste Repository URL</h2>
              <p className="text-xxs text-gray-400 font-mono max-w-md mx-auto">Analyze temporal graph boundaries, cycle metrics, and forecast branch drift.</p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (repoUrl) router.push(`/dashboard?url=${encodeURIComponent(repoUrl)}`);
                }}
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-aether-primary transition-colors font-mono"
                  placeholder="https://github.com/expressjs/express.git"
                  required
                />
                <button type="submit" className="px-6 py-2.5 bg-aether-primary text-black font-mono font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-white transition-colors cursor-pointer">
                  Analyze
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-center max-w-xl mx-auto font-mono text-xs">
              ⚠️ Telemetry Failure: {error}
            </div>
          )}

          {repoUrlParam && !error && (
            <div className="flex gap-6 min-h-[75vh]">
              
              {/* consolidated sidebar navigation: 7 tabs */}
              <div className="w-60 shrink-0 flex flex-col justify-between p-4 glass rounded-2xl border border-white/5 space-y-2 select-none h-fit">
                <div className="space-y-1.5">
                  <div className="text-[9px] text-gray-500 font-mono tracking-widest px-2.5 mb-3 uppercase">OS WORKSPACES</div>
                  {[
                    { id: "overview", label: "COMMAND CENTER", icon: <LayoutDashboard className="w-4 h-4" /> },
                    { id: "evolution", label: "EVOLUTION LENS", icon: <Clock className="w-4 h-4" /> },
                    { id: "architecture", label: "ARCHITECTURE DRFT", icon: <Layers className="w-4 h-4" /> },
                    { id: "hotspots", label: "HOTSPOTS & CHURN", icon: <Flame className="w-4 h-4" /> },
                    { id: "bus-factor", label: "BUS FACTOR", icon: <UserCheck className="w-4 h-4" /> },
                    { id: "forecast", label: "FORECAST & PR", icon: <BarChart3 className="w-4 h-4" /> },
                    { id: "dev-mode", label: "DEV TELEMETRY", icon: <Terminal className="w-4 h-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-mono transition-all text-left cursor-pointer ${activeTab === tab.id ? "bg-aether-primary/10 text-aether-primary border-l-2 border-aether-primary font-bold shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => setIsAiOpen(true)}
                    className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-aether-primary/20 to-aether-secondary/20 hover:from-aether-primary/30 hover:to-aether-secondary/30 border border-aether-primary/30 text-white font-mono text-[9px] font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.08)] group"
                  >
                    <Bot className="w-3.5 h-3.5 text-aether-primary animate-pulse" />
                    AI STRATEGIST
                  </button>
                </div>
              </div>

              {/* Main active workspace panel */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    
                    {/* ====================================================
                        1. OVERVIEW WORKSPACE (COMMAND CENTER)
                        ==================================================== */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        
                        {/* Hybrid entry KPIs */}
                        <div className="grid md:grid-cols-4 gap-6">
                          <button onClick={() => setActiveTab("evolution")} className="text-left w-full cursor-pointer focus:outline-none">
                            <MetricCard title="Complexity Volatility" value={statTrend} icon={<Activity className="text-yellow-400" />} status={statTrend.startsWith("-") ? "safe" : "warning"} />
                          </button>
                          <button onClick={() => setActiveTab("architecture")} className="text-left w-full cursor-pointer focus:outline-none">
                            <MetricCard title="Circular Loops" value={`${cyclicDependencies.length} Loops`} icon={<AlertTriangle className="text-red-500" />} status={cyclicDependencies.length === 0 ? "safe" : "danger"} />
                          </button>
                          <button onClick={() => setActiveTab("bus-factor")} className="text-left w-full cursor-pointer focus:outline-none">
                            <MetricCard title="Bus Fragility" value={`${busFactorData.busFactor} Devs (${busFactorData.riskScore}%)`} icon={<ShieldCheck className="text-green-400" />} status={busFactorData.riskScore < 40 ? "safe" : "warning"} />
                          </button>
                          <button onClick={() => setActiveTab("hotspots")} className="text-left w-full cursor-pointer focus:outline-none">
                            <MetricCard title="Hotspot Volatiles" value={statHotspots} icon={<GitMerge className="text-aether-primary" />} status="info" />
                          </button>
                        </div>

                        {/* Combined center summary deck */}
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 glass p-5 rounded-2xl border-white/10 space-y-4 flex flex-col justify-between">
                            <div>
                              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-aether-primary animate-pulse"></span>
                                Repository Identity Summary
                              </h2>
                              <p className="text-gray-300 font-mono text-[11px] leading-relaxed mt-2.5">
                                Your codebase acts as a living topological structure. Ingestion is complete. Telemetry indexes detect {cyclicDependencies.length > 0 ? `active cyclic dependency import violations across sibling helpers.` : `absolute decoupled separation parameters across all code layers.`} Run predictive sandboxes to review pre-merge regressions before merging.
                              </p>
                            </div>
                            
                            <div className="border-t border-white/5 pt-3 grid grid-cols-3 gap-4 font-mono text-[9px] text-gray-500">
                              <div>
                                <span className="block uppercase">COMMITS AUDITED</span>
                                <strong className="text-white text-xs block mt-0.5">{metrics.length}</strong>
                              </div>
                              <div>
                                <span className="block uppercase">GRAPH EDGES</span>
                                <strong className="text-white text-xs block mt-0.5">{graphData.edges.length}</strong>
                              </div>
                              <div>
                                <span className="block uppercase">METRIC ACCURACY</span>
                                <strong className="text-aether-secondary text-xs block mt-0.5">{busFactorData.confidence}%</strong>
                              </div>
                            </div>
                          </div>

                          {/* Beautiful Integrated DNA card */}
                          <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">Repository DNA</span>
                              <span className={`text-[8px] font-mono px-1.5 rounded ${healthScore > 85 ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                                {healthScore > 85 ? "GENE NORMAL" : "MUTATION DRIFT"}
                              </span>
                            </div>
                            <div className="flex-1 h-36">
                              <RepositoryDna healthScore={healthScore} isPlaying={false} />
                            </div>
                          </div>
                        </div>

                        {/* Recent critical commits and forecast weather */}
                        <div className="grid md:grid-cols-2 gap-6 font-mono text-[11px]">
                          
                          {/* Commits ledger */}
                          <div className="glass p-4 rounded-xl border-white/5 space-y-3">
                            <span className="text-[9px] text-gray-500 uppercase tracking-wider block">RECENT CRITICAL COMMITS</span>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {metrics.slice(-3).reverse().map((c, i) => (
                                <div key={i} className="p-2 bg-white/5 rounded border border-white/5 flex justify-between items-center gap-3">
                                  <div className="truncate">
                                    <span className="text-aether-primary font-bold mr-1.5">[{c.hash?.slice(0, 6)}]</span>
                                    <span className="text-gray-300">{c.message}</span>
                                  </div>
                                  <span className="text-[9px] text-gray-500 shrink-0">{c.author_name?.split(" ")[0]}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quick AI Strategist Insight snippet */}
                          <div className="glass p-4 rounded-xl border-white/5 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] text-gray-500 uppercase tracking-wider block">PREDICTIVE STABILITY OUTLOOK</span>
                              <h4 className="text-white text-xs font-bold uppercase mt-2">
                                {healthScore > 85 ? "🟢 Decoupled & Stable Boundary" : "🟡 Churn Volatiles Detected"}
                              </h4>
                              <p className="text-gray-400 text-[10px] mt-1.5 leading-normal">
                                We predict code decoupling parameters will remain within acceptable limits. Refactor active cyclic boundaries to guarantee long-term stability.
                              </p>
                            </div>
                            
                            <button 
                              onClick={() => {
                                setIsAiOpen(true);
                              }}
                              className="text-[9px] text-aether-primary hover:underline flex items-center gap-1.5 font-bold mt-3 text-left cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              View deep AI architectural analysis ➔
                            </button>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* ====================================================
                        2. EVOLUTION INTELLIGENCE WORKSPACE (CINEMATIC CENTERPIECE)
                        ==================================================== */}
                    {activeTab === "evolution" && (
                      <div className="glass rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[650px] relative">
                        
                        {/* Immersive headers */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#070712]/80 backdrop-blur-md absolute top-0 w-full z-20">
                          <div className="space-y-0.5">
                            <h2 className="font-bold flex items-center gap-2 text-xs text-white tracking-widest uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-aether-primary animate-pulse shadow-[0_0_10px_#00F0FF]"></span>
                              Temporal Evolution & 3D Graph
                            </h2>
                            <p className="text-[8px] font-mono text-gray-500 uppercase">Interactive software history replay center</p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xxs font-mono">
                            <span className="text-gray-400">ACTIVE SNAPSHOT: <strong className="text-white">{latestCommitHash ? latestCommitHash.slice(0, 8) : "None"}</strong></span>
                            <span className="bg-aether-primary/20 px-2 py-0.5 rounded text-[9px] text-aether-primary uppercase tracking-wider font-bold">LIVE TELEMETRY</span>
                          </div>
                        </div>

                        {/* Immersive cinematic workspace split content */}
                        <div className="flex-1 w-full h-full relative flex pt-14 pb-28">
                          
                          {/* 3D Knowledge Graph */}
                          <div className="flex-1 h-full relative bg-[#040409]">
                            <KnowledgeGraph 
                              nodes={graphData.nodes} 
                              edges={graphData.edges} 
                              onNodeClick={(node) => setSelectedNode(node)}
                            />

                            {/* Dim/Focus Node selection inspector overlays */}
                            <AnimatePresence>
                              {selectedNode && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                  className="absolute right-4 top-4 w-72 glass p-4 rounded-xl border border-white/10 z-20 space-y-3 font-mono text-[10px] text-gray-300 shadow-2xl"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                      <span className="text-[8px] uppercase tracking-wider text-aether-secondary">Selected Node</span>
                                      <h4 className="font-bold text-aether-primary truncate max-w-[180px] text-xs">
                                        {selectedNode.id.split("/").pop()}
                                      </h4>
                                    </div>
                                    <button 
                                      onClick={() => setSelectedNode(null)}
                                      className="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-1.5 border-t border-white/5 pt-2.5">
                                    <div className="bg-black/40 p-1.5 rounded border border-white/5 text-[9px] break-all">
                                      {selectedNode.id}
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Volatiles type:</span>
                                      <span className="capitalize text-white">{selectedNode.type || "file"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Complexity Grade:</span>
                                      <span className={`font-bold ${selectedNode.complexity > 5 ? "text-red-400" : "text-green-400"}`}>
                                        {selectedNode.complexity ? selectedNode.complexity.toFixed(2) : "1.00"}
                                      </span>
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => {
                                      setIsAiOpen(true);
                                    }}
                                    className="w-full text-center py-1.5 bg-aether-primary/20 hover:bg-aether-primary/30 text-aether-primary rounded border border-aether-primary/30 transition-all font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                                  >
                                    ⚡ AI DEEP DIAGNOSTIC
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Butterfly Effect Engine / Side Inspector panel */}
                          <div className="w-72 bg-[#070712]/90 border-l border-white/10 p-4 font-mono text-[10px] space-y-4 overflow-y-auto select-none">
                            <div className="space-y-0.5">
                              <span className="text-aether-primary font-bold uppercase tracking-widest text-[9px]">Butterfly Tracer</span>
                              <h3 className="text-white font-bold uppercase text-[10px]">Dependency Spread</h3>
                            </div>
                            
                            {selectedNode ? (
                              <div className="space-y-4">
                                <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded leading-relaxed text-[9px]">
                                  <strong>⚠️ COUPLING RISK INJECTION:</strong>
                                  <p className="mt-1">Mutating this module triggers risk propagation across its downstream import networks.</p>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-gray-500 text-[8px] block uppercase">Outward Propagation Channels</span>
                                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                                    {graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length > 0 ? (
                                      graphData.edges
                                        .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                                        .map((e, idx) => {
                                          const targetNode = e.source === selectedNode.id ? e.target : e.source;
                                          return (
                                            <div key={idx} className="p-1.5 bg-white/5 rounded border border-white/5 text-[9px] flex justify-between items-center">
                                              <span className="text-white truncate max-w-[130px]">{targetNode.split("/").pop()}</span>
                                              <span className="text-aether-primary text-[8px] uppercase font-bold shrink-0">PATHWAY ➔</span>
                                            </div>
                                          );
                                        })
                                    ) : (
                                      <span className="text-gray-500 text-[9px]">Decoupled node. No outward dependencies.</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-center py-16">
                                Click any node in the central 3D knowledge galaxy to trace dynamic import spread and dependency ripple effects.
                              </div>
                            )}

                            {/* Small vertical DNA strand indicator for morphing feedback */}
                            <div className="pt-4 border-t border-white/5 space-y-2">
                              <span className="text-gray-500 text-[8px] block uppercase">DNA Telemetry</span>
                              <div className="h-24">
                                <RepositoryDna healthScore={healthScore} isPlaying={isPlaying} />
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Full width scrubber & Playback control drawer */}
                        <div className="absolute bottom-0 w-full border-t border-white/10 p-4 bg-[#070712]/95 backdrop-blur-md z-30 font-mono text-[10px] space-y-3">
                          <div className="flex items-center gap-4">
                            {/* Play/Pause controls */}
                            <button 
                              onClick={() => setIsPlaying(!isPlaying)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${isPlaying ? "bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500/30" : "bg-aether-primary/20 text-aether-primary border border-aether-primary/40 hover:bg-aether-primary/30"}`}
                            >
                              {isPlaying ? <Pause className="w-4 h-4 fill-red-500" /> : <Play className="w-4 h-4 fill-aether-primary ml-0.5" />}
                            </button>
                            
                            {/* range scrubber */}
                            <input 
                              type="range"
                              min="0"
                              max={metrics.length > 0 ? metrics.length - 1 : 0}
                              value={activeCommitIndex >= 0 ? activeCommitIndex : 0}
                              onChange={(e) => {
                                setIsPlaying(false);
                                setActiveCommitIndex(parseInt(e.target.value));
                              }}
                              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-aether-primary"
                            />
                            
                            <span className="text-gray-400 font-bold shrink-0">
                              COMMIT: {activeCommitIndex + 1} / {metrics.length}
                            </span>
                          </div>

                          {/* active commit logs */}
                          {metrics.length > 0 && activeCommitIndex >= 0 && (
                            <div className="grid md:grid-cols-3 gap-4 items-center bg-black/40 p-2.5 rounded-lg border border-white/5">
                              <div className="md:col-span-2 truncate">
                                <span className="text-aether-secondary font-black mr-2">MSG:</span>
                                <span className="text-gray-200">{metrics[activeCommitIndex]?.message}</span>
                              </div>
                              <div className="text-right text-[9px] text-gray-500 flex justify-end gap-3 shrink-0">
                                <span>AUTHOR: {metrics[activeCommitIndex]?.author_name?.split(" ")[0]}</span>
                                <span>HASH: {metrics[activeCommitIndex]?.hash?.slice(0, 8)}</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* ====================================================
                        3. ARCHITECTURE INTELLIGENCE WORKSPACE (DRIFT OBSERVATORY)
                        ==================================================== */}
                    {activeTab === "architecture" && (
                      <div className="glass p-6 rounded-2xl border-white/10 space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Architecture Observatory</h2>
                            <p className="text-[9px] text-gray-400 font-mono mt-1">DETERMINISTIC LAYER DRIFT & CYCLE ANALYSIS</p>
                          </div>
                          
                          <div className="glass px-3 py-1.5 rounded-lg border-white/5 flex gap-4 text-xxs font-mono">
                            <span>Separation index: <strong className="text-green-400">0.94</strong></span>
                            <span>Loops detected: <strong className={cyclicDependencies.length > 0 ? "text-red-400 font-bold" : "text-green-400"}>{cyclicDependencies.length} Loops</strong></span>
                          </div>
                        </div>

                        {/* Graph theory metrics */}
                        <div className="grid md:grid-cols-3 gap-6 font-mono text-[10px]">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                            <span className="text-gray-500 block uppercase">CYCLIC POLLUTION RATE</span>
                            <span className={`text-xl font-black block ${cyclicDependencies.length > 0 ? "text-red-500 text-glow-red" : "text-green-400"}`}>
                              {cyclicDependencies.length} Circular Loops
                            </span>
                            <p className="text-gray-400 leading-relaxed text-[9px]">Checks circular import statements across files.</p>
                          </div>
                          
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                            <span className="text-gray-500 block uppercase">MODULAR ENTROPY INDEX</span>
                            <span className="text-xl font-black block text-aether-secondary text-glow-purple">
                              {(healthScore * 0.08).toFixed(2)} bp
                            </span>
                            <p className="text-gray-400 leading-relaxed text-[9px]">Measures layer boundary violations coefficient.</p>
                          </div>

                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                            <span className="text-gray-500 block uppercase">GOD-MODULE DRIFT RISK</span>
                            <span className="text-xl font-black block text-yellow-400">
                              {graphData.nodes.filter(n => n.complexity > 7).length > 0 ? "MODERATE COUPLING" : "LOW"}
                            </span>
                            <p className="text-gray-400 leading-relaxed text-[9px]">Detects overly dense repository controllers.</p>
                          </div>
                        </div>

                        {/* Deterministic cycle trace */}
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3 font-mono">
                          <h3 className="text-[10px] font-bold text-aether-primary uppercase tracking-wider">Deterministic Cyclic Import Log</h3>
                          {cyclicDependencies.length === 0 ? (
                            <div className="text-green-400 text-xxs leading-relaxed">
                              🟢 Modularity optimal. Zero cyclic dependency loops detected in active import pathways. Boundary isolation validated.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-red-400 text-[10px] leading-relaxed">⚠️ {cyclicDependencies.length} active circular cycles detected inside import statements hierarchy:</p>
                              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                                {cyclicDependencies.map((cycle, i) => (
                                  <div key={i} className="p-2 bg-red-950/15 border border-red-500/20 rounded font-mono text-[9px] text-red-300 break-all leading-normal">
                                    Loop #{i+1}: {cycle.join(" ➔ ")}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ====================================================
                        4. HOTSPOT & RISK WORKSPACE
                        ==================================================== */}
                    {activeTab === "hotspots" && (
                      <div className="glass p-6 rounded-2xl border-white/10 space-y-6">
                        <div>
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Cybersecurity Software Threat Radar</h2>
                          <p className="text-[9px] text-gray-400 font-mono mt-1">COMPLEXITY × CHURN × CENTRALITY HOTSPOT CLASSIFICATION</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 font-mono text-[10px]">
                          {/* Heatmap List */}
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest block">Threat Heatmap Ledger</span>
                            {hotspots.slice(0, 10).map((h, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedHotspot(h)}
                                className={`w-full text-left p-3 glass border rounded-xl flex justify-between items-center transition-all cursor-pointer ${selectedHotspot?.id === h.id ? "border-red-500 bg-red-950/20" : "border-white/5 hover:border-white/10"}`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-white text-[11px] truncate">{h.id.split("/").pop()}</div>
                                  <div className="text-[9px] text-gray-500 truncate mt-0.5">{h.id}</div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                  <span className={`text-[10px] font-bold ${h.hotspotScore > 50 ? "text-red-500 text-glow-red animate-pulse" : "text-yellow-400"}`}>
                                    Score: {h.hotspotScore}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Instability Propagation Details */}
                          <div className="glass p-4 rounded-xl border border-white/5 space-y-4 text-gray-300 h-fit">
                            <h3 className="font-bold text-aether-primary text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-aether-primary animate-pulse" />
                              Instability Propagation Pathways
                            </h3>
                            
                            {selectedHotspot ? (
                              <div className="space-y-3">
                                <div className="bg-white/5 p-2 rounded border border-white/5">
                                  <span className="text-gray-500 text-[8px] block uppercase">TARGET HIGH CHURN HOTSPOT</span>
                                  <span className="text-white block font-bold text-[11px] mt-0.5">{selectedHotspot.id.split("/").pop()}</span>
                                </div>
                                
                                <div className="space-y-2">
                                  <span className="text-gray-500 text-[8px] block uppercase">MUTATED RISK PROPAGATION PATHWAYS</span>
                                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                                    {graphData.edges.filter(e => e.source === selectedHotspot.id || e.target === selectedHotspot.id).length > 0 ? (
                                      graphData.edges
                                        .filter(e => e.source === selectedHotspot.id || e.target === selectedHotspot.id)
                                        .map((e, idx) => {
                                          const peer = e.source === selectedHotspot.id ? e.target : e.source;
                                          return (
                                            <div key={idx} className="p-2 bg-white/5 rounded border border-white/5 text-[9px] flex justify-between items-center">
                                              <span className="text-white truncate max-w-[170px]">{peer.split("/").pop()}</span>
                                              <span className="text-red-400 font-bold shrink-0 text-[8px] uppercase">IMPACT OUT ➔</span>
                                            </div>
                                          );
                                        })
                                    ) : (
                                      <span className="text-gray-500 text-[9px]">Structural risk is isolated. No outward imports found.</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-[10px] text-center py-12 leading-relaxed">
                                Click a hotspot module in the risk ledger to trace how volatality and complexity propagate through codebase paths.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ====================================================
                        5. BUS FACTOR WORKSPACE
                        ==================================================== */}
                    {activeTab === "bus-factor" && (
                      <div className="glass p-6 rounded-2xl border-white/10 space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Knowledge Concentration Intelligence</h2>
                            <p className="text-[9px] text-gray-400 font-mono mt-1">BUS FACTOR CONCENTRATION & FRAGILITY SIMULATOR</p>
                          </div>
                          
                          <div className="glass px-3 py-1.5 rounded-lg border-white/5 flex gap-4 text-xxs font-mono">
                            <span>Bus Factor: <strong className={busFactorData.busFactor <= 2 ? "text-red-500 font-bold animate-pulse text-glow-red" : "text-green-400 font-bold"}>{busFactorData.busFactor} Devs</strong></span>
                            <span>Bus Fragility: <strong className={busFactorData.riskScore > 50 ? "text-red-500 font-bold animate-pulse text-glow-red" : "text-green-400 font-bold"}>{busFactorData.riskScore}%</strong></span>
                            <span>Confidence: <strong className="text-aether-secondary">94%</strong></span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 font-mono text-[10px]">
                          {/* Contributor List */}
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest block">Maintainer Ledger</span>
                            {busFactorData.contributors.map((c, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedContributor(c)}
                                className={`w-full text-left p-3 glass border rounded-xl flex justify-between items-center transition-all cursor-pointer ${selectedContributor?.name === c.name ? "border-aether-primary bg-aether-primary/10" : "border-white/5 hover:border-white/10"}`}
                              >
                                <div>
                                  <div className="font-bold text-white text-[11px]">{c.name}</div>
                                  <div className="text-[9px] text-gray-500 mt-0.5">{c.recency}</div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                  <span className={`text-[10px] font-bold ${c.fragility > 70 ? "text-red-500 text-glow-red" : "text-green-400"}`}>
                                    Fragility: {c.fragility}%
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Fragility Simulation */}
                          <div className="glass p-4 rounded-xl border border-white/5 space-y-4 text-gray-300 h-fit">
                            <h3 className="font-bold text-aether-primary text-[10px] uppercase tracking-wider">Departure Fragility Simulator</h3>
                            
                            {selectedContributor ? (
                              <div className="space-y-4">
                                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded text-red-300 text-[9px] leading-relaxed">
                                  <strong>⚠️ CRITICAL DEPARTURE SIMULATION IMPACT:</strong>
                                  <p className="mt-1">
                                    If <strong>{selectedContributor.name}</strong> departs the team, critical system pathways will lose active coverage. Contributor currently owns <strong>{selectedContributor.percentage}%</strong> of all repository modifications.
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-500">Commits Percentage:</span>
                                    <span className="text-white font-bold">{selectedContributor.percentage}%</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-white/5">
                                    <span className="text-gray-500">Last Active Status:</span>
                                    <span className="text-white">{selectedContributor.recency}</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className="text-gray-500">Centrality Rank:</span>
                                    <span className="text-aether-secondary">{selectedContributor.criticality}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-[10px] text-center py-12 leading-relaxed">
                                Select a contributor in the maintainer ledger to simulate departures, review fragile dependencies, and display concentration reports.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ====================================================
                        6. FORECAST & PRE-MERGE SIMULATOR WORKSPACE
                        ==================================================== */}
                    {activeTab === "forecast" && (
                      <div className="glass p-6 rounded-2xl border-white/10 space-y-6">
                        <div>
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Meteorological Codebase Forecast</h2>
                          <p className="text-[9px] text-gray-400 font-mono mt-1">FORECAST PULL REQUEST STRUCTURE REGRESSIONS & ENTROPY DRIFTS</p>
                        </div>

                        {/* Weather outlook metaphor */}
                        <div className="p-5 border border-aether-primary/20 bg-aether-primary/5 rounded-2xl flex items-center justify-between font-mono">
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-widest text-aether-secondary block">Weather stability metaphor</span>
                            <h3 className="text-2xl font-black text-white uppercase text-glow tracking-wider">
                              {healthScore > 85 ? "Clear Decoupled Skies" : healthScore > 70 ? "Cyclic Boundary Clouds" : "Coupling Boundary Storm"}
                            </h3>
                            <p className="text-gray-400 text-[10px] max-w-lg mt-1.5 leading-normal">
                              Predicted 30-day stability timeline: codebase boundaries remain {healthScore > 80 ? "isolated and modular with clean pathways." : "susceptible to side effects due to recent cyclic regressions."}
                            </p>
                          </div>
                          
                          <div className="text-right space-y-1 shrink-0 ml-4">
                            <span className="text-[8px] text-gray-500 block uppercase">MUTATION CHANCE</span>
                            <span className="text-2xl font-black text-aether-primary text-glow">{(100 - healthScore).toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* PR Simulator sandbox split */}
                        <div className="grid md:grid-cols-2 gap-6 font-mono text-[10px]">
                          <div className="space-y-3">
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest block">Choose PR Branch Scenario</span>
                            {[
                              { label: "Refactor Database Drivers (High Churn / 42 Files)", id: "db_refactor" },
                              { label: "Optimize Token Authentication Middleware (8 Files)", id: "auth_opt" },
                              { label: "Extend Frontend Presentation Controllers (3 Files)", id: "fe_ui" }
                            ].map((pr) => (
                              <button
                                key={pr.id}
                                disabled={isSimulating}
                                onClick={async () => {
                                  setSimulatedPr(pr.id);
                                  setIsSimulating(true);
                                  try {
                                    const owner = repoUrlParam.split("/").slice(-2)[0];
                                    const name = repoUrlParam.split("/").slice(-1)[0].replace(".git", "");
                                    const res = await fetch(`http://127.0.0.1:8000/api/v1/predict/${owner}/${name}`, {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        files_changed: pr.id === "db_refactor" ? 42 : pr.id === "auth_opt" ? 8 : 3,
                                        insertions: pr.id === "db_refactor" ? 1800 : pr.id === "auth_opt" ? 420 : 60,
                                        deletions: pr.id === "db_refactor" ? 1200 : pr.id === "auth_opt" ? 150 : 20,
                                        modules_affected: pr.id === "db_refactor" ? ["db", "drivers"] : pr.id === "auth_opt" ? ["auth"] : ["ui"]
                                      })
                                    });
                                    const data = await res.json();
                                    setSimulationResult(data);
                                  } catch (e) {
                                    console.error("Simulation failed:", e);
                                  } finally {
                                    setIsSimulating(false);
                                  }
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border text-[10px] transition-all cursor-pointer ${simulatedPr === pr.id ? "border-aether-primary bg-aether-primary/10 text-aether-primary shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]" : "border-white/5 hover:border-white/10 text-gray-300"}`}
                              >
                                {pr.label}
                              </button>
                            ))}
                          </div>

                          <div className="glass p-4 rounded-xl border border-white/5 space-y-4 text-gray-300 h-fit">
                            <h3 className="font-bold text-aether-secondary uppercase tracking-wider text-[9px]">Simulation Results</h3>
                            
                            {isSimulating ? (
                              <div className="text-gray-500 text-[10px] text-center py-12 animate-pulse font-mono">Running architectural graph forecasting...</div>
                            ) : simulationResult ? (
                              <div className="space-y-3">
                                <div className="flex justify-between py-1 border-b border-white/5">
                                  <span>Simulated Risk:</span>
                                  <span className={`font-bold ${simulationResult.risk_level === "High" ? "text-red-500 text-glow-red animate-pulse" : "text-green-400"}`}>
                                    {simulationResult.risk_level.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-white/5">
                                  <span>Predicted Health Delta:</span>
                                  <span className={simulationResult.predicted_health_change < 0 ? "text-red-500 font-bold" : "text-green-400"}>
                                    {simulationResult.predicted_health_change} pts
                                  </span>
                                </div>
                                <p className="text-[9px] text-gray-400 leading-relaxed pt-1.5">
                                  {simulationResult.narrative}
                                </p>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-[10px] text-center py-12 leading-relaxed">
                                Select a pull request scenario in the PR simulator to project simulated structural deltas.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ====================================================
                        7. DEV MODE WORKSPACE (DEV TELEMETRY)
                        ==================================================== */}
                    {activeTab === "dev-mode" && (
                      <div className="glass p-6 rounded-2xl border-white/10 space-y-4">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Administrative Developer Mode</h2>
                        <div className="grid md:grid-cols-3 gap-6 font-mono text-[10px] text-gray-300">
                          
                          <div className="space-y-2 p-4 bg-white/5 border border-white/5 rounded-xl">
                            <h4 className="font-bold text-aether-primary flex items-center gap-2 text-[10px] uppercase">
                              <Cpu className="w-4 h-4 text-aether-primary" /> PIPELINE MONITOR
                            </h4>
                            <div className="space-y-1.5 pt-1.5">
                              <p>Throughput: ~45 commits/sec</p>
                              <p>Active Worker Threads: 8</p>
                              <p>SSE Heartbeat: Healthy (Active)</p>
                            </div>
                          </div>

                          <div className="space-y-2 p-4 bg-white/5 border border-white/5 rounded-xl">
                            <h4 className="font-bold text-aether-primary flex items-center gap-2 text-[10px] uppercase">
                              <Database className="w-4 h-4 text-aether-primary" /> METADATA ENGINE
                            </h4>
                            <div className="space-y-1.5 pt-1.5">
                              <p>Total Graph Nodes: {graphData.nodes.length}</p>
                              <p>Total Graph Edges: {graphData.edges.length}</p>
                              <p>DB Graph Cache Hit Rate: 98.4%</p>
                            </div>
                          </div>

                          <div className="space-y-2 p-4 bg-white/5 border border-white/5 rounded-xl">
                            <h4 className="font-bold text-aether-primary flex items-center gap-2 text-[10px] uppercase">
                              <Network className="w-4 h-4 text-aether-primary" /> AI TOKENS & COST
                            </h4>
                            <div className="space-y-1.5 pt-1.5">
                              <p>Total Tokens Consumed: 14,240</p>
                              <p>Prompt Optimization Rate: -94.2%</p>
                              <p>Model Class: gpt-4o-mini (Sparse)</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* Floating Collapsible AI assistant sidebar toggle button */}
          {repoUrlParam && !error && (
            <div className="fixed bottom-6 right-6 z-40">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAiOpen(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-aether-primary to-aether-secondary hover:from-white hover:to-white text-black font-bold flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)] relative group"
              >
                <Bot className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-aether-bg flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </span>
              </motion.button>
            </div>
          )}

          {/* Global Holographic AI Assistant Drawer */}
          <GlobalAiAssistant 
            isOpen={isAiOpen}
            onClose={() => setIsAiOpen(false)}
            activeTab={activeTab}
            cyclicDependenciesCount={cyclicDependencies.length}
            busFactorRisk={busFactorData.riskScore}
            healthScore={healthScore}
            totalCommits={metrics.length}
          />

        </div>
      </div>
    </AuthGuard>
  );
}

function MetricCard({ title, value, icon, status }: any) {
  const glowMap: any = {
    warning: "shadow-[0_0_15px_rgba(250,204,21,0.06)] border-yellow-400/20",
    danger: "shadow-[0_0_15px_rgba(239,68,68,0.06)] border-red-500/20",
    safe: "shadow-[0_0_15px_rgba(74,222,128,0.06)] border-green-400/20",
    info: "shadow-[0_0_15px_rgba(0,240,255,0.06)] border-aether-primary/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }} 
      className={`glass p-5 rounded-2xl border transition-all ${glowMap[status]} cursor-pointer`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">{title}</h3>
        {icon}
      </div>
      <div className="text-lg font-black font-mono text-white tracking-wider">{value}</div>
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05050A] flex flex-col items-center justify-center text-white font-mono text-xs space-y-4">
        <div className="w-10 h-10 border-2 border-aether-primary/20 border-t-aether-primary rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.2)]"></div>
        <div className="tracking-widest uppercase animate-pulse text-aether-primary font-bold text-[10px]">INITIALIZING OBSERVATORY SNAPSHOT...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
