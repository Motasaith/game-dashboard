"use client";

import { useState } from 'react';
import RotaBoard from '@/components/games/rota/RotaBoard';
import RotaLobby from '@/components/games/rota/RotaLobby';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GameRoom() {
    const router = useRouter();
    const user = { username: "BinaPlayer", _id: "mock_user_1" };

    // Game State
    const [gameMode, setGameMode] = useState<'cpu' | 'online' | null>(null);
    const [status, setStatus] = useState<string>('idle');
    const [gameState, setGameState] = useState<any>(null);
    const [winner, setWinner] = useState<string | null>(null);

    const handleSelectMode = (mode: 'cpu' | 'online' | 'create_private') => {
        if (mode === 'cpu') {
            setGameMode('cpu');
            setStatus('playing');
        } else {
            console.log("Online mode not yet implemented in migration.");
        }
    };

    const handleJoinPrivate = (code: string) => {
        console.log("Join private not implemented.");
    };

    const handleLeaveMatchClick = () => {
        if (confirm("Are you sure you want to leave?")) {
            setStatus('idle');
            setGameMode(null);
            setGameState(null);
            setWinner(null);
        }
    };

    // 1. Lobby
    if (!gameMode) {
        return <RotaLobby onSelectMode={handleSelectMode} onJoinPrivate={handleJoinPrivate} />;
    }

    // 2. Game Board
    const isMyTurn = gameState?.turn === 'player'; // CPU Mode assumption

    return (
        <div className="min-h-full flex flex-col p-2 md:p-4 overflow-y-auto relative h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 md:mb-8 bg-slate-900/50 p-2 md:p-4 rounded-xl border border-slate-800 text-sm md:text-base">
                <div className={`flex items-center gap-2 md:gap-3 transition-opacity ${isMyTurn ? 'opacity-100' : 'opacity-50'} flex-1 min-w-0`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${isMyTurn ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_#06b6d4]' : 'bg-cyan-900/50 text-cyan-400 border-cyan-500/30'}`}>
                        <span className="font-bold text-[10px] md:text-base">YOU</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white truncate text-xs md:text-base">{user.username}</p>
                        <p className="text-[10px] md:text-xs text-slate-400 truncate">X</p>
                    </div>
                </div>

                <div className="flex flex-col items-center px-2 md:px-4 flex-shrink-0">
                    <div className="text-lg md:text-2xl font-black text-slate-700">VS</div>
                    {status === 'playing' && !winner && (
                        <div className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-full mt-1 whitespace-nowrap ${isMyTurn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isMyTurn ? "YOUR TURN" : "OPPONENT"}
                        </div>
                    )}
                </div>

                <div className={`flex items-center justify-end gap-2 md:gap-3 text-right transition-opacity ${!isMyTurn ? 'opacity-100' : 'opacity-50'} flex-1 min-w-0`}>
                    <div className="min-w-0">
                        <p className="font-bold text-white truncate text-xs md:text-base">System AI</p>
                        <p className="text-[10px] md:text-xs text-slate-400 truncate">Lvl 1</p>
                    </div>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${!isMyTurn ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_#a855f7]' : 'bg-purple-900/50 text-purple-400 border-purple-500/30'}`}>
                        <span className="font-bold text-[10px] md:text-base">OPP</span>
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div className="flex-1 flex items-center justify-center w-full relative">
                <RotaBoard
                    key={gameMode}
                    mode={gameMode}
                    gameState={gameState}
                    playerId={user._id}
                    onStateChange={(localState) => {
                        setGameState(localState);
                    }}
                    onGameOver={(w) => {
                        setWinner(w);
                        setStatus('game_over');
                    }}
                />
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-center">
                {(status === 'playing' || status === 'game_over') && (
                    <button
                        onClick={handleLeaveMatchClick}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-bold"
                    >
                        <LogOut className="w-4 h-4" />
                        {status === 'game_over' ? 'Return to Lobby' : 'Leave Match'}
                    </button>
                )}
            </div>
        </div>
    );
};
