import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upsert user + mark online (call on login / mount)
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        avatar: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                name: args.name,
                avatar: args.avatar,
                isOnline: true,
                lastSeen: Date.now(),
            });
            return existing._id;
        }

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            avatar: args.avatar,
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

// Heartbeat — call every 30s to stay online
export const keepAlive = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: true,
                lastSeen: Date.now(),
            });
        }
    },
});

// Go offline
export const goOffline = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: false,
                lastSeen: Date.now(),
            });
        }
    },
});

// Get all online users (heartbeat within last 60s)
export const getOnlineUsers = query({
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const now = Date.now();
        return users.filter((u) => u.isOnline && now - u.lastSeen < 60000);
    },
});

// Get total online count
export const getOnlineCount = query({
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const now = Date.now();
        return users.filter((u) => u.isOnline && now - u.lastSeen < 60000).length;
    },
});

// Search users by name (exclude current user)
export const searchUsers = query({
    args: { query: v.string(), excludeClerkId: v.string() },
    handler: async (ctx, args) => {
        if (!args.query || args.query.length < 2) return [];
        const users = await ctx.db.query("users").collect();
        const q = args.query.toLowerCase();
        return users
            .filter(
                (u) =>
                    u.clerkId !== args.excludeClerkId &&
                    u.name.toLowerCase().includes(q)
            )
            .slice(0, 20)
            .map((u) => ({
                clerkId: u.clerkId,
                name: u.name,
                avatar: u.avatar,
                isOnline: u.isOnline && Date.now() - u.lastSeen < 60000,
            }));
    },
});
