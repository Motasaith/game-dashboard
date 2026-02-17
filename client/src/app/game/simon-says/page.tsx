"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import SimonSaysBoard from "@/components/games/simon-says/SimonSaysBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. Watch",
        text: "Simon will flash a sequence of colors. Pay close attention and remember the order!",
        color: "text-green-400"
    },
    {
        title: "2. Repeat",
        text: "After the sequence plays, tap the colored pads in the exact same order.",
        color: "text-blue-400"
    },
    {
        title: "3. Survive",
        text: "Each round adds one more color to the sequence. One wrong tap and it's game over!",
        color: "text-red-400"
    }
];

export default function SimonSaysPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-4xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <SimonSaysBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="SIMON SAYS"
                subtitle="Watch • Remember • Repeat"
                gradient="from-green-400 to-emerald-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
