"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import LightsOutBoard from "@/components/games/lights-out/LightsOutBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. Toggle",
        text: "Tap any light to toggle it and all adjacent lights (up, down, left, right).",
        color: "text-amber-400"
    },
    {
        title: "2. Goal",
        text: "Turn ALL lights off to complete the level. It's a logic puzzle — think before you tap!",
        color: "text-purple-400"
    },
    {
        title: "3. Progress",
        text: "Each level gets harder with more lights to turn off. Try to solve it in the fewest moves!",
        color: "text-white"
    }
];

export default function LightsOutPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-4xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <LightsOutBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="LIGHTS OUT"
                subtitle="Toggle • Think • Solve"
                gradient="from-purple-400 to-pink-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
