"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutGrid,
    Users,
    Settings,
    LogIn,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bell,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
    SignedIn,
    SignedOut,
    UserButton,
    SignOutButton,
    useUser,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { usePresence } from "@/hooks/usePresence";

const navItems = [
    { icon: LayoutGrid, label: "Library", path: "/" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
    const { user } = useUser();
    const [collapsed, setCollapsed] = useState(false);

    // Start heartbeat for presence tracking
    usePresence(
        user
            ? {
                clerkId: user.id,
                name: user.username || user.firstName || "Player",
                avatar: user.imageUrl,
            }
            : null
    );

    // Pending friend requests badge
    const pendingRequests = useQuery(
        api.friends.getPendingRequests,
        user ? { clerkId: user.id } : "skip"
    );

    // Pending game invites badge
    const pendingInvites = useQuery(
        api.gameInvites.getPendingInvites,
        user ? { clerkId: user.id } : "skip"
    );

    const totalNotifications =
        (pendingRequests?.length ?? 0) + (pendingInvites?.length ?? 0);

    // Persist collapsed state
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) setCollapsed(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    }, [collapsed]);

    const displayName =
        user?.username ||
        user?.firstName ||
        user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
        "Guest";
    const initial = displayName[0]?.toUpperCase() || "G";

    return (
        <div
            className={`hidden md:flex ${collapsed ? "w-16" : "w-64"} glass-strong border-r border-slate-800/50 flex-col justify-between z-20 shrink-0 transition-all duration-300 ease-in-out relative`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-8 z-30 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg"
            >
                {collapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                    <ChevronLeft className="w-3.5 h-3.5" />
                )}
            </button>

            <div>
                {/* Logo */}
                <div className="p-4">
                    <Logo collapsed={collapsed} />
                </div>

                {/* Navigation */}
                <nav className="mt-4 px-2 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.path}
                            className="flex items-center gap-4 p-3 rounded-xl transition-all group text-slate-400 hover:bg-white/5 hover:text-white relative"
                        >
                            {/* Active indicator bar */}
                            <div className="absolute left-0 w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <item.icon className="w-5 h-5 mx-auto lg:mx-0 shrink-0" />
                            {!collapsed && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                            {/* Badge for Friends tab */}
                            {item.label === "Friends" && totalNotifications > 0 && (
                                <span
                                    className={`${collapsed ? "absolute -top-0.5 -right-0.5" : "ml-auto"} min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold flex items-center justify-center px-1`}
                                >
                                    {totalNotifications}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* User Section — Signed In */}
            <SignedIn>
                <div className="p-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 w-full p-2 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                            {initial}
                        </div>
                        {!collapsed && (
                            <>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate">{displayName}</p>
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                        Online
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-0 h-0 hidden",
                                                userButtonTrigger: "p-0",
                                            },
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    {!collapsed ? (
                        <SignOutButton>
                            <button className="mt-1 flex items-center gap-3 w-full p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <LogOut className="w-4 h-4 shrink-0" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </SignOutButton>
                    ) : (
                        <SignOutButton>
                            <button className="mt-1 flex items-center justify-center w-full p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </SignOutButton>
                    )}
                </div>
            </SignedIn>

            {/* User Section — Guest */}
            <SignedOut>
                <div className="p-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 w-full p-2 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-tr from-slate-600 to-slate-500 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            G
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm truncate text-slate-400">
                                    Guest
                                </p>
                                <p className="text-xs text-slate-500">Not signed in</p>
                            </div>
                        )}
                    </div>
                    <Link
                        href="/sign-in"
                        className="mt-1 flex items-center gap-3 w-full p-2 rounded-xl text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                        <LogIn className="w-4 h-4 mx-auto lg:mx-0 shrink-0" />
                        {!collapsed && (
                            <span className="text-sm font-medium">Sign In</span>
                        )}
                    </Link>
                </div>
            </SignedOut>
        </div>
    );
}
