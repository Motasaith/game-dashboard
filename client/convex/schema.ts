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
        user1: v.string(),
        user2: v.string(),
        status: v.string(), // "pending" | "accepted"
        sentBy: v.string(),
        createdAt: v.number(),
    })
        .index("by_user1", ["user1"])
        .index("by_user2", ["user2"])
        .index("by_users", ["user1", "user2"]),

    // Game Invites — invite a friend to play a game
    gameInvites: defineTable({
        fromUser: v.string(),
        toUser: v.string(),
        fromUserName: v.string(),
        gameTitle: v.string(),
        gamePath: v.string(),
        status: v.string(), // "pending" | "accepted" | "declined"
        sessionId: v.optional(v.string()), // filled when accepted
        createdAt: v.number(),
    })
        .index("by_toUser", ["toUser"])
        .index("by_fromUser", ["fromUser"]),

    // Matchmaking queue — players waiting for a match
    matchmaking: defineTable({
        playerId: v.string(),     // clerkId or guest UUID
        playerName: v.string(),
        gameSlug: v.string(),     // e.g. "tic-tac-toe"
        status: v.string(),       // "waiting" | "matched"
        sessionId: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_gameSlug", ["gameSlug"])
        .index("by_playerId", ["playerId"]),

    // Game sessions — pairs two players
    gameSessions: defineTable({
        gameSlug: v.string(),
        roomCode: v.string(),     // 6-char code for room sharing
        player1Id: v.string(),
        player1Name: v.string(),
        player2Id: v.optional(v.string()),
        player2Name: v.optional(v.string()),
        status: v.string(),       // "waiting" | "active" | "finished"
        createdAt: v.number(),
    })
        .index("by_roomCode", ["roomCode"])
        .index("by_player1", ["player1Id"])
        .index("by_player2", ["player2Id"]),
});
