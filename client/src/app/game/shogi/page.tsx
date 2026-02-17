"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ShogiBoard from "@/components/games/shogi/ShogiBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Move Pieces", text: "Each piece moves differently — similar to chess but on a 9×9 board. Captured pieces can be re-deployed!", color: "text-amber-400" },
    { title: "2. Promotion", text: "Most pieces promote when entering the last 3 rows. Promoted pieces gain new movement abilities.", color: "text-red-400" },
    { title: "3. Drop Rule", text: "Captured pieces join your hand. Drop them onto any valid empty cell on your turn — a unique Shogi mechanic!", color: "text-cyan-400" }
];

export default function ShogiPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    if (isPlaying) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.06),transparent_70%)]" />
            <div className="z-10 w-full max-w-3xl relative">
                <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <ShogiBoard />
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="SHOGI" subtitle="Japanese Chess • Drop & Promote" gradient="from-amber-400 to-red-500" rules={RULES} onSelectMode={(mode) => { if (mode === 'cpu') setIsPlaying(true); }} />
        </div>
    );
}
