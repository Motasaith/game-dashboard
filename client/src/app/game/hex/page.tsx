"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import HexBoard from "@/components/games/hex/HexBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Claim", text: "Click an empty hex cell to place your stone. You are Red, CPU is Blue.", color: "text-red-400" },
    { title: "2. Connect", text: "Red connects the left and right edges. Blue connects the top and bottom edges.", color: "text-blue-400" },
    { title: "3. Strategy", text: "There are no draws in Hex! Block your opponent while building your connection.", color: "text-white" }
];

export default function HexPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    if (isPlaying) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08),transparent_70%)]" />
            <div className="z-10 w-full max-w-3xl relative">
                <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <HexBoard />
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="HEX" subtitle="Connect • Block • Conquer" gradient="from-red-400 to-orange-500" rules={RULES} onSelectMode={(mode) => { if (mode === 'cpu') setIsPlaying(true); }} />
        </div>
    );
}
