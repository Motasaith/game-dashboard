import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, UserPlus, Play } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce search
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
        <div className="flex h-full">
            {/* Main Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-80 rounded-3xl overflow-hidden mb-10 group"
                >
                    <div className="absolute inset-0 bg-[url('/assets/rota-banner.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 p-8">
                        <span className="bg-cyan-500 text-black font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 inline-block">
                            Featured
                        </span>
                        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">ROTA</h1>
                        <p className="text-slate-300 max-w-lg mb-6 text-lg">
                            Master the ancient Roman game of strategy. Outwit your opponent in this circular battlefield.
                        </p>
                        <button 
                            onClick={() => navigate('/game/rota')}
                            className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-400 transition-colors"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            Play Now
                        </button>
                    </div>
                </motion.div>

                {/* Game Library */}
                <h2 className="text-2xl font-bold text-white mb-6">Your Library</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* ROTA Card */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/game/rota')}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-indigo-500/20"
                    >
                        <div className="absolute inset-0 bg-[url('/assets/rota-banner.png')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 p-6 z-10">
                            <h3 className="text-2xl font-bold text-white mb-1">ROTA</h3>
                            <p className="text-indigo-200 text-sm">Strategy • Multiplayer</p>
                        </div>
                    </motion.div>

                    {/* Placeholder Cards */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center aspect-[3/4] opacity-50">
                            <p className="text-slate-600 font-medium">Coming Soon</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Panel (Right Sidebar) */}
            <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 hidden xl:block">
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-6">Social</h3>

                {/* User Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Find players..." 
                        className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Search Results */}
                {searchQuery && (
                    <div className="mb-8">
                        <h4 className="text-xs font-bold text-cyan-500 uppercase mb-3">Search Results</h4>
                        {isSearching ? (
                            <div className="flex justify-center py-4">
                                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {searchResults.map(user => (
                                    <div key={user._id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium">{user.username}</span>
                                        </div>
                                        <button className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors">
                                            <UserPlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {searchResults.length === 0 && (
                                    <p className="text-slate-500 text-sm text-center">No users found.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Online Friends */}
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Online Friends (0)</h4>
                    <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
                        <p className="text-slate-500 text-sm">No friends online</p>
                        <button className="mt-2 text-cyan-400 text-xs font-bold hover:underline">Invite Friends</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
