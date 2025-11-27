import { motion } from 'framer-motion';
import { X, Trophy, Skull, Calendar, Edit2, Save, Loader } from 'lucide-react';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProfileModal = ({ onClose, user }) => {
    const { updateProfile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!newUsername.trim()) return;
        setLoading(true);
        setError('');
        try {
            await updateProfile({ username: newUsername });
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600 relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 -mt-12 relative">
                    <div className="flex justify-between items-end mb-4">
                        <div className="w-24 h-24 bg-slate-900 p-1 rounded-full">
                            <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                        </div>
                        
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700 text-white"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-2 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    {isEditing ? (
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Username</label>
                            <input 
                                type="text" 
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
                            <p className="text-slate-400 text-sm mb-6">{user?.email}</p>
                        </>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-2 text-green-400 mb-1">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Wins</span>
                            </div>
                            <p className="text-2xl font-black text-white">0</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-2 text-red-400 mb-1">
                                <Skull className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Losses</span>
                            </div>
                            <p className="text-2xl font-black text-white">0</p>
                        </div>
                    </div>

                    {/* Match History Placeholder */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Recent Activity
                        </h3>
                        <div className="space-y-2">
                            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-800 text-center text-slate-500 text-sm">
                                No matches played yet.
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileModal;
