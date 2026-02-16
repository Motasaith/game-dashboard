"use client";

import { useState } from 'react';
import MorrisBoard from '@/components/games/morris/MorrisBoard';
import GameLobby, { RuleSection } from '@/components/games/GameLobby';

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Form 'Mills' by aligning 3 pieces. Each Mill allows you to remove one of your opponent's pieces.",
        color: "text-cyan-400"
    },
    {
        title: "2. The Phases",
        text: (
            <ul className="space-y-1">
                <li><strong className="text-white">Placing:</strong> Place pieces on empty spots.</li>
                <li><strong className="text-white">Moving:</strong> Slide pieces to adjacent spots.</li>
                <li><strong className="text-white">Flying:</strong> When 3 pieces left, fly anywhere.</li>
            </ul>
        ),
        color: "text-purple-400"
    },
    {
        title: "3. Winning",
        text: "Reduce your opponent to 2 pieces OR block them from making any moves.",
        color: "text-red-400"
    }
];

export default function MorrisPage() {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                {/* Simplified Header for In-Game (optional, or rely on internal board header) */}
                <div className="w-full max-w-5xl">
                    <MorrisBoard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <GameLobby
                title="NINE MEN'S MORRIS"
                subtitle="Ancient Strategy • Form Mills • Capture Enemies"
                gradient="from-cyan-400 to-blue-600"
                rules={RULES}
                onSelectMode={(mode) => {
                    if (mode === 'cpu') setIsPlaying(true);
                }}
            />
        </div>
    );
}
