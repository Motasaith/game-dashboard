"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const games = [
  {
    title: "ROTA",
    description: "Master the ancient Roman game of strategy. Outwit your opponent in this circular battlefield of wits and positioning.",
    banner: "/assets/rota-banner.png",
    path: "/game/rota",
    color: "cyan",
    tag: "Strategy",
    isNew: false,
  },
  {
    title: "Nine Men's Morris",
    description: "The classic game of mills. Form lines of three to remove your opponent's pieces in this strategic board game.",
    banner: "/assets/morris-banner.png",
    path: "/game/morris",
    color: "green",
    tag: "Classic Mill Game",
    isNew: false,
  },
  {
    title: "Ultimate TTT",
    description: "Tic-Tac-Toe on steroids. Win on the small boards to claim the large board. Think 9 steps ahead!",
    banner: "/assets/ultimate-ttt-banner.jpg",
    path: "/game/ultimate-ttt",
    color: "purple",
    tag: "Puzzle",
    isNew: false,
  },
  {
    title: "Othello",
    description: "A minute to learn, a lifetime to master. Flank your opponent's discs to flip them to your color.",
    banner: "/assets/othello-banner.jpg",
    path: "/game/othello",
    color: "emerald",
    tag: "Strategy",
    isNew: false,
  },
  {
    title: "Dots & Boxes",
    description: "Connect the dots to close boxes. The player with the most boxes wins. Simple yet deceptively deep.",
    banner: "/assets/dots-boxes-banner.jpg",
    path: "/game/dots-boxes",
    color: "pink",
    tag: "Puzzle",
    isNew: false,
  },
  {
    title: "Connect Four",
    description: "Drop your discs to connect 4 in a row. Vertical, horizontal, or diagonal wins the game.",
    banner: "/assets/connect-four-banner.jpg",
    path: "/game/connect-four",
    color: "blue",
    tag: "Classic",
    isNew: false,
  },
  {
    title: "Checkers",
    description: "Jump over opponent pieces to capture them. Promote your pieces to Kings and dominate the board.",
    banner: "/assets/checkers-banner.jpg",
    path: "/game/checkers",
    color: "red",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Mancala",
    description: "The ancient game of counting. Sow your seeds wisely to capture the most in your store.",
    banner: "/assets/mancala-banner.jpg",
    path: "/game/mancala",
    color: "amber",
    tag: "Strategy",
    isNew: false,
  },
  {
    title: "Chess",
    description: "The game of kings. Strategize, sacrifice, and checkmate your opponent in this ultimate test of wit.",
    banner: "/assets/chess-banner.jpg",
    path: "/game/chess",
    color: "green",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Tic-Tac-Toe",
    description: "The timeless classic. Place X's and O's to get three in a row. Features an unbeatable AI!",
    banner: "/assets/tic-tac-toe-banner.jpg",
    path: "/game/tic-tac-toe",
    color: "indigo",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "2048",
    description: "Slide and merge tiles to reach 2048. A deceptively simple puzzle that demands strategic thinking.",
    banner: "/assets/2048-banner.jpg",
    path: "/game/2048",
    color: "orange",
    tag: "Puzzle",
    isNew: true,
  },
  {
    title: "Simon Says",
    description: "Watch, remember, repeat. Test your memory as the color sequences grow longer each round.",
    banner: "/assets/simon-says-banner.jpg",
    path: "/game/simon-says",
    color: "violet",
    tag: "Memory",
    isNew: true,
  },
  {
    title: "Lights Out",
    description: "Toggle lights in a cross pattern to turn them all off. A satisfying logic puzzle with increasing difficulty.",
    banner: "/assets/lights-out-banner.jpg",
    path: "/game/lights-out",
    color: "yellow",
    tag: "Puzzle",
    isNew: true,
  },
  {
    title: "Battleship",
    description: "Hunt and sink the enemy fleet! Call your shots on a 10×10 grid and destroy all hidden ships.",
    banner: "/assets/battleship-banner.jpg",
    path: "/game/battleship",
    color: "blue",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Gomoku",
    description: "Five in a row wins. Place stones on a 15×15 board to form an unbroken line before your opponent.",
    banner: "/assets/gomoku-banner.jpg",
    path: "/game/gomoku",
    color: "emerald",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Backgammon",
    description: "Race your 15 checkers around the board. Roll dice, block opponents, and bear off to win.",
    banner: "/assets/backgammon-banner.jpg",
    path: "/game/backgammon",
    color: "amber",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Chinese Checkers",
    description: "Hop your marbles across the star-shaped board. Chain jumps to race into the opposite triangle.",
    banner: "/assets/chinese-checkers-banner.jpg",
    path: "/game/chinese-checkers",
    color: "rose",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Quoridor",
    description: "Move your pawn or place walls to block. A race to the opposite edge with strategic wall placement.",
    banner: "/assets/quoridor-banner.jpg",
    path: "/game/quoridor",
    color: "teal",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Hex",
    description: "Connect your two edges with an unbroken chain of stones. No draws possible in this pure strategy game.",
    banner: "/assets/hex-banner.jpg",
    path: "/game/hex",
    color: "red",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Stratego",
    description: "Hidden armies clash! Deploy, attack, and capture the enemy flag in this fog-of-war battle game.",
    banner: "/assets/stratego-banner.jpg",
    path: "/game/stratego",
    color: "rose",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Dominoes",
    description: "Match tile ends to build a chain. Draw from the boneyard when stuck. First to empty wins!",
    banner: "/assets/dominoes-banner.jpg",
    path: "/game/dominoes",
    color: "cyan",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Mahjong Solitaire",
    description: "Match and remove tile pairs from a layered pyramid. Only free tiles can be selected — plan ahead!",
    banner: "/assets/mahjong-banner.jpg",
    path: "/game/mahjong",
    color: "teal",
    tag: "Puzzle",
    isNew: true,
  },
  {
    title: "Go (9×9)",
    description: "Surround territory and capture stones on a 9×9 board. The ancient game of infinite depth.",
    banner: "/assets/go-banner.jpg",
    path: "/game/go",
    color: "amber",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Shogi",
    description: "Japanese chess with a twist — captured pieces join your army! Drop and promote for devastating combos.",
    banner: "/assets/shogi-banner.jpg",
    path: "/game/shogi",
    color: "orange",
    tag: "Strategy",
    isNew: true,
  },
];

