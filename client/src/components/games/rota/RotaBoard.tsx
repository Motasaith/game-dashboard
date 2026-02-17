"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import { getBestPlacement, getBestMove } from '@/lib/aiEngine';
import GameOverModal from '@/components/games/GameOverModal';

// --- CONSTANTS ---
const ADJACENCY: { [key: number]: number[] } = {
    0: [1, 7, 8], 1: [0, 2, 8], 2: [1, 3, 8], 3: [2, 4, 8],
    4: [3, 5, 8], 5: [4, 6, 8], 6: [5, 7, 8], 7: [6, 0, 8],
    8: [0, 1, 2, 3, 4, 5, 6, 7]
};

const WIN_LINES = [
    [0, 8, 4], [1, 8, 5], [2, 8, 6], [3, 8, 7],
    [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5],
    [4, 5, 6], [5, 6, 7], [6, 7, 0], [7, 0, 1]
];

interface RotaBoardProps {
    mode?: 'online' | 'cpu';
    gameState?: any;
    playerId?: string;
    onMove?: (move: any) => void;
    onGameOver?: (winner: string) => void;
    onStateChange?: (state: any) => void;
}

const RotaBoard: React.FC<RotaBoardProps> = ({ mode = 'online', gameState: propGameState, playerId, onMove, onGameOver, onStateChange }) => {
    // --- Local State for CPU Mode ---
    const [localState, setLocalState] = useState({
        board: Array(9).fill(null),
        turn: null as string | null,
        phase: 'placing',
        piecesPlaced: { player: 0, cpu: 0 },
        winner: null as string | null,
        winReason: null as string | null
    });

    const [showToss, setShowToss] = useState(mode !== 'online');
    const [tossResult, setTossResult] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<number | null>(null);

    // --- Derived State ---
    const isOnline = mode === 'online';
    const currentGameState = isOnline ? propGameState : localState;
    const { board, turn, phase, winner, winReason } = currentGameState || {}; // Safe access

    // In online mode, playerId is passed. In CPU mode, 'player' is always the human.
    const isMyTurn = isOnline ? turn === playerId : turn === 'player';
    const mySymbol = isOnline ? (propGameState?.players?.[playerId || ''] || 'X') : 'X';

    // Reset selection on turn change
    useEffect(() => {
        setSelectedNode(null);
    }, [turn]);

    // Sync Local State to Parent (for UI indicators)
    // Sync Local State to Parent (for UI indicators + Game Over)
    useEffect(() => {
        if (!isOnline) {
            if (onStateChange) onStateChange(localState);
            if (localState.winner && onGameOver) {
                onGameOver(localState.winner);
            }
        }
    }, [localState, isOnline, onStateChange, onGameOver]);

    // --- Toss Logic (CPU Mode) ---
    useEffect(() => {
        if (!isOnline && showToss) {
            const timer = setTimeout(() => {
                const result = Math.random() < 0.5 ? 'player' : 'cpu';
                setTossResult(result);
                setTimeout(() => {
                    setLocalState(prev => ({ ...prev, turn: result }));
                    setShowToss(false);
                }, 2000);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOnline, showToss]);

    // --- CPU Logic (Minimax) ---
    useEffect(() => {
        if (!isOnline && turn === 'cpu' && !winner && !showToss) {

            // Check if CPU is trapped before thinking (Movement Phase)
            if (phase === 'moving') {
                const moves = getAvailableMoves(localState, 'cpu');
                if (moves.length === 0) {
                    setLocalState(prev => ({ ...prev, winner: playerId || 'player', winReason: 'trapped' }));
                    // if (onGameOver) onGameOver(playerId || 'player'); // Moved to useEffect
                    return;
                }
            }

            const timer = setTimeout(() => {
                makeCpuMove();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isOnline, turn, winner, showToss, localState.phase, localState.board]);

    const makeCpuMove = () => {
        let bestMove = null;
        const cpuColor = 'O';
        const playerColor = 'X';

        if (localState.phase === 'placing') {
            if (localState.piecesPlaced.cpu >= 3) return;
            bestMove = getBestPlacement(localState.board, cpuColor, playerColor);
        } else {
            bestMove = getBestMove(localState.board, cpuColor, playerColor);
        }

        if (bestMove) {
            handleLocalMove('cpu', bestMove);
        } else {
            // Trapped logic fallback
            if (localState.phase === 'moving' && !winner) {
                setLocalState(prev => ({ ...prev, winner: playerId || 'player', winReason: 'trapped' }));
                // if (onGameOver) onGameOver(playerId || 'player'); // Moved to useEffect
            }
        }
    };

    // Helper: Available Moves
    const getAvailableMoves = (state: any, actor: string) => {
        const moves: any[] = [];
        const symbol = actor === 'player' ? 'X' : 'O';

        if (state.phase === 'placing') {
            if (state.piecesPlaced[actor as keyof typeof state.piecesPlaced] >= 3) return []; // No moves if 3 pieces placed
            state.board.forEach((cell: any, index: number) => {
                if (cell === null) moves.push({ index });
            });
        } else {
            const pieces = state.board.map((cell: any, idx: number) => cell === symbol ? idx : -1).filter((idx: number) => idx !== -1);
            pieces.forEach((from: number) => {
                ADJACENCY[from].forEach(to => {
                    if (state.board[to] === null) {
                        moves.push({ from, to });
                    }
                });
            });
        }
        return moves;
    };

    // Helper: Check Win (FIXED LOGIC)
    const checkWinSimple = (board: any[]) => {
        for (let line of WIN_LINES) {
            if (board[line[0]] && board[line[0]] === board[line[1]] && board[line[0]] === board[line[2]]) {
                return board[line[0]];
            }
        }
        return null;
    };

    const handleLocalMove = (actor: string, move: any) => {
        setLocalState(prev => {
            // --- SECURITY GATEKEEPER ---
            let targetIndex;
            if (prev.phase === 'placing') {
                targetIndex = move.index;
            } else {
                targetIndex = move.to;
            }

            if (prev.board[targetIndex] !== null) {
                console.warn(`🚨 CHEATING DETECTED: ${actor} tried to move to occupied spot ${targetIndex}. BLOCKED.`);
                return prev;
            }

            if (prev.phase === 'moving' && prev.board[move.from] === (actor === 'player' ? 'O' : 'X')) {
                console.warn(`🚨 CHEATING DETECTED: ${actor} tried to move opponent's piece. BLOCKED.`);
                return prev;
            }

            const newState = {
                ...prev,
                board: [...prev.board],
                piecesPlaced: { ...prev.piecesPlaced }
            };

            const symbol = actor === 'player' ? 'X' : 'O';
            const opponent = actor === 'player' ? 'cpu' : 'player';

            if (newState.phase === 'placing') {
                if (newState.piecesPlaced[actor as keyof typeof newState.piecesPlaced] >= 3) return prev;

                newState.board[move.index] = symbol;
                newState.piecesPlaced[actor as keyof typeof newState.piecesPlaced]++;

                if (checkWinSimple(newState.board) === symbol) {
                    const winnerId = actor === 'player' ? (playerId || 'player') : 'cpu';
                    newState.winner = winnerId;
                    newState.winReason = 'line';
                    // if (onGameOver) onGameOver(newState.winner); // Moved to useEffect
                } else {
                    if (newState.piecesPlaced.player === 3 && newState.piecesPlaced.cpu === 3) {
                        newState.phase = 'moving';
                    }
                    newState.turn = opponent;
                }
            } else {
                newState.board[move.from] = null;
                newState.board[move.to] = symbol;

                if (checkWinSimple(newState.board) === symbol) {
                    const winnerId = actor === 'player' ? (playerId || 'player') : 'cpu';
                    newState.winner = winnerId;
                    newState.winReason = 'line';
                    // if (onGameOver) onGameOver(newState.winner); // Moved to useEffect
                } else {
                    const opponentMoves = getAvailableMoves(newState, opponent);
                    if (opponentMoves.length === 0) {
                        const winnerId = actor === 'player' ? (playerId || 'player') : 'cpu';
                        newState.winner = winnerId;
                        newState.winReason = 'trapped';
                        // if (onGameOver) onGameOver(newState.winner); // Moved to useEffect
                    } else {
                        newState.turn = opponent;
                    }
                }
            }
            return newState;
        });
    };

    const handleClick = (index: number) => {
        if (!isMyTurn || winner || showToss) return;

        if (phase === 'placing') {
            if (isOnline) {
                if (onMove) onMove({ index });
            } else {
                if (localState.piecesPlaced.player >= 3) return;
                if (localState.board[index] === null) {
                    handleLocalMove('player', { index });
                }
            }
        } else {
            if (selectedNode === null) {
                if (board[index] === mySymbol) {
                    setSelectedNode(index);
                }
            } else {
                if (index === selectedNode) {
                    setSelectedNode(null);
                } else {
                    if (isOnline) {
                        if (onMove) onMove({ from: selectedNode, to: index });
                    } else {
                        if (localState.board[index] === null && ADJACENCY[selectedNode].includes(index)) {
                            handleLocalMove('player', { from: selectedNode, to: index });
                        }
                    }
                    setSelectedNode(null);
                }
            }
        }
    };

    const getPieceColor = (symbol: string) => {
        if (symbol === 'X') return 'bg-cyan-500 shadow-[0_0_15px_#06b6d4]';
        if (symbol === 'O') return 'bg-purple-500 shadow-[0_0_15px_#a855f7]';
        return '';
    };

    const center = { x: 200, y: 200 };
    const radius = 140;
    const nodes: { id: number, x: number, y: number }[] = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        nodes.push({
            id: i,
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        });
    }
    nodes.push({ id: 8, x: center.x, y: center.y });

    const resetGame = () => {
        setLocalState({
            board: Array(9).fill(null),
            turn: null as string | null,
            phase: 'placing',
            piecesPlaced: { player: 0, cpu: 0 },
            winner: null as string | null,
            winReason: null as string | null
        });
        setShowToss(mode !== 'online');
        setTossResult(null);
        setSelectedNode(null);
    };

    const winnerForModal = winner
        ? (winner === playerId || winner === 'player') ? 'player' : 'cpu'
        : null;

    return (
        <div className="relative w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] aspect-square mx-auto select-none">
            {/* Toss Overlay */}
            <AnimatePresence>
                {!isOnline && showToss && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-full"
                    >
                        <motion.div
                            animate={{ rotateY: 1800 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="mb-4"
                        >
                            <Coins className="w-16 h-16 text-yellow-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {tossResult ? (tossResult === 'player' ? "YOU GO FIRST" : "CPU GOES FIRST") : "FLIPPING COIN..."}
                        </h3>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Board Visuals */}
            <svg viewBox="0 0 400 400" className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <circle cx="200" cy="200" r="140" stroke="#1e293b" strokeWidth="4" fill="none" />
                {nodes.slice(0, 8).map((node, i) => (
                    <line key={i} x1="200" y1="200" x2={node.x} y2={node.y} stroke="#1e293b" strokeWidth="4" />
                ))}
                {nodes.slice(0, 8).map((node, i) => {
                    const nextNode = nodes[(i + 1) % 8];
                    return <line key={`p-${i}`} x1={node.x} y1={node.y} x2={nextNode.x} y2={nextNode.y} stroke="#1e293b" strokeWidth="4" />
                })}
            </svg>

            {/* Interactive Nodes */}
            {nodes.map((node) => {
                const piece = board?.[node.id];
                const isSelected = selectedNode === node.id;

                const isAdjacent = selectedNode !== null && ADJACENCY[selectedNode].includes(node.id);
                const isValidTarget = isMyTurn && phase === 'moving' && isAdjacent && piece === null;

                const leftPct = (node.x / 400) * 100;
                const topPct = (node.y / 400) * 100;

                return (
                    <motion.div
                        key={node.id}
                        className={`absolute w-[12%] h-[12%] -ml-[6%] -mt-[6%] rounded-full flex items-center justify-center cursor-pointer transition-all z-10
                            ${piece ? getPieceColor(piece) : 'bg-slate-800 border-2 border-slate-700 hover:border-cyan-500'}
                            ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : ''}
                            ${isValidTarget ? 'bg-cyan-900/50 border-cyan-500 animate-pulse shadow-[0_0_10px_#22d3ee]' : ''}
                        `}
                        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                        onClick={() => handleClick(node.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    />
                );
            })}

            {/* Status Overlay */}
            {!isMyTurn && !winner && !showToss && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="glass-strong px-4 sm:px-6 py-2 rounded-full text-slate-300 font-bold tracking-widest uppercase text-xs sm:text-sm md:text-base">
                        {isOnline ? "Opponent's Turn" : "CPU Thinking..."}
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                accentColor="purple"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
};

export default RotaBoard;
