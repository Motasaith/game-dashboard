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

// ─── Accept a game invite ───
export const acceptInvite = mutation({
    args: { inviteId: v.id("gameInvites") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.inviteId, { status: "accepted" });
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

// ─── Get invites I sent ───
export const getSentInvites = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const invites = await ctx.db
            .query("gameInvites")
            .withIndex("by_fromUser", (q) => q.eq("fromUser", args.clerkId))
            .collect();

        return invites.filter((i) => i.status === "pending");
    },
});
