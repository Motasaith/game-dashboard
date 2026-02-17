"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, initializeGame, move, Direction, getTileColor } from '@/lib/game2048Logic';
import { RotateCcw, Trophy } from 'lucide-react';

export default function Game2048Board() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const { board, score, bestScore, gameOver, won } = gameState;

    const handleMove = useCallback((direction: Direction) => {
        setGameState(prev => move(prev, direction));
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowUp': e.preventDefault(); handleMove('up'); break;
                case 'ArrowDown': e.preventDefault(); handleMove('down'); break;
                case 'ArrowLeft': e.preventDefault(); handleMove('left'); break;
                case 'ArrowRight': e.preventDefault(); handleMove('right'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove]);

    // Touch/swipe controls
    useEffect(() => {
        let startX = 0, startY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) < 30) return; // Minimum swipe distance

            if (absDx > absDy) {
                handleMove(dx > 0 ? 'right' : 'left');
            } else {
                handleMove(dy > 0 ? 'down' : 'up');
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleMove]);

    const resetGame = () => setGameState(initializeGame());

    const getFontSize = (value: number): string => {
        if (value >= 1024) return 'text-lg sm:text-xl md:text-2xl';
        if (value >= 128) return 'text-xl sm:text-2xl md:text-3xl';
        return 'text-2xl sm:text-3xl md:text-4xl';
    };

    return (
        <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto px-2">
            {/* Score HUD */}
            <div className="w-full flex justify-between items-center mb-4 sm:mb-6">
                <div className="glass-strong px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-center">
                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">Score</div>
                    <div className="text-xl sm:text-2xl font-black text-white">{score}</div>
                </div>

                <button
                    onClick={resetGame}
                    className="p-2.5 sm:p-3 glass-strong rounded-xl text-slate-400 hover:text-white hover:scale-105 transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                <div className="glass-strong px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-center">
                    <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Best
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400">{bestScore}</div>
                </div>
            </div>

            {/* Board */}
            <div className="glass-strong p-2 sm:p-3 rounded-2xl shadow-2xl w-full aspect-square max-w-[340px] sm:max-w-[380px]">
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full h-full">
                    {board.flat().map((value, index) => {
                        const { bg, text } = getTileColor(value);
                        return (
                            <div key={index} className="relative aspect-square">
                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        key={`${index}-${value}`}
                                        initial={value ? { scale: 0.5, opacity: 0 } : false}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                                        className={`absolute inset-0 ${bg} ${text} rounded-lg sm:rounded-xl flex items-center justify-center font-black ${getFontSize(value)} shadow-lg`}
                                    >
                                        {value > 0 && value}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Controls hint */}
            <div className="mt-4 text-center text-slate-600 text-xs sm:text-sm">
                <span className="hidden sm:inline">Use arrow keys</span>
                <span className="sm:hidden">Swipe to move</span>
                <span> • Merge tiles to reach 2048!</span>
            </div>

            {/* Game Over / Won Overlay */}
            <AnimatePresence>
                {(gameOver || won) && (
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
                            <h2 className={`text-4xl sm:text-5xl font-black mb-2 ${won ? 'text-cyan-400' : 'text-red-400'}`}>
                                {won ? '🎉 2048!' : 'GAME OVER'}
                            </h2>
                            <p className="text-slate-400 mb-2 text-sm">
                                {won ? 'You reached the legendary tile!' : 'No more moves available'}
                            </p>
                            <p className="text-2xl font-black text-white mb-6">Score: {score}</p>
                            <button
                                onClick={resetGame}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
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
