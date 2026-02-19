import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Join the matchmaking queue ───
export const joinQueue = mutation({
    args: {
        playerId: v.string(),
        playerName: v.string(),
        gameSlug: v.string(),
    },
    handler: async (ctx, args) => {
        // Remove any existing entries for this player in this game
        const existing = await ctx.db
            .query("matchmaking")
            .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
            .collect();
        for (const e of existing) {
            if (e.gameSlug === args.gameSlug) {
                await ctx.db.delete(e._id);
            }
        }

        // Look for another player waiting for the same game
        const waitingPlayers = await ctx.db
            .query("matchmaking")
            .withIndex("by_gameSlug", (q) => q.eq("gameSlug", args.gameSlug))
            .collect();
        const opponent = waitingPlayers.find(
            (w) => w.status === "waiting" && w.playerId !== args.playerId
        );

        if (opponent) {
            // Match found! Create a game session
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const sessionId = await ctx.db.insert("gameSessions", {
                gameSlug: args.gameSlug,
                roomCode,
                player1Id: opponent.playerId,
                player1Name: opponent.playerName,
                player2Id: args.playerId,
                player2Name: args.playerName,
                status: "active",
                createdAt: Date.now(),
            });

            // Update both matchmaking entries
            await ctx.db.patch(opponent._id, {
                status: "matched",
                sessionId: sessionId,
            });

            // Insert matched entry for current player
            const myEntry = await ctx.db.insert("matchmaking", {
                playerId: args.playerId,
                playerName: args.playerName,
                gameSlug: args.gameSlug,
                status: "matched",
                sessionId: sessionId,
                createdAt: Date.now(),
            });

            return { status: "matched", sessionId: sessionId };
        }

        // No opponent — join the queue
        await ctx.db.insert("matchmaking", {
            playerId: args.playerId,
            playerName: args.playerName,
            gameSlug: args.gameSlug,
            status: "waiting",
            createdAt: Date.now(),
        });

        return { status: "waiting", sessionId: null };
    },
});

// ─── Leave the matchmaking queue ───
export const leaveQueue = mutation({
    args: { playerId: v.string(), gameSlug: v.string() },
    handler: async (ctx, args) => {
        const entries = await ctx.db
            .query("matchmaking")
            .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
            .collect();
        for (const e of entries) {
            if (e.gameSlug === args.gameSlug && e.status === "waiting") {
                await ctx.db.delete(e._id);
            }
        }
    },
});

// ─── Poll for match result ───
export const getMyMatch = query({
    args: { playerId: v.string(), gameSlug: v.string() },
    handler: async (ctx, args) => {
        const entries = await ctx.db
            .query("matchmaking")
            .withIndex("by_playerId", (q) => q.eq("playerId", args.playerId))
            .collect();
        const match = entries.find(
            (e) => e.gameSlug === args.gameSlug && e.status === "matched"
        );
        if (match) {
            return { status: "matched" as const, sessionId: match.sessionId! };
        }

        const waiting = entries.find(
            (e) => e.gameSlug === args.gameSlug && e.status === "waiting"
        );
        if (waiting) {
            return { status: "waiting" as const, sessionId: null };
        }

        return { status: "none" as const, sessionId: null };
    },
});

// ─── Get queue count for a game ───
export const getQueueCount = query({
    args: { gameSlug: v.string() },
    handler: async (ctx, args) => {
        const entries = await ctx.db
            .query("matchmaking")
            .withIndex("by_gameSlug", (q) => q.eq("gameSlug", args.gameSlug))
            .collect();
        return entries.filter((e) => e.status === "waiting").length;
    },
});
