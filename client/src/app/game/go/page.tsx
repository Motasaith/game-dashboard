"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import GoBoard from "@/components/games/go/GoBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    { title: "1. Place Stones", text: "Click an intersection to place your stone (Black). Surround opponent stones to capture them.", color: "text-slate-300" },
    { title: "2. Liberties", text: "A stone's liberties are its empty adjacent points. A group with zero liberties is captured!", color: "text-amber-400" },
    { title: "3. Territory", text: "Control more territory than your opponent. Pass when you have no beneficial moves. Two passes end the game.", color: "text-white" }
];

export default function GoPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    if (isPlaying) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(180,140,60,0.08),transparent_70%)]" />
            <div className="z-10 w-full max-w-3xl relative">
                <button onClick={() => setIsPlaying(false)} className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                <GoBoard />
            </div>
        </div>
    );
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby title="GO (9×9)" subtitle="Surround • Capture • Control" gradient="from-amber-400 to-yellow-600" rules={RULES} onSelectMode={(mode) => { setIsPlaying(true); }} />
        </div>
    );
}
