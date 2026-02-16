"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const games = [
    {
      title: "ROTA",
      description: "Master the ancient Roman game of strategy. Outwit your opponent in this circular battlefield of wits and positioning.",
      banner: "/assets/rota-banner.png",
      path: "/game/rota",
      color: "text-cyan-500"
    },
    {
      title: "Nine Men's Morris",
      description: "The classic game of mills. Form lines of three to remove your opponent's pieces in this strategic board game.",
      banner: "/assets/morris-banner.png",
      path: "/game/morris",
      color: "text-green-500"
    },
    {
      title: "Ultimate TTT",
      description: "Tic-Tac-Toe on steroids. Win on the small boards to claim the large board. Think 9 steps ahead!",
      banner: "/assets/ultimate-ttt-banner.jpg",
      path: "/game/ultimate-ttt",
      color: "text-purple-500"
    },
    {
      title: "Othello",
      description: "A minute to learn, a lifetime to master. Flank your opponent's discs to flip them to your color.",
      banner: "/assets/othello-banner.jpg",
      path: "/game/othello",
      color: "text-emerald-500"
    },
    {
      title: "Dots & Boxes",
      description: "Connect the dots to close boxes. The player with the most boxes wins. Simple yet deceptively deep.",
      banner: "/assets/dots-boxes-banner.jpg",
      path: "/game/dots-boxes",
      color: "text-pink-500"
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % games.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [games.length]);

  const searchResults: any[] = []; // Mock results

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Hero Section (Carousel) */}
        <div className="relative h-96 rounded-3xl overflow-hidden mb-10 group shadow-2xl shadow-black/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear scale-100"
                style={{ backgroundImage: `url('${games[activeIndex].banner}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3 lg:w-1/2">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-black font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 inline-block ${games[activeIndex].color.replace('text-', 'bg-')}`}
                >
                  Featured Game
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight"
                >
                  {games[activeIndex].title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-200 text-lg mb-8 leading-relaxed"
                >
                  {games[activeIndex].description}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => router.push(games[activeIndex].path)}
                  className={`bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity text-lg`}
                >
                  <Play className="w-5 h-5 fill-black" />
                  Play Now
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div className="absolute bottom-8 right-8 flex gap-3 z-10">
            {games.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex
                  ? "bg-white w-8"
                  : "bg-white/30 hover:bg-white/60"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Game Library */}
        <h2 className="text-2xl font-bold text-white mb-6">Your Library</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* ROTA Card */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/game/rota")}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-indigo-500/20"
          >
            <div className="absolute inset-0 bg-[url('/assets/rota-banner.png')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 z-10">
              <h3 className="text-2xl font-bold text-white mb-1">ROTA</h3>
              <p className="text-indigo-200 text-sm">
                Strategy • Multiplayer
              </p>
            </div>
          </motion.div>

          {/* Nine Men's Morris */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/game/morris")}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-cyan-500/20"
          >
            <div className="absolute inset-0 bg-[url('/assets/morris-banner.png')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 z-10">
              <h3 className="text-xl font-bold text-white mb-1">Nine Men's Morris</h3>
              <p className="text-cyan-200 text-sm">
                Classic Mill Game
              </p>
            </div>
          </motion.div>

          {/* Ultimate TTT */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/game/ultimate-ttt")}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-purple-500/20"
          >
            <div className="absolute inset-0 bg-[url('/assets/ultimate-ttt-banner.jpg')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="flex flex-col h-full justify-end p-6 z-10 relative">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ultimate TTT</h3>
                <p className="text-purple-200 text-sm">
                  Think 9 steps ahead
                </p>
              </div>
            </div>
          </motion.div>

          {/* Othello */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/game/othello")}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-emerald-500/20"
          >
            <div className="absolute inset-0 bg-[url('/assets/othello-banner.jpg')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="flex flex-col h-full justify-end p-6 z-10 relative">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Othello</h3>
                <p className="text-emerald-200 text-sm">
                  Strategic flippin' fun
                </p>
              </div>
            </div>
          </motion.div>

          {/* Dots and Boxes */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/game/dots-boxes")}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group shadow-2xl shadow-pink-500/20"
          >
            <div className="absolute inset-0 bg-[url('/assets/dots-boxes-banner.jpg')] bg-cover bg-center transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            <div className="flex flex-col h-full justify-end p-6 z-10 relative">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Dots & Boxes</h3>
                <p className="text-pink-200 text-sm">
                  Claim the boxes
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social Panel (Right Sidebar) */}
      <div className="w-80 bg-slate-900/50 border-l border-slate-800 p-6 hidden xl:block">
        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-6">
          Social
        </h3>

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

        {/* Online Friends */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
            Online Friends (0)
          </h4>
          <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
            <p className="text-slate-500 text-sm">No friends online</p>
            <button className="mt-2 text-cyan-400 text-xs font-bold hover:underline">
              Invite Friends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
