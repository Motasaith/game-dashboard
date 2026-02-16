"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, INITIAL_STATE, ADJACENCY, checkMill, getBestMove, MILLS } from '@/lib/nineMensMorrisLogic';
import { Cpu } from 'lucide-react';

// Coordinates for rendering the 24 nodes (3 concentric squares)
const NODES = [
    // Outer
    { id: 0, x: 0, y: 0 }, { id: 1, x: 50, y: 0 }, { id: 2, x: 100, y: 0 },
    // Middle
    { id: 3, x: 16.6, y: 16.6 }, { id: 4, x: 50, y: 16.6 }, { id: 5, x: 83.3, y: 16.6 },
    // Inner
    { id: 6, x: 33.3, y: 33.3 }, { id: 7, x: 50, y: 33.3 }, { id: 8, x: 66.6, y: 33.3 },

    // Left
    { id: 9, x: 0, y: 50 }, { id: 10, x: 16.6, y: 50 }, { id: 11, x: 33.3, y: 50 },
    // Right
    { id: 12, x: 66.6, y: 50 }, { id: 13, x: 83.3, y: 50 }, { id: 14, x: 100, y: 50 },

    // Inner Bottom
    { id: 15, x: 33.3, y: 66.6 }, { id: 16, x: 50, y: 66.6 }, { id: 17, x: 66.6, y: 66.6 },
    // Middle Bottom
    { id: 18, x: 16.6, y: 83.3 }, { id: 19, x: 50, y: 83.3 }, { id: 20, x: 83.3, y: 83.3 },
    // Outer Bottom
    { id: 21, x: 0, y: 100 }, { id: 22, x: 50, y: 100 }, { id: 23, x: 100, y: 100 }
];

