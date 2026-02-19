"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe, Users, ArrowRight, ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { usePlayerId } from '@/hooks/usePlayerId';

export interface RuleSection {
    title: string;
    text: React.ReactNode;
    color?: string;
}

interface GameLobbyProps {
    title: string;
    subtitle: string;
    gradient: string;
    rules: RuleSection[];
    gameSlug?: string; // e.g. "chess", "tic-tac-toe"
    onSelectMode: (mode: 'cpu' | 'online' | 'friend', sessionId?: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
    title,
    subtitle,
    gradient,
    rules,
    gameSlug,
    onSelectMode
}) => {
    const { playerId, playerName } = usePlayerId();
    const slug = gameSlug || title.toLowerCase().replace(/\s+/g, '-');

    // ─── Matchmaking state ───
    const [searching, setSearching] = useState(false);
    const joinQueue = useMutation(api.matchmaking.joinQueue);
    const leaveQueue = useMutation(api.matchmaking.leaveQueue);
    const matchResult = useQuery(
        api.matchmaking.getMyMatch,
        searching && playerId ? { playerId, gameSlug: slug } : "skip"
    );
    const queueCount = useQuery(api.matchmaking.getQueueCount, { gameSlug: slug });

    // ─── Room state ───
    const [roomCode, setRoomCode] = useState('');
    const [createdRoom, setCreatedRoom] = useState<{ code: string; sessionId: string } | null>(null);
    const [joinError, setJoinError] = useState('');
    const [copied, setCopied] = useState(false);
    const createSession = useMutation(api.gameSessions.createSession);
    const joinByRoomCode = useMutation(api.gameSessions.joinByRoomCode);

    // Poll created room for player2 joining
    const createdSessionData = useQuery(
        api.gameSessions.getSession,
        createdRoom ? { sessionId: createdRoom.sessionId as any } : "skip"
    );

    // Match found → redirect
    useEffect(() => {
        if (matchResult?.status === "matched" && matchResult.sessionId) {
            setSearching(false);
            onSelectMode('online', matchResult.sessionId);
        }
    }, [matchResult, onSelectMode]);

    // Room creator: opponent joined → redirect
    useEffect(() => {
        if (createdSessionData?.status === "active" && createdSessionData.player2Id) {
            onSelectMode('friend', createdRoom!.sessionId);
        }
    }, [createdSessionData, createdRoom, onSelectMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searching && playerId) {
                leaveQueue({ playerId, gameSlug: slug });
            }
        };
    }, [searching, playerId, slug, leaveQueue]);

    const handleFindMatch = async () => {
        if (!playerId) return;
        setSearching(true);
        const result = await joinQueue({ playerId, playerName, gameSlug: slug });
        if (result.status === "matched" && result.sessionId) {
            setSearching(false);
            onSelectMode('online', result.sessionId);
        }
    };

    const handleCancelSearch = async () => {
        if (!playerId) return;
        setSearching(false);
        await leaveQueue({ playerId, gameSlug: slug });
    };

    const handleCreateRoom = async () => {
        if (!playerId) return;
        const result = await createSession({ gameSlug: slug, playerId, playerName });
        setCreatedRoom({ code: result.roomCode, sessionId: result.sessionId });
    };

    const handleJoinRoom = async () => {
        if (!playerId || !roomCode.trim()) return;
        setJoinError('');
        try {
            const result = await joinByRoomCode({ roomCode: roomCode.trim(), playerId, playerName });
            onSelectMode('friend', result.sessionId);
        } catch (e: any) {
            setJoinError(e.message || 'Failed to join room');
        }
    };

    const handleCopy = () => {
        if (createdRoom) {
            navigator.clipboard.writeText(createdRoom.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

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
                    whileHover={!searching ? { y: -5 } : {}}
                    className={`bg-slate-900/50 border p-6 rounded-2xl transition-colors group ${searching
                        ? "border-purple-500/50 bg-purple-500/5"
                        : "border-slate-800 hover:border-purple-500/50 cursor-pointer"
                        }`}
                    onClick={!searching ? handleFindMatch : undefined}
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-purple-500/20 transition-colors">
                        {searching ? (
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                        ) : (
                            <Globe className="w-8 h-8 text-purple-500" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Find Match</h3>

                    {searching ? (
                        <div className="space-y-3">
                            <p className="text-sm text-purple-300 animate-pulse">
                                Searching for opponent...
                            </p>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCancelSearch(); }}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            Play against anyone online.
                            {(queueCount ?? 0) > 0 && (
                                <span className="block text-purple-400 font-medium mt-1">
                                    {queueCount} player{queueCount !== 1 ? 's' : ''} in queue
                                </span>
                            )}
                        </p>
                    )}
                </motion.div>

                {/* Play with Friend */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-green-500/50 transition-colors group"
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-500/20 transition-colors">
                        <Users className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Play with Friend</h3>

                    {createdRoom ? (
                        // Show room code after creation
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400">Share this code with your friend:</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 py-2.5 px-3 bg-slate-950 border border-green-500/30 rounded-lg text-center font-mono text-lg font-bold text-green-400 tracking-widest">
                                    {createdRoom.code}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 animate-pulse">
                                Waiting for friend to join...
                            </p>
                            <button
                                onClick={() => setCreatedRoom(null)}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        // Create or join
                        <div className="space-y-3">
                            <button
                                onClick={handleCreateRoom}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                Create Room
                            </button>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter Code"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:ring-1 focus:ring-green-500 uppercase tracking-wider"
                                    value={roomCode}
                                    onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setJoinError(''); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoinRoom(); }}
                                    maxLength={6}
                                />
                                <button
                                    onClick={handleJoinRoom}
                                    disabled={!roomCode.trim()}
                                    className="absolute right-1 top-1 bottom-1 px-2 bg-green-600 hover:bg-green-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            {joinError && (
                                <p className="text-xs text-red-400">{joinError}</p>
                            )}
                        </div>
                    )}
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
