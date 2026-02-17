"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GameState, INITIAL_STATE, Color, COLORS, startGame, startNewRound, handlePlayerInput } from '@/lib/simonSaysLogic';
import { RotateCcw, Volume2 } from 'lucide-react';

const COLOR_MAP: Record<Color, { base: string; active: string; glow: string }> = {
    red: { base: 'bg-red-700', active: 'bg-red-500', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.8)]' },
    green: { base: 'bg-green-700', active: 'bg-green-500', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.8)]' },
    blue: { base: 'bg-blue-700', active: 'bg-blue-500', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.8)]' },
    yellow: { base: 'bg-yellow-700', active: 'bg-yellow-400', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.8)]' },
};

const CORNER_RADIUS: Record<Color, string> = {
    red: 'rounded-tl-[50%]',
    green: 'rounded-tr-[50%]',
    blue: 'rounded-bl-[50%]',
    yellow: 'rounded-br-[50%]',
};

export default function SimonSaysBoard() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [flashingColor, setFlashingColor] = useState<Color | null>(null);
    const showingRef = useRef(false);

    const { phase, round, highScore, sequence } = gameState;

    // Show sequence animation
    const showSequence = useCallback(async (seq: Color[]) => {
        showingRef.current = true;
        await new Promise(r => setTimeout(r, 500));

        for (let i = 0; i < seq.length; i++) {
            setFlashingColor(seq[i]);
            await new Promise(r => setTimeout(r, 500));
            setFlashingColor(null);
            await new Promise(r => setTimeout(r, 200));
        }

        showingRef.current = false;
        setGameState(prev => ({ ...prev, phase: 'input' }));
    }, []);

    // Trigger sequence showing
    useEffect(() => {
        if (phase === 'showing' && !showingRef.current) {
            showSequence(sequence);
        }
    }, [phase, sequence, showSequence]);

    // Auto-advance after success
    useEffect(() => {
        if (phase === 'success') {
            const timer = setTimeout(() => {
                setGameState(prev => startNewRound(prev));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    const handlePadClick = (color: Color) => {
        if (phase !== 'input' || showingRef.current) return;

        // Flash feedback
        setFlashingColor(color);
        setTimeout(() => setFlashingColor(null), 200);

        setGameState(prev => handlePlayerInput(prev, color));
    };

    const handleStart = () => {
        setGameState(startGame());
    };

    const resetGame = () => {
        showingRef.current = false;
        setFlashingColor(null);
        setGameState(INITIAL_STATE);
    };

    return (
        <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto px-2">
            {/* Score HUD */}
            <div className="w-full flex justify-between items-center mb-6 sm:mb-8">
                <div className="glass-strong px-4 py-2 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Round</div>
                    <div className="text-2xl font-black text-white">{round}</div>
                </div>

                <div className="glass px-3 py-1.5 rounded-full font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">
                    {phase === 'idle' ? 'PRESS START' :
                        phase === 'showing' ? 'WATCH...' :
                            phase === 'input' ? 'YOUR TURN' :
                                phase === 'success' ? '✓ CORRECT!' :
                                    'GAME OVER'}
                </div>

                <div className="glass-strong px-4 py-2 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Best</div>
                    <div className="text-2xl font-black text-amber-400">{highScore}</div>
                </div>
            </div>

            {/* Simon Board */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full h-full">
                    {COLORS.map((color) => {
                        const isActive = flashingColor === color;
                        const colors = COLOR_MAP[color];
                        const corner = CORNER_RADIUS[color];

                        return (
                            <motion.button
                                key={color}
                                whileTap={phase === 'input' ? { scale: 0.95 } : {}}
                                onClick={() => handlePadClick(color)}
                                disabled={phase !== 'input'}
                                className={`${corner} transition-all duration-200 border-2 border-slate-900
                                    ${isActive ? `${colors.active} ${colors.glow}` : colors.base}
                                    ${phase === 'input' ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}
                                `}
                            />
                        );
                    })}
                </div>

                {/* Center Circle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center">
                        {phase === 'idle' ? (
                            <button
                                onClick={handleStart}
                                className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider pointer-events-auto hover:text-cyan-400 transition-colors"
                            >
                                Start
                            </button>
                        ) : phase === 'gameover' ? (
                            <button
                                onClick={handleStart}
                                className="text-red-400 font-bold text-xs sm:text-sm uppercase tracking-wider pointer-events-auto hover:text-white transition-colors"
                            >
                                Retry
                            </button>
                        ) : (
                            <Volume2 className="w-6 h-6 text-slate-600" />
                        )}
                    </div>
                </div>
            </div>

            {/* Game Over Feedback */}
            {phase === 'gameover' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 glass-strong px-6 py-4 rounded-2xl text-center"
                >
                    <p className="text-red-400 font-bold text-lg">Wrong!</p>
                    <p className="text-slate-400 text-sm">You reached round {round}</p>
                    <button
                        onClick={handleStart}
                        className="mt-3 px-6 py-2 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform text-sm"
                    >
                        Try Again
                    </button>
                </motion.div>
            )}
        </div>
    );
}
