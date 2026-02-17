"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, initializeGame, getValidMovesForPiece, movePiece, getDropMoves, dropPiece, getAIMove, BOARD_SIZE, PIECE_LABELS, PROMOTED_LABELS, PieceType, Piece } from '@/lib/shogiLogic';
import GameOverModal from '@/components/games/GameOverModal';

function PieceDisplay({ piece, size = 'normal' }: { piece: Piece; size?: 'small' | 'normal' }) {
    const label = piece.promoted ? PROMOTED_LABELS[piece.type] : PIECE_LABELS[piece.type];
    const sizeClass = size === 'small' ? 'w-5 h-6 text-[10px]' : 'w-7 h-8 sm:w-8 sm:h-9 text-xs sm:text-sm';

    return (
        <div className={`${sizeClass} flex items-center justify-center font-black
            ${piece.player === 'sente' ? 'text-slate-100' : 'text-red-400 rotate-180'}
            ${piece.promoted ? 'text-amber-400' : ''}
        `}>
            {label}
        </div>
    );
}

export default function ShogiBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [selectedHand, setSelectedHand] = useState<PieceType | null>(null);
    const [validMoves, setValidMoves] = useState<[number, number][]>([]);

    const { board, turn, winner, hand, message } = gameState;

    // CPU turn
    useEffect(() => {
        if (turn === 'gote' && !winner) {
            const timer = setTimeout(() => {
                const action = getAIMove(gameState);
                if (action) {
                    if (action.type === 'move') {
                        setGameState(prev => movePiece(prev, action.from[0], action.from[1], action.to[0], action.to[1]));
                    } else {
                        setGameState(prev => dropPiece(prev, action.piece, action.to[0], action.to[1]));
                    }
                }
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const handleCellClick = (r: number, c: number) => {
        if (turn !== 'sente' || winner) return;

        // If dropping from hand
        if (selectedHand) {
            if (validMoves.some(([mr, mc]) => mr === r && mc === c)) {
                setGameState(prev => dropPiece(prev, selectedHand, r, c));
            }
            setSelectedHand(null);
            setSelectedCell(null);
            setValidMoves([]);
            return;
        }

        // If moving to a valid target
        if (selectedCell && validMoves.some(([mr, mc]) => mr === r && mc === c)) {
            setGameState(prev => movePiece(prev, selectedCell[0], selectedCell[1], r, c));
            setSelectedCell(null);
            setValidMoves([]);
            return;
        }

        // Select own piece
        const cell = board[r][c];
        if (cell && cell.player === 'sente') {
            setSelectedCell([r, c]);
            setSelectedHand(null);
            setValidMoves(getValidMovesForPiece(board, r, c));
            return;
        }

        // Deselect
        setSelectedCell(null);
        setSelectedHand(null);
        setValidMoves([]);
    };

    const handleHandClick = (pieceType: PieceType) => {
        if (turn !== 'sente' || winner) return;
        setSelectedHand(pieceType);
        setSelectedCell(null);
        setValidMoves(getDropMoves(board, pieceType, 'sente'));
    };

    const resetGame = () => {
        setGameState(initializeGame());
        setSelectedCell(null);
        setSelectedHand(null);
        setValidMoves([]);
    };

    const winnerForModal = winner === 'sente' ? 'player' : winner === 'gote' ? 'cpu' : null;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-4 items-center mb-3">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${turn === 'sente' ? 'glass-strong text-white' : 'text-slate-500'}`}>
                    You (先手)
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {winner ? 'GAME OVER' : turn === 'sente' ? '☖ YOUR TURN' : '☗ CPU...'}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${turn === 'gote' ? 'glass-strong text-red-400' : 'text-slate-500'}`}>
                    CPU (後手)
                </div>
            </div>

            {/* CPU hand */}
            <div className="flex gap-1 mb-2 flex-wrap justify-center">
                <span className="text-[10px] text-red-400 mr-1">CPU hand:</span>
                {hand.gote.length === 0 ? (
                    <span className="text-[10px] text-slate-600">empty</span>
                ) : hand.gote.map((pt, i) => (
                    <div key={i} className="w-5 h-6 bg-red-500/10 border border-red-500/30 rounded flex items-center justify-center text-[10px] text-red-400 font-bold rotate-180">
                        {PIECE_LABELS[pt]}
                    </div>
                ))}
            </div>

            {/* Board */}
            <div className="glass-strong p-2 sm:p-3 rounded-2xl">
                <div className="flex">
                    {/* Column numbers */}
                    <div className="w-4" />
                    {Array.from({ length: BOARD_SIZE }).map((_, c) => (
                        <div key={c} className="w-8 sm:w-9 text-center text-[8px] text-slate-600 font-mono">{9 - c}</div>
                    ))}
                </div>

                {board.map((row, r) => (
                    <div key={r} className="flex items-center">
                        <div className="w-4 text-[8px] text-slate-600 font-mono">{r + 1}</div>
                        {row.map((cell, c) => {
                            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                            const isValid = validMoves.some(([mr, mc]) => mr === r && mc === c);

                            return (
                                <div
                                    key={c}
                                    onClick={() => handleCellClick(r, c)}
                                    className={`w-8 h-9 sm:w-9 sm:h-10 border border-slate-700/40 flex items-center justify-center cursor-pointer transition-all
                                        ${isSelected ? 'bg-cyan-500/20 ring-1 ring-cyan-400' :
                                            isValid ? 'bg-green-500/15 ring-1 ring-green-500/50' :
                                                'bg-amber-900/10 hover:bg-amber-900/20'}
                                    `}
                                >
                                    {cell && (
                                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                            <PieceDisplay piece={cell} />
                                        </motion.div>
                                    )}
                                    {isValid && !cell && <div className="w-2 h-2 rounded-full bg-green-400/60" />}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Player hand */}
            <div className="flex gap-1 mt-2 flex-wrap justify-center">
                <span className="text-[10px] text-cyan-400 mr-1">Your hand:</span>
                {hand.sente.length === 0 ? (
                    <span className="text-[10px] text-slate-600">empty</span>
                ) : hand.sente.map((pt, i) => (
                    <div
                        key={i}
                        onClick={() => handleHandClick(pt)}
                        className={`w-6 h-7 rounded flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all
                            ${selectedHand === pt ? 'bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400' : 'bg-slate-800 border-slate-600 hover:border-cyan-500'}
                            border text-white
                        `}
                    >
                        {PIECE_LABELS[pt]}
                    </div>
                ))}
            </div>

            <GameOverModal
                winner={winnerForModal}
                playerLabel="先手"
                cpuLabel="後手"
                accentColor="amber"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
