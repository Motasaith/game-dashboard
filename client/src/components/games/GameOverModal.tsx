"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Home, Trophy, Frown, Minus } from 'lucide-react';
import Link from 'next/link';

interface GameOverModalProps {
    winner: 'player' | 'cpu' | 'draw' | string | null;
    playerLabel?: string;
    cpuLabel?: string;
    scores?: { player: number; cpu: number };
    accentColor?: string; // tailwind color like 'cyan' or 'pink'
    onPlayAgain: () => void;
    show: boolean;
}

const CONFETTI_COLORS = ['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function GameOverModal({
    winner,
    playerLabel = 'You',
    cpuLabel = 'CPU',
    scores,
    accentColor = 'cyan',
    onPlayAgain,
    show,
}: GameOverModalProps) {
    const isVictory = winner === 'player';
    const isDraw = winner === 'draw';
    const isDefeat = !isVictory && !isDraw;

    const confetti = useMemo(() =>
        Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 3,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            size: 4 + Math.random() * 8,
        })),
        []
    );

    const accentMap: Record<string, { gradient: string; text: string; shadow: string }> = {
        cyan: {
            gradient: 'from-cyan-500 to-blue-600',
            text: 'text-cyan-400',
            shadow: 'shadow-cyan-500/20',
        },
        pink: {
            gradient: 'from-pink-500 to-rose-600',
            text: 'text-pink-400',
            shadow: 'shadow-pink-500/20',
        },
        green: {
            gradient: 'from-green-500 to-emerald-600',
            text: 'text-green-400',
            shadow: 'shadow-green-500/20',
        },
        purple: {
            gradient: 'from-purple-500 to-indigo-600',
            text: 'text-purple-400',
            shadow: 'shadow-purple-500/20',
        },
        amber: {
            gradient: 'from-amber-500 to-orange-600',
            text: 'text-amber-400',
            shadow: 'shadow-amber-500/20',
        },
        red: {
            gradient: 'from-red-500 to-rose-600',
            text: 'text-red-400',
            shadow: 'shadow-red-500/20',
        },
        blue: {
            gradient: 'from-blue-500 to-indigo-600',
            text: 'text-blue-400',
            shadow: 'shadow-blue-500/20',
        },
    };

    const accent = accentMap[accentColor] || accentMap.cyan;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Confetti (victory only) */}
                    {isVictory && confetti.map((piece) => (
                        <motion.div
                            key={piece.id}
                            initial={{ y: '-10vh', x: `${piece.x}vw`, opacity: 0, rotate: 0 }}
                            animate={{
                                y: '110vh',
                                opacity: [0, 1, 1, 0],
                                rotate: 720,
                            }}
                            transition={{
                                duration: piece.duration,
                                delay: piece.delay,
                                ease: 'linear',
                            }}
                            className="absolute z-40 rounded-sm"
                            style={{
                                width: piece.size,
                                height: piece.size,
                                backgroundColor: piece.color,
                                left: `${piece.x}%`,
                            }}
                        />
                    ))}

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.7, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative z-50 w-full max-w-sm mx-auto"
                    >
                        <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center overflow-hidden">
                            {/* Gradient glow behind */}
                            <div className={`absolute inset-0 opacity-10 bg-gradient-to-b ${isVictory ? accent.gradient : isDraw ? 'from-slate-400 to-slate-600' : 'from-red-500 to-red-800'
                                } to-transparent rounded-3xl`} />

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="relative z-10 mb-4 flex justify-center"
                            >
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isVictory
                                        ? `bg-gradient-to-br ${accent.gradient} shadow-lg ${accent.shadow}`
                                        : isDraw
                                            ? 'bg-slate-700 shadow-lg shadow-slate-500/20'
                                            : 'bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/20'
                                    }`}>
                                    {isVictory && <Trophy className="w-10 h-10 text-white" />}
                                    {isDraw && <Minus className="w-10 h-10 text-slate-300" />}
                                    {isDefeat && <Frown className="w-10 h-10 text-white" />}
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`relative z-10 text-4xl md:text-5xl font-black mb-2 ${isVictory ? accent.text : isDraw ? 'text-slate-200' : 'text-red-400'
                                    }`}
                            >
                                {isVictory ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT'}
                            </motion.h2>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="relative z-10 text-slate-400 mb-6 font-medium text-sm"
                            >
                                {isVictory ? 'Outstanding performance!' : isDraw ? 'A well-fought match.' : 'Better luck next time.'}
                            </motion.p>

                            {/* Scores (if provided) */}
                            {scores && (
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="relative z-10 flex justify-center gap-12 mb-8"
                                >
                                    <div className="text-center">
                                        <div className="text-xs uppercase text-slate-500 font-bold mb-1">{playerLabel}</div>
                                        <div className="text-3xl font-black text-white">{scores.player}</div>
                                    </div>
                                    <div className="text-slate-700 flex items-end text-lg font-black">vs</div>
                                    <div className="text-center">
                                        <div className="text-xs uppercase text-slate-500 font-bold mb-1">{cpuLabel}</div>
                                        <div className="text-3xl font-black text-white">{scores.cpu}</div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Buttons */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="relative z-10 flex flex-col gap-3"
                            >
                                <button
                                    onClick={onPlayAgain}
                                    className={`w-full py-3.5 bg-gradient-to-r ${accent.gradient} text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg ${accent.shadow} flex items-center justify-center gap-2`}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Play Again
                                </button>
                                <Link
                                    href="/"
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Home className="w-4 h-4" />
                                    Back to Lobby
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
