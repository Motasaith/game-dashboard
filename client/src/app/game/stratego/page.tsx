"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import StrategoBoard from "@/components/games/stratego/StrategoBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Hidden Armies", text: "Your pieces are visible; enemy pieces are hidden until combat reveals them.", color: "text-red-400" },
    { title: "2. Combat", text: "Higher rank wins. Special: Spy beats Marshal, Miner defuses Bombs. Equal ranks destroy each other.", color: "text-amber-400" },
    { title: "3. Capture the Flag", text: "Find and capture the enemy's flag to win! Bombs and Flags cannot move.", color: "text-green-400" }
];

export default function StrategoPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    if (isPlaying) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.06),transparent_70%)]" />
            <div className="z-10 w-full max-w-3xl relative">
                <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <StrategoBoard />
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="STRATEGO" subtitle="Deploy • Attack • Capture" gradient="from-red-400 to-rose-600" rules={RULES} onSelectMode={(mode) => { if (mode === 'cpu') setIsPlaying(true); }} />
        </div>
    );
}
