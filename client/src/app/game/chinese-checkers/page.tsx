"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ChineseCheckersBoard from "@/components/games/chinese-checkers/ChineseCheckersBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Move", text: "Move one piece per turn. Step to an adjacent empty cell, or hop over a neighboring piece.", color: "text-red-400" },
    { title: "2. Chain Hops", text: "You can chain multiple hops in a single turn — each hop jumps over one piece to an empty cell.", color: "text-blue-400" },
    { title: "3. Win", text: "Be the first to move all your pieces from your triangle to the opposite triangle!", color: "text-green-400" }
];

export default function ChineseCheckersPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-3xl relative">
                    <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <ChineseCheckersBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="CHINESE CHECKERS" subtitle="Hop • Chain • Race" gradient="from-red-400 to-pink-500" rules={RULES} onSelectMode={(mode) => { setIsPlaying(true); }} />
        </div>
    );
}
