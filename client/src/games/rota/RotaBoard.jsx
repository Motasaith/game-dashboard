import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import { getBestPlacement, getBestMove } from './aiEngine';

const RotaBoard = ({ mode = 'online', gameState: propGameState, playerId, onMove, onGameOver }) => {
    // --- Local State for CPU Mode ---
    const [localState, setLocalState] = useState({
        board: Array(9).fill(null),
        turn: null, 
        phase: 'placing',
        piecesPlaced: { player: 0, cpu: 0 },
        winner: null,
        winReason: null // 'line' or 'trapped'
    });

    const [showToss, setShowToss] = useState(true);
    const [tossResult, setTossResult] = useState(null); 

    // --- Derived State ---
    const isOnline = mode === 'online';
    const currentGameState = isOnline ? propGameState : localState;
    
    const { board, turn, phase, winner, winReason } = currentGameState;
    
    // In online mode, playerId is passed. In CPU mode, 'player' is always the human.
    const isMyTurn = isOnline ? turn === playerId : turn === 'player';
    const mySymbol = isOnline ? propGameState.players[playerId] : 'X'; 

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
                    setLocalState(prev => ({ ...prev, winner: playerId, winReason: 'trapped' })); // Player wins
                    if (onGameOver) onGameOver(playerId);
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
            // Strict check: Don't place if already have 3
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
                 setLocalState(prev => ({ ...prev, winner: playerId, winReason: 'trapped' }));
                 if (onGameOver) onGameOver(playerId);
            }
        }
    };
    
    // Helper for local moves (used by UI and AI)
    const getAvailableMoves = (state, actor) => {
        const moves = [];
        const symbol = actor === 'player' ? 'X' : 'O';
        
        if (state.phase === 'placing') {
            state.board.forEach((cell, index) => {
                if (cell === null) moves.push({ index });
            });
        } else {
            const pieces = state.board.map((cell, idx) => cell === symbol ? idx : -1).filter(idx => idx !== -1);
            const adjacency = {
                0: [1, 7, 8], 1: [0, 2, 8], 2: [1, 3, 8], 3: [2, 4, 8],
                4: [3, 5, 8], 5: [4, 6, 8], 6: [5, 7, 8], 7: [6, 0, 8],
                8: [0, 1, 2, 3, 4, 5, 6, 7]
            };
            pieces.forEach(from => {
                adjacency[from].forEach(to => {
                    if (state.board[to] === null) {
                        moves.push({ from, to });
                    }
                });
            });
        }
        return moves;
    };

    const checkWinSimple = (board) => {
        const lines = [
            [0, 8, 4], [1, 8, 5], [2, 8, 6], [3, 8, 7], // Diameters
            [0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 0]  // Perimeter (Corner-Edge-Corner only)
        ];
        for (let line of lines) {
            if (board[line[0]] && board[line[0]] === board[line[1]] && board[line[0]] === board[line[2]]) {
                return board[line[0]];
            }
        }
        return null;
    };

    const handleLocalMove = (actor, move) => {
        setLocalState(prev => {
            // DEEP COPY to prevent mutation bugs
            const newState = { 
                ...prev,
                board: [...prev.board],
                piecesPlaced: { ...prev.piecesPlaced }
            };
            
            const symbol = actor === 'player' ? 'X' : 'O';
            const opponent = actor === 'player' ? 'cpu' : 'player';

            if (newState.phase === 'placing') {
                // STRICT GUARD: Stop at 3 pieces
                if (newState.piecesPlaced[actor] >= 3) return prev;

                newState.board[move.index] = symbol;
                newState.piecesPlaced[actor]++;
                
                if (checkWinSimple(newState.board) === symbol) {
                    newState.winner = actor === 'player' ? playerId : 'cpu';
                    newState.winReason = 'line';
                    if (onGameOver) onGameOver(newState.winner);
                } else {
                    // Check if phase should change (Strictly after 6th piece)
                    if (newState.piecesPlaced.player === 3 && newState.piecesPlaced.cpu === 3) {
                        newState.phase = 'moving';
                    }
                    newState.turn = opponent;
                }
            } else {
                newState.board[move.from] = null;
                newState.board[move.to] = symbol;

                if (checkWinSimple(newState.board) === symbol) {
                    newState.winner = actor === 'player' ? playerId : 'cpu';
                    newState.winReason = 'line';
                    if (onGameOver) onGameOver(newState.winner);
                } else {
                    // Check if opponent is trapped
                    const opponentMoves = getAvailableMoves(newState, opponent);
                    if (opponentMoves.length === 0) {
                         newState.winner = actor === 'player' ? playerId : 'cpu'; 
                         newState.winReason = 'trapped';
                         if (onGameOver) onGameOver(newState.winner);
                    } else {
                        newState.turn = opponent;
                    }
                }
            }
            return newState;
        });
    };

    // --- Interaction ---
    const [selectedNode, setSelectedNode] = useState(null);

    // Reset selection on turn change
    useEffect(() => {
        setSelectedNode(null);
    }, [turn]);

    const handleClick = (index) => {
        if (!isMyTurn || winner || showToss) return;

        if (phase === 'placing') {
            if (isOnline) {
                onMove({ index });
            } else {
                // STRICT GUARD: Stop at 3 pieces for Player
                if (localState.piecesPlaced.player >= 3) return;

                if (localState.board[index] === null) {
                    handleLocalMove('player', { index });
                }
            }
        } else {
            // Moving Phase
            if (selectedNode === null) {
                if (board[index] === mySymbol) {
                    setSelectedNode(index);
                }
            } else {
                if (index === selectedNode) {
                    setSelectedNode(null);
                } else {
                    // Attempt move
                    if (isOnline) {
                        onMove({ from: selectedNode, to: index });
                    } else {
                        // Validate local move simple check
                        const adjacency = {
                            0: [1, 7, 8], 1: [0, 2, 8], 2: [1, 3, 8], 3: [2, 4, 8],
                            4: [3, 5, 8], 5: [4, 6, 8], 6: [5, 7, 8], 7: [6, 0, 8],
                            8: [0, 1, 2, 3, 4, 5, 6, 7]
                        };
                        if (localState.board[index] === null && adjacency[selectedNode].includes(index)) {
                            handleLocalMove('player', { from: selectedNode, to: index });
                        }
                    }
                    setSelectedNode(null);
                }
            }
        }
    };

    // Helper to get piece color
    const getPieceColor = (symbol) => {
        if (symbol === 'X') return 'bg-cyan-500 shadow-[0_0_15px_#06b6d4]';
        if (symbol === 'O') return 'bg-purple-500 shadow-[0_0_15px_#a855f7]';
        return '';
    };

    // SVG Coordinates
    const center = { x: 200, y: 200 };
    const radius = 140;
    const nodes = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        nodes.push({
            id: i,
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        });
    }
    nodes.push({ id: 8, x: center.x, y: center.y });

    return (
        <div className="relative w-[400px] h-[400px] mx-auto select-none">
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

            {/* Game Board SVG */}
            <svg width="400" height="400" className="absolute top-0 left-0 z-0 pointer-events-none">
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
                    return <line key={`p-${i}`} x1={node.x} y1={node.y} x2={nextNode.x} y2={nextNode.y} stroke="#1e293b" strokeWidth="4" />;
                })}
            </svg>

            {/* Interactive Nodes */}
            {nodes.map((node) => {
                const piece = board[node.id];
                const isSelected = selectedNode === node.id;
                const isValidTarget = isMyTurn && phase === 'moving' && selectedNode !== null && piece === null;
                
                return (
                    <motion.div
                        key={node.id}
                        className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center cursor-pointer transition-all z-10
                            ${piece ? getPieceColor(piece) : 'bg-slate-800 border-2 border-slate-700 hover:border-cyan-500'}
                            ${isSelected ? 'ring-4 ring-yellow-400 scale-110' : ''}
                            ${isValidTarget ? 'bg-cyan-900/50 border-cyan-500 animate-pulse' : ''}
                        `}
                        style={{ left: node.x, top: node.y }}
                        onClick={() => handleClick(node.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    />
                );
            })}

            {/* Status Overlay */}
            {!isMyTurn && !winner && !showToss && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-700 text-slate-300 font-bold tracking-widest uppercase">
                        {isOnline ? "Opponent's Turn" : "CPU Thinking..."}
                    </div>
                </div>
            )}
            
            {winner && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-xl">
                    <div className="text-center">
                        <h2 className={`text-4xl font-black mb-2 ${
                            (isOnline && winner === playerId) || (!isOnline && winner === playerId) 
                            ? 'text-green-400' : 'text-red-500'
                        }`}>
                            {(isOnline && winner === playerId) || (!isOnline && winner === playerId) ? 'VICTORY' : 'DEFEAT'}
                        </h2>
                        <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">
                            {winReason === 'trapped' 
                                ? ((isOnline && winner === playerId) || (!isOnline && winner === playerId) ? "OPPONENT TRAPPED" : "YOU WERE TRAPPED")
                                : "GAME OVER"
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RotaBoard;
