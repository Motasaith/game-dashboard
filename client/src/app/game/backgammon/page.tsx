"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import BackgammonBoard from "@/components/games/backgammon/BackgammonBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Roll & Move", text: "Roll dice and move your checkers (White) toward your home board. Use each die value separately.", color: "text-amber-400" },
    { title: "2. Hit & Bar", text: "Land on a point with 1 opponent piece to send it to the bar. Blocked points (2+) are safe.", color: "text-red-400" },
    { title: "3. Bear Off", text: "Once all your pieces are in your home board, start bearing them off. First to remove all 15 wins!", color: "text-green-400" }
];

export default function BackgammonPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-4xl relative">
                    <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <BackgammonBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="BACKGAMMON" subtitle="Roll • Move • Bear Off" gradient="from-amber-400 to-yellow-500" rules={RULES} onSelectMode={(mode) => { setIsPlaying(true); }} />
        </div>
    );
}
