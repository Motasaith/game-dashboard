"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, initializeGame, applyMove, getBestMove, Line } from '@/lib/dotsAndBoxesLogic';
import GameOverModal from '@/components/games/GameOverModal';
import { Cpu } from 'lucide-react';

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
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleLineClick = (type: Line, row: number, col: number) => {
        if (turn !== 'player' || winner) return;

        if (type === 'horizontal' && horizontalLines[row][col]) return;
        if (type === 'vertical' && verticalLines[row][col]) return;

        setGameState(prev => applyMove(prev, { type, row, col }));
    };

    const resetGame = () => {
        setGameState(initializeGame(5));
    };

    const winnerForModal = winner
        ? winner === 'draw' ? 'draw'
            : winner === 'player' ? 'player' : 'cpu'
        : null;

    // Responsive cell size
    const cellSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 40 : 60;
    const dotSize = cellSize === 40 ? 12 : 16;
    const lineThickness = cellSize === 40 ? 10 : 16;

    return (
        <div className="flex flex-col items-center select-none w-full max-w-2xl mx-auto px-2">
            {/* HUD */}
            <div className="w-full flex justify-between mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base font-bold text-slate-400">
                <div className={`p-3 sm:p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${turn === 'player' ? 'glass-strong ring-2 ring-cyan-500' : 'bg-slate-900/50'}`}>
                    <span className="text-cyan-400 text-xs sm:text-sm uppercase">You</span>
                    <span className="text-3xl sm:text-4xl text-white font-black">{scores.player}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="font-mono text-slate-600 uppercase tracking-widest text-[10px] sm:text-sm">
                        {turn === 'player' ? 'Your Turn' : 'CPU Turn'}
                    </div>
                </div>

                <div className={`p-3 sm:p-4 rounded-xl flex flex-col items-center gap-1 transition-all ${turn === 'cpu' ? 'glass-strong ring-2 ring-pink-500' : 'bg-slate-900/50'}`}>
                    <span className="text-pink-400 text-xs sm:text-sm uppercase flex items-center gap-1">CPU <Cpu className="w-3 h-3" /></span>
                    <span className="text-3xl sm:text-4xl text-white font-black">{scores.cpu}</span>
                </div>
            </div>

            {/* Game Grid */}
            <div className="glass-strong p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl overflow-x-auto">
                <div
                    className="relative grid"
                    style={{
                        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                        gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`
                    }}
                >
                    {/* DOTS & VERTICAL LINES */}
                    {Array.from({ length: gridSize + 1 }).map((_, r) => (
                        <React.Fragment key={r}>
                            {/* ROW OF DOTS + HORIZONTAL LINES */}
                            <div className="absolute left-0 flex" style={{ top: `${r * cellSize}px` }}>
                                {Array.from({ length: gridSize + 1 }).map((__, c) => (
                                    <div key={`dot-${r}-${c}`} className="relative flex items-center">
                                        {/* DOT */}
                                        <div
                                            className="bg-slate-200 rounded-full z-20 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                            style={{ width: dotSize, height: dotSize }}
                                        />

                                        {/* HORIZONTAL LINE (Right of dot) */}
                                        {c < gridSize && (
                                            <div
                                                onClick={() => handleLineClick('horizontal', r, c)}
                                                className={`mx-0.5 rounded-full cursor-pointer z-10 transition-colors duration-300
                                                    ${horizontalLines[r][c]
                                                        ? 'bg-gradient-to-r from-slate-200 to-white shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                                                        : 'bg-slate-800 hover:bg-slate-700'}
                                                `}
                                                style={{
                                                    width: cellSize - dotSize - 4,
                                                    height: lineThickness,
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ROW OF VERTICAL LINES */}
                            {r < gridSize && (
                                <div className="absolute left-0 flex" style={{ top: `${r * cellSize + dotSize}px` }}>
                                    {Array.from({ length: gridSize + 1 }).map((__, c) => (
                                        <div key={`vrow-${r}-${c}`} className="relative flex" style={{ marginRight: `${cellSize - dotSize}px` }}>
                                            {/* VERTICAL LINE (Below dot) */}
                                            <div
                                                onClick={() => handleLineClick('vertical', r, c)}
                                                className={`my-0.5 rounded-full cursor-pointer z-10 transition-colors duration-300
                                                    ${verticalLines[r][c]
                                                        ? 'bg-gradient-to-b from-slate-200 to-white shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                                                        : 'bg-slate-800 hover:bg-slate-700'}
                                                `}
                                                style={{
                                                    width: lineThickness,
                                                    height: cellSize - dotSize - 4,
                                                }}
                                            />

                                            {/* BOX (Right of vertical line) */}
                                            {c < gridSize && (
                                                <div
                                                    className="absolute flex items-center justify-center"
                                                    style={{
                                                        left: dotSize,
                                                        width: cellSize - dotSize,
                                                        height: cellSize - dotSize,
                                                    }}
                                                >
                                                    <AnimatePresence>
                                                        {boxes[r][c] && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className={`rounded-md sm:rounded-lg ${boxes[r][c] === 'player' ? 'bg-cyan-500/80' : 'bg-pink-500/80'}`}
                                                                style={{
                                                                    width: (cellSize - dotSize) * 0.7,
                                                                    height: (cellSize - dotSize) * 0.7,
                                                                }}
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

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                playerLabel="You"
                cpuLabel="CPU"
                scores={{ player: scores.player, cpu: scores.cpu }}
                accentColor="pink"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
