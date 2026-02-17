"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import GameOverModal from "@/components/games/GameOverModal";
import {
    GameState,
    getInitialGameState,
    sowSeeds,
    isValidMove,
    getAIMove,
    BOTTOM_STORE,
    TOP_STORE,
} from "@/lib/mancalaLogic";

export default function MancalaBoard() {
    const [gameState, setGameState] = useState<GameState>(getInitialGameState());
    const [aiThinking, setAiThinking] = useState(false);

    // AI Move Effect
    useEffect(() => {
        if (gameState.currentPlayer === "top" && !gameState.winner && !aiThinking) {
            setAiThinking(true);
            setTimeout(() => {
                const pitIndex = getAIMove(gameState);
                if (pitIndex !== -1) {
                    const newGameState = sowSeeds(gameState, pitIndex);
                    setGameState(newGameState);
                }
                setAiThinking(false);
            }, 1000);
        }
    }, [gameState.currentPlayer, gameState.winner]);

    const handlePitClick = (pitIndex: number) => {
        if (gameState.winner || aiThinking || gameState.currentPlayer === "top") return;
        if (!isValidMove(gameState, pitIndex)) return;

        const newGameState = sowSeeds(gameState, pitIndex);
        setGameState(newGameState);
    };

    const resetGame = () => {
        setGameState(getInitialGameState());
        setAiThinking(false);
    };

    const winnerForModal = gameState.winner
        ? gameState.winner === "draw" ? "draw"
            : gameState.winner === "bottom" ? "player" : "cpu"
        : null;

    return (
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl mx-auto px-2">
            {/* Game Status */}
            <div className="flex justify-between w-full items-center glass-strong p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-4 h-4 rounded-full transition-all ${gameState.currentPlayer === "bottom"
                            ? "bg-amber-500 shadow-[0_0_12px_#f59e0b]"
                            : "bg-blue-400 shadow-[0_0_12px_#60a5fa]"
                            }`}
                    />
                    <span className="text-white font-bold text-sm sm:text-base">
                        {gameState.winner
                            ? gameState.winner === "draw"
                                ? "It's a Draw!"
                                : `${gameState.winner === "bottom" ? "You" : "AI"} Won!`
                            : aiThinking
                                ? "AI Thinking..."
                                : `${gameState.currentPlayer === "bottom" ? "Your" : "AI's"} Turn`}
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

            {/* Mancala Board */}
            <div className="relative bg-[#3e2723] p-3 sm:p-4 md:p-6 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border-4 sm:border-8 border-[#2d1b18] w-full flex items-center justify-between gap-2 sm:gap-4">

                {/* Top Store (AI) — Left side */}
                <div className="w-14 sm:w-20 md:w-24 h-28 sm:h-36 md:h-48 bg-[#2d1b18] rounded-full shadow-inner flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
                    <span className="text-white/20 font-bold text-xs sm:text-sm mb-1">AI</span>
                    <div className="flex flex-wrap gap-0.5 sm:gap-1 p-2 sm:p-4 justify-center">
                        {Array.from({ length: Math.min(gameState.pits[TOP_STORE], 20) }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full shadow-sm"
                            />
                        ))}
                    </div>
                    <div className="absolute bottom-1 sm:bottom-2 text-white font-bold text-lg sm:text-xl">{gameState.pits[TOP_STORE]}</div>
                </div>

                {/* Pits Area */}
                <div className="flex-1 flex flex-col gap-2 sm:gap-4">
                    {/* Top Row (AI Pits) - Indices 12 down to 7 */}
                    <div className="flex justify-around">
                        {[12, 11, 10, 9, 8, 7].map((pitIndex) => (
                            <div key={pitIndex} className="flex flex-col items-center gap-1 sm:gap-2">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#2d1b18] rounded-full shadow-inner flex flex-wrap gap-0.5 sm:gap-1 p-1.5 sm:p-3 items-center justify-center relative">
                                    {Array.from({ length: Math.min(gameState.pits[pitIndex], 12) }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-blue-400 rounded-full shadow-sm"
                                        />
                                    ))}
                                    <div className="absolute -top-4 sm:-top-6 text-white/30 text-[10px] sm:text-xs font-bold">{gameState.pits[pitIndex]}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Row (Player Pits) - Indices 0 up to 5 */}
                    <div className="flex justify-around">
                        {[0, 1, 2, 3, 4, 5].map((pitIndex) => {
                            const isMyTurn = gameState.currentPlayer === "bottom" && !gameState.winner && !aiThinking;
                            const canMove = isValidMove(gameState, pitIndex);

                            return (
                                <div key={pitIndex} className="flex flex-col items-center gap-1 sm:gap-2">
                                    <div
                                        onClick={() => handlePitClick(pitIndex)}
                                        className={`
                                            w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#2d1b18] rounded-full shadow-inner flex flex-wrap gap-0.5 sm:gap-1 p-1.5 sm:p-3 items-center justify-center relative transition-all
                                            ${isMyTurn && canMove ? "cursor-pointer hover:ring-2 hover:ring-amber-500 hover:bg-[#3e2723]" : "opacity-90"}
                                        `}
                                    >
                                        {Array.from({ length: Math.min(gameState.pits[pitIndex], 12) }).map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-amber-400 rounded-full shadow-sm"
                                            />
                                        ))}
                                        <div className="absolute -bottom-4 sm:-bottom-6 text-white/30 text-[10px] sm:text-xs font-bold">{gameState.pits[pitIndex]}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Store (Player) — Right side */}
                <div className="w-14 sm:w-20 md:w-24 h-28 sm:h-36 md:h-48 bg-[#2d1b18] rounded-full shadow-inner flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
                    <span className="text-white/20 font-bold text-xs sm:text-sm mb-1">YOU</span>
                    <div className="flex flex-wrap gap-0.5 sm:gap-1 p-2 sm:p-4 justify-center">
                        {Array.from({ length: Math.min(gameState.pits[BOTTOM_STORE], 20) }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-400 rounded-full shadow-sm"
                            />
                        ))}
                    </div>
                    <div className="absolute bottom-1 sm:bottom-2 text-white font-bold text-lg sm:text-xl">{gameState.pits[BOTTOM_STORE]}</div>
                </div>
            </div>

            {/* Game Over Modal */}
            <GameOverModal
                winner={winnerForModal}
                playerLabel="You"
                cpuLabel="AI"
                scores={{ player: gameState.pits[BOTTOM_STORE], cpu: gameState.pits[TOP_STORE] }}
                accentColor="amber"
                onPlayAgain={resetGame}
                show={!!gameState.winner}
            />
        </div>
    );
}
