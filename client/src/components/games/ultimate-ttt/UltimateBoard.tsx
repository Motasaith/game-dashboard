"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, INITIAL_STATE, applyMove, getBestMove, getMoves } from '@/lib/ultimateTicTacToeLogic';
import { Cpu, X, Circle, RotateCcw } from 'lucide-react';

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

    return (
        <div className="flex flex-col items-center select-none">
            {/* HUD */}
            <div className="w-full max-w-md flex justify-between mb-8 text-sm md:text-base font-bold text-slate-400">
                <div className={`p-3 rounded-lg flex gap-2 items-center transition-colors ${turn === 'X' ? 'bg-cyan-500/10 text-cyan-400' : ''}`}>
                    <X className="w-5 h-5" />
                    <span>YOU (X)</span>
                </div>
                {winner ? (
                    <button onClick={resetGame} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Restart
                    </button>
                ) : (
                    <div className="font-mono text-slate-600">
                        {turn === 'X' ? 'YOUR TURN' : 'CPU THINKING...'}
                    </div>
                )}
                <div className={`p-3 rounded-lg flex gap-2 items-center transition-colors ${turn === 'O' ? 'bg-red-500/10 text-red-500' : ''}`}>
                    <span>CPU (O)</span>
                    <Cpu className="w-5 h-5" />
                </div>
            </div>

            {/* Main Grid (3x3 of 3x3) */}
            <div className="relative grid grid-cols-3 gap-2 md:gap-4 p-2 md:p-4 bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl">
                {board.map((smallBoard, macroIdx) => {
                    const isWon = macroBoard[macroIdx] !== null;
                    const isTarget = !winner && !isWon && (nextMacro === null || nextMacro === macroIdx);

                    return (
                        <div
                            key={macroIdx}
                            className={`relative grid grid-cols-3 gap-1 p-1 md:p-2 rounded-lg transition-all
                                ${isWon ? 'opacity-80' : 'bg-slate-800'}
                                ${isTarget ? 'ring-2 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'ring-1 ring-slate-700/50'}
                            `}
                        >
                            {/* Overlay for Won Board */}
                            {isWon && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px] rounded-lg">
                                    {macroBoard[macroIdx] === 'X' && <X className="w-16 h-16 md:w-24 md:h-24 text-cyan-500" strokeWidth={3} />}
                                    {macroBoard[macroIdx] === 'O' && <Circle className="w-16 h-16 md:w-24 md:h-24 text-red-500" strokeWidth={3} />}
                                    {macroBoard[macroIdx] === 'draw' && <span className="text-2xl font-bold text-slate-500">DRAW</span>}
                                </div>
                            )}

                            {smallBoard.map((cell, microIdx) => (
                                <motion.div
                                    key={microIdx}
                                    whileHover={!cell && isTarget && turn === 'X' ? { scale: 0.95 } : {}}
                                    onClick={() => handleCellClick(macroIdx, microIdx)}
                                    className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded bg-slate-700/50 text-xl md:text-2xl font-black
                                        ${!cell && isTarget && turn === 'X' ? 'cursor-pointer hover:bg-slate-600' : 'cursor-default'}
                                        ${cell === 'X' ? 'text-cyan-400' : 'text-red-400'}
                                    `}
                                >
                                    {cell === 'X' && <X className="w-5 h-5 md:w-7 md:h-7" />}
                                    {cell === 'O' && <Circle className="w-5 h-5 md:w-7 md:h-7" />}
                                </motion.div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Game Over Modal */}
            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl"
                        >
                            <h2 className={`text-4xl md:text-5xl font-black mb-4 ${winner === 'X' ? 'text-cyan-400' : winner === 'O' ? 'text-red-500' : 'text-slate-200'}`}>
                                {winner === 'X' ? 'VICTORY' : winner === 'O' ? 'DEFEAT' : 'DRAW'}
                            </h2>
                            <p className="text-slate-400 mb-8">
                                {winner === 'X' ? 'You mastered the macro board!' : 'The AI outsmarted you.'}
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={resetGame}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                                >
                                    Play Again
                                </button>
                                <button
                                    onClick={() => window.history.back()}
                                    className="w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Back to Library
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
