"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, initializeGame, getValidMoves, movePiece, getAIMove, BOARD_SIZE } from '@/lib/strategoLogic';
import GameOverModal from '@/components/games/GameOverModal';

const RANK_COLORS: Record<number, string> = {
    10: 'bg-yellow-500', 9: 'bg-orange-500', 7: 'bg-red-500',
    6: 'bg-rose-600', 5: 'bg-pink-500', 4: 'bg-purple-500',
    3: 'bg-indigo-500', 2: 'bg-blue-500', 1: 'bg-cyan-500',
    0: 'bg-green-500', [-1]: 'bg-slate-600',
};

export default function StrategoBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const [selected, setSelected] = useState<[number, number] | null>(null);
    const [validMoves, setValidMoves] = useState<[number, number][]>([]);

    const { board, turn, winner, message, lastCombat } = gameState;

    // CPU turn
    useEffect(() => {
        if (turn === 'blue' && !winner) {
            const timer = setTimeout(() => {
                const move = getAIMove(gameState);
                if (move) {
                    setGameState(prev => movePiece(prev, move.from[0], move.from[1], move.to[0], move.to[1]));
                }
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (r: number, c: number) => {
        if (turn !== 'red' || winner) return;

        const cell = board[r][c];

        // If a valid move target
        if (selected && validMoves.some(([mr, mc]) => mr === r && mc === c)) {
            setGameState(prev => movePiece(prev, selected[0], selected[1], r, c));
            setSelected(null);
            setValidMoves([]);
            return;
        }

        // Select own piece
        if (cell && cell !== 'water' && cell.player === 'red') {
            setSelected([r, c]);
            setValidMoves(getValidMoves(gameState, r, c));
            return;
        }

        // Deselect
        setSelected(null);
        setValidMoves([]);
    };

    const resetGame = () => {
        setGameState(initializeGame());
        setSelected(null);
        setValidMoves([]);
    };

    const winnerForModal = winner === 'red' ? 'player' : winner === 'blue' ? 'cpu' : null;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-4 items-center mb-3">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${turn === 'red' ? 'glass-strong text-red-400' : 'text-slate-500'}`}>
                    You (Red)
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {winner ? 'GAME OVER' : turn === 'red' ? 'YOUR TURN' : 'CPU...'}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${turn === 'blue' ? 'glass-strong text-blue-400' : 'text-slate-500'}`}>
                    CPU (Blue)
                </div>
            </div>

            {/* Combat message */}
            <AnimatePresence>
                {lastCombat && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mb-3 px-4 py-1.5 rounded-xl text-xs font-bold
                            ${lastCombat.result === 'win' ? 'bg-green-500/20 text-green-400' :
                                lastCombat.result === 'lose' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'}
                        `}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Board */}
            <div className="glass-strong p-2 sm:p-3 rounded-2xl">
                {board.map((row, r) => (
                    <div key={r} className="flex">
                        {row.map((cell, c) => {
                            const isSelected = selected?.[0] === r && selected?.[1] === c;
                            const isValid = validMoves.some(([mr, mc]) => mr === r && mc === c);
                            const isWater = cell === 'water';

                            return (
                                <div
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded m-0.5 transition-all cursor-pointer
                                        ${isWater ? 'bg-blue-500/20 border border-blue-500/30' :
                                            isSelected ? 'ring-2 ring-yellow-400 bg-yellow-400/10' :
                                                isValid ? 'ring-2 ring-green-400 bg-green-400/10' :
                                                    'bg-slate-800/40 border border-slate-700/20'}
                                    `}
                                >
                                    {cell && cell !== 'water' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white shadow-md
                                                ${cell.player === 'red'
                                                    ? (RANK_COLORS[cell.rank] || 'bg-slate-600')
                                                    : cell.revealed ? (RANK_COLORS[cell.rank] || 'bg-slate-600') : 'bg-slate-500'}
                                                ${cell.revealed ? 'border border-white/20' : ''}
                                            `}
                                        >
                                            {cell.player === 'red' || cell.revealed
                                                ? (cell.rank === -1 ? '💣' : cell.rank === 0 ? '🏴' : cell.rank === 1 ? '🕵' : cell.rank)
                                                : '?'
                                            }
                                        </motion.div>
                                    )}
                                    {isValid && !cell && <div className="w-2 h-2 rounded-full bg-green-400/60" />}
                                    {isWater && <div className="text-[10px]">🌊</div>}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-1.5 justify-center max-w-[350px]">
                {[
                    { label: '10 Marshal', color: 'bg-yellow-500' },
                    { label: '1 Spy', color: 'bg-cyan-500' },
                    { label: '2 Miner', color: 'bg-blue-500' },
                    { label: '💣 Bomb', color: 'bg-slate-600' },
                    { label: '🏴 Flag', color: 'bg-green-500' },
                ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded ${color}`} />
                        <span className="text-[9px] text-slate-500">{label}</span>
                    </div>
                ))}
            </div>

            <GameOverModal
                winner={winnerForModal}
                playerLabel="Red"
                cpuLabel="Blue"
                accentColor="red"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
