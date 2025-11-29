import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe, Users, Copy, ArrowRight, Loader } from 'lucide-react';

const RotaLobby = ({ onSelectMode, onJoinPrivate }) => {
    const [roomCode, setRoomCode] = useState('');

    return (
        <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8">
            <div className="text-center max-w-4xl w-full">
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2 tracking-tighter">
                    ROTA
                </h1>
                <p className="text-slate-400 mb-8 md:mb-12 text-base md:text-lg">
                    Select your battlefield
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Vs CPU */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/50 border border-slate-800 p-4 md:p-6 rounded-2xl hover:border-cyan-500/50 transition-colors cursor-pointer group"
                        onClick={() => onSelectMode('cpu')}
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:bg-cyan-500/20 transition-colors">
                            <Cpu className="w-6 h-6 md:w-8 md:h-8 text-cyan-500" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">Vs CPU</h3>
                        <p className="text-xs md:text-sm text-slate-400">
                            Train against the system AI. Perfect for practicing strategy.
                        </p>
                    </motion.div>

                    {/* Find Match */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/50 border border-slate-800 p-4 md:p-6 rounded-2xl hover:border-purple-500/50 transition-colors cursor-pointer group"
                        onClick={() => onSelectMode('online')}
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:bg-purple-500/20 transition-colors">
                            <Globe className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">Find Match</h3>
                        <p className="text-xs md:text-sm text-slate-400">
                            Battle against random agents from around the world.
                        </p>
                    </motion.div>

                    {/* Private Room */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-slate-900/50 border border-slate-800 p-4 md:p-6 rounded-2xl hover:border-green-500/50 transition-colors group"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 md:mb-6 mx-auto group-hover:bg-green-500/20 transition-colors">
                            <Users className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-4">Play with Friend</h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => onSelectMode('create_private')}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs md:text-sm font-bold transition-colors"
                            >
                                Create Room
                            </button>
                            
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Enter Code"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-xs md:text-sm text-white focus:ring-1 focus:ring-green-500"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                />
                                <button 
                                    onClick={() => onJoinPrivate(roomCode)}
                                    disabled={!roomCode}
                                    className="absolute right-1 top-1 bottom-1 px-2 bg-green-600 hover:bg-green-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
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
                    className="mt-8 md:mt-12 bg-slate-900/30 border border-slate-800 rounded-2xl p-4 md:p-8 text-left"
                >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                        <span className="text-cyan-400">?</span> How to Play
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-slate-300">
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-cyan-400 mb-2">1. The Goal</h3>
                            <p className="text-xs md:text-sm leading-relaxed">
                                Get 3 of your pieces in a row. You can win by forming a line through the center (Diameter) or along the edge (Arc).
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-purple-400 mb-2">2. The Phases</h3>
                            <ul className="text-xs md:text-sm space-y-2">
                                <li><strong className="text-white">Placing:</strong> Take turns placing 3 pieces each on any empty spot.</li>
                                <li><strong className="text-white">Moving:</strong> Once all pieces are placed, take turns moving one piece to an adjacent empty spot.</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-red-400 mb-2">3. Win & Loss</h3>
                            <ul className="text-xs md:text-sm space-y-2">
                                <li><strong className="text-green-400">Victory:</strong> Form a line of 3.</li>
                                <li><strong className="text-red-500">Defeat:</strong> Get trapped with no valid moves available.</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RotaLobby;
