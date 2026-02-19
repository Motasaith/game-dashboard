"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ConnectFourBoard from "@/components/games/connect-four/ConnectFourBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Connect 4 discs of your color in a row: horizontally, vertically, or diagonally.",
        color: "text-blue-400"
    },
    {
        title: "2. The Drop",
        text: "Take turns dropping one disc into any of the 7 columns. Gravity pulls it down.",
        color: "text-cyan-400"
    },
    {
        title: "3. Winning",
        text: "Be the first to align 4 discs. Block your opponent from doing the same!",
        color: "text-white"
    }
];

export default function ConnectFourPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5" />

                {/* Game Area */}
                <div className="z-10 w-full max-w-4xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <ConnectFourBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="CONNECT FOUR"
                subtitle="Drop • Connect • Win"
                gradient="from-blue-500 to-cyan-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    setIsPlaying(true);
                }}
            />
        </div>
    );
}
