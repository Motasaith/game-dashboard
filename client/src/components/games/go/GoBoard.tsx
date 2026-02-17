"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, INITIAL_STATE, BOARD_SIZE, applyMove, pass, getScores, getAIMove } from '@/lib/goLogic';
import GameOverModal from '@/components/games/GameOverModal';

export default function GoBoard() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const { board, turn, winner, captures, lastMove, phase } = gameState;
    const scores = getScores(gameState);

    // CPU turn (white)
    useEffect(() => {
        if (turn === 'white' && phase === 'playing') {
            const timer = setTimeout(() => {
                const move = getAIMove(gameState);
                if (move === 'pass') {
                    setGameState(prev => pass(prev));
                } else {
                    setGameState(prev => applyMove(prev, move[0], move[1]));
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [turn, phase, gameState]);

    const handleClick = (row: number, col: number) => {
        if (turn !== 'black' || phase !== 'playing') return;
        if (board[row][col] !== null) return;
        const newState = applyMove(gameState, row, col);
        if (newState !== gameState) setGameState(newState);
    };

    const handlePass = () => {
        if (turn !== 'black') return;
        setGameState(prev => pass(prev));
    };

    const resetGame = () => setGameState(INITIAL_STATE);

    const isLastMoveCell = (r: number, c: number) => lastMove?.[0] === r && lastMove?.[1] === c;
    const winnerForModal = winner === 'black' ? 'player' : winner === 'white' ? 'cpu' : winner === 'draw' ? 'draw' : null;
    const cellSize = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9';

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-4 items-center mb-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'black' && phase === 'playing' ? 'glass-strong ring-2 ring-slate-300' : ''}`}>
                    <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-400" />
                    <span className="text-xs font-bold text-slate-300">You ({captures.black} cap)</span>
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {phase === 'gameover' ? 'GAME OVER' : turn === 'black' ? 'YOUR TURN' : 'CPU...'}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'white' && phase === 'playing' ? 'glass-strong ring-2 ring-white' : ''}`}>
                    <span className="text-xs font-bold text-slate-300">CPU ({captures.white} cap)</span>
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                </div>
            </div>

            {/* Scores */}
            <div className="flex gap-4 mb-3 text-xs">
                <span className="text-slate-400">Black: <span className="text-white font-bold">{scores.black.toFixed(1)}</span></span>
                <span className="text-slate-400">White: <span className="text-white font-bold">{scores.white.toFixed(1)}</span> (6.5 komi)</span>
            </div>

            {/* Board */}
            <div className="glass-strong p-2 sm:p-3 rounded-xl">
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
                                        {r > 0 && <div className="absolute top-0 w-px h-1/2 bg-amber-800/60" />}
                                        {r < BOARD_SIZE - 1 && <div className="absolute bottom-0 w-px h-1/2 bg-amber-800/60" />}
                                        {c > 0 && <div className="absolute left-0 h-px w-1/2 bg-amber-800/60" />}
                                        {c < BOARD_SIZE - 1 && <div className="absolute right-0 h-px w-1/2 bg-amber-800/60" />}
                                    </div>

                                    {/* Stone */}
                                    {cell && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`w-[85%] h-[85%] rounded-full z-10 shadow-md
                                                ${cell === 'black'
                                                    ? 'bg-gradient-to-br from-slate-600 to-slate-900 border border-slate-500'
                                                    : 'bg-gradient-to-br from-white to-slate-100 border border-slate-300'}
                                                ${isLastMoveCell(r, c) ? 'ring-2 ring-cyan-400' : ''}
                                            `}
                                        />
                                    )}

                                    {/* Star points (hoshi) */}
                                    {!cell && ((r === 2 || r === 4 || r === 6) && (c === 2 || c === 4 || c === 6)) && (
                                        <div className="absolute w-2 h-2 rounded-full bg-amber-800/80 z-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pass button */}
            {turn === 'black' && phase === 'playing' && (
                <button onClick={handlePass} className="mt-3 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700">
                    Pass
                </button>
            )}

            <GameOverModal
                winner={winnerForModal}
                playerLabel="Black"
                cpuLabel="White"
                scores={{ player: Math.round(scores.black), cpu: Math.round(scores.white) }}
                accentColor="amber"
                onPlayAgain={resetGame}
                show={phase === 'gameover'}
            />
        </div>
    );
}
