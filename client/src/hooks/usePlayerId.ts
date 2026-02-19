"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

/**
 * Returns a stable playerId for any visitor:
 * - Signed-in users → clerkId
 * - Guests → UUID from localStorage
 *
 * Also returns the display name.
 */
export function usePlayerId() {
    const { user, isLoaded } = useUser();
    const [guestId, setGuestId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            let stored = localStorage.getItem("guest-player-id");
            if (!stored) {
                stored = "guest_" + crypto.randomUUID();
                localStorage.setItem("guest-player-id", stored);
            }
            setGuestId(stored);
        }
    }, [user]);

    if (!isLoaded) {
        return { playerId: null, playerName: "Loading...", isGuest: true };
    }

    if (user) {
        return {
            playerId: user.id,
            playerName: user.username || user.firstName || "Player",
            isGuest: false,
        };
    }

    return {
        playerId: guestId,
        playerName: "Guest",
        isGuest: true,
    };
}
