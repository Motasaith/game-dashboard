"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, INITIAL_STATE, getInitialBoard, getValidMoves, applyMove, getBestMove } from '@/lib/othelloLogic';
import GameOverModal from '@/components/games/GameOverModal';
import { Cpu, RotateCcw } from 'lucide-react';

export default function OthelloBoard() {
    const [gameState, setGameState] = useState<GameState>({
        ...INITIAL_STATE,
        board: getInitialBoard(),
        validMoves: getValidMoves(getInitialBoard(), 'black'),
    });

    const { board, turn, validMoves, winner, scores, message } = gameState;

    // --- CPU TURN (White) ---
    useEffect(() => {
        if (turn === 'white' && !winner) {
            const timer = setTimeout(() => {
                const moveIndex = getBestMove(gameState);
                if (moveIndex !== -1) {
                    setGameState(prev => applyMove(prev, moveIndex));
                } else {
                    setGameState(prev => applyMove(prev, -1));
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (index: number) => {
        if (turn === 'white' || winner) return;
        if (!validMoves.includes(index)) return;

        setGameState(prev => applyMove(prev, index));
    };

    const resetGame = () => {
        setGameState({
            ...INITIAL_STATE,
            board: getInitialBoard(),
            validMoves: getValidMoves(getInitialBoard(), 'black'),
        });
    };

    const winnerForModal = winner
        ? winner === 'draw' ? 'draw'
            : winner === 'black' ? 'player' : 'cpu'
        : null;

    return (
        <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto px-2">
            {/* HUD */}
            <div className="w-full flex justify-between mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base font-bold text-slate-400">
                <div className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all ${turn === 'black' ? 'glass-strong ring-2 ring-cyan-500 scale-105' : ''}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-black border border-slate-600 shadow-[0_0_10px_black]" />
                        <span className={`text-xs sm:text-sm ${turn === 'black' ? 'text-cyan-400' : ''}`}>YOU</span>
                    </div>
                    <span className="text-2xl sm:text-3xl text-white font-black">{scores.black}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                    {winner ? (
                        <button onClick={resetGame} className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 shadow-lg hover:scale-105 transition-all text-xs sm:text-sm">
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" /> Restart
                        </button>
                    ) : (
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 glass rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-500">
                            {message}
                        </div>
                    )}
                </div>

                <div className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all ${turn === 'white' ? 'glass-strong ring-2 ring-red-500 scale-105' : ''}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <span className={`text-xs sm:text-sm ${turn === 'white' ? 'text-red-400' : ''}`}>CPU</span>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_10px_white]" />
                    </div>
                    <span className="text-2xl sm:text-3xl text-white font-black">{scores.white}</span>
                </div>
            </div>

            {/* Board */}
            <div className="relative p-1.5 sm:p-2 glass-strong rounded-lg shadow-2xl">
                <div className="grid grid-cols-8 gap-0.5 sm:gap-1 bg-slate-900 border border-slate-900">
                    {board.map((cell, index) => {
                        const isValid = validMoves.includes(index) && turn === 'black';

                        return (
                            <div
                                key={index}
                                onClick={() => handleCellClick(index)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center bg-green-700/80 relative
                                    ${isValid ? 'cursor-pointer hover:bg-green-600/80' : ''}
                                `}
                            >
                                {/* Grid dots */}
                                {(index === 18 || index === 21 || index === 42 || index === 45) && (
                                    <div className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-slate-900/50" />
                                )}

                                {/* Piece */}
                                <AnimatePresence mode='popLayout'>
                                    {cell && (
                                        <motion.div
                                            key={`${cell}-${index}`}
                                            initial={{ scale: 0, rotateX: 180 }}
                                            animate={{ scale: 1, rotateX: 0 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                            className={`w-[80%] h-[80%] rounded-full shadow-md
                                                ${cell === 'black'
                                                    ? 'bg-gradient-to-br from-slate-800 to-black border border-slate-700'
                                                    : 'bg-gradient-to-br from-white to-slate-200 border border-slate-300'}
                                            `}
                                        >
                                            <div className={`absolute inset-0 rounded-full opacity-50 bg-gradient-to-tl ${cell === 'black' ? 'from-black to-transparent' : 'from-slate-300 to-transparent'}`} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Hint for valid move */}
                                {isValid && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black/20"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                playerLabel="Black"
                cpuLabel="White"
                scores={{ player: scores.black, cpu: scores.white }}
                accentColor="cyan"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
