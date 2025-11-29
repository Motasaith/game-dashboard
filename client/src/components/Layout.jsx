import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Users, User, LogOut, Settings } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutGrid, label: 'Library', path: '/' },
        { icon: Users, label: 'Friends', path: '/friends' }, // Placeholder path
        { icon: Settings, label: 'Settings', path: '/settings' }, // Placeholder path
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-16 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-20"
            >
                <div>
                    {/* Logo */}
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20" />
                        <span className="hidden lg:block font-black text-xl tracking-wider">ROTA</span>
                    </div>

                    {/* Navigation */}
                    <nav className="mt-6 px-3 space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={item.label} 
                                    to={item.path}
                                    className={`flex items-center gap-4 p-3 rounded-xl transition-all group ${
                                        isActive 
                                        ? 'bg-cyan-500/10 text-cyan-400' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-cyan-400' : ''}`} />
                                    <span className="hidden lg:block font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeNav"
                                            className="absolute left-0 w-1 h-8 bg-cyan-500 rounded-r-full" 
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Section */}
                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={() => setIsProfileOpen(true)}
                        className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
                    >
                        <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-lg">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.username}</p>
                            <p className="text-xs text-slate-500">Online</p>
                        </div>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="mt-2 flex items-center gap-3 w-full p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:block text-sm font-medium">Logout</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {children}
            </main>

            {/* Profile Modal */}
            <AnimatePresence>
                {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} user={user} />}
            </AnimatePresence>
        </div>
    );
};

export default Layout;
