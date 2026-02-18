"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Users,
    UserPlus,
    Search,
    Check,
    X,
    Gamepad2,
    Clock,
    UserMinus,
    Send,
    Inbox,
    Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GameInviteModal from "@/components/GameInviteModal";

type Tab = "online" | "all" | "requests" | "search";

export default function FriendsPage() {
    const { user } = useUser();
    const [tab, setTab] = useState<Tab>("online");

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center glass rounded-2xl p-10 border border-slate-800/50 max-w-md">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
                    <p className="text-slate-400 text-sm">
                        Sign in to view your friends and send game invites.
                    </p>
                </div>
            </div>
        );
    }

    const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
        { key: "online", label: "Online", icon: Globe },
        { key: "all", label: "All Friends", icon: Users },
        { key: "requests", label: "Requests", icon: Inbox },
        { key: "search", label: "Find Players", icon: Search },
    ];

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                        <Users className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
                        Friends
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your friends and send game invites
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-slate-800/40 rounded-2xl mb-6 sm:mb-8 overflow-x-auto">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${tab === t.key
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {tab === "online" && <OnlineFriendsTab clerkId={user.id} userName={user.username || user.firstName || "Player"} />}
                        {tab === "all" && <AllFriendsTab clerkId={user.id} userName={user.username || user.firstName || "Player"} />}
                        {tab === "requests" && <RequestsTab clerkId={user.id} />}
                        {tab === "search" && <SearchTab clerkId={user.id} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   ONLINE FRIENDS TAB
   ────────────────────────────────────────────── */
function OnlineFriendsTab({ clerkId, userName }: { clerkId: string; userName: string }) {
    const friends = useQuery(api.friends.getFriends, { clerkId });
    const onlineFriends = friends?.filter((f) => f.isOnline) ?? [];

    const [inviteTarget, setInviteTarget] = useState<{
        name: string;
        clerkId: string;
    } | null>(null);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <h2 className="text-lg font-bold text-white">Online Now</h2>
                <span className="text-sm text-slate-500">{onlineFriends.length}</span>
            </div>

            {onlineFriends.length === 0 ? (
                <EmptyState
                    icon={Globe}
                    title="No friends online"
                    subtitle="Your friends will appear here when they're online"
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {onlineFriends.map((friend) => (
                        <FriendCard
                            key={friend.friendshipId}
                            name={friend.name}
                            avatar={friend.avatar}
                            isOnline={true}
                            actions={
                                <button
                                    onClick={() =>
                                        setInviteTarget({
                                            name: friend.name,
                                            clerkId: friend.clerkId,
                                        })
                                    }
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                                >
                                    <Gamepad2 className="w-3.5 h-3.5" />
                                    Invite
                                </button>
                            }
                        />
                    ))}
                </div>
            )}

            <GameInviteModal
                isOpen={!!inviteTarget}
                onClose={() => setInviteTarget(null)}
                friendName={inviteTarget?.name ?? ""}
                friendClerkId={inviteTarget?.clerkId ?? ""}
                currentUserClerkId={clerkId}
                currentUserName={userName}
            />
        </div>
    );
}

/* ──────────────────────────────────────────────
   ALL FRIENDS TAB
   ────────────────────────────────────────────── */
function AllFriendsTab({ clerkId, userName }: { clerkId: string; userName: string }) {
    const friends = useQuery(api.friends.getFriends, { clerkId });
    const removeFriend = useMutation(api.friends.removeFriend);

    const [inviteTarget, setInviteTarget] = useState<{
        name: string;
        clerkId: string;
    } | null>(null);

    const sorted = [...(friends ?? [])].sort((a, b) =>
        a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold text-white">All Friends</h2>
                <span className="text-sm text-slate-500">{friends?.length ?? 0}</span>
            </div>

            {sorted.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No friends yet"
                    subtitle='Search for players in the "Find Players" tab'
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {sorted.map((friend) => (
                        <FriendCard
                            key={friend.friendshipId}
                            name={friend.name}
                            avatar={friend.avatar}
                            isOnline={friend.isOnline}
                            actions={
                                <div className="flex gap-2">
                                    {friend.isOnline && (
                                        <button
                                            onClick={() =>
                                                setInviteTarget({
                                                    name: friend.name,
                                                    clerkId: friend.clerkId,
                                                })
                                            }
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                                        >
                                            <Gamepad2 className="w-3.5 h-3.5" />
                                            Invite
                                        </button>
                                    )}
                                    <button
                                        onClick={() =>
                                            removeFriend({ friendshipId: friend.friendshipId })
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs font-bold hover:text-red-400 hover:border-red-500/30 transition-colors"
                                    >
                                        <UserMinus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            }
                        />
                    ))}
                </div>
            )}

            <GameInviteModal
                isOpen={!!inviteTarget}
                onClose={() => setInviteTarget(null)}
                friendName={inviteTarget?.name ?? ""}
                friendClerkId={inviteTarget?.clerkId ?? ""}
                currentUserClerkId={clerkId}
                currentUserName={userName}
            />
        </div>
    );
}

