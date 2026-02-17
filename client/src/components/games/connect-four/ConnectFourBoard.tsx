"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import GameOverModal from "@/components/games/GameOverModal";
import {
    GameState,
    getInitialGameState,
    dropDisc,
    ROWS,
    COLS,
    getAIMove,
} from "@/lib/connectFourLogic";

export default function ConnectFourBoard() {
    const [gameState, setGameState] = useState<GameState>(getInitialGameState());
    const [aiThinking, setAiThinking] = useState(false);
    const [hoverCol, setHoverCol] = useState<number | null>(null);

    // AI Move Effect
    useEffect(() => {
        if (gameState.currentPlayer === "yellow" && !gameState.winner && !aiThinking) {
            setAiThinking(true);
            setTimeout(() => {
                const col = getAIMove(gameState);
                if (col !== -1) {
                    const newGameState = dropDisc(gameState, col);
                    setGameState(newGameState);
                }
                setAiThinking(false);
            }, 800);
        }
    }, [gameState.currentPlayer, gameState.winner]);

    const handleColumnClick = (colIndex: number) => {
        if (gameState.winner || aiThinking || gameState.currentPlayer === "yellow") return;

        const newGameState = dropDisc(gameState, colIndex);
        if (newGameState !== gameState) {
            setGameState(newGameState);
        }
    };

    const resetGame = () => {
        setGameState(getInitialGameState());
        setAiThinking(false);
    };

    // Find which row a disc would land in for hover preview
    const getPreviewRow = (col: number): number => {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!gameState.board[r][col]) return r;
        }
        return -1;
    };

    const winnerForModal = gameState.winner
        ? gameState.winner === "draw" ? "draw"
            : gameState.winner === "red" ? "player" : "cpu"
        : null;

    return (
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full max-w-2xl mx-auto px-2">
            {/* Game Status */}
            <div className="flex justify-between w-full items-center glass-strong p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-4 h-4 rounded-full transition-all ${gameState.currentPlayer === "red"
                            ? "bg-red-500 shadow-[0_0_12px_#ef4444]"
                            : "bg-yellow-400 shadow-[0_0_12px_#facc15]"
                            }`}
                    />
                    <span className="text-white font-bold text-sm sm:text-base">
                        {gameState.winner
                            ? gameState.winner === "draw"
                                ? "It's a Draw!"
                                : `${gameState.winner === "red" ? "You" : "AI"} Won!`
                            : aiThinking
                                ? "AI Thinking..."
                                : `${gameState.currentPlayer === "red" ? "Your" : "AI's"} Turn`}
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
            <div className="relative bg-blue-800 p-2 sm:p-3 md:p-4 rounded-xl shadow-[0_0_30px_rgba(30,64,175,0.4)] border-4 border-blue-900">
                {/* Column Hover Areas */}
                <div className="absolute inset-0 z-10 grid grid-cols-7 h-full w-full">
                    {Array.from({ length: COLS }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            onClick={() => handleColumnClick(colIndex)}
                            onMouseEnter={() => setHoverCol(colIndex)}
                            onMouseLeave={() => setHoverCol(null)}
                            className="cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
                    {gameState.board.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            const isPreview = hoverCol === colIndex && getPreviewRow(colIndex) === rowIndex && !gameState.winner && !aiThinking && gameState.currentPlayer === "red";

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-slate-950 shadow-inner relative overflow-hidden"
                                >
                                    {/* Hover Ghost Disc */}
                                    {isPreview && (
                                        <div className="w-full h-full rounded-full bg-red-500/20 border-2 border-red-500/30" />
                                    )}

                                    <AnimatePresence mode="popLayout">
                                        {cell && (
                                            <motion.div
                                                initial={{ y: -300, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                                className={`w-full h-full rounded-full shadow-lg border-4 border-opacity-20 absolute inset-0 ${cell === "red"
                                                    ? "bg-gradient-to-br from-red-400 to-red-600 border-white shadow-[inset_0_-4px_6px_rgba(0,0,0,0.3)]"
                                                    : "bg-gradient-to-br from-yellow-300 to-yellow-500 border-white shadow-[inset_0_-4px_6px_rgba(0,0,0,0.3)]"
                                                    }`}
                                            >
                                                {/* Shine Effect */}
                                                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-1/3 h-1/3 bg-white opacity-25 rounded-full blur-[2px]" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Board Feet */}
                <div className="absolute -bottom-4 sm:-bottom-6 -left-2 w-3 sm:w-4 h-6 sm:h-8 bg-blue-900 rounded-b-lg" />
                <div className="absolute -bottom-4 sm:-bottom-6 -right-2 w-3 sm:w-4 h-6 sm:h-8 bg-blue-900 rounded-b-lg" />
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                accentColor="blue"
                onPlayAgain={resetGame}
                show={!!gameState.winner}
            />
        </div>
    );
}
