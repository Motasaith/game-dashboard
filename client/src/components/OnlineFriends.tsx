"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePresence } from "@/hooks/usePresence";
import { Search, Users } from "lucide-react";

/**
 * OnlineFriends — Shows online users with live presence.
 * Uses the Convex heartbeat system instead of Liveblocks.
 */
export default function OnlineFriends() {
    const { user } = useUser();
    const onlineUsers = useQuery(api.users.getOnlineUsers);

    // Start the heartbeat for the current user
    usePresence(
        user
            ? {
                clerkId: user.id,
                name: user.username || user.firstName || "Player",
                avatar: user.imageUrl,
            }
            : null
    );

    // Filter out current user from the list
    const friends = onlineUsers?.filter((u) => u.clerkId !== user?.id) ?? [];

    return (
        <div>
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Social
            </h3>

            {/* Player Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Find players..."
                    className="w-full bg-slate-800/50 border-none rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 outline-none"
                />
            </div>

            {/* Online Users */}
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Online — {onlineUsers?.length ?? 0}
            </h4>

            {friends.length === 0 ? (
                <div className="text-center py-8 glass rounded-xl border border-slate-800/50 border-dashed">
                    <p className="text-slate-500 text-sm">No friends online</p>
                    <button className="mt-2 text-cyan-400 text-xs font-bold hover:underline">
                        Invite Friends
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {friends.map((friend) => (
                        <div
                            key={friend._id}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            {/* Avatar */}
                            {friend.avatar ? (
                                <img
                                    src={friend.avatar}
                                    alt={friend.name}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-green-500/50"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                    {friend.name[0]?.toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {friend.name}
                                </p>
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                                    Online
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
