"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, INITIAL_STATE, BOARD_SIZE, applyMove, getAIMove } from '@/lib/gomokuLogic';
import GameOverModal from '@/components/games/GameOverModal';

export default function GomokuBoard() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const { board, turn, winner, winLine, lastMove } = gameState;

    // CPU Turn (white)
    useEffect(() => {
        if (turn === 'white' && !winner) {
            const timer = setTimeout(() => {
                const move = getAIMove(gameState);
                if (move) {
                    setGameState(prev => applyMove(prev, move[0], move[1]));
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleClick = (row: number, col: number) => {
        if (turn !== 'black' || winner) return;
        if (board[row][col] !== null) return;
        setGameState(prev => applyMove(prev, row, col));
    };

    const resetGame = () => setGameState(INITIAL_STATE);

    const isWinCell = (r: number, c: number) => winLine?.some(([wr, wc]) => wr === r && wc === c) ?? false;
    const isLastMove = (r: number, c: number) => lastMove?.[0] === r && lastMove?.[1] === c;

    const winnerForModal = winner
        ? winner === 'draw' ? 'draw'
            : winner === 'black' ? 'player' : 'cpu'
        : null;

    // Dynamic cell size based on screen
    const cellSize = 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7';

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-1">
            {/* HUD */}
            <div className="flex gap-4 items-center mb-3 sm:mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'black' && !winner ? 'glass-strong ring-2 ring-slate-300' : ''}`}>
                    <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-400" />
                    <span className="text-xs font-bold text-slate-300">YOU</span>
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {winner ? (winner === 'draw' ? 'DRAW' : winner === 'black' ? 'YOU WIN' : 'CPU WINS') : (turn === 'black' ? 'YOUR TURN' : 'CPU...')}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'white' && !winner ? 'glass-strong ring-2 ring-white' : ''}`}>
                    <span className="text-xs font-bold text-slate-300">CPU</span>
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                </div>
            </div>

            {/* Board — Go-style intersections */}
            <div className="glass-strong p-2 sm:p-3 rounded-xl overflow-auto max-w-full">
                <div className="inline-block">
                    {board.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((cell, c) => (
                                <div
                                    key={c}
                                    onClick={() => handleClick(r, c)}
                                    className={`${cellSize} relative flex items-center justify-center cursor-pointer`}
                                >
                                    {/* Grid lines */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        {r > 0 && <div className="absolute top-0 w-px h-1/2 bg-slate-700" />}
                                        {r < BOARD_SIZE - 1 && <div className="absolute bottom-0 w-px h-1/2 bg-slate-700" />}
                                        {c > 0 && <div className="absolute left-0 h-px w-1/2 bg-slate-700" />}
                                        {c < BOARD_SIZE - 1 && <div className="absolute right-0 h-px w-1/2 bg-slate-700" />}
                                    </div>

                                    {/* Stone */}
                                    {cell && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`w-[80%] h-[80%] rounded-full z-10 shadow-md
                                                ${cell === 'black' ? 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600' : 'bg-gradient-to-br from-white to-slate-200 border border-slate-300'}
                                                ${isWinCell(r, c) ? 'ring-2 ring-green-500' : ''}
                                                ${isLastMove(r, c) ? 'ring-2 ring-cyan-400' : ''}
                                            `}
                                        />
                                    )}

                                    {/* Hover indicator */}
                                    {!cell && turn === 'black' && !winner && (
                                        <div className="absolute w-[60%] h-[60%] rounded-full bg-slate-600/0 hover:bg-slate-600/30 z-10 transition-colors" />
                                    )}

                                    {/* Star points (for standard Go-style markers) */}
                                    {!cell && ((r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11)) && (
                                        <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-600 z-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <GameOverModal
                winner={winnerForModal}
                playerLabel="Black"
                cpuLabel="White"
                accentColor="purple"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
