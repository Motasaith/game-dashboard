"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Play,
  Sparkles,
  Flame,
  Trophy,
  Puzzle,
  Swords,
  Crown,
  Brain,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Star,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ──────────────────────────────────────────────
   GAME DATA
   ────────────────────────────────────────────── */
const games = [
  {
    title: "ROTA",
    description: "Master the ancient Roman game of strategy.",
    banner: "/assets/rota-banner.png",
    path: "/game/rota",
    color: "cyan",
    tag: "Strategy",
    isNew: false,
  },
  {
    title: "Nine Men's Morris",
    description: "The classic game of mills. Form lines of three.",
    banner: "/assets/morris-banner.png",
    path: "/game/morris",
    color: "green",
    tag: "Classic",
    isNew: false,
  },
  {
    title: "Ultimate TTT",
    description: "Tic-Tac-Toe on steroids. Think 9 steps ahead!",
    banner: "/assets/ultimate-ttt-banner.jpg",
    path: "/game/ultimate-ttt",
    color: "purple",
    tag: "Puzzle",
    isNew: false,
  },
  {
    title: "Othello",
    description: "Flank your opponent's discs to flip them.",
    banner: "/assets/othello-banner.jpg",
    path: "/game/othello",
    color: "emerald",
    tag: "Strategy",
    isNew: false,
  },
  {
    title: "Dots & Boxes",
    description: "Connect dots to close boxes and score points.",
    banner: "/assets/dots-boxes-banner.jpg",
    path: "/game/dots-boxes",
    color: "pink",
    tag: "Puzzle",
    isNew: false,
  },
  {
    title: "Connect Four",
    description: "Drop discs to connect 4 in a row!",
    banner: "/assets/connect-four-banner.jpg",
    path: "/game/connect-four",
    color: "blue",
    tag: "Classic",
    isNew: false,
  },
  {
    title: "Checkers",
    description: "Jump and capture in this classic board game.",
    banner: "/assets/checkers-banner.jpg",
    path: "/game/checkers",
    color: "red",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Mancala",
    description: "Ancient game of counting and strategy.",
    banner: "/assets/mancala-banner.jpg",
    path: "/game/mancala",
    color: "amber",
    tag: "Strategy",
    isNew: false,
  },
  {
    title: "Chess",
    description: "The ultimate test of strategic thinking.",
    banner: "/assets/chess-banner.jpg",
    path: "/game/chess",
    color: "green",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Tic-Tac-Toe",
    description: "The timeless classic with unbeatable AI!",
    banner: "/assets/tic-tac-toe-banner.jpg",
    path: "/game/tic-tac-toe",
    color: "indigo",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "2048",
    description: "Slide and merge tiles to reach 2048.",
    banner: "/assets/2048-banner.jpg",
    path: "/game/2048",
    color: "orange",
    tag: "Puzzle",
    isNew: true,
  },
  {
    title: "Simon Says",
    description: "Test your memory with growing sequences.",
    banner: "/assets/simon-says-banner.jpg",
    path: "/game/simon-says",
    color: "violet",
    tag: "Memory",
    isNew: true,
  },
  {
    title: "Lights Out",
    description: "Toggle lights to turn them all off.",
    banner: "/assets/lights-out-banner.jpg",
    path: "/game/lights-out",
    color: "yellow",
    tag: "Puzzle",
    isNew: true,
  },
  {
    title: "Battleship",
    description: "Hunt and sink the enemy fleet!",
    banner: "/assets/battleship-banner.jpg",
    path: "/game/battleship",
    color: "blue",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Gomoku",
    description: "Five in a row wins on a 15×15 board.",
    banner: "/assets/gomoku-banner.jpg",
    path: "/game/gomoku",
    color: "emerald",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Backgammon",
    description: "Race your checkers around the board.",
    banner: "/assets/backgammon-banner.jpg",
    path: "/game/backgammon",
    color: "amber",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Chinese Checkers",
    description: "Hop marbles across the star-shaped board.",
    banner: "/assets/chinese-checkers-banner.jpg",
    path: "/game/chinese-checkers",
    color: "rose",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Quoridor",
    description: "Place walls and race to the opposite edge.",
    banner: "/assets/quoridor-banner.jpg",
    path: "/game/quoridor",
    color: "teal",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Hex",
    description: "Connect edges with an unbroken chain of stones.",
    banner: "/assets/hex-banner.jpg",
    path: "/game/hex",
    color: "red",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Stratego",
    description: "Deploy, attack, and capture the enemy flag.",
    banner: "/assets/stratego-banner.jpg",
    path: "/game/stratego",
    color: "rose",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Dominoes",
    description: "Match tile ends to build chains and win.",
    banner: "/assets/dominoes-banner.jpg",
    path: "/game/dominoes",
    color: "cyan",
    tag: "Classic",
    isNew: true,
  },
  {
    title: "Mahjong Solitaire",
    description: "Match and remove tile pairs from the pyramid.",
    banner: "/assets/mahjong-banner.jpg",
    path: "/game/mahjong",
    color: "teal",
    tag: "Puzzle",
    isNew: true,
  },
  {
    title: "Go (9×9)",
    description: "Surround territory on a 9×9 board.",
    banner: "/assets/go-banner.jpg",
    path: "/game/go",
    color: "amber",
    tag: "Strategy",
    isNew: true,
  },
  {
    title: "Shogi",
    description: "Japanese chess — captured pieces join your army!",
    banner: "/assets/shogi-banner.jpg",
    path: "/game/shogi",
    color: "orange",
    tag: "Strategy",
    isNew: true,
  },
];

