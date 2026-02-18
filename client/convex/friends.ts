import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Send a friend request ───
export const sendRequest = mutation({
    args: { fromClerkId: v.string(), toClerkId: v.string() },
    handler: async (ctx, args) => {
        if (args.fromClerkId === args.toClerkId) throw new Error("Cannot add yourself");

        // Check if a friendship already exists in either direction
        const existing1 = await ctx.db
            .query("friendships")
            .withIndex("by_users", (q) =>
                q.eq("user1", args.fromClerkId).eq("user2", args.toClerkId)
            )
            .first();
        const existing2 = await ctx.db
            .query("friendships")
            .withIndex("by_users", (q) =>
                q.eq("user1", args.toClerkId).eq("user2", args.fromClerkId)
            )
            .first();

        if (existing1 || existing2) throw new Error("Friendship already exists");

        return await ctx.db.insert("friendships", {
            user1: args.fromClerkId,
            user2: args.toClerkId,
            status: "pending",
            sentBy: args.fromClerkId,
            createdAt: Date.now(),
        });
    },
});

// ─── Accept a friend request ───
export const acceptRequest = mutation({
    args: { friendshipId: v.id("friendships"), clerkId: v.string() },
    handler: async (ctx, args) => {
        const friendship = await ctx.db.get(args.friendshipId);
        if (!friendship) throw new Error("Not found");

        // Only the receiver can accept
        const isReceiver =
            (friendship.user1 === args.clerkId && friendship.sentBy !== args.clerkId) ||
            (friendship.user2 === args.clerkId && friendship.sentBy !== args.clerkId);
        if (!isReceiver) throw new Error("Only receiver can accept");

        await ctx.db.patch(args.friendshipId, { status: "accepted" });
    },
});

// ─── Decline / cancel a friend request ───
export const declineRequest = mutation({
    args: { friendshipId: v.id("friendships") },
    handler: async (ctx, args) => {
        const friendship = await ctx.db.get(args.friendshipId);
        if (!friendship) throw new Error("Not found");
        await ctx.db.delete(args.friendshipId);
    },
});

// ─── Remove a friend ───
export const removeFriend = mutation({
    args: { friendshipId: v.id("friendships") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.friendshipId);
    },
});

// ─── Get accepted friends (with user data) ───
export const getFriends = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const asUser1 = await ctx.db
            .query("friendships")
            .withIndex("by_user1", (q) => q.eq("user1", args.clerkId))
            .collect();
        const asUser2 = await ctx.db
            .query("friendships")
            .withIndex("by_user2", (q) => q.eq("user2", args.clerkId))
            .collect();

        const all = [...asUser1, ...asUser2].filter((f) => f.status === "accepted");

        // Resolve friend user data
        const friends = await Promise.all(
            all.map(async (f) => {
                const friendClerkId = f.user1 === args.clerkId ? f.user2 : f.user1;
                const friendUser = await ctx.db
                    .query("users")
                    .withIndex("by_clerkId", (q) => q.eq("clerkId", friendClerkId))
                    .first();
                const now = Date.now();
                return {
                    friendshipId: f._id,
                    clerkId: friendClerkId,
                    name: friendUser?.name ?? "Unknown",
                    avatar: friendUser?.avatar,
                    isOnline: friendUser ? friendUser.isOnline && now - friendUser.lastSeen < 60000 : false,
                };
            })
        );

        return friends;
    },
});

// ─── Get incoming friend requests ───
export const getPendingRequests = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const asUser1 = await ctx.db
            .query("friendships")
            .withIndex("by_user1", (q) => q.eq("user1", args.clerkId))
            .collect();
        const asUser2 = await ctx.db
            .query("friendships")
            .withIndex("by_user2", (q) => q.eq("user2", args.clerkId))
            .collect();

        // Incoming = pending requests where I'm NOT the sender
        const incoming = [...asUser1, ...asUser2].filter(
            (f) => f.status === "pending" && f.sentBy !== args.clerkId
        );

        const results = await Promise.all(
            incoming.map(async (f) => {
                const senderUser = await ctx.db
                    .query("users")
                    .withIndex("by_clerkId", (q) => q.eq("clerkId", f.sentBy))
                    .first();
                return {
                    friendshipId: f._id,
                    clerkId: f.sentBy,
                    name: senderUser?.name ?? "Unknown",
                    avatar: senderUser?.avatar,
                };
            })
        );
        return results;
    },
});

// ─── Get outgoing (sent) friend requests ───
export const getSentRequests = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const asUser1 = await ctx.db
            .query("friendships")
            .withIndex("by_user1", (q) => q.eq("user1", args.clerkId))
            .collect();
        const asUser2 = await ctx.db
            .query("friendships")
            .withIndex("by_user2", (q) => q.eq("user2", args.clerkId))
            .collect();

        const sent = [...asUser1, ...asUser2].filter(
            (f) => f.status === "pending" && f.sentBy === args.clerkId
        );

        const results = await Promise.all(
            sent.map(async (f) => {
                const targetClerkId = f.user1 === args.clerkId ? f.user2 : f.user1;
                const targetUser = await ctx.db
                    .query("users")
                    .withIndex("by_clerkId", (q) => q.eq("clerkId", targetClerkId))
                    .first();
                return {
                    friendshipId: f._id,
                    clerkId: targetClerkId,
                    name: targetUser?.name ?? "Unknown",
                    avatar: targetUser?.avatar,
                };
            })
        );
        return results;
    },
});
