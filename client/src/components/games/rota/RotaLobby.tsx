"use client";

import React from 'react';
import GameLobby, { RuleSection } from '../GameLobby';

interface RotaLobbyProps {
    onSelectMode: (mode: 'cpu' | 'online' | 'create_private') => void;
    onJoinPrivate: (code: string) => void;
}

const RULES: RuleSection[] = [
    {
        title: "1. The Goal",
        text: "Get 3 of your pieces in a row. You can win by forming a line through the center (Diameter) or along the edge (Arc).",
        color: "text-cyan-400"
    },
    {
        title: "2. The Phases",
        text: (
            <ul className="space-y-1">
                <li><strong className="text-white">Placing:</strong> Take turns placing 3 pieces each on any empty spot.</li>
                <li><strong className="text-white">Moving:</strong> Once all pieces are placed, take turns moving one piece to an adjacent spot.</li>
            </ul>
        ),
        color: "text-purple-400"
    },
    {
        title: "3. Win & Loss",
        text: (
            <ul className="space-y-1">
                <li><strong className="text-green-400">Victory:</strong> Form a line of 3.</li>
                <li><strong className="text-red-500">Defeat:</strong> Get trapped with no valid moves available.</li>
            </ul>
        ),
        color: "text-red-400"
    }
];

const RotaLobby: React.FC<RotaLobbyProps> = ({ onSelectMode }) => {
    return (
        <GameLobby
            title="ROTA"
            subtitle="Select your battlefield"
            gradient="from-cyan-400 to-blue-600"
            rules={RULES}
            onSelectMode={(mode) => {
                if (mode === 'cpu') onSelectMode('cpu');
                // other modes treated as cpu for now or ignored until implemented in GameLobby
            }}
        />
    );
};

export default RotaLobby;