const COLOR_MAP: Record<string, { shadow: string; badge: string; glow: string; text: string }> = {
  cyan: { shadow: "shadow-cyan-500/20", badge: "bg-cyan-500", glow: "hover:shadow-cyan-500/30", text: "text-cyan-200" },
  green: { shadow: "shadow-green-500/20", badge: "bg-green-500", glow: "hover:shadow-green-500/30", text: "text-green-200" },
  purple: { shadow: "shadow-purple-500/20", badge: "bg-purple-500", glow: "hover:shadow-purple-500/30", text: "text-purple-200" },
  emerald: { shadow: "shadow-emerald-500/20", badge: "bg-emerald-500", glow: "hover:shadow-emerald-500/30", text: "text-emerald-200" },
  pink: { shadow: "shadow-pink-500/20", badge: "bg-pink-500", glow: "hover:shadow-pink-500/30", text: "text-pink-200" },
  blue: { shadow: "shadow-blue-500/20", badge: "bg-blue-500", glow: "hover:shadow-blue-500/30", text: "text-blue-200" },
  red: { shadow: "shadow-red-500/20", badge: "bg-red-500", glow: "hover:shadow-red-500/30", text: "text-red-200" },
  amber: { shadow: "shadow-amber-500/20", badge: "bg-amber-500", glow: "hover:shadow-amber-500/30", text: "text-amber-200" },
  teal: { shadow: "shadow-teal-500/20", badge: "bg-teal-500", glow: "hover:shadow-teal-500/30", text: "text-teal-200" },
  orange: { shadow: "shadow-orange-500/20", badge: "bg-orange-500", glow: "hover:shadow-orange-500/30", text: "text-orange-200" },
  rose: { shadow: "shadow-rose-500/20", badge: "bg-rose-500", glow: "hover:shadow-rose-500/30", text: "text-rose-200" },
  indigo: { shadow: "shadow-indigo-500/20", badge: "bg-indigo-500", glow: "hover:shadow-indigo-500/30", text: "text-indigo-200" },
  violet: { shadow: "shadow-violet-500/20", badge: "bg-violet-500", glow: "hover:shadow-violet-500/30", text: "text-violet-200" },
  yellow: { shadow: "shadow-yellow-500/20", badge: "bg-yellow-500", glow: "hover:shadow-yellow-500/30", text: "text-yellow-200" },
};

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % games.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredGames = searchQuery
    ? games.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : games;

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto scrollbar-hide">

        {/* Search Bar — Mobile only, visible above carousel */}
        <div className="relative mb-4 sm:mb-6 md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search games..."
            className="w-full glass-strong rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hero Section (Carousel) */}
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 md:mb-10 group shadow-2xl shadow-black/50">
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

              <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 w-full md:w-2/3 lg:w-1/2">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-black font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-4 inline-block ${COLOR_MAP[games[activeIndex].color]?.badge}`}
                >
                  Featured Game
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-1 sm:mb-2 md:mb-4 tracking-tight"
                >
                  {games[activeIndex].title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-300 text-xs sm:text-sm md:text-lg mb-3 sm:mb-6 md:mb-8 leading-relaxed line-clamp-2"
                >
                  {games[activeIndex].description}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => router.push(games[activeIndex].path)}
                  className="bg-white text-black px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity text-sm sm:text-base md:text-lg"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                  Play Now
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 right-3 sm:right-6 md:right-8 flex gap-1.5 sm:gap-2 md:gap-3 z-10">
            {games.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 sm:h-2 md:h-3 rounded-full transition-all duration-300 ${index === activeIndex
                  ? "bg-white w-5 sm:w-6 md:w-8"
                  : "bg-white/30 hover:bg-white/60 w-1.5 sm:w-2 md:w-3"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400 hidden sm:block" />
            Your Library
          </h2>
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search games..."
              className="w-56 lg:w-64 glass-strong rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Game Library Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pb-4 sm:pb-0">
          {filteredGames.map((game, index) => {
            const colors = COLOR_MAP[game.color] || COLOR_MAP.cyan;

            return (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(game.path)}
                className={`relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group shadow-xl ${colors.shadow} ${colors.glow} hover:shadow-2xl transition-shadow duration-300`}
              >
                {/* Banner Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${game.banner}')` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Glassmorphism border glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10 rounded-xl sm:rounded-2xl" />

                {/* NEW Badge */}
                {game.isNew && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg animate-glow-pulse">
                      NEW
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 z-10">
                  <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest ${colors.text} mb-0.5 sm:mb-1 block`}>
                    {game.tag}
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                    {game.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Social Panel (Right Sidebar) — Desktop only */}
      <div className="w-80 glass-strong border-l border-slate-800/50 p-6 hidden xl:block">
        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-6">
          Social
        </h3>

        {/* User Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Find players..."
            className="w-full bg-slate-800/50 border-none rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 outline-none"
          />
        </div>

        {/* Online Friends */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
            Online Friends (0)
          </h4>
          <div className="text-center py-8 glass rounded-xl border border-slate-800/50 border-dashed">
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
