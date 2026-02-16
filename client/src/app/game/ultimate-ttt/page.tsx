"use client";

import { useState } from 'react';
import UltimateBoard from '@/components/games/ultimate-ttt/UltimateBoard';
import GameLobby, { RuleSection } from '@/components/games/GameLobby';

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Win three small boards in a row (horizontally, vertically, or diagonally) to win the giant board.",
        color: "text-purple-400"
    },
    {
        title: "2. The Twist",
        text: "Your move's position in a small board determines which small board your opponent MUST play in next.",
        color: "text-pink-400"
    },
    {
        title: "3. Strategy",
        text: "Don't just focus on one small board. Plan your moves to send your opponent to boards they can't win.",
        color: "text-cyan-400"
    }
];

export default function UltimatePage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-5xl">
                    <UltimateBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <GameLobby
                title="ULTIMATE TIC-TAC-TOE"
                subtitle="Recursive Strategy • Think 9 Steps Ahead"
                gradient="from-purple-400 to-pink-600"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
