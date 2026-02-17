"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, initializeGame, playerFire, cpuFire, GRID_SIZE } from '@/lib/battleshipLogic';
import GameOverModal from '@/components/games/GameOverModal';

const COLS = 'ABCDEFGHIJ'.split('');

function CellIcon({ state }: { state: string }) {
    if (state === 'hit') return <span className="text-red-500 text-lg font-black">✕</span>;
    if (state === 'miss') return <span className="text-slate-600 text-sm">•</span>;
    if (state === 'sunk') return <span className="text-orange-500 text-lg font-black">✕</span>;
    return null;
}

export default function BattleshipBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const { playerBoard, cpuBoard, playerTurn, phase, winner, message } = gameState;

    // CPU auto-fire
    useEffect(() => {
        if (!playerTurn && phase === 'playing') {
            const timer = setTimeout(() => {
                setGameState(prev => cpuFire(prev));
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [playerTurn, phase]);

    const handleFire = (row: number, col: number) => {
        if (!playerTurn || phase !== 'playing') return;
        setGameState(prev => playerFire(prev, row, col));
    };

    const resetGame = () => setGameState(initializeGame());

    const renderGrid = (grid: string[][], isEnemy: boolean, onCellClick?: (r: number, c: number) => void) => (
        <div>
            {/* Column headers */}
            <div className="flex">
                <div className="w-5 h-5 sm:w-6 sm:h-6" />
                {COLS.map(c => (
                    <div key={c} className="w-7 h-5 sm:w-8 sm:h-6 flex items-center justify-center text-[10px] text-slate-500 font-bold">{c}</div>
                ))}
            </div>
            {grid.map((row, r) => (
                <div key={r} className="flex">
                    <div className="w-5 h-7 sm:w-6 sm:h-8 flex items-center justify-center text-[10px] text-slate-500 font-bold">{r + 1}</div>
                    {row.map((cell, c) => {
                        const isClickable = isEnemy && playerTurn && phase === 'playing' && cell !== 'hit' && cell !== 'miss' && cell !== 'sunk';
                        const showShip = !isEnemy && (cell === 'ship' || cell === 'hit' || cell === 'sunk');

                        return (
                            <motion.div
                                key={c}
                                whileHover={isClickable ? { scale: 1.1 } : {}}
                                whileTap={isClickable ? { scale: 0.9 } : {}}
                                onClick={() => isClickable && onCellClick?.(r, c)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs border transition-all
                                    ${cell === 'hit' ? 'bg-red-500/30 border-red-500/50' :
                                        cell === 'miss' ? 'bg-slate-800/50 border-slate-700/30' :
                                            cell === 'sunk' ? 'bg-orange-500/30 border-orange-500/50' :
                                                !isEnemy && cell === 'ship' ? 'bg-cyan-500/20 border-cyan-500/30' :
                                                    isClickable ? 'bg-slate-800/30 border-slate-700/30 cursor-crosshair hover:bg-blue-500/20 hover:border-blue-500/40' :
                                                        'bg-slate-800/30 border-slate-700/20'}
                                `}
                            >
                                <CellIcon state={cell} />
                                {!isEnemy && cell === 'ship' && <span className="text-cyan-500/60 text-[8px]">■</span>}
                            </motion.div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    const winnerForModal = winner === 'player' ? 'player' : winner === 'cpu' ? 'cpu' : null;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* Status */}
            <div className="glass px-4 py-2 rounded-full mb-4 text-sm font-bold">
                <span className={playerTurn ? 'text-cyan-400' : 'text-red-400'}>
                    {message}
                </span>
            </div>

            {/* Grids */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8">
                {/* Enemy Grid */}
                <div>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 text-center">Enemy Waters</h3>
                    <div className="glass-strong p-2 sm:p-3 rounded-xl">
                        {renderGrid(cpuBoard.grid as unknown as string[][], true, handleFire)}
                    </div>
                </div>

                {/* Player Grid */}
                <div>
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 text-center">Your Fleet</h3>
                    <div className="glass-strong p-2 sm:p-3 rounded-xl">
                        {renderGrid(playerBoard.grid as unknown as string[][], false)}
                    </div>
                </div>
            </div>

            {/* Ship Status */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-[600px]">
                {cpuBoard.ships.map((ship, i) => (
                    <div key={i} className={`px-2 py-1 rounded text-[10px] font-bold ${ship.hits.every(Boolean) ? 'bg-red-500/20 text-red-400 line-through' : 'bg-slate-800 text-slate-400'}`}>
                        {ship.name}
                    </div>
                ))}
            </div>

            <GameOverModal
                winner={winnerForModal}
                playerLabel="Admiral"
                cpuLabel="Enemy"
                accentColor="blue"
                onPlayAgain={resetGame}
                show={phase === 'gameover'}
            />
        </div>
    );
}