/* ──────────────────────────────────────────────
   REQUESTS TAB
   ────────────────────────────────────────────── */
function RequestsTab({ clerkId }: { clerkId: string }) {
    const pendingRequests = useQuery(api.friends.getPendingRequests, { clerkId });
    const sentRequests = useQuery(api.friends.getSentRequests, { clerkId });
    const acceptRequest = useMutation(api.friends.acceptRequest);
    const declineRequest = useMutation(api.friends.declineRequest);

    return (
        <div className="space-y-8">
            {/* Incoming */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Inbox className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-bold text-white">Incoming</h2>
                    <span className="text-sm text-slate-500">
                        {pendingRequests?.length ?? 0}
                    </span>
                </div>

                {!pendingRequests || pendingRequests.length === 0 ? (
                    <EmptyState
                        icon={Inbox}
                        title="No pending requests"
                        subtitle="Friend requests will appear here"
                    />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {pendingRequests.map((req) => (
                            <FriendCard
                                key={req.friendshipId}
                                name={req.name}
                                avatar={req.avatar}
                                actions={
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                acceptRequest({
                                                    friendshipId: req.friendshipId,
                                                    clerkId,
                                                })
                                            }
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() =>
                                                declineRequest({ friendshipId: req.friendshipId })
                                            }
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs font-bold hover:text-red-400 hover:border-red-500/30 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Sent */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Send className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-bold text-white">Sent</h2>
                    <span className="text-sm text-slate-500">
                        {sentRequests?.length ?? 0}
                    </span>
                </div>

                {!sentRequests || sentRequests.length === 0 ? (
                    <EmptyState
                        icon={Send}
                        title="No sent requests"
                        subtitle="Requests you send will appear here"
                    />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {sentRequests.map((req) => (
                            <FriendCard
                                key={req.friendshipId}
                                name={req.name}
                                avatar={req.avatar}
                                badge="Pending"
                                actions={
                                    <button
                                        onClick={() =>
                                            declineRequest({ friendshipId: req.friendshipId })
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs font-bold hover:text-red-400 hover:border-red-500/30 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Cancel
                                    </button>
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────
   SEARCH TAB
   ────────────────────────────────────────────── */
function SearchTab({ clerkId }: { clerkId: string }) {
    const [query, setQuery] = useState("");
    const results = useQuery(api.users.searchUsers, {
        query,
        excludeClerkId: clerkId,
    });
    const sendRequest = useMutation(api.friends.sendRequest);
    const [sentTo, setSentTo] = useState<Set<string>>(new Set());

    const handleSend = async (toClerkId: string) => {
        try {
            await sendRequest({ fromClerkId: clerkId, toClerkId });
            setSentTo((prev) => new Set(prev).add(toClerkId));
        } catch (e: any) {
            // Already friends or pending
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Find Players</h2>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by username (min 2 chars)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
                />
            </div>

            {query.length < 2 ? (
                <EmptyState
                    icon={Search}
                    title="Search for players"
                    subtitle="Type at least 2 characters to search"
                />
            ) : !results || results.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No players found"
                    subtitle={`No results for "${query}"`}
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {results.map((user) => (
                        <FriendCard
                            key={user.clerkId}
                            name={user.name}
                            avatar={user.avatar}
                            isOnline={user.isOnline}
                            actions={
                                sentTo.has(user.clerkId) ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-green-400 text-xs font-bold">
                                        <Check className="w-3.5 h-3.5" />
                                        Sent
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleSend(user.clerkId)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        Add
                                    </button>
                                )
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────
   SHARED: FRIEND CARD
   ────────────────────────────────────────────── */
function FriendCard({
    name,
    avatar,
    isOnline,
    actions,
    badge,
}: {
    name: string;
    avatar?: string;
    isOnline?: boolean;
    actions?: React.ReactNode;
    badge?: string;
}) {
    return (
        <div className="glass rounded-xl border border-slate-800/50 p-4 flex items-center gap-3 hover:border-slate-700/60 transition-colors">
            {/* Avatar */}
            <div className="relative shrink-0">
                {avatar ? (
                    <img
                        src={avatar}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                        {name[0]?.toUpperCase()}
                    </div>
                )}
                {isOnline !== undefined && (
                    <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${isOnline
                                ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                                : "bg-slate-600"
                            }`}
                    />
                )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{name}</p>
                {badge ? (
                    <p className="text-[11px] text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {badge}
                    </p>
                ) : isOnline !== undefined ? (
                    <p
                        className={`text-[11px] ${isOnline ? "text-green-400" : "text-slate-500"}`}
                    >
                        {isOnline ? "Online" : "Offline"}
                    </p>
                ) : null}
            </div>

            {/* Actions */}
            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    );
}

/* ──────────────────────────────────────────────
   SHARED: EMPTY STATE
   ────────────────────────────────────────────── */
function EmptyState({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: React.ElementType;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="text-center py-12 glass rounded-2xl border border-slate-800/50 border-dashed">
            <Icon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-white font-bold text-sm">{title}</p>
            <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
        </div>
    );
}
