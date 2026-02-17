"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, initializeGame, getValidMoves, movePawn, placeWall, canPlaceWall, getAIAction, BOARD_SIZE, Pos, Wall } from '@/lib/quoridorLogic';
import GameOverModal from '@/components/games/GameOverModal';

export default function QuoridorBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const [validMoves, setValidMoves] = useState<Pos[]>([]);
    const [action, setAction] = useState<'move' | 'wall'>('move');
    const [wallOrient, setWallOrient] = useState<'h' | 'v'>('h');

    const { pawns, walls, wallCounts, turn, winner, phase } = gameState;

    // Update valid moves on turn change
    useEffect(() => {
        if (turn === 'p1' && !winner) {
            setValidMoves(getValidMoves(gameState));
        }
    }, [turn, winner, gameState]);

    // CPU turn
    useEffect(() => {
        if (turn === 'p2' && !winner) {
            const timer = setTimeout(() => {
                const ai = getAIAction(gameState);
                if (ai) {
                    if (ai.type === 'move') {
                        setGameState(prev => movePawn(prev, ai.to));
                    } else {
                        setGameState(prev => placeWall(prev, ai.wall));
                    }
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (row: number, col: number) => {
        if (turn !== 'p1' || winner) return;

        if (action === 'move' && validMoves.some(v => v.row === row && v.col === col)) {
            setGameState(prev => movePawn(prev, { row, col }));
        }
    };

    const handleWallClick = (row: number, col: number) => {
        if (turn !== 'p1' || winner || action !== 'wall') return;
        const wall: Wall = { row, col, orientation: wallOrient };
        if (canPlaceWall(gameState, wall)) {
            setGameState(prev => placeWall(prev, wall));
        }
    };

    const resetGame = () => {
        setGameState(initializeGame());
        setAction('move');
    };

    const winnerForModal = winner === 'p1' ? 'player' : winner === 'p2' ? 'cpu' : null;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-3 items-center mb-3">
                <div className="glass px-3 py-1.5 rounded-xl text-xs">
                    <span className="text-green-400 font-bold">You: {wallCounts.p1}</span> walls
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {winner ? (winner === 'p1' ? 'YOU WIN' : 'CPU WINS') : turn === 'p1' ? 'YOUR TURN' : 'CPU...'}
                </div>
                <div className="glass px-3 py-1.5 rounded-xl text-xs">
                    <span className="text-red-400 font-bold">CPU: {wallCounts.p2}</span> walls
                </div>
            </div>

            {/* Action toggles */}
            {turn === 'p1' && !winner && (
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => setAction('move')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${action === 'move' ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500' : 'text-slate-500'}`}
                    >Move</button>
                    <button
                        onClick={() => setAction('wall')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${action === 'wall' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500' : 'text-slate-500'}`}
                    >Wall</button>
                    {action === 'wall' && (
                        <button
                            onClick={() => setWallOrient(prev => prev === 'h' ? 'v' : 'h')}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300"
                        >{wallOrient === 'h' ? '─ Horizontal' : '│ Vertical'}</button>
                    )}
                </div>
            )}

            {/* Board */}
            <div className="glass-strong p-3 sm:p-4 rounded-2xl">
                {/* Goal label top */}
                <div className="text-center text-[10px] text-green-400 font-bold mb-1">← YOUR GOAL →</div>

                <div className="relative">
                    {Array.from({ length: BOARD_SIZE }).map((_, r) => (
                        <div key={r} className="flex">
                            {Array.from({ length: BOARD_SIZE }).map((_, c) => {
                                const isP1 = pawns.p1.row === r && pawns.p1.col === c;
                                const isP2 = pawns.p2.row === r && pawns.p2.col === c;
                                const isValid = action === 'move' && validMoves.some(v => v.row === r && v.col === c);

                                return (
                                    <React.Fragment key={c}>
                                        <div
                                            onClick={() => action === 'move' ? handleCellClick(r, c) : null}
                                            className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded transition-all cursor-pointer
                                                ${isValid ? 'bg-green-500/20 ring-1 ring-green-500/50' : 'bg-slate-800/40'}
                                                ${r === 0 ? 'border-t border-green-500/30' : ''}
                                                ${r === BOARD_SIZE - 1 ? 'border-b border-red-500/30' : ''}
                                            `}
                                        >
                                            {isP1 && (
                                                <motion.div layoutId="p1" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-green-300 shadow-lg" />
                                            )}
                                            {isP2 && (
                                                <motion.div layoutId="p2" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-red-400 to-rose-600 border-2 border-red-300 shadow-lg" />
                                            )}
                                            {isValid && !isP1 && !isP2 && (
                                                <div className="w-2 h-2 rounded-full bg-green-400/60" />
                                            )}
                                        </div>

                                        {/* Vertical wall slot */}
                                        {c < BOARD_SIZE - 1 && (
                                            <div
                                                onClick={() => action === 'wall' && wallOrient === 'v' ? handleWallClick(r, c) : null}
                                                className={`w-1.5 sm:w-2 h-7 sm:h-9 rounded-sm transition-all
                                                    ${walls.some(w => w.orientation === 'v' && w.col === c && (w.row === r || w.row === r - 1))
                                                        ? 'bg-amber-500'
                                                        : action === 'wall' && wallOrient === 'v' ? 'bg-slate-700/30 hover:bg-amber-500/40 cursor-pointer' : 'bg-transparent'}
                                                `}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Goal label bottom */}
                <div className="text-center text-[10px] text-red-400 font-bold mt-1">← CPU GOAL →</div>
            </div>

            <GameOverModal
                winner={winnerForModal}
                playerLabel="You"
                cpuLabel="CPU"
                accentColor="green"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
