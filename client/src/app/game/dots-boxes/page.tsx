"use client";

import { useState } from 'react';
import DotsBoard from '@/components/games/dots-boxes/DotsBoard';
import GameLobby, { RuleSection } from '@/components/games/GameLobby';

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Connect dots to form boxes. The player who closes the most boxes wins.",
        color: "text-pink-400"
    },
    {
        title: "2. Drawing Lines",
        text: "Take turns drawing one horizontal or vertical line between two adjacent dots.",
        color: "text-rose-400"
    },
    {
        title: "3. Extra Turn",
        text: "If your line completes a box (4th side), you capture it and get another turn!",
        color: "text-white"
    }
];

export default function DotsPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-5xl flex flex-col items-center">
                    <DotsBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <GameLobby
                title="DOTS & BOXES"
                subtitle="Connect Dots • Close Boxes • Claim Territory"
                gradient="from-pink-500 to-rose-500"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
