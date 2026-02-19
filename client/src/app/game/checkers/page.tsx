"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import CheckersBoard from "@/components/games/checkers/CheckersBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Capture all opponent pieces or block them so they cannot move.",
        color: "text-red-400"
    },
    {
        title: "2. Movement",
        text: "Move diagonally forward one step. If you can jump an opponent's piece, you MUST take the capture!",
        color: "text-orange-400"
    },
    {
        title: "3. Kings",
        text: "Reach the far end of the board to become a King. Kings can move and jump backwards.",
        color: "text-white"
    }
];

export default function CheckersPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5" />

                {/* Game Area */}
                <div className="z-10 w-full max-w-4xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <CheckersBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="CHECKERS"
                subtitle="Jump • Capture • King Me"
                gradient="from-red-500 to-orange-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    setIsPlaying(true);
                }}
            />
        </div>
    );
}
