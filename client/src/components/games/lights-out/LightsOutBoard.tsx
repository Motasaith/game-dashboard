"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, initializeGame, applyMove, GRID_SIZE } from '@/lib/lightsOutLogic';
import { RotateCcw, Lightbulb, ChevronRight } from 'lucide-react';

export default function LightsOutBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame(1));
    const { grid, moves, won, level } = gameState;

    const handleCellClick = (row: number, col: number) => {
        if (won) return;
        setGameState(prev => applyMove(prev, row, col));
    };

    const resetLevel = () => setGameState(initializeGame(level));
    const nextLevel = () => setGameState(initializeGame(level + 1));

    const litCount = grid.flat().filter(Boolean).length;

    return (
        <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto px-2">
            {/* HUD */}
            <div className="w-full flex justify-between items-center mb-4 sm:mb-6">
                <div className="glass-strong px-4 py-2 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Level</div>
                    <div className="text-2xl font-black text-purple-400">{level}</div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="glass px-3 py-1.5 rounded-full font-mono text-[10px] sm:text-xs uppercase tracking-widest">
                        <span className="text-amber-400">{litCount}</span>
                        <span className="text-slate-600"> lights left</span>
                    </div>
                </div>

                <div className="glass-strong px-4 py-2 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Moves</div>
                    <div className="text-2xl font-black text-white">{moves}</div>
                </div>
            </div>

            {/* Board */}
            <div className="glass-strong p-3 sm:p-4 rounded-2xl shadow-2xl">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {grid.map((row, r) =>
                        row.map((lit, c) => (
                            <motion.button
                                key={`${r}-${c}`}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleCellClick(r, c)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-xl transition-all duration-300 border-2
                                    ${lit
                                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                    }
                                `}
                            >
                                <Lightbulb className={`w-6 h-6 sm:w-7 sm:h-7 mx-auto transition-colors ${lit ? 'text-amber-900' : 'text-slate-700'}`} />
                            </motion.button>
                        ))
                    )}
                </div>
            </div>

            {/* Instructions */}
            <p className="mt-4 text-slate-600 text-xs sm:text-sm text-center">
                Tap a light to toggle it and its neighbors. Turn all lights off to win!
            </p>

            {/* Controls */}
            <div className="mt-4 flex gap-3">
                <button
                    onClick={resetLevel}
                    className="flex items-center gap-2 px-4 py-2 glass-strong rounded-xl text-slate-400 hover:text-white transition-colors text-sm font-bold"
                >
                    <RotateCcw className="w-4 h-4" /> Reset
                </button>
            </div>

            {/* Win Overlay */}
            <AnimatePresence>
                {won && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="glass-strong p-6 sm:p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border border-slate-700"
                        >
                            <div className="text-5xl mb-4">🌙</div>
                            <h2 className="text-4xl sm:text-5xl font-black text-purple-400 mb-2">
                                LIGHTS OUT!
                            </h2>
                            <p className="text-slate-400 mb-1 text-sm">Level {level} completed</p>
                            <p className="text-white font-bold mb-6">in {moves} moves</p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={nextLevel}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                >
                                    Next Level <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={resetLevel}
                                    className="w-full py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Replay Level
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
