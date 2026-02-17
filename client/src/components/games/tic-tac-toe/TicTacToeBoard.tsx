"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, INITIAL_STATE, applyMove, getBestMove } from '@/lib/ticTacToeLogic';
import { X, Circle } from 'lucide-react';
import GameOverModal from '@/components/games/GameOverModal';

export default function TicTacToeBoard() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const { board, turn, winner, winLine } = gameState;

    // CPU Turn (O)
    useEffect(() => {
        if (turn === 'O' && !winner) {
            const timer = setTimeout(() => {
                const move = getBestMove(gameState);
                if (move !== -1) {
                    setGameState(prev => applyMove(prev, move));
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (index: number) => {
        if (turn !== 'X' || winner) return;
        if (board[index] !== null) return;
        setGameState(prev => applyMove(prev, index));
    };

    const resetGame = () => setGameState(INITIAL_STATE);

    const winnerForModal = winner
        ? winner === 'draw' ? 'draw'
            : winner === 'X' ? 'player' : 'cpu'
        : null;

    return (
        <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto px-2">
            {/* HUD */}
            <div className="w-full flex justify-between mb-4 sm:mb-6 md:mb-8 text-sm font-bold text-slate-400">
                <div className={`p-2 sm:p-3 rounded-xl flex gap-2 items-center transition-all ${turn === 'X' && !winner ? 'glass-strong ring-2 ring-cyan-500' : ''}`}>
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <span className="text-xs sm:text-sm">YOU</span>
                </div>
                <div className="glass px-3 py-1.5 rounded-full font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest flex items-center">
                    {winner ? (winner === 'draw' ? 'DRAW' : winner === 'X' ? 'YOU WIN' : 'CPU WINS') : (turn === 'X' ? 'YOUR TURN' : 'CPU...')}
                </div>
                <div className={`p-2 sm:p-3 rounded-xl flex gap-2 items-center transition-all ${turn === 'O' && !winner ? 'glass-strong ring-2 ring-red-500' : ''}`}>
                    <span className="text-xs sm:text-sm">CPU</span>
                    <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                </div>
            </div>

            {/* Board */}
            <div className="glass-strong p-3 sm:p-4 rounded-2xl shadow-2xl">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {board.map((cell, index) => {
                        const isWinCell = winLine?.includes(index);

                        return (
                            <motion.div
                                key={index}
                                whileHover={!cell && turn === 'X' && !winner ? { scale: 0.95 } : {}}
                                whileTap={!cell && turn === 'X' && !winner ? { scale: 0.9 } : {}}
                                onClick={() => handleCellClick(index)}
                                className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center rounded-xl text-4xl font-black transition-all
                                    ${!cell && turn === 'X' && !winner ? 'cursor-pointer hover:bg-slate-700/80 bg-slate-800/60' : 'bg-slate-800/60 cursor-default'}
                                    ${isWinCell ? 'ring-2 ring-green-500 bg-green-500/10' : ''}
                                `}
                            >
                                <AnimatePresence mode="wait">
                                    {cell && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                        >
                                            {cell === 'X' ? (
                                                <X className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-cyan-400" strokeWidth={3} />
                                            ) : (
                                                <Circle className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-red-400" strokeWidth={3} />
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <GameOverModal
                winner={winnerForModal}
                playerLabel="X"
                cpuLabel="O"
                accentColor="cyan"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
