"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, initializeGame, selectTile, isTileFree, getHint, Tile } from '@/lib/mahjongLogic';
import GameOverModal from '@/components/games/GameOverModal';

export default function MahjongBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const [hintIds, setHintIds] = useState<number[]>([]);
    const { tiles, selected, matchesFound, totalPairs, winner, stuck } = gameState;

    const handleTileClick = (tileId: number) => {
        setHintIds([]);
        setGameState(prev => selectTile(prev, tileId));
    };

    const handleHint = () => {
        const hint = getHint(gameState);
        if (hint) setHintIds(hint);
    };

    const resetGame = () => {
        setGameState(initializeGame());
        setHintIds([]);
    };

    // Sort tiles for rendering: layer first, then position
    const sortedTiles = [...tiles].sort((a, b) => {
        if (a.layer !== b.layer) return a.layer - b.layer;
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    const tileWidth = 40;
    const tileHeight = 52;
    const layerOffset = 4;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex gap-3 items-center mb-4">
                <div className="glass px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-400">
                    Matched: {matchesFound} / {totalPairs}
                </div>
                <button onClick={handleHint} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/30 transition">
                    💡 Hint
                </button>
                <button onClick={resetGame} className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-700 transition">
                    🔄 New
                </button>
            </div>

            {/* Board */}
            <div className="glass-strong p-4 sm:p-6 rounded-2xl overflow-auto max-w-full">
                <div className="relative" style={{ width: tileWidth * 10 + 20, height: tileHeight * 7 + 20, margin: '0 auto' }}>
                    <AnimatePresence>
                        {sortedTiles.filter(t => !t.removed).map(tile => {
                            const isFree = isTileFree(tile, tiles);
                            const isSelected = selected === tile.id;
                            const isHint = hintIds.includes(tile.id);

                            const x = tile.col * tileWidth + tile.layer * layerOffset;
                            const y = tile.row * tileHeight - tile.layer * layerOffset;

                            return (
                                <motion.div
                                    key={tile.id}
                                    layout
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
                                    onClick={() => isFree && handleTileClick(tile.id)}
                                    className={`absolute rounded-lg border-2 flex flex-col items-center justify-center transition-all
                                        ${isFree ? 'cursor-pointer' : 'cursor-default opacity-70'}
                                        ${isSelected ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/30 z-50' :
                                            isHint ? 'border-amber-400 bg-amber-500/10 animate-pulse z-40' :
                                                isFree ? 'border-slate-500 bg-slate-800/90 hover:border-white hover:bg-slate-700/90 z-30' :
                                                    'border-slate-700 bg-slate-900/90 z-20'}
                                    `}
                                    style={{
                                        left: x, top: y,
                                        width: tileWidth - 4,
                                        height: tileHeight - 4,
                                        zIndex: tile.layer * 100 + (isSelected ? 50 : 0),
                                    }}
                                >
                                    <span className="text-lg">{tile.emoji}</span>
                                    <span className="text-[8px] text-slate-500 font-mono">{tile.value}</span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Stuck message */}
            {stuck && (
                <div className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-bold">
                    No more matches available! Try a new game.
                </div>
            )}

            <GameOverModal
                winner={winner ? 'player' : null}
                playerLabel="You"
                cpuLabel=""
                accentColor="cyan"
                onPlayAgain={resetGame}
                show={winner}
            />
        </div>
    );
}
