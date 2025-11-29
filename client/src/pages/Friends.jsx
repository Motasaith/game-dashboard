import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users, UserCheck, UserX } from 'lucide-react';
import api from '../utils/api';

const Friends = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Mock Data for now
    const friends = [
        { id: 1, username: 'Alice', status: 'online', game: 'ROTA' },
        { id: 2, username: 'Bob', status: 'offline', lastSeen: '2h ago' },
        { id: 3, username: 'Charlie', status: 'online', game: null },
    ];

    const requests = [
        { id: 4, username: 'David' },
        { id: 5, username: 'Eve' },
    ];

    // Debounce search (reusing logic)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                try {
                    const res = await api.get(`/api/users/search?q=${searchQuery}`);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 tracking-tight flex items-center gap-3">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-cyan-500" />
                SOCIAL HUB
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 md:mb-8 border-b border-slate-800 pb-1 overflow-x-auto scrollbar-hide">
                {['all', 'online', 'pending', 'add'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-bold text-sm uppercase tracking-wider transition-colors relative whitespace-nowrap ${
                            activeTab === tab ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {tab === 'add' ? 'Add Friend' : tab}
                        {activeTab === tab && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute bottom-[-5px] left-0 right-0 h-1 bg-cyan-500 rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="max-w-4xl">
                {activeTab === 'add' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Find Agents</h2>
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Enter username..." 
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            {isSearching && <div className="text-center text-slate-500">Scanning database...</div>}
                            
                            {!isSearching && searchResults.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.username}</p>
                                            <p className="text-xs text-slate-400">Agent ID: {user._id.slice(-4)}</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors font-bold text-sm">
                                        <UserPlus className="w-4 h-4" />
                                        Send Request
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Friend List (Mock) */}
                        {activeTab !== 'pending' && friends.map(friend => (
                            <motion.div 
                                key={friend.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-slate-300">
                                            {friend.username[0]}
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${friend.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{friend.username}</p>
                                        <p className="text-xs text-slate-400">
                                            {friend.status === 'online' ? (friend.game ? `Playing ${friend.game}` : 'Online') : `Last seen ${friend.lastSeen}`}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <UserX className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}

                        {/* Pending Requests (Mock) */}
                        {activeTab === 'pending' && requests.map(req => (
                            <motion.div 
                                key={req.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-slate-300">
                                        {req.username[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{req.username}</p>
                                        <p className="text-xs text-slate-400">Incoming Request</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors">
                                        <UserCheck className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                        <UserX className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
