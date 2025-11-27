import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Ensure path is correct
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext); // Assuming you have this context setup
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/"); // Changed to / as per App.jsx routes, or /dashboard if that's the intended route. User said /dashboard but App.jsx has / as protected dashboard.
    } catch (err) {
      setError("Invalid credentials");
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
          SYSTEM ACCESS
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm uppercase tracking-widest">
          Enter Credentials
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-900/20 transition-all active:scale-[0.98] mt-2"
          >
            INITIALIZE SESSION
          </button>
        </form>

        <div className="mt-6 text-center text-slate-500 text-sm">
          New User?{" "}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline">
            Create Identity
          </Link>
        </div>

        {/* Server Status Indicator */}
        <div className="mt-8 flex justify-center">
             <ServerStatus />
        </div>
      </motion.div>
    </div>
  );
};

const ServerStatus = () => {
    const [status, setStatus] = useState('checking'); // checking, online, offline

    useState(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get('/api/health');
                if (res.status === 200) setStatus('online');
                else setStatus('offline');
            } catch (e) {
                setStatus('offline');
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    if (status === 'checking') return <span className="text-xs text-slate-600 animate-pulse">CONNECTING TO MAINFRAME...</span>;
    
    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            status === 'online' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-bold tracking-wider">
                {status === 'online' ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
            </span>
        </div>
    );
};

export default Login;
