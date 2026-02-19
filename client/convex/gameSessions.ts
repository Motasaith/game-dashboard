import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Create a game session (for room creation) ───
export const createSession = mutation({
    args: {
        gameSlug: v.string(),
        playerId: v.string(),
        playerName: v.string(),
    },
    handler: async (ctx, args) => {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const sessionId = await ctx.db.insert("gameSessions", {
            gameSlug: args.gameSlug,
            roomCode,
            player1Id: args.playerId,
            player1Name: args.playerName,
            status: "waiting",
            createdAt: Date.now(),
        });
        return { sessionId, roomCode };
    },
});

// ─── Join a session by room code ───
export const joinByRoomCode = mutation({
    args: {
        roomCode: v.string(),
        playerId: v.string(),
        playerName: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("gameSessions")
            .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode.toUpperCase()))
            .first();

        if (!session) throw new Error("Room not found");

        // Already in this session? Just return it
        if (session.player1Id === args.playerId || session.player2Id === args.playerId) {
            return { sessionId: session._id, gameSlug: session.gameSlug };
        }

        if (session.status !== "waiting") throw new Error("Room is full");

        await ctx.db.patch(session._id, {
            player2Id: args.playerId,
            player2Name: args.playerName,
            status: "active",
        });

        return { sessionId: session._id, gameSlug: session.gameSlug };
    },
});

// ─── Get session data (for both players to poll) ───
export const getSession = query({
    args: { sessionId: v.id("gameSessions") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.sessionId);
    },
});

// ─── Get session by room code ───
export const getSessionByRoomCode = query({
    args: { roomCode: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("gameSessions")
            .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode.toUpperCase()))
            .first();
    },
});
