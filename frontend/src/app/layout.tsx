import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AetherGraph - Temporal Intelligence Engine",
  description: "Futuristic repository intelligence system predicting engineering risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-aether-bg text-white min-h-screen relative`}>
        {/* Animated Background Grid */}
        <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Subtle glowing orbs */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-aether-primary opacity-[0.15] blur-[100px] z-[-1]"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-aether-secondary opacity-[0.15] blur-[100px] z-[-1]"></div>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 glass border-b border-aether-border/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-aether-primary to-aether-secondary flex items-center justify-center">
                <span className="font-bold text-black text-xl">A</span>
              </div>
              <span className="font-bold tracking-widest text-lg">AETHERGRAPH</span>
            </div>
            <div className="flex gap-6 text-sm font-medium text-gray-300">
              <a href="#features" className="hover:text-aether-primary transition-colors">Platform</a>
              <a href="#analysis" className="hover:text-aether-primary transition-colors">Observatory</a>
            </div>
          </div>
        </nav>

        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
