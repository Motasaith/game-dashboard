"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, initializeGame, applyMove, getBestMove, Line } from '@/lib/dotsAndBoxesLogic';
import { Cpu, RotateCcw } from 'lucide-react';

export default function DotsBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame(5)); // 5x5 boxes
    const { horizontalLines, verticalLines, boxes, turn, scores, winner, gridSize } = gameState;

    // --- CPU TURN ---
    useEffect(() => {
        if (turn === 'cpu' && !winner) {
            const timer = setTimeout(() => {
                const move = getBestMove(gameState);
                if (move) {
                    setGameState(prev => applyMove(prev, move));
                }
            }, 600); // Faster turns for dots
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleLineClick = (type: Line, row: number, col: number) => {
        if (turn !== 'player' || winner) return;

        // Check if taken
        if (type === 'horizontal' && horizontalLines[row][col]) return;
        if (type === 'vertical' && verticalLines[row][col]) return;

        setGameState(prev => applyMove(prev, { type, row, col }));
    };

    const resetGame = () => {
        setGameState(initializeGame(5));
    };

    return (
        <div className="flex flex-col items-center select-none w-full max-w-2xl">
            {/* HUD */}
            <div className="w-full flex justify-between mb-8 text-base font-bold text-slate-400">
                <div className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${turn === 'player' ? 'bg-cyan-900/20 ring-2 ring-cyan-500' : 'bg-slate-900'}`}>
                    <span className="text-cyan-400 text-sm uppercase">You</span>
                    <span className="text-4xl text-white font-black">{scores.player}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                    {winner ? (
                        <button onClick={resetGame} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 shadow-lg hover:scale-105 transition-all font-bold">
                            <RotateCcw className="w-4 h-4" /> Restart
                        </button>
                    ) : (
                        <div className="font-mono text-slate-600 uppercase tracking-widest text-sm">
                            {turn === 'player' ? 'Your Turn' : 'CPU Turn'}
                        </div>
                    )}
                </div>

                <div className={`p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${turn === 'cpu' ? 'bg-pink-900/20 ring-2 ring-pink-500' : 'bg-slate-900'}`}>
                    <span className="text-pink-400 text-sm uppercase flex items-center gap-1">CPU <Cpu className="w-3 h-3" /></span>
                    <span className="text-4xl text-white font-black">{scores.cpu}</span>
                </div>
            </div>

            {/* Game Grid */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border-4 border-slate-800">
                <div
                    className="relative grid"
                    style={{
                        gridTemplateColumns: `repeat(${gridSize}, 60px)`,
                        gridTemplateRows: `repeat(${gridSize}, 60px)`
                    }}
                >
                    {/* DOTS & VERTICAL LINES */}
                    {Array.from({ length: gridSize + 1 }).map((_, r) => (
                        <React.Fragment key={r}>
                            {/* ROW OF DOTS + HORIZONTAL LINES */}
                            <div className="absolute left-0 flex" style={{ top: `${r * 60}px` }}>
                                {Array.from({ length: gridSize + 1 }).map((__, c) => (
                                    <div key={`dot-${r}-${c}`} className="relative flex items-center">
                                        {/* DOT */}
                                        <div className="w-4 h-4 bg-slate-200 rounded-full z-20 shadow-[0_0_10px_white]" />

                                        {/* HORIZONTAL LINE (Right of dot) */}
                                        {c < gridSize && (
                                            <div
                                                onClick={() => handleLineClick('horizontal', r, c)}
                                                className={`w-9 h-4 mx-1 rounded-full cursor-pointer z-10 transition-colors duration-300
                                                    ${horizontalLines[r][c]
                                                        ? 'bg-gradient-to-r from-slate-200 to-white shadow-[0_0_15px_white]'
                                                        : 'bg-slate-800 hover:bg-slate-700'}
                                                `}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ROW OF VERTICAL LINES */}
                            {r < gridSize && (
                                <div className="absolute left-0 flex" style={{ top: `${r * 60 + 16}px` }}>
                                    {Array.from({ length: gridSize + 1 }).map((__, c) => (
                                        <div key={`vrow-${r}-${c}`} className="relative flex mr-[44px]">
                                            {/* VERTICAL LINE (Below dot) */}
                                            <div
                                                onClick={() => handleLineClick('vertical', r, c)}
                                                className={`w-4 h-9 my-1 rounded-full cursor-pointer z-10 transition-colors duration-300 ml-[0px]
                                                    ${verticalLines[r][c]
                                                        ? 'bg-gradient-to-b from-slate-200 to-white shadow-[0_0_15px_white]'
                                                        : 'bg-slate-800 hover:bg-slate-700'}
                                                `}
                                            />

                                            {/* BOX (Right of vertical line) */}
                                            {c < gridSize && (
                                                <div className="absolute left-4 w-[44px] h-[44px] flex items-center justify-center">
                                                    <AnimatePresence>
                                                        {boxes[r][c] && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className={`w-8 h-8 rounded-lg ${boxes[r][c] === 'player' ? 'bg-cyan-500' : 'bg-pink-500'}`}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Winner Overlay */}
            <AnimatePresence>
                {winner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl"
                        >
                            <h2 className="text-4xl font-black text-white mb-2">
                                {winner === 'player' ? 'VICTORY' : winner === 'cpu' ? 'DEFEAT' : 'DRAW'}
                            </h2>
                            <p className="text-slate-400 mb-6">
                                {scores.player} - {scores.cpu}
                            </p>
                            <button
                                onClick={resetGame}
                                className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
