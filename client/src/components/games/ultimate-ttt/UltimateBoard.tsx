"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, INITIAL_STATE, applyMove, getBestMove, getMoves } from '@/lib/ultimateTicTacToeLogic';
import { Cpu, X, Circle, RotateCcw } from 'lucide-react';
import GameOverModal from '@/components/games/GameOverModal';

export default function UltimateBoard() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const { board, macroBoard, turn, nextMacro, winner } = gameState;

    // --- CPU TURN ---
    useEffect(() => {
        if (turn === 'O' && !winner) {
            const timer = setTimeout(() => {
                const move = getBestMove(gameState);
                if (move) {
                    setGameState(prev => applyMove(prev, move));
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (macroIdx: number, microIdx: number) => {
        if (turn !== 'X' || winner) return;

        // Validation
        if (board[macroIdx][microIdx] !== null) return;
        if (nextMacro !== null && nextMacro !== macroIdx) return;
        if (macroBoard[macroIdx] !== null) return; // Board already won

        // Apply Move
        setGameState(prev => applyMove(prev, { macro: macroIdx, micro: microIdx }));
    };

    const resetGame = () => {
        setGameState(INITIAL_STATE);
    };

    const winnerForModal = winner
        ? winner === 'draw' ? 'draw'
            : winner === 'X' ? 'player' : 'cpu'
        : null;

    return (
        <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto px-2">
            {/* HUD */}
            <div className="w-full flex justify-between mb-4 sm:mb-6 md:mb-8 text-sm md:text-base font-bold text-slate-400">
                <div className={`p-2 sm:p-3 rounded-xl flex gap-2 items-center transition-all ${turn === 'X' ? 'glass-strong ring-2 ring-cyan-500' : ''}`}>
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">YOU (X)</span>
                </div>
                {winner ? (
                    <button onClick={resetGame} className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 shadow-lg hover:scale-105 transition-all text-xs sm:text-sm">
                        <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" /> Restart
                    </button>
                ) : (
                    <div className="glass px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">
                        {turn === 'X' ? 'YOUR TURN' : 'CPU THINKING...'}
                    </div>
                )}
                <div className={`p-2 sm:p-3 rounded-xl flex gap-2 items-center transition-all ${turn === 'O' ? 'glass-strong ring-2 ring-red-500' : ''}`}>
                    <span className="text-xs sm:text-sm">CPU (O)</span>
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
            </div>

            {/* Main Grid (3x3 of 3x3) */}
            <div className="relative grid grid-cols-3 gap-1 sm:gap-2 md:gap-4 p-1.5 sm:p-2 md:p-4 bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl">
                {board.map((smallBoard, macroIdx) => {
                    const isWon = macroBoard[macroIdx] !== null;
                    const isTarget = !winner && !isWon && (nextMacro === null || nextMacro === macroIdx);

                    return (
                        <div
                            key={macroIdx}
                            className={`relative grid grid-cols-3 gap-0.5 sm:gap-1 p-0.5 sm:p-1 md:p-2 rounded-lg transition-all
                                ${isWon ? 'opacity-80' : 'bg-slate-800'}
                                ${isTarget ? 'ring-2 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'ring-1 ring-slate-700/50'}
                            `}
                        >
                            {/* Overlay for Won Board */}
                            {isWon && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px] rounded-lg">
                                    {macroBoard[macroIdx] === 'X' && <X className="w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 text-cyan-500" strokeWidth={3} />}
                                    {macroBoard[macroIdx] === 'O' && <Circle className="w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 text-red-500" strokeWidth={3} />}
                                    {macroBoard[macroIdx] === 'draw' && <span className="text-lg sm:text-2xl font-bold text-slate-500">DRAW</span>}
                                </div>
                            )}

                            {smallBoard.map((cell, microIdx) => (
                                <motion.div
                                    key={microIdx}
                                    whileHover={!cell && isTarget && turn === 'X' ? { scale: 0.95 } : {}}
                                    onClick={() => handleCellClick(macroIdx, microIdx)}
                                    className={`w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 flex items-center justify-center rounded bg-slate-700/50 text-lg sm:text-xl md:text-2xl font-black
                                        ${!cell && isTarget && turn === 'X' ? 'cursor-pointer hover:bg-slate-600' : 'cursor-default'}
                                        ${cell === 'X' ? 'text-cyan-400' : 'text-red-400'}
                                    `}
                                >
                                    {cell === 'X' && <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />}
                                    {cell === 'O' && <Circle className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />}
                                </motion.div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                accentColor="cyan"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
