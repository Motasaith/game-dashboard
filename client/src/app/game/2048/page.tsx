"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Game2048Board from "@/components/games/2048/Game2048Board";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. Slide Tiles",
        text: "Use arrow keys (desktop) or swipe (mobile) to slide all tiles in one direction.",
        color: "text-amber-400"
    },
    {
        title: "2. Merge",
        text: "When two tiles with the same number collide, they merge into one tile with double the value!",
        color: "text-orange-400"
    },
    {
        title: "3. Reach 2048",
        text: "Keep merging tiles to create the elusive 2048 tile. The game ends when no more moves are possible.",
        color: "text-cyan-400"
    }
];

export default function Game2048Page() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-4xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <Game2048Board />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="2048"
                subtitle="Slide • Merge • Conquer"
                gradient="from-amber-400 to-orange-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
