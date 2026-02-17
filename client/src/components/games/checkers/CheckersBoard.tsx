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
} from "@/lib/checkersLogic";

export default function CheckersBoard() {
    const [gameState, setGameState] = useState<GameState>(getInitialGameState());
    const [aiThinking, setAiThinking] = useState(false);

    // AI Move Effect — Red is CPU
    useEffect(() => {
        if (gameState.currentPlayer === "red" && !gameState.winner && !aiThinking) {
            setAiThinking(true);
            const timer = setTimeout(() => {
                const performAITurn = (state: GameState): GameState => {
                    const move = getAIMove(state);
                    if (!move) return state;

                    // Select the piece
                    let newState = handleCellClick(state, move.from.row, move.from.col);
                    // Make the move
                    newState = handleCellClick(newState, move.to.row, move.to.col);

                    // Check for multi-jump (AI must continue capturing)
                    if (newState.currentPlayer === "red" && newState.mustCapture && newState.selectedCell) {
                        return performAITurn(newState);
                    }

                    return newState;
                };

                const newState = performAITurn(gameState);
                setGameState(newState);
                setAiThinking(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [gameState.currentPlayer, gameState.winner, aiThinking]);

    const onCellClick = (row: number, col: number) => {
        if (gameState.winner || aiThinking || gameState.currentPlayer === "red") return;

        const newState = handleCellClick(gameState, row, col);
        if (newState !== gameState) {
            setGameState(newState);
        }
    };

    const resetGame = () => {
        setGameState(getInitialGameState());
        setAiThinking(false);
    };

    const winnerForModal = gameState.winner
        ? gameState.winner === "white" ? "player" : "cpu"
        : null;

    return (
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full max-w-2xl mx-auto px-2">
            {/* Game Status */}
            <div className="flex justify-between w-full items-center glass-strong p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-4 h-4 rounded-full transition-all ${gameState.currentPlayer === "white"
                            ? "bg-slate-200 shadow-[0_0_12px_#ffffff]"
                            : "bg-red-500 shadow-[0_0_12px_#ef4444]"
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

            {/* Game Board */}
            <div className="relative bg-[#4a3b32] p-2 sm:p-3 md:p-4 rounded-xl shadow-2xl border-4 border-[#3d2b23]">
                <div
                    className="grid gap-0"
                    style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
                >
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
                                        w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 relative flex items-center justify-center transition-colors
                                        ${isDark ? "bg-[#2e201a]" : "bg-[#eecfa1]"}
                                        ${isValidMove ? "cursor-pointer" : ""}
                                    `}
                                >
                                    {/* Valid Move Indicator */}
                                    {isValidMove && (
                                        <div className="absolute inset-0 bg-green-500/30 animate-pulse" />
                                    )}

                                    {/* Piece */}
                                    <AnimatePresence>
                                        {cell && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className={`
                                                    w-[75%] h-[75%] rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.5)]
                                                    ${cell.player === "red"
                                                        ? "bg-gradient-to-br from-red-500 to-red-700 border-2 sm:border-4 border-red-900"
                                                        : "bg-gradient-to-br from-slate-100 to-slate-300 border-2 sm:border-4 border-slate-400"}
                                                    ${isSelected ? "ring-2 sm:ring-4 ring-yellow-400 scale-110 z-10" : ""}
                                                    flex items-center justify-center relative
                                                `}
                                            >
                                                {/* King Crown */}
                                                {cell.type === "king" && (
                                                    <div className="text-base sm:text-xl">👑</div>
                                                )}

                                                {/* Inner shine */}
                                                <div className="absolute top-1 left-1 w-1/3 h-1/3 bg-white opacity-20 rounded-full blur-[2px]" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                accentColor="amber"
                onPlayAgain={resetGame}
                show={!!gameState.winner}
            />
        </div>
    );
}
