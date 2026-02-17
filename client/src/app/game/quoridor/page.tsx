"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import QuoridorBoard from "@/components/games/quoridor/QuoridorBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Move or Wall", text: "Each turn, either move your pawn one cell or place a wall to block your opponent.", color: "text-green-400" },
    { title: "2. Walls", text: "Walls are 2 cells long. You have 10 walls. Walls can't completely cut off any player's path.", color: "text-amber-400" },
    { title: "3. Win", text: "Race your pawn to the opposite edge. You can jump over the opponent when adjacent!", color: "text-white" }
];

export default function QuoridorPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    if (isPlaying) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.08),transparent_70%)]" />
            <div className="z-10 w-full max-w-3xl relative">
                <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <QuoridorBoard />
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="QUORIDOR" subtitle="Move • Block • Outrun" gradient="from-green-400 to-emerald-500" rules={RULES} onSelectMode={(mode) => { if (mode === 'cpu') setIsPlaying(true); }} />
        </div>
    );
}
