import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Send a game invite ───
export const sendInvite = mutation({
    args: {
        fromClerkId: v.string(),
        fromUserName: v.string(),
        toClerkId: v.string(),
        gameTitle: v.string(),
        gamePath: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("gameInvites", {
            fromUser: args.fromClerkId,
            toUser: args.toClerkId,
            fromUserName: args.fromUserName,
            gameTitle: args.gameTitle,
            gamePath: args.gamePath,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

// ─── Accept a game invite → creates a game session ───
export const acceptInvite = mutation({
    args: { inviteId: v.id("gameInvites") },
    handler: async (ctx, args) => {
        const invite = await ctx.db.get(args.inviteId);
        if (!invite) throw new Error("Invite not found");

        // Extract game slug from path (e.g. "/game/chess" → "chess")
        const gameSlug = invite.gamePath.split("/").pop() || "unknown";

        // Create a game session for both players
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const sessionId = await ctx.db.insert("gameSessions", {
            gameSlug,
            roomCode,
            player1Id: invite.fromUser,
            player1Name: invite.fromUserName,
            player2Id: invite.toUser,
            player2Name: "Player 2",
            status: "active",
            createdAt: Date.now(),
        });

        // Update invite with session info
        await ctx.db.patch(args.inviteId, {
            status: "accepted",
            sessionId: sessionId,
        });

        return { sessionId, gamePath: invite.gamePath };
    },
});

// ─── Decline a game invite ───
export const declineInvite = mutation({
    args: { inviteId: v.id("gameInvites") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.inviteId, { status: "declined" });
    },
});

// ─── Get pending invites for a user ───
export const getPendingInvites = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const invites = await ctx.db
            .query("gameInvites")
            .withIndex("by_toUser", (q) => q.eq("toUser", args.clerkId))
            .collect();
        return invites.filter((i) => i.status === "pending");
    },
});

// ─── Get invites I sent (for polling accepted status) ───
export const getSentInvites = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const invites = await ctx.db
            .query("gameInvites")
            .withIndex("by_fromUser", (q) => q.eq("fromUser", args.clerkId))
            .collect();
        // Return recently accepted invites (within last 30s) so sender can redirect
        const now = Date.now();
        return invites.filter(
            (i) =>
                i.status === "pending" ||
                (i.status === "accepted" && i.sessionId && now - i.createdAt < 120000)
        );
    },
});
