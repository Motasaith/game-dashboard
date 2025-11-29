import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Bell, Shield, Monitor, LogOut } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useContext(AuthContext);
    
    // Mock Settings State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        friendRequests: true,
        gameInvites: true
    });

    const [appearance, setAppearance] = useState({
        cyberpunkMode: true,
        reducedMotion: false
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAppearance = (key) => {
        setAppearance(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 tracking-tight flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 md:w-8 md:h-8 text-cyan-500" />
                SYSTEM CONFIGURATION
            </h1>

            <div className="space-y-6">
                {/* Account Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" />
                        Account Security
                    </h2>
                    
                    <div className="grid gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                            <input 
                                type="text" 
                                value={user?.username || ''} 
                                disabled
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={user?.email || ''} 
                                disabled
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="pt-4 border-t border-slate-800">
                            <button className="text-red-400 text-sm font-bold hover:text-red-300 transition-colors">
                                Change Password
                            </button>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-cyan-500" />
                        Interface
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-white">Cyberpunk Mode</p>
                                <p className="text-xs text-slate-400">Enable neon visual effects and animations</p>
                            </div>
                            <button 
                                onClick={() => toggleAppearance('cyberpunkMode')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${appearance.cyberpunkMode ? 'bg-cyan-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${appearance.cyberpunkMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-white">Reduced Motion</p>
                                <p className="text-xs text-slate-400">Disable complex animations for performance</p>
                            </div>
                            <button 
                                onClick={() => toggleAppearance('reducedMotion')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${appearance.reducedMotion ? 'bg-cyan-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${appearance.reducedMotion ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-500" />
                        Notifications
                    </h2>
                    
                    <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                                <p className="font-bold text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <button 
                                    onClick={() => toggleNotification(key)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-green-600' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <button 
                    onClick={logout}
                    className="w-full p-4 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Terminate Session
                </button>
            </div>
        </div>
    );
};

export default Settings;
