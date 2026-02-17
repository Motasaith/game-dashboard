"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import TicTacToeBoard from "@/components/games/tic-tac-toe/TicTacToeBoard";
import GameLobby, { RuleSection } from "@/components/games/GameLobby";

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Get three of your marks (X) in a horizontal, vertical, or diagonal row.",
        color: "text-cyan-400"
    },
    {
        title: "2. Turns",
        text: "You play as X and go first. The CPU plays as O. Take turns placing marks on empty cells.",
        color: "text-blue-400"
    },
    {
        title: "3. Win or Draw",
        text: "First to get 3 in a row wins. If all 9 cells are filled with no winner, it's a draw!",
        color: "text-white"
    }
];

export default function TicTacToePage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),transparent_70%)]" />
                <div className="z-10 w-full max-w-4xl relative">
                    <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute top-0 left-0 -mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Lobby
                    </button>
                    <TicTacToeBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <GameLobby
                title="TIC-TAC-TOE"
                subtitle="The Classic X & O Battle"
                gradient="from-cyan-400 to-blue-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
