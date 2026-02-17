"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, initializeGame, getPlayableTiles, playTile, drawTile, getCPUAction } from '@/lib/dominoesLogic';
import GameOverModal from '@/components/games/GameOverModal';

function DominoTile({ left, right, small, highlighted, onClick }: {
    left: number; right: number; small?: boolean; highlighted?: boolean; onClick?: () => void;
}) {
    const size = small ? 'w-8 h-14 sm:w-10 sm:h-16' : 'w-10 h-16 sm:w-12 sm:h-20';
    const dotSize = small ? 'text-[10px]' : 'text-xs sm:text-sm';

    return (
        <motion.div
            whileHover={onClick ? { scale: 1.1, y: -4 } : {}}
            onClick={onClick}
            className={`${size} rounded-lg border-2 flex flex-col items-center justify-between py-1 transition-all
                ${highlighted ? 'border-green-400 bg-green-500/10 cursor-pointer shadow-lg shadow-green-500/20' :
                    onClick ? 'border-slate-500 bg-slate-800/80 cursor-pointer hover:border-cyan-400' :
                        'border-slate-600 bg-slate-800/60'}
            `}
        >
            <span className={`${dotSize} font-black text-white`}>{left}</span>
            <div className="w-full h-px bg-slate-600" />
            <span className={`${dotSize} font-black text-white`}>{right}</span>
        </motion.div>
    );
}

export default function DominoesBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const [selectedTile, setSelectedTile] = useState<number | null>(null);

    const { chain, playerHand, cpuHand, boneyard, turn, winner, scores, message } = gameState;

    // CPU turn
    useEffect(() => {
        if (turn === 'cpu' && !winner) {
            const timer = setTimeout(() => {
                const action = getCPUAction(gameState);
                if (action.type === 'play') {
                    setGameState(prev => playTile(prev, action.index, action.side));
                } else {
                    // CPU draws until it can play or boneyard is empty
                    let state = gameState;
                    let drew = false;
                    for (let i = 0; i < 5; i++) {
                        const playable = getPlayableTiles(state.cpuHand, state.chain);
                        if (playable.length > 0) {
                            const best = playable.sort((a, b) => (b.tile.left + b.tile.right) - (a.tile.left + a.tile.right))[0];
                            state = playTile(state, best.index, best.side);
                            drew = true;
                            break;
                        }
                        if (state.boneyard.length === 0) break;
                        state = drawTile(state);
                    }
                    if (!drew) {
                        state = drawTile(state); // Pass
                    }
                    setGameState(state);
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [turn, winner, gameState]);

    const playable = turn === 'player' ? getPlayableTiles(playerHand, chain) : [];

    const handleTileClick = (index: number) => {
        if (turn !== 'player' || winner) return;

        const tilePlays = playable.filter(p => p.index === index);

        if (tilePlays.length === 0) return;

        if (tilePlays.length === 1) {
            setGameState(prev => playTile(prev, index, tilePlays[0].side));
            setSelectedTile(null);
        } else {
            // Can play on either side — toggle selection
            if (selectedTile === index) {
                // Second click: play on right side (first click was left)
                setGameState(prev => playTile(prev, index, 'right'));
                setSelectedTile(null);
            } else {
                setSelectedTile(index);
            }
        }
    };

    const handleDraw = () => {
        if (turn !== 'player' || winner) return;
        setGameState(prev => drawTile(prev));
    };

    const resetGame = () => {
        setGameState(initializeGame());
        setSelectedTile(null);
    };

    const winnerForModal = winner === 'player' ? 'player' : winner === 'cpu' ? 'cpu' : winner === 'draw' ? 'draw' : null;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-3 items-center mb-3">
                <div className="glass px-3 py-1 rounded-xl text-xs">
                    <span className="text-cyan-400 font-bold">You: {scores.player}</span>
                </div>
                <div className="glass px-3 py-1 rounded-full text-[10px] font-mono text-slate-500 uppercase">
                    {winner ? 'GAME OVER' : turn === 'player' ? 'YOUR TURN' : 'CPU...'}
                </div>
                <div className="glass px-3 py-1 rounded-xl text-xs">
                    <span className="text-red-400 font-bold">CPU: {scores.cpu}</span>
                </div>
            </div>

            {/* CPU hand (hidden) */}
            <div className="flex gap-1 mb-3 flex-wrap justify-center">
                {cpuHand.map((_, i) => (
                    <div key={i} className="w-6 h-10 sm:w-8 sm:h-12 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[8px] text-red-400">?</div>
                ))}
            </div>

            {/* Chain */}
            <div className="glass-strong p-3 sm:p-4 rounded-2xl mb-3 min-h-[80px] w-full max-w-lg overflow-x-auto">
                <div className="flex items-center gap-1 justify-center min-w-max">
                    {chain.length === 0 ? (
                        <span className="text-slate-600 text-xs">Play a tile to start</span>
                    ) : (
                        chain.map((entry, i) => {
                            const l = entry.reversed ? entry.tile.right : entry.tile.left;
                            const r = entry.reversed ? entry.tile.left : entry.tile.right;
                            return <DominoTile key={i} left={l} right={r} small />;
                        })
                    )}
                </div>
            </div>

            {/* Message */}
            {message && <div className="text-xs text-slate-400 mb-2">{message}</div>}

            {/* Player hand */}
            <div className="flex gap-1.5 flex-wrap justify-center mb-3">
                {playerHand.map((tile, i) => {
                    const isPlayable = playable.some(p => p.index === i);
                    return (
                        <DominoTile
                            key={i}
                            left={tile.left}
                            right={tile.right}
                            highlighted={isPlayable}
                            onClick={isPlayable ? () => handleTileClick(i) : undefined}
                        />
                    );
                })}
            </div>

            {/* Draw button */}
            {turn === 'player' && !winner && (
                <button
                    onClick={handleDraw}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition"
                >
                    {boneyard.length > 0 ? `Draw (${boneyard.length} left)` : 'Pass'}
                </button>
            )}

            <GameOverModal
                winner={winnerForModal}
                playerLabel="You"
                cpuLabel="CPU"
                scores={scores}
                accentColor="cyan"
                onPlayAgain={resetGame}
                show={!!winner}
            />
        </div>
    );
}
