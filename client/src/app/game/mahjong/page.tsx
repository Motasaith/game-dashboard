"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import MahjongBoard from "@/components/games/mahjong/MahjongBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Find Pairs", text: "Click two matching tiles to remove them. Tiles must have the same suit and value.", color: "text-cyan-400" },
    { title: "2. Free Tiles Only", text: "A tile is free if it's not covered by another tile from above AND has at least one open side (left or right).", color: "text-amber-400" },
    { title: "3. Clear the Board", text: "Remove all tiles to win! Use the Hint button if you're stuck.", color: "text-white" }
];

export default function MahjongPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    if (isPlaying) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),transparent_70%)]" />
            <div className="z-10 w-full max-w-4xl relative">
                <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <MahjongBoard />
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="MAHJONG SOLITAIRE" subtitle="Match • Clear • Meditate" gradient="from-cyan-400 to-teal-500" rules={RULES} onSelectMode={(mode) => { setIsPlaying(true); }} />
        </div>
    );
}
