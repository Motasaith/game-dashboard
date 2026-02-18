"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Gamepad2, Play } from "lucide-react";

const GAMES = [
    { title: "ROTA", path: "/game/rota", color: "cyan" },
    { title: "Nine Men's Morris", path: "/game/morris", color: "green" },
    { title: "Ultimate TTT", path: "/game/ultimate-ttt", color: "purple" },
    { title: "Othello", path: "/game/othello", color: "emerald" },
    { title: "Dots & Boxes", path: "/game/dots-boxes", color: "pink" },
    { title: "Connect Four", path: "/game/connect-four", color: "blue" },
    { title: "Checkers", path: "/game/checkers", color: "red" },
    { title: "Mancala", path: "/game/mancala", color: "amber" },
    { title: "Chess", path: "/game/chess", color: "green" },
    { title: "Tic-Tac-Toe", path: "/game/tic-tac-toe", color: "indigo" },
    { title: "2048", path: "/game/2048", color: "orange" },
    { title: "Simon Says", path: "/game/simon-says", color: "violet" },
    { title: "Lights Out", path: "/game/lights-out", color: "yellow" },
    { title: "Battleship", path: "/game/battleship", color: "blue" },
    { title: "Gomoku", path: "/game/gomoku", color: "emerald" },
    { title: "Backgammon", path: "/game/backgammon", color: "amber" },
    { title: "Chinese Checkers", path: "/game/chinese-checkers", color: "rose" },
    { title: "Quoridor", path: "/game/quoridor", color: "teal" },
    { title: "Hex", path: "/game/hex", color: "red" },
    { title: "Stratego", path: "/game/stratego", color: "rose" },
    { title: "Dominoes", path: "/game/dominoes", color: "cyan" },
    { title: "Mahjong Solitaire", path: "/game/mahjong", color: "teal" },
    { title: "Go (9×9)", path: "/game/go", color: "amber" },
    { title: "Shogi", path: "/game/shogi", color: "orange" },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    friendName: string;
    friendClerkId: string;
    currentUserClerkId: string;
    currentUserName: string;
}

export default function GameInviteModal({
    isOpen,
    onClose,
    friendName,
    friendClerkId,
    currentUserClerkId,
    currentUserName,
}: Props) {
    const sendInvite = useMutation(api.gameInvites.sendInvite);
    const [sent, setSent] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    if (!isOpen) return null;

    const filtered = GAMES.filter((g) =>
        g.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleSend = async (game: (typeof GAMES)[0]) => {
        await sendInvite({
            fromClerkId: currentUserClerkId,
            fromUserName: currentUserName,
            toClerkId: friendClerkId,
            gameTitle: game.title,
            gamePath: game.path,
        });
        setSent(game.title);
        setTimeout(() => {
            setSent(null);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md glass-strong rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5 text-cyan-400" />
                            Invite to Play
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Choose a game to play with <span className="text-cyan-300 font-medium">{friendName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 pt-4">
                    <input
                        type="text"
                        placeholder="Search games..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 outline-none"
                    />
                </div>

                {/* Success state */}
                {sent && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                            <Play className="w-8 h-8 text-green-400 fill-green-400" />
                        </div>
                        <p className="text-white font-bold">Invite Sent!</p>
                        <p className="text-slate-400 text-sm mt-1">
                            Invited {friendName} to play {sent}
                        </p>
                    </div>
                )}

                {/* Game List */}
                {!sent && (
                    <div className="p-3 max-h-80 overflow-y-auto space-y-1">
                        {filtered.map((game) => (
                            <button
                                key={game.title}
                                onClick={() => handleSend(game)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-white/5 transition-colors group"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-${game.color}-500/20 flex items-center justify-center shrink-0`}>
                                    <Gamepad2 className={`w-5 h-5 text-${game.color}-400`} />
                                </div>
                                <span className="text-sm font-medium text-white flex-1">
                                    {game.title}
                                </span>
                                <Play className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-6">
                                No games found
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
