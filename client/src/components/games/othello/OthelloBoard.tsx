"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, INITIAL_STATE, getInitialBoard, getValidMoves, applyMove, getBestMove } from '@/lib/othelloLogic';
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
                    // Pass turn logic handled in logic/ui?
                    // If AI returns -1, it means no moves, so we must trigger pass or game over check
                    setGameState(prev => applyMove(prev, -1));
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (index: number) => {
        if (turn === 'white' || winner) return; // Player is Black
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

    return (
        <div className="flex flex-col items-center select-none">
            {/* HUD */}
            <div className="w-full max-w-lg flex justify-between mb-8 text-base font-bold text-slate-400">
                <div className={`flex flex-col items-center p-3 rounded-xl transition-all ${turn === 'black' ? 'bg-slate-800 ring-2 ring-cyan-500 scale-105' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-black border border-slate-600 shadow-[0_0_10px_black]" />
                        <span className={turn === 'black' ? 'text-cyan-400' : ''}>YOU (Black)</span>
                    </div>
                    <span className="text-3xl text-white font-black">{scores.black}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                    {winner ? (
                        <button onClick={resetGame} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                            <RotateCcw className="w-4 h-4" /> Restart
                        </button>
                    ) : (
                        <div className="px-4 py-2 bg-slate-900 rounded-full border border-slate-800 text-xs font-mono uppercase tracking-widest text-slate-500">
                            {message}
                        </div>
                    )}
                </div>

                <div className={`flex flex-col items-center p-3 rounded-xl transition-all ${turn === 'white' ? 'bg-slate-800 ring-2 ring-red-500 scale-105' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={turn === 'white' ? 'text-red-400' : ''}>CPU (White)</span>
                        <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white]" />
                    </div>
                    <span className="text-3xl text-white font-black">{scores.white}</span>
                </div>
            </div>

            {/* Board */}
            <div className="relative p-2 bg-slate-800 rounded-lg shadow-2xl border-4 border-slate-700">
                <div className="grid grid-cols-8 gap-1 bg-slate-900 border border-slate-900">
                    {board.map((cell, index) => {
                        const isValid = validMoves.includes(index) && turn === 'black';

                        return (
                            <div
                                key={index}
                                onClick={() => handleCellClick(index)}
                                className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center bg-green-700/80 relative
                                    ${isValid ? 'cursor-pointer hover:bg-green-600/80' : ''}
                                `}
                            >
                                {/* Grid texture/dot */}
                                {(index === 18 || index === 21 || index === 42 || index === 45) && (
                                    <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-900/50" />
                                )}

                                {/* Piece */}
                                <AnimatePresence mode='popLayout'>
                                    {cell && (
                                        <motion.div
                                            key={`${cell}-${index}`} // Key change triggers animation
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
                                            {/* Inner detail for 3D effect */}
                                            <div className={`absolute inset-0 rounded-full opacity-50 bg-gradient-to-tl ${cell === 'black' ? 'from-black to-transparent' : 'from-slate-300 to-transparent'}`} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Hint for valid move */}
                                {isValid && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-3 h-3 rounded-full bg-black/20"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
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
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className={`absolute inset-0 opacity-10 bg-gradient-to-b ${winner === 'black' ? 'from-cyan-500' : 'from-red-500'} to-transparent`} />

                            <h2 className={`text-4xl md:text-5xl font-black mb-2 ${winner === 'black' ? 'text-cyan-400' : winner === 'white' ? 'text-red-500' : 'text-slate-200'}`}>
                                {winner === 'black' ? 'VICTORY' : winner === 'white' ? 'DEFEAT' : 'DRAW'}
                            </h2>
                            <p className="text-slate-400 mb-6 font-medium">
                                {winner === 'black' ? `You dominated the board!` : winner === 'white' ? 'The AI outflanked you.' : 'A perfect balance.'}
                            </p>

                            <div className="flex justify-center gap-8 mb-8">
                                <div className="text-center">
                                    <div className="text-xs uppercase text-slate-500 font-bold mb-1">Black</div>
                                    <div className="text-3xl font-black text-white">{scores.black}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs uppercase text-slate-500 font-bold mb-1">White</div>
                                    <div className="text-3xl font-black text-white">{scores.white}</div>
                                </div>
                            </div>

                            <button
                                onClick={resetGame}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-white/10"
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
