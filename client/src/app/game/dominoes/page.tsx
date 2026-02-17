"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import DominoesBoard from "@/components/games/dominoes/DominoesBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Match Ends", text: "Play a tile by matching one of its numbers with an end of the chain.", color: "text-cyan-400" },
    { title: "2. Draw", text: "If you can't play, draw from the boneyard. If empty, you pass your turn.", color: "text-amber-400" },
    { title: "3. Win", text: "Be the first to play all your tiles! If both players can't move, lowest pip count wins.", color: "text-white" }
];

export default function DominoesPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    if (isPlaying) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),transparent_70%)]" />
            <div className="z-10 w-full max-w-3xl relative">
                <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <DominoesBoard />
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="DOMINOES" subtitle="Match • Chain • Dominate" gradient="from-cyan-400 to-teal-500" rules={RULES} onSelectMode={(mode) => { if (mode === 'cpu') setIsPlaying(true); }} />
        </div>
    );
}