export default function MorrisBoard() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const { board, phase, turn, piecesHand, piecesBoard, selectedCell, removalPending, winner, message } = gameState;

    // --- CPU TURN ---
    useEffect(() => {
        if (turn === 'cpu' && !winner) {
            const timer = setTimeout(() => {
                const move = getBestMove(gameState);
                if (move) {
                    performMove('cpu', move);
                } else {
                    // No valid moves = loss
                    setGameState(prev => ({ ...prev, winner: 'player', message: "CPU has no valid moves!" }));
                }
            }, 1000); // 1s delay
            return () => clearTimeout(timer);
        }
    }, [turn, winner, phase]);

    const performMove = (actor: 'player' | 'cpu', move: { from?: number, to: number, remove?: number }) => {
        setGameState(prev => {
            const newBoard = [...prev.board];
            let newPhase = prev.phase;
            let msg = prev.message;
            let pendingRemoval = false;
            let nextTurn: 'player' | 'cpu' = actor === 'player' ? 'cpu' : 'player';

            // 1. Placing
            if (prev.phase === 'placing') {
                newBoard[move.to] = actor;
                prev.piecesHand[actor]--;
                prev.piecesBoard[actor]++;

                if (prev.piecesHand.player === 0 && prev.piecesHand.cpu === 0) {
                    newPhase = 'moving';
                }
            }
            // 2. Moving / Flying
            else {
                if (move.from !== undefined) newBoard[move.from] = null;
                newBoard[move.to] = actor;
            }

            // Check Mill
            if (checkMill(newBoard, move.to, actor)) {
                if (actor === 'cpu' && move.remove !== undefined) {
                    newBoard[move.remove] = null;
                    prev.piecesBoard.player--;
                    msg = "CPU formed a mill and removed your piece!";
                } else if (actor === 'player') {
                    pendingRemoval = true;
                    msg = "Mill formed! Select opponent's piece to remove.";
                    nextTurn = 'player'; // Player keeps turn to remove
                }
            } else {
                msg = nextTurn === 'player' ? "Your turn" : "CPU Thinking...";
            }

            // Check Win Condition (pieces < 3 in moving phase)
            let newWinner = prev.winner;
            if (newBoard.filter(c => c === 'player').length < 3 && newPhase !== 'placing') newWinner = 'cpu';
            if (newBoard.filter(c => c === 'cpu').length < 3 && newPhase !== 'placing') newWinner = 'player';

            // Check Flying Unlock
            if (newPhase === 'moving') {
                if (prev.piecesBoard[actor] === 3) newPhase = 'flying'; // Actor unlocks flying next turn? No, rules say if you have 3 pieces.
                // Logic check: if opponent reduced to 3, they fly? 
                // The phase is global in this simple state, but really it's per player.
                // Let's rely on Valid Moves logic which handles 'flying' per player.
            }

            return {
                ...prev,
                board: newBoard,
                phase: newPhase,
                turn: nextTurn,
                selectedCell: null,
                message: msg,
                removalPending: pendingRemoval,
                winner: newWinner
            };
        });
    };

    const handleNodeClick = (index: number) => {
        if (turn !== 'player' || winner) return;

        // Removal Phase
        if (removalPending) {
            if (board[index] === 'cpu') {
                // Validate if piece is in a mill (unless all are in mills)
                const isMill = checkMill(board, index, 'cpu');
                const nonMillPieces = board.map((c, i) => c === 'cpu' && !checkMill(board, i, 'cpu') ? i : -1).filter(i => i !== -1);

                if (isMill && nonMillPieces.length > 0) {
                    setGameState(prev => ({ ...prev, message: "Cannot remove a piece from a mill unless no other options!" }));
                    return;
                }

                setGameState(prev => {
                    const newBoard = [...prev.board];
                    newBoard[index] = null;
                    prev.piecesBoard.cpu--;

                    let newWinner = prev.winner;
                    if (prev.piecesBoard.cpu < 3 && prev.phase !== 'placing') newWinner = 'player';

                    return {
                        ...prev, // Keep prev state refs
                        board: newBoard,
                        removalPending: false,
                        turn: 'cpu',
                        message: "CPU Thinking...",
                        winner: newWinner
                    };
                });
            }
            return;
        }

        // Placing Phase
        if (phase === 'placing') {
            if (board[index] === null) {
                performMove('player', { to: index });
            }
        }
        // Moving Phase
        else {
            if (board[index] === 'player') {
                setGameState(prev => ({ ...prev, selectedCell: index }));
            } else if (board[index] === null && selectedCell !== null) {
                // Validate Move
                const isAdjacent = ADJACENCY[selectedCell].includes(index);
                const isFlying = piecesBoard.player === 3;

                if (isAdjacent || isFlying) {
                    performMove('player', { from: selectedCell, to: index });
                }
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* HUD */}
            <div className="w-full max-w-md flex justify-between mb-8 text-sm md:text-base font-bold text-slate-400">
                <div className={`p-3 rounded-lg flex gap-2 items-center transition-colors ${turn === 'player' ? 'bg-cyan-500/10 text-cyan-400' : ''}`}>
                    <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
                    <span>YOU: {piecesHand.player > 0 ? `${piecesHand.player} to place` : piecesBoard.player}</span>
                </div>
                <div className={`p-3 rounded-lg flex gap-2 items-center transition-colors ${turn === 'cpu' ? 'bg-red-500/10 text-red-500' : ''}`}>
                    <span>CPU: {piecesHand.cpu > 0 ? `${piecesHand.cpu} to place` : piecesBoard.cpu}</span>
                    <Cpu className="w-4 h-4" />
                </div>
            </div>

            <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px] bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl p-8 select-none">

                {/* Board Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full p-[10%] pointer-events-none stroke-slate-700 stroke-4" style={{ padding: '8%' }}>
                    {/* Squares */}
                    <rect x="0%" y="0%" width="100%" height="100%" fill="none" rx="4" />
                    <rect x="16.6%" y="16.6%" width="66.6%" height="66.6%" fill="none" rx="4" />
                    <rect x="33.3%" y="33.3%" width="33.3%" height="33.3%" fill="none" rx="4" />
                    {/* Connectors */}
                    <line x1="50%" y1="0%" x2="50%" y2="33.3%" />
                    <line x1="50%" y1="66.6%" x2="50%" y2="100%" />
                    <line x1="0%" y1="50%" x2="33.3%" y2="50%" />
                    <line x1="66.6%" y1="50%" x2="100%" y2="50%" />
                </svg>

                {/* Nodes */}
                <div className="relative w-full h-full">
                    {NODES.map((node) => {
                        const cellState = board[node.id];
                        const isSelected = selectedCell === node.id;
                        const validTarget = selectedCell !== null && board[node.id] === null && (ADJACENCY[selectedCell].includes(node.id) || piecesBoard.player === 3);

                        return (
                            <motion.div
                                key={node.id}
                                className={`absolute w-6 h-6 md:w-8 md:h-8 -ml-3 -mt-3 md:-ml-4 md:-mt-4 rounded-full border-2 cursor-pointer z-10 flex items-center justify-center transition-all
                                    ${cellState === 'player' ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_15px_#06b6d4]' :
                                        cellState === 'cpu' ? 'bg-red-500 border-red-300 shadow-[0_0_15px_#ef4444]' :
                                            'bg-slate-800 border-slate-600 hover:border-white'}
                                    ${isSelected ? 'ring-4 ring-yellow-400 scale-125' : ''}
                                    ${validTarget ? 'bg-green-500/20 border-green-500 animate-pulse' : ''}
                                `}
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                onClick={() => handleNodeClick(node.id)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                            />
                        );
                    })}
                </div>

                {/* Message Overlay */}
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <span className="bg-slate-950/80 px-4 py-2 rounded-full text-slate-200 text-sm font-bold border border-slate-700 backdrop-blur-sm">
                        {message}
                    </span>
                </div>

                {/* Game Over Overlay */}
                {winner && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
                        <div className="text-center">
                            <h2 className={`text-5xl font-black mb-4 ${winner === 'player' ? 'text-green-500' : 'text-red-500'}`}>
                                {winner === 'player' ? 'VICTORY' : 'DEFEAT'}
                            </h2>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
