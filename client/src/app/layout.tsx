import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bina Codes - Games Dashboard",
  description: "Play classic strategy games online.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = { username: "BinaPlayer" };

  const navItems = [
    { icon: LayoutGrid, label: "Library", path: "/" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-slate-950 text-white overflow-hidden font-sans flex flex-col md:flex-row h-screen")}>

        {/* Desktop / Tablet Sidebar — hidden on mobile */}
        <div className="hidden md:flex w-16 lg:w-64 glass-strong border-r border-slate-800/50 flex-col justify-between z-20 shrink-0">
          <div>
            {/* Logo */}
            <div className="p-4 lg:p-6">
              <Logo />
            </div>

            {/* Navigation */}
            <nav className="mt-4 lg:mt-6 px-2 lg:px-3 space-y-1 lg:space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all group text-slate-400 hover:bg-white/5 hover:text-white relative"
                >
                  {/* Active indicator bar */}
                  <div className="absolute left-0 w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <item.icon className="w-5 h-5 lg:w-6 lg:h-6 mx-auto lg:mx-0" />
                  <span className="hidden lg:block font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-3 lg:p-4 border-t border-slate-800/50">
            <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm lg:text-lg shrink-0 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                {user.username[0]}
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="font-bold text-sm truncate">{user.username}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Online
                </p>
              </div>
            </button>
            <button className="mt-1 lg:mt-2 flex items-center gap-3 w-full p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4 lg:w-5 lg:h-5 mx-auto lg:mx-0" />
              <span className="hidden lg:block text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative pb-16 md:pb-0">{children}</main>

        {/* Mobile Bottom Navigation — visible only on mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-slate-800/50 flex justify-around items-center px-2 py-2 safe-area-bottom">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          {/* User Avatar in bottom nav */}
          <button className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-slate-400 hover:text-white transition-colors">
            <div className="w-5 h-5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-[8px]">
              {user.username[0]}
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </nav>
      </body>
    </html>
  );
}
