"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface RuleSection {
    title: string;
    text: React.ReactNode; // Allow strings or JSX
    color?: string; // Tailwind text color class, e.g., 'text-cyan-400'
}

interface GameLobbyProps {
    title: string;
    subtitle: string;
    gradient: string; // e.g., "from-cyan-400 to-blue-600"
    rules: RuleSection[];
    onSelectMode: (mode: 'cpu' | 'online' | 'friend') => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
    title,
    subtitle,
    gradient,
    rules,
    onSelectMode
}) => {
    const [roomCode, setRoomCode] = useState('');

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="flex items-center gap-4 mb-4 md:mb-8">
                <Link
                    href="/"
                    className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                {/* Mobile Title (hidden on desktop, shown here for nav feeling) */}
                <div className="md:hidden">
                    <h1 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
                        {title}
                    </h1>
                </div>
            </div>

            <div className="text-center mb-12 hidden md:block">
                <h1 className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient} mb-2 tracking-tighter uppercase`}>
                    {title}
                </h1>
                <p className="text-slate-400 text-lg">
                    {subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Vs CPU */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors cursor-pointer group"
                    onClick={() => onSelectMode('cpu')}
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-cyan-500/20 transition-colors">
                        <Cpu className="w-8 h-8 text-cyan-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Vs CPU</h3>
                    <p className="text-sm text-slate-400">
                        Train against the system AI. Perfect for practicing strategy.
                    </p>
                </motion.div>

                {/* Find Match */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-colors cursor-pointer group opacity-50 cursor-not-allowed"
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-purple-500/20 transition-colors">
                        <Globe className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Find Match</h3>
                    <p className="text-sm text-slate-400">
                        Online matchmaking coming soon.
                    </p>
                </motion.div>

                {/* Play with Friend */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-green-500/50 transition-colors group opacity-50 cursor-not-allowed"
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-500/20 transition-colors">
                        <Users className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Play with Friend</h3>

                    <div className="space-y-3">
                        <button
                            disabled
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors cursor-not-allowed"
                        >
                            Create Room
                        </button>

                        <div className="relative">
                            <input
                                type="text"
                                disabled
                                placeholder="Enter Code"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:ring-1 focus:ring-green-500 cursor-not-allowed"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                            />
                            <button
                                disabled
                                className="absolute right-1 top-1 bottom-1 px-2 bg-green-600 hover:bg-green-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* How to Play Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-left"
            >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-cyan-400">?</span> How to Play
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-300">
                    {rules.map((rule, idx) => (
                        <div key={idx}>
                            <h3 className={`text-lg font-bold ${rule.color || 'text-cyan-400'} mb-2`}>
                                {rule.title}
                            </h3>
                            <div className="text-sm leading-relaxed">
                                {rule.text}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default GameLobby;
