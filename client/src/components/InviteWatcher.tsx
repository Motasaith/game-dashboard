"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * InviteWatcher — polls the sender's sent invites.
 * When an invite is accepted (sessionId appears), it auto-redirects the sender to the game.
 * Place this once in the layout.
 */
export default function InviteWatcher() {
    const { user } = useUser();
    const router = useRouter();
    const handledRef = useRef<Set<string>>(new Set());

    const sentInvites = useQuery(
        api.gameInvites.getSentInvites,
        user ? { clerkId: user.id } : "skip"
    );

    useEffect(() => {
        if (!sentInvites) return;

        for (const invite of sentInvites) {
            if (
                invite.status === "accepted" &&
                invite.sessionId &&
                !handledRef.current.has(invite._id)
            ) {
                handledRef.current.add(invite._id);
                // Redirect sender to the game
                router.push(invite.gamePath + "?session=" + invite.sessionId);
            }
        }
    }, [sentInvites, router]);

    return null; // invisible
}
