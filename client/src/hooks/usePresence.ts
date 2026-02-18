"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * usePresence — Heartbeat hook for online status.
 * Call this once in your app (e.g. in a layout-level component).
 * It upserts the user on mount, sends keepAlive every 30s,
 * and marks them offline on unmount / tab close.
 */
export function usePresence(user: {
    clerkId: string;
    name: string;
    avatar?: string;
} | null) {
    const upsertUser = useMutation(api.users.upsertUser);
    const keepAlive = useMutation(api.users.keepAlive);
    const goOffline = useMutation(api.users.goOffline);

    useEffect(() => {
        if (!user) return;

        // Register / go online
        upsertUser({
            clerkId: user.clerkId,
            name: user.name,
            avatar: user.avatar,
        });

        // Heartbeat every 30s
        const interval = setInterval(() => {
            keepAlive({ clerkId: user.clerkId });
        }, 30_000);

        // Go offline on tab close
        const handleBeforeUnload = () => {
            // Use sendBeacon for reliability on tab close
            const url = process.env.NEXT_PUBLIC_CONVEX_URL!;
            navigator.sendBeacon?.(
                `${url}/api/mutation`,
                JSON.stringify({
                    path: "users:goOffline",
                    args: { clerkId: user.clerkId },
                })
            );
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            goOffline({ clerkId: user.clerkId });
        };
    }, [user?.clerkId]); // eslint-disable-line react-hooks/exhaustive-deps
}
