import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe, Users, Copy, ArrowRight, Loader } from 'lucide-react';

const RotaLobby = ({ onSelectMode, onJoinPrivate }) => {
    const [roomCode, setRoomCode] = useState('');

    return (
        <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-4xl w-full">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2 tracking-tighter">
                    ROTA
                </h1>
                <p className="text-slate-400 mb-12 text-lg">
                    Select your battlefield
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/50 transition-colors cursor-pointer group"
                        onClick={() => onSelectMode('online')}
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-purple-500/20 transition-colors">
                            <Globe className="w-8 h-8 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Find Match</h3>
                        <p className="text-sm text-slate-400">
                            Battle against random agents from around the world.
                        </p>
                    </motion.div>

                    {/* Private Room */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-green-500/50 transition-colors group"
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-green-500/20 transition-colors">
                            <Users className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Play with Friend</h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => onSelectMode('create_private')}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                Create Room
                            </button>
                            
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Enter Code"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:ring-1 focus:ring-green-500"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                />
                                <button 
                                    onClick={() => onJoinPrivate(roomCode)}
                                    disabled={!roomCode}
                                    className="absolute right-1 top-1 bottom-1 px-2 bg-green-600 hover:bg-green-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RotaLobby;
