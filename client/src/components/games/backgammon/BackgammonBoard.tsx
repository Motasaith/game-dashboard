"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameState, initializeGame, rollDice, getValidMoves, applyMove, getAIMove, Move } from '@/lib/backgammonLogic';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import GameOverModal from '@/components/games/GameOverModal';

const DiceIcon = ({ value }: { value: number }) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[Math.min(value - 1, 5)] || Dice1;
    return <Icon className="w-8 h-8 sm:w-10 sm:h-10" />;
};

export default function BackgammonBoard() {
    const [gameState, setGameState] = useState<GameState>(initializeGame());
    const [selectedPoint, setSelectedPoint] = useState<number | 'bar' | null>(null);
    const [validMoves, setValidMoves] = useState<Move[]>([]);

    const { points, bar, borneOff, dice, turn, phase, winner, remainingMoves, message } = gameState;

    // CPU turn
    useEffect(() => {
        if (turn === 'black' && phase === 'rolling') {
            const timer = setTimeout(() => {
                const rolled = rollDice(gameState);
                setGameState(rolled);
            }, 600);
            return () => clearTimeout(timer);
        }

        if (turn === 'black' && phase === 'moving') {
            const timer = setTimeout(() => {
                const move = getAIMove(gameState);
                if (move) {
                    setGameState(prev => applyMove(prev, move));
                } else {
                    setGameState(prev => ({
                        ...prev,
                        phase: 'rolling',
                        turn: 'white',
                        remainingMoves: [],
                    }));
                }
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [turn, phase, gameState]);

    const handleRoll = () => {
        if (turn !== 'white' || phase !== 'rolling') return;
        setGameState(prev => rollDice(prev));
    };

    const handlePointClick = (index: number | 'bar') => {
        if (turn !== 'white' || phase !== 'moving') return;

        if (selectedPoint === null) {
            // Select a piece
            const allMoves = getValidMoves(gameState);
            const movesFromHere = allMoves.filter(m => m.from === index);
            if (movesFromHere.length > 0) {
                setSelectedPoint(index);
                setValidMoves(movesFromHere);
            }
        } else if (selectedPoint === index) {
            // Deselect
            setSelectedPoint(null);
            setValidMoves([]);
        } else {
            // Try to move
            const move = validMoves.find(m => m.to === index);
            if (move) {
                setGameState(prev => applyMove(prev, move));
                setSelectedPoint(null);
                setValidMoves([]);
            }
        }
    };

    const handleBearOff = () => {
        const move = validMoves.find(m => m.to === 'off');
        if (move) {
            setGameState(prev => applyMove(prev, move));
            setSelectedPoint(null);
            setValidMoves([]);
        }
    };

    const resetGame = () => {
        setGameState(initializeGame());
        setSelectedPoint(null);
        setValidMoves([]);
    };

    const renderPoint = (index: number, inverted: boolean) => {
        const count = Math.abs(points[index]);
        const player = points[index] > 0 ? 'white' : points[index] < 0 ? 'black' : null;
        const isSelected = selectedPoint === index;
        const isTarget = validMoves.some(m => m.to === index);
        const maxShow = Math.min(count, 5);

        return (
            <div
                key={index}
                onClick={() => handlePointClick(index)}
                className={`relative w-7 sm:w-9 flex flex-col ${inverted ? 'items-center justify-end' : 'items-center justify-start'} h-28 sm:h-36 cursor-pointer
                    ${isSelected ? 'bg-cyan-500/20 rounded' : isTarget ? 'bg-green-500/10 rounded' : ''}
                `}
            >
                {/* Triangle */}
                <div className={`absolute ${inverted ? 'bottom-0' : 'top-0'} w-0 h-0 
                    border-l-[14px] sm:border-l-[18px] border-r-[14px] sm:border-r-[18px] border-transparent
                    ${inverted
                        ? `border-b-[80px] sm:border-b-[100px] ${index % 2 === 0 ? 'border-b-slate-800' : 'border-b-slate-700'}`
                        : `border-t-[80px] sm:border-t-[100px] ${index % 2 === 0 ? 'border-t-slate-800' : 'border-t-slate-700'}`
                    }
                `} />

                {/* Checkers */}
                <div className={`relative z-10 flex flex-col ${inverted ? 'flex-col-reverse' : ''} gap-0.5 sm:gap-1 ${inverted ? 'pb-1' : 'pt-1'}`}>
                    {Array.from({ length: maxShow }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 shadow-md
                                ${player === 'white' ? 'bg-gradient-to-br from-white to-slate-200 border-slate-300' :
                                    'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500'}
                            `}
                        />
                    ))}
                    {count > 5 && (
                        <div className="text-[9px] font-bold text-slate-400 text-center">{count}</div>
                    )}
                </div>

                {/* Point number */}
                <div className={`absolute ${inverted ? 'top-0 -mt-4' : 'bottom-0 -mb-4'} text-[8px] text-slate-600 font-mono`}>
                    {index + 1}
                </div>
            </div>
        );
    };

    const winnerForModal = winner === 'white' ? 'player' : winner === 'black' ? 'cpu' : null;

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto px-2">
            {/* HUD */}
            <div className="flex items-center gap-4 mb-4">
                <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${turn === 'white' ? 'glass-strong text-white' : 'text-slate-500'}`}>
                    You (White)
                </div>
                <div className="flex gap-2 items-center">
                    {dice[0] > 0 && <DiceIcon value={dice[0]} />}
                    {dice[1] > 0 && <DiceIcon value={dice[1]} />}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${turn === 'black' ? 'glass-strong text-white' : 'text-slate-500'}`}>
                    CPU (Black)
                </div>
            </div>

            {/* Roll button */}
            {turn === 'white' && phase === 'rolling' && (
                <button onClick={handleRoll} className="mb-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:scale-105 transition-transform">
                    Roll Dice
                </button>
            )}

            {/* Remaining moves */}
            {remainingMoves.length > 0 && turn === 'white' && (
                <div className="flex gap-2 mb-3">
                    <span className="text-xs text-slate-500">Moves left:</span>
                    {remainingMoves.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded">{v}</span>
                    ))}
                </div>
            )}

            {/* Board */}
            <div className="glass-strong p-2 sm:p-3 rounded-xl">
                {/* Top half (points 12-23) */}
                <div className="flex gap-px">
                    <div className="flex gap-px">
                        {Array.from({ length: 6 }).map((_, i) => renderPoint(12 + i, false))}
                    </div>
                    <div className="w-6 sm:w-8 glass rounded flex items-center justify-center">
                        <span className="text-[8px] text-slate-600 [writing-mode:vertical-lr]">BAR</span>
                    </div>
                    <div className="flex gap-px">
                        {Array.from({ length: 6 }).map((_, i) => renderPoint(18 + i, false))}
                    </div>
                </div>

                {/* Bar & borne off */}
                <div className="h-8 sm:h-12 flex items-center justify-between px-2 my-1">
                    <div className="text-[10px] text-slate-500">Bar: W{bar.white} B{bar.black}</div>
                    <div className="text-xs text-slate-400 font-bold">{message}</div>
                    <div className="text-[10px] text-slate-500">Off: W{borneOff.white} B{borneOff.black}</div>
                </div>

                {/* Bottom half (points 11-0, reversed) */}
                <div className="flex gap-px">
                    <div className="flex gap-px">
                        {Array.from({ length: 6 }).map((_, i) => renderPoint(11 - i, true))}
                    </div>
                    <div className="w-6 sm:w-8 glass rounded" />
                    <div className="flex gap-px">
                        {Array.from({ length: 6 }).map((_, i) => renderPoint(5 - i, true))}
                    </div>
                </div>
            </div>

            {/* Bear off button */}
            {validMoves.some(m => m.to === 'off') && (
                <button onClick={handleBearOff} className="mt-3 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-bold hover:bg-green-500/30">
                    Bear Off
                </button>
            )}

            <GameOverModal
                winner={winnerForModal}
                playerLabel="White"
                cpuLabel="Black"
                accentColor="amber"
                onPlayAgain={resetGame}
                show={phase === 'gameover'}
            />
        </div>
    );
}