/* ──────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────── */
const CATEGORIES = [
  { key: "All", icon: Gamepad2 },
  { key: "Strategy", icon: Swords },
  { key: "Classic", icon: Crown },
  { key: "Puzzle", icon: Puzzle },
  { key: "Memory", icon: Brain },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; shadow: string; gradient: string }> = {
  cyan: { bg: "bg-cyan-500/20", border: "border-cyan-500/30", text: "text-cyan-300", shadow: "shadow-cyan-500/20", gradient: "from-cyan-500 to-cyan-600" },
  green: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-300", shadow: "shadow-green-500/20", gradient: "from-green-500 to-green-600" },
  purple: { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-300", shadow: "shadow-purple-500/20", gradient: "from-purple-500 to-purple-600" },
  emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-300", shadow: "shadow-emerald-500/20", gradient: "from-emerald-500 to-emerald-600" },
  pink: { bg: "bg-pink-500/20", border: "border-pink-500/30", text: "text-pink-300", shadow: "shadow-pink-500/20", gradient: "from-pink-500 to-pink-600" },
  blue: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-300", shadow: "shadow-blue-500/20", gradient: "from-blue-500 to-blue-600" },
  red: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-300", shadow: "shadow-red-500/20", gradient: "from-red-500 to-red-600" },
  amber: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-300", shadow: "shadow-amber-500/20", gradient: "from-amber-500 to-amber-600" },
  teal: { bg: "bg-teal-500/20", border: "border-teal-500/30", text: "text-teal-300", shadow: "shadow-teal-500/20", gradient: "from-teal-500 to-teal-600" },
  orange: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-300", shadow: "shadow-orange-500/20", gradient: "from-orange-500 to-orange-600" },
  rose: { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-300", shadow: "shadow-rose-500/20", gradient: "from-rose-500 to-rose-600" },
  indigo: { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-300", shadow: "shadow-indigo-500/20", gradient: "from-indigo-500 to-indigo-600" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-300", shadow: "shadow-violet-500/20", gradient: "from-violet-500 to-violet-600" },
  yellow: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", text: "text-yellow-300", shadow: "shadow-yellow-500/20", gradient: "from-yellow-500 to-yellow-600" },
};

/* ──────────────────────────────────────────────
   SCROLL ROW COMPONENT
   ────────────────────────────────────────────── */
function ScrollRow({
  title,
  icon: Icon,
  games: rowGames,
  accentColor = "cyan",
  onGameClick,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  games: typeof games;
  accentColor?: string;
  onGameClick: (path: string) => void;
  badge?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll, rowGames]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (rowGames.length === 0) return null;

  return (
    <section className="section-reveal">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-3 sm:mb-4 px-1">
        <Icon className={`w-5 h-5 text-${accentColor}-400`} />
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">{title}</h2>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white uppercase tracking-wider">
            {badge}
          </span>
        )}
        <span className="text-xs text-slate-500 font-medium">{rowGames.length} games</span>
      </div>

      {/* Scrollable Row */}
      <div className="relative scroll-container group/scroll">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="scroll-arrow absolute left-0 top-0 bottom-2 z-20 w-10 sm:w-12 flex items-center justify-center bg-gradient-to-r from-slate-950/95 to-transparent"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="scroll-arrow absolute right-0 top-0 bottom-2 z-20 w-10 sm:w-12 flex items-center justify-center bg-gradient-to-l from-slate-950/95 to-transparent"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        <div ref={scrollRef} className="scroll-row">
          {rowGames.map((game) => (
            <GameCard key={game.title} game={game} onClick={() => onGameClick(game.path)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   GAME CARD COMPONENT
   ────────────────────────────────────────────── */
function GameCard({
  game,
  onClick,
  size = "normal",
}: {
  game: (typeof games)[0];
  onClick: () => void;
  size?: "normal" | "featured";
}) {
  const colors = COLOR_MAP[game.color] || COLOR_MAP.cyan;
  const sizeClasses =
    size === "featured"
      ? "w-44 sm:w-52 md:w-60 aspect-[3/4]"
      : "w-36 sm:w-40 md:w-48 aspect-[3/4]";

  return (
    <div
      onClick={onClick}
      className={`game-card relative ${sizeClasses} rounded-2xl overflow-hidden cursor-pointer group`}
    >
      {/* Banner */}
      <div
        className="card-image absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${game.banner}')` }}
      />

      {/* Fallback gradient if no image */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-30`}
      />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Hover border glow */}
      <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:${colors.border} transition-colors duration-300`} />

      {/* Play button overlay */}
      <div className="play-overlay absolute inset-0 flex items-center justify-center z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* NEW badge */}
      {game.isNew && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider shadow-lg animate-glow-pulse">
            NEW
          </span>
        </div>
      )}

      {/* Title & tag */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${colors.text} mb-0.5 block opacity-80`}>
          {game.tag}
        </span>
        <h3 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
          {game.title}
        </h3>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FEATURED HERO CARD (larger)
   ────────────────────────────────────────────── */
function FeaturedCard({
  game,
  onClick,
  index,
}: {
  game: (typeof games)[0];
  onClick: () => void;
  index: number;
}) {
  const colors = COLOR_MAP[game.color] || COLOR_MAP.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={onClick}
      className="game-card relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group aspect-[16/10] sm:aspect-[16/9]"
    >
      {/* Banner */}
      <div
        className="card-image absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${game.banner}')` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-20`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Play overlay */}
      <div className="play-overlay absolute inset-0 flex items-center justify-center z-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
          <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Badge */}
      {game.isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg animate-glow-pulse">
            NEW
          </span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${colors.text} mb-1 block`}>
          {game.tag}
        </span>
        <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight mb-1 sm:mb-2">
          {game.title}
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm line-clamp-1 max-w-md">
          {game.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   MAIN DASHBOARD
   ────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const goToGame = useCallback((path: string) => router.push(path), [router]);

  // Filter by search + category
  const filtered = useMemo(() => {
    return games.filter((g) => {
      const matchesSearch = !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || g.tag === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Group by category
  const newGames = useMemo(() => filtered.filter((g) => g.isNew), [filtered]);
  const strategyGames = useMemo(() => filtered.filter((g) => g.tag === "Strategy"), [filtered]);
  const classicGames = useMemo(() => filtered.filter((g) => g.tag === "Classic"), [filtered]);
  const puzzleGames = useMemo(() => filtered.filter((g) => g.tag === "Puzzle"), [filtered]);
  const memoryGames = useMemo(() => filtered.filter((g) => g.tag === "Memory"), [filtered]);

  // Featured picks (first 4 non-new games with banners)
  const featured = useMemo(() => games.filter((g) => !g.isNew).slice(0, 4), []);

  const isSearching = searchQuery.length > 0;

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 md:space-y-10">

        {/* ─── TOP BAR: Search + Category Pills ─── */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search games..."
              className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl py-3 sm:py-3.5 pl-11 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-xs font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`category-pill flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border ${activeCategory === cat.key
                    ? "active border-transparent"
                    : "text-slate-400 border-slate-700/50 bg-slate-800/40"
                    }`}
                >
                  <CatIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {cat.key}
                </button>
              );
            })}
            <div className="flex items-center gap-2 px-3 text-slate-600 text-xs font-medium">
              <Gamepad2 className="w-3.5 h-3.5" />
              {games.length} games
            </div>
          </div>
        </div>

        {/* ─── SEARCH RESULTS (when searching) ─── */}
        {isSearching ? (
          <section className="section-reveal">
            <div className="flex items-center gap-3 mb-4 px-1">
              <Search className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                Results for &ldquo;{searchQuery}&rdquo;
              </h2>
              <span className="text-xs text-slate-500">{filtered.length} found</span>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
                {filtered.map((game) => (
                  <GameCard
                    key={game.title}
                    game={game}
                    onClick={() => goToGame(game.path)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Gamepad2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No games found</p>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* ─── FEATURED: Top Picks ─── */}
            {activeCategory === "All" && (
              <section className="section-reveal">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 px-1">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Top Picks For You</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white uppercase tracking-wider">
                    Featured
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {featured.map((game, i) => (
                    <FeaturedCard
                      key={game.title}
                      game={game}
                      onClick={() => goToGame(game.path)}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ─── NEW GAMES ROW ─── */}
            {newGames.length > 0 && (
              <ScrollRow
                title="New Games"
                icon={Sparkles}
                games={newGames}
                accentColor="cyan"
                onGameClick={goToGame}
                badge={`${newGames.length} new`}
              />
            )}

            {/* ─── TRENDING (all games shuffled) ─── */}
            {activeCategory === "All" && (
              <ScrollRow
                title="Trending Now"
                icon={TrendingUp}
                games={games.filter((_, i) => i % 2 === 0).slice(0, 12)}
                accentColor="rose"
                onGameClick={goToGame}
                badge="Hot"
              />
            )}

            {/* ─── STRATEGY GAMES ─── */}
            {strategyGames.length > 0 && (
              <ScrollRow
                title="Strategy Games"
                icon={Swords}
                games={strategyGames}
                accentColor="cyan"
                onGameClick={goToGame}
              />
            )}

            {/* ─── CLASSIC GAMES ─── */}
            {classicGames.length > 0 && (
              <ScrollRow
                title="Classic Games"
                icon={Crown}
                games={classicGames}
                accentColor="amber"
                onGameClick={goToGame}
              />
            )}

            {/* ─── PUZZLE GAMES ─── */}
            {puzzleGames.length > 0 && (
              <ScrollRow
                title="Puzzle Games"
                icon={Puzzle}
                games={puzzleGames}
                accentColor="purple"
                onGameClick={goToGame}
              />
            )}

            {/* ─── MEMORY GAMES ─── */}
            {memoryGames.length > 0 && (
              <ScrollRow
                title="Memory Games"
                icon={Brain}
                games={memoryGames}
                accentColor="violet"
                onGameClick={goToGame}
              />
            )}

            {/* ─── ALL GAMES GRID ─── */}
            {activeCategory === "All" && (
              <section className="section-reveal">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 px-1">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">All Games</h2>
                  <span className="text-xs text-slate-500 font-medium">{games.length} total</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 pb-6">
                  {games.map((game, i) => (
                    <motion.div
                      key={game.title}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                    >
                      <GameCard
                        game={game}
                        onClick={() => goToGame(game.path)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
