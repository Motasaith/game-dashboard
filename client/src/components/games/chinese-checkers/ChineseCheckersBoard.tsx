"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, initializeGame, selectPiece, movePiece, getAIMove, key, Pos } from '@/lib/chineseCheckersLogic';
import GameOverModal from '@/components/games/GameOverModal';

export default function ChineseCheckersBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const { board, turn, winner, selectedPiece, validMoves } = gameState;

    // CPU turn (blue)
    useEffect(() => {
        if (turn === 'blue' && !winner) {
            const timer = setTimeout(() => {
                const move = getAIMove(gameState);
                if (move) {
                    const selected = selectPiece(gameState, move.from);
                    const moved = movePiece(selected, move.to);
                    setGameState(moved);
                }
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (pos: Pos) => {
        if (turn !== 'red' || winner) return;

        const k = key(pos);
        const cellVal = board.get(k);

        // If clicking on a valid move destination
        if (selectedPiece && validMoves.some(m => key(m) === k)) {
            setGameState(prev => movePiece(prev, pos));
            return;
        }

        // If clicking own piece, select it
        if (cellVal === 'red') {
            setGameState(prev => selectPiece(prev, pos));
            return;
        }
    };

    const resetGame = () => setGameState(initializeGame());

    const winnerForModal = winner === 'red' ? 'player' : winner === 'blue' ? 'cpu' : null;

    // Collect all board entries for rendering
    const cells: { pos: Pos; value: string | null }[] = [];
    for (const [k, v] of board) {
        cells.push({ pos: { row: parseInt(k.split(',')[0]), col: parseInt(k.split(',')[1]) }, value: v });
    }

    // Get row range
    const rows = new Set(cells.map(c => c.pos.row));
    const sortedRows = [...rows].sort((a, b) => a - b);

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-4 items-center mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'red' && !winner ? 'glass-strong ring-2 ring-red-500' : ''}`}>
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-slate-300">YOU</span>
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {winner ? (winner === 'red' ? 'YOU WIN' : 'CPU WINS') : (turn === 'red' ? 'YOUR TURN' : 'CPU...')}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${turn === 'blue' && !winner ? 'glass-strong ring-2 ring-blue-500' : ''}`}>
                    <span className="text-xs font-bold text-slate-300">CPU</span>
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                </div>
            </div>

            {/* Board */}
            <div className="glass-strong p-3 sm:p-4 rounded-2xl">
                {sortedRows.map(row => {
                    const rowCells = cells.filter(c => c.pos.row === row).sort((a, b) => a.pos.col - b.pos.col);

                    return (
                        <div key={row} className="flex justify-center gap-0.5 sm:gap-1">
                            {rowCells.map(({ pos, value }) => {
                                const k = key(pos);
                                const isSelected = selectedPiece && key(selectedPiece) === k;
                                const isValid = validMoves.some(m => key(m) === k);

                                return (
                                    <motion.div
                                        key={k}
                                        whileHover={turn === 'red' ? { scale: 1.1 } : {}}
                                        onClick={() => handleCellClick(pos)}
                                        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all
                                            ${isSelected ? 'ring-2 ring-yellow-400 bg-yellow-400/20' :
                                                isValid ? 'ring-2 ring-green-400 bg-green-400/10' :
                                                    'bg-slate-800/40'}
                                        `}
                                    >
                                        {value === 'red' && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-300 shadow-md"
                                            />
                                        )}
                                        {value === 'blue' && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-300 shadow-md"
                                            />
                                        )}
                                        {value === null && isValid && (
                                            <div className="w-2 h-2 rounded-full bg-green-400/50" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <p className="mt-3 text-slate-600 text-xs text-center">
                Click a piece to select, then click a highlighted cell to move. Hop over pieces for chain jumps!
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
