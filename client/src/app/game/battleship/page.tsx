"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import BattleshipBoard from "@/components/games/battleship/BattleshipBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Deploy", text: "Your fleet is auto-deployed on a 10×10 grid. 5 ships hidden beneath the waves.", color: "text-blue-400" },
    { title: "2. Fire", text: "Click on the enemy grid to fire. Hits are marked red, misses are dots. Sink all 5 ships to win!", color: "text-red-400" },
    { title: "3. Survive", text: "The CPU fires back each turn. Protect your fleet and destroy theirs first!", color: "text-white" }
];

export default function BattleshipPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-5xl relative">
                    <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <BattleshipBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="BATTLESHIP" subtitle="Deploy • Fire • Sink" gradient="from-blue-400 to-cyan-500" rules={RULES} onSelectMode={(mode) => { if (mode === 'cpu') setIsPlaying(true); }} />
        </div>
    );
}
