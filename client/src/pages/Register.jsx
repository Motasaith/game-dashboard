import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            console.error('Registration failed', err);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                <h2 className="text-3xl font-black text-white text-center mb-2 tracking-wider">
                    NEW AGENT
                </h2>
                <p className="text-slate-400 text-center mb-8 text-sm uppercase tracking-widest">
                    Create Identity
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="text-xs font-bold text-cyan-400 uppercase ml-1 mb-1 block">Username</label>
                        <input 
                            type="text" 
                            placeholder="Codename" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-cyan-400 uppercase ml-1 mb-1 block">Email</label>
                        <input 
                            type="email" 
                            placeholder="agent@rota.com" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-purple-400 uppercase ml-1 mb-1 block">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] mt-2">
                        ESTABLISH LINK
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-500 text-sm">
                    Already have an identity?{" "}
                    <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline">
                        Access System
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
