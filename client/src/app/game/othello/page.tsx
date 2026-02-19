"use client";

import { useState } from 'react';
import OthelloBoard from '@/components/games/othello/OthelloBoard';
import GameLobby, { RuleSection } from '@/components/games/GameLobby';

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Have the majority of disks on the board in your color (Black) by the end of the game.",
        color: "text-emerald-400"
    },
    {
        title: "2. Flanking",
        text: "Place your disk to 'sandwich' opponent's disks between two of yours (horizontal, vertical, or diagonal).",
        color: "text-cyan-400"
    },
    {
        title: "3. Flipping",
        text: "All sandwiched disks are flipped to your color. If you can't make a move that flips at least one disk, you pass.",
        color: "text-slate-300"
    }
];

export default function OthelloPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-5xl">
                    <OthelloBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <GameLobby
                title="OTHELLO"
                subtitle="A Minute to Learn... A Lifetime to Master"
                gradient="from-emerald-400 to-cyan-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    setIsPlaying(true);
                }}
            />
        </div>
    );
}
