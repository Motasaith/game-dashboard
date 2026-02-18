"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Gamepad2, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * InviteNotification — Shows incoming game invites as toast popups.
 * Place this once in the layout so it's always visible.
 */
export default function InviteNotification() {
    const { user } = useUser();
    const router = useRouter();

    const pendingInvites = useQuery(
        api.gameInvites.getPendingInvites,
        user ? { clerkId: user.id } : "skip"
    );

    const acceptInvite = useMutation(api.gameInvites.acceptInvite);
    const declineInvite = useMutation(api.gameInvites.declineInvite);

    const handleAccept = async (inviteId: string, gamePath: string) => {
        await acceptInvite({ inviteId: inviteId as any });
        router.push(gamePath);
    };

    const handleDecline = async (inviteId: string) => {
        await declineInvite({ inviteId: inviteId as any });
    };

    if (!pendingInvites || pendingInvites.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {pendingInvites.slice(0, 3).map((invite) => (
                    <motion.div
                        key={invite._id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="pointer-events-auto glass-strong rounded-2xl border border-cyan-500/30 p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white">Game Invite!</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    <span className="text-cyan-300 font-medium">
                                        {invite.fromUserName}
                                    </span>{" "}
                                    wants to play{" "}
                                    <span className="text-white font-medium">
                                        {invite.gameTitle}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => handleAccept(invite._id, invite.gamePath)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Play Now
                            </button>
                            <button
                                onClick={() => handleDecline(invite._id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs font-bold hover:text-white hover:bg-slate-700/60 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Decline
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
