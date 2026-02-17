"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import GameOverModal from "@/components/games/GameOverModal";
import {
    GameState,
    getInitialGameState,
    handleCellClick,
    getAIMove,
    BOARD_SIZE,
    Piece
} from "@/lib/chessLogic";

const PIECE_SYMBOLS: { [key: string]: string } = {
    "white-king": "♔", "white-queen": "♕", "white-rook": "♖", "white-bishop": "♗", "white-knight": "♘", "white-pawn": "♙",
    "black-king": "♚", "black-queen": "♛", "black-rook": "♜", "black-bishop": "♝", "black-knight": "♞", "black-pawn": "♟"
};

export default function ChessBoard() {
    const [gameState, setGameState] = useState<GameState>(getInitialGameState());
    const [aiThinking, setAiThinking] = useState(false);
    const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({ white: [], black: [] });

    // AI Move Effect
    useEffect(() => {
        if (gameState.currentPlayer === "black" && !gameState.winner && !aiThinking) {
            setAiThinking(true);
            setTimeout(() => {
                const move = getAIMove(gameState);
                if (move) {
                    // 1. Select
                    let state = handleCellClick(gameState, move.from.row, move.from.col);
                    // Check if target has a piece to capture
                    const targetPiece = gameState.board[move.to.row][move.to.col];
                    if (targetPiece) {
                        setCapturedPieces(prev => ({
                            ...prev,
                            [targetPiece.player]: [...prev[targetPiece.player], PIECE_SYMBOLS[`${targetPiece.player}-${targetPiece.type}`]]
                        }));
                    }
                    // 2. Move
                    state = handleCellClick(state, move.to.row, move.to.col);

                    setGameState(state);
                }
                setAiThinking(false);
            }, 1000);
        }
    }, [gameState.currentPlayer, gameState.winner]);

    const onCellClick = (row: number, col: number) => {
        if (gameState.winner || aiThinking || gameState.currentPlayer === "black") return;

        // Track captured pieces
        if (gameState.selectedCell && gameState.validMoves.some(m => m.row === row && m.col === col)) {
            const targetPiece = gameState.board[row][col];
            if (targetPiece) {
                setCapturedPieces(prev => ({
                    ...prev,
                    [targetPiece.player]: [...prev[targetPiece.player], PIECE_SYMBOLS[`${targetPiece.player}-${targetPiece.type}`]]
                }));
            }
        }

        const newState = handleCellClick(gameState, row, col);
        if (newState !== gameState) {
            setGameState(newState);
        }
    };

    const resetGame = () => {
        setGameState(getInitialGameState());
        setAiThinking(false);
        setCapturedPieces({ white: [], black: [] });
    };

    const winnerForModal = gameState.winner
        ? gameState.winner === "draw" ? "draw"
            : gameState.winner === "white" ? "player" : "cpu"
        : null;

    return (
        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 w-full max-w-2xl mx-auto px-2">
            {/* Game Status */}
            <div className="flex justify-between w-full items-center glass-strong p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-4 h-4 rounded-full transition-all ${gameState.currentPlayer === "white"
                            ? "bg-white shadow-[0_0_12px_#ffffff]"
                            : "bg-slate-800 shadow-[0_0_12px_#000000] border border-slate-500"
                            }`}
                    />
                    <span className="text-white font-bold text-sm sm:text-base">
                        {gameState.winner
                            ? `${gameState.winner === "white" ? "You" : "AI"} Won!`
                            : aiThinking
                                ? "AI Thinking..."
                                : `${gameState.currentPlayer === "white" ? "Your" : "AI's"} Turn`}
                    </span>
                </div>
                <Button
                    variant="outline"
                    onClick={resetGame}
                    className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm"
                >
                    Reset
                </Button>
            </div>

            {/* Captured Pieces — Black's captures */}
            <div className="w-full flex items-center gap-1 min-h-[28px] px-2">
                <span className="text-xs text-slate-500 mr-2 hidden sm:inline">AI captured:</span>
                <div className="flex flex-wrap gap-0.5">
                    {capturedPieces.white.map((p, i) => (
                        <span key={i} className="text-lg sm:text-xl opacity-60">{p}</span>
                    ))}
                </div>
            </div>

            {/* Chess Board */}
            <div className="relative bg-[#769656] p-1.5 sm:p-2 md:p-4 rounded-xl shadow-2xl border-4 border-[#3d2b23]">
                <div className="grid grid-cols-8 border-2 sm:border-4 border-[#eeeed2]">
                    {gameState.board.map((row, r) =>
                        row.map((cell, c) => {
                            const isDark = (r + c) % 2 === 1;
                            const isSelected = gameState.selectedCell?.row === r && gameState.selectedCell?.col === c;
                            const isValidMove = gameState.validMoves.some(m => m.row === r && m.col === c);

                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => onCellClick(r, c)}
                                    className={`
                                        w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl select-none cursor-pointer relative
                                        ${isDark ? "bg-[#769656]" : "bg-[#eeeed2]"}
                                        ${isSelected ? "!bg-[#baca44]" : ""}
                                    `}
                                >
                                    {/* Valid Move Marker */}
                                    {isValidMove && !cell && (
                                        <div className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-black/20 rounded-full" />
                                    )}
                                    {isValidMove && cell && (
                                        <div className="absolute inset-0 border-2 sm:border-4 border-black/20 rounded-full" />
                                    )}

                                    {/* Piece */}
                                    <AnimatePresence>
                                        {cell && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`${cell.player === "white"
                                                    ? "text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.8)]"
                                                    : "text-black drop-shadow-[0_2px_1px_rgba(255,255,255,0.5)]"}`}
                                            >
                                                {PIECE_SYMBOLS[`${cell.player}-${cell.type}`]}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Notation */}
                                    {c === 0 && (
                                        <span className={`absolute left-0.5 top-0.5 text-[0.4rem] sm:text-[0.5rem] md:text-xs font-bold ${isDark ? "text-[#eeeed2]" : "text-[#769656]"}`}>{8 - r}</span>
                                    )}
                                    {r === 7 && (
                                        <span className={`absolute right-0.5 bottom-0 text-[0.4rem] sm:text-[0.5rem] md:text-xs font-bold ${isDark ? "text-[#eeeed2]" : "text-[#769656]"}`}>{String.fromCharCode(97 + c)}</span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Captured Pieces — White's captures */}
            <div className="w-full flex items-center gap-1 min-h-[28px] px-2">
                <span className="text-xs text-slate-500 mr-2 hidden sm:inline">You captured:</span>
                <div className="flex flex-wrap gap-0.5">
                    {capturedPieces.black.map((p, i) => (
                        <span key={i} className="text-lg sm:text-xl opacity-60">{p}</span>
                    ))}
                </div>
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                accentColor="green"
                onPlayAgain={resetGame}
                show={!!gameState.winner}
            />
        </div>
    );
}
