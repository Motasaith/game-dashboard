"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import MancalaBoard from "@/components/games/mancala/MancalaBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Collect the most seeds in your store (the large cup on your right).",
        color: "text-amber-400"
    },
    {
        title: "2. Sowing",
        text: "Pick up all seeds from a pit and sow them one by one counter-clockwise.",
        color: "text-yellow-400"
    },
    {
        title: "3. Special Moves",
        text: "Land in your store for an extra turn. Land in an empty pit on your side to capture opposite seeds!",
        color: "text-white"
    }
];

export default function MancalaPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5" />

                {/* Game Area */}
                <div className="z-10 w-full max-w-5xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <MancalaBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="MANCALA"
                subtitle="Sow Seeds • Capture Stores • Count Carefully"
                gradient="from-amber-500 to-yellow-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    setIsPlaying(true);
                }}
            />
        </div>
    );
}
