"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ChessBoard from "@/components/games/chess/ChessBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Checkmate the opponent's King (put it in check with no escape).",
        color: "text-green-400"
    },
    {
        title: "2. Movement",
        text: "Pawns move forward, Knights jump, Bishops diagonal, Rooks straight, Queens both.",
        color: "text-emerald-400"
    },
    {
        title: "3. Strategy",
        text: "Control the center, develop your pieces, and protect your King!",
        color: "text-white"
    }
];

export default function ChessPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,163,74,0.1),transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-5" />

                {/* Game Area */}
                <div className="z-10 w-full max-w-4xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <ChessBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="CHESS"
                subtitle="Strategy • Tactics • Checkmate"
                gradient="from-green-500 to-emerald-600"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
