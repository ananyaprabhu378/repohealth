"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity, GitBranch, ShieldAlert } from "lucide-react";
import Link from "next/link";
import CodeGalaxy from "../components/CodeGalaxy";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aether-primary to-aether-secondary shadow-[0_0_15px_rgba(0,255,200,0.5)] flex items-center justify-center">
            <span className="text-black font-black text-xl tracking-tighter">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AetherGraph</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/register" className="text-sm font-bold text-black bg-white px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 pt-20">
        
        {/* 3D Code Galaxy Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          <CodeGalaxy />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-aether-primary/30 bg-aether-primary/10 text-aether-primary text-sm font-medium mb-4 glow-primary"
          >
            <span className="w-2 h-2 rounded-full bg-aether-primary animate-pulse"></span>
            Temporal Intelligence Engine v1.0
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tight"
          >
            See how software evolves <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aether-primary to-aether-secondary text-glow">
              before it breaks.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Ingest repositories, build temporal knowledge graphs, and predict engineering risk with our futuristic AI observatory.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-6 pt-8"
          >
            <Link href="/dashboard" className="px-8 py-4 rounded-lg bg-aether-primary text-black font-bold text-lg hover:bg-white transition-colors glow-primary flex items-center gap-2 group">
              Analyze Repository
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard" className="px-8 py-4 rounded-lg glass font-bold text-lg hover:bg-white/5 transition-colors border border-white/10">
              View Demo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Core Capabilities</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Beyond simple analytics. Real temporal intelligence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity className="w-8 h-8 text-aether-primary" />}
              title="Repository Health Engine"
              description="Historical analysis of complexity trends, dependency instability, and structural coupling across every commit."
            />
            <FeatureCard 
              icon={<GitBranch className="w-8 h-8 text-aether-secondary" />}
              title="Temporal Knowledge Graph"
              description="3D interactive visualization of module dependencies and co-change relationships over time."
            />
            <FeatureCard 
              icon={<ShieldAlert className="w-8 h-8 text-red-500" />}
              title="Pre-Merge Prediction"
              description="Identify architectural drift, high churn risk, and bus factor concentrations before the PR is merged."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-8 rounded-2xl space-y-6 relative overflow-hidden group border border-white/5 hover:border-aether-primary/50 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-aether-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
