"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, INITIAL_STATE, BOARD_SIZE, applyMove, getAIMove } from '@/lib/hexLogic';
import GameOverModal from '@/components/games/GameOverModal';

export default function HexBoard() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const { board, turn, winner, winPath, lastMove } = gameState;

    // CPU turn (blue)
    useEffect(() => {
        if (turn === 'blue' && !winner) {
            const timer = setTimeout(() => {
                const move = getAIMove(gameState);
                if (move) setGameState(prev => applyMove(prev, move[0], move[1]));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleClick = (row: number, col: number) => {
        if (turn !== 'red' || winner) return;
        if (board[row][col] !== null) return;
        setGameState(prev => applyMove(prev, row, col));
    };

    const resetGame = () => setGameState(INITIAL_STATE);

    const isWinCell = (r: number, c: number) => winPath?.some(([wr, wc]) => wr === r && wc === c) ?? false;
    const isLastMoveCell = (r: number, c: number) => lastMove?.[0] === r && lastMove?.[1] === c;

    const winnerForModal = winner === 'red' ? 'player' : winner === 'blue' ? 'cpu' : null;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-4 items-center mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'red' && !winner ? 'glass-strong ring-2 ring-red-500' : ''}`}>
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-slate-300">YOU (←→)</span>
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {winner ? (winner === 'red' ? 'YOU WIN' : 'CPU WINS') : turn === 'red' ? 'YOUR TURN' : 'CPU...'}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'blue' && !winner ? 'glass-strong ring-2 ring-blue-500' : ''}`}>
                    <span className="text-xs font-bold text-slate-300">CPU (↑↓)</span>
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                </div>
            </div>

            {/* Left/Right labels */}
            <div className="flex items-center gap-2">
                <div className="text-red-400 text-[10px] font-bold [writing-mode:vertical-lr] rotate-180">RED</div>

                <div className="glass-strong p-3 sm:p-4 rounded-2xl overflow-auto max-w-full">
                    {/* Top label */}
                    <div className="flex justify-center mb-1">
                        <span className="text-blue-400 text-[10px] font-bold">BLUE</span>
                    </div>

                    {board.map((row, r) => (
                        <div key={r} className="flex" style={{ marginLeft: `${r * 12}px` }}>
                            {row.map((cell, c) => (
                                <motion.div
                                    key={c}
                                    whileHover={!cell && turn === 'red' && !winner ? { scale: 1.15 } : {}}
                                    onClick={() => handleClick(r, c)}
                                    className="relative cursor-pointer"
                                    style={{ width: 24, height: 22, margin: '1px' }}
                                >
                                    {/* Hexagon shape via CSS */}
                                    <div className={`absolute inset-0 flex items-center justify-center transition-all
                                        ${cell === 'red' ? 'text-red-500' :
                                            cell === 'blue' ? 'text-blue-500' :
                                                'text-slate-700 hover:text-slate-500'}
                                    `}>
                                        <svg viewBox="0 0 24 22" className="w-full h-full">
                                            <polygon
                                                points="12,0 24,6 24,16 12,22 0,16 0,6"
                                                fill={
                                                    isWinCell(r, c) ? (cell === 'red' ? '#fbbf24' : '#38bdf8') :
                                                        cell === 'red' ? '#ef4444' :
                                                            cell === 'blue' ? '#3b82f6' :
                                                                '#1e293b'
                                                }
                                                stroke={
                                                    isLastMoveCell(r, c) ? '#fbbf24' :
                                                        isWinCell(r, c) ? '#fbbf24' :
                                                            '#334155'
                                                }
                                                strokeWidth={isLastMoveCell(r, c) || isWinCell(r, c) ? 2 : 1}
                                            />
                                        </svg>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}

                    {/* Bottom label */}
                    <div className="flex justify-center mt-1" style={{ marginLeft: `${BOARD_SIZE * 12}px` }}>
                        <span className="text-blue-400 text-[10px] font-bold">BLUE</span>
                    </div>
                </div>

                <div className="text-red-400 text-[10px] font-bold [writing-mode:vertical-lr]">RED</div>
            </div>

            <p className="mt-3 text-slate-600 text-xs text-center">
                Red connects left↔right • Blue connects top↔bottom
            </p>

            <GameOverModal
                winner={winnerForModal}
                playerLabel="Red"
                cpuLabel="Blue"
                accentColor="red"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
