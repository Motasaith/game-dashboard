"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import GomokuBoard from "@/components/games/gomoku/GomokuBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Place Stones", text: "You play Black, CPU plays White. Click any intersection to place your stone.", color: "text-slate-300" },
    { title: "2. Five in a Row", text: "Get exactly 5 stones in a row (horizontal, vertical, or diagonal) to win.", color: "text-purple-400" },
    { title: "3. Strategy", text: "Block the opponent's lines while building your own. Think two moves ahead!", color: "text-white" }
];

export default function GomokuPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-3xl relative">
                    <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <GomokuBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="GOMOKU" subtitle="Five in a Row • Pure Strategy" gradient="from-purple-400 to-indigo-500" rules={RULES} onSelectMode={(mode) => { if (mode === 'cpu') setIsPlaying(true); }} />
        </div>
    );
}
