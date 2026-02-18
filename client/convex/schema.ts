import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users — Clerk user data + online presence
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        avatar: v.optional(v.string()),
        isOnline: v.boolean(),
        lastSeen: v.number(),
    }).index("by_clerkId", ["clerkId"]),

    // Friendships — bidirectional friend relationships
    friendships: defineTable({
        user1: v.string(), // clerkId of requester
        user2: v.string(), // clerkId of target
        status: v.string(), // "pending" | "accepted"
        sentBy: v.string(), // clerkId of who sent it
        createdAt: v.number(),
    })
        .index("by_user1", ["user1"])
        .index("by_user2", ["user2"])
        .index("by_users", ["user1", "user2"]),

    // Game Invites — invite a friend to play a game
    gameInvites: defineTable({
        fromUser: v.string(), // clerkId
        toUser: v.string(), // clerkId
        fromUserName: v.string(),
        gameTitle: v.string(),
        gamePath: v.string(),
        status: v.string(), // "pending" | "accepted" | "declined"
        createdAt: v.number(),
    })
        .index("by_toUser", ["toUser"])
        .index("by_fromUser", ["fromUser"]),
});
