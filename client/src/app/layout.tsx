import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Settings, LogOut } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bina Codes - Games Dashboard",
  description: "Play classic strategy games online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mock User for now (Clerk will replace this later)
  const user = { username: "BinaPlayer" };

  const navItems = [
    { icon: LayoutGrid, label: "Library", path: "/" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-slate-950 text-white overflow-hidden font-sans flex h-screen")}>
        {/* Sidebar */}
        <div className="w-16 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-20">
          <div>
            {/* Logo */}
            <div className="p-6 flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {/* Logo Icon */}
                <div className="relative w-8 h-8 flex-shrink-0">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full" />
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                    <defs>
                      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" /> {/* cyan-500 */}
                        <stop offset="100%" stopColor="#2563eb" /> {/* blue-600 */}
                      </linearGradient>
                    </defs>
                    <path
                      d="M 20 10 L 60 10 C 85 10, 85 45, 60 45 L 80 45 C 95 45, 95 90, 60 90 L 20 90 Z"
                      fill="none"
                      stroke="url(#logo-gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 20 10 L 20 90 M 20 50 L 55 50"
                      fill="none"
                      stroke="url(#logo-gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="20" cy="10" r="4" fill="#06b6d4" />
                    <circle cx="20" cy="90" r="4" fill="#2563eb" />
                    <circle cx="60" cy="45" r="4" fill="#3b82f6" />
                  </svg>
                </div>

                <span className="hidden lg:block font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  BINA CODES
                </span>
              </div>
              <span className="hidden lg:block text-xs text-slate-500 font-bold pl-11 tracking-widest uppercase">
                Games Dashboard
              </span>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all group text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <item.icon className="w-6 h-6" />
                  <span className="hidden lg:block font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-slate-800">
            <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-800 transition-colors text-left">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-lg">
                {user.username[0]}
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="font-bold text-sm truncate">{user.username}</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            </button>
            <button className="mt-2 flex items-center gap-3 w-full p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="hidden lg:block text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">{children}</main>
      </body>
    </html>
  );
}
