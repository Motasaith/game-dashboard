import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, Settings, LogIn } from "lucide-react";
import Link from "next/link";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Sidebar from "@/components/Sidebar";
import InviteNotification from "@/components/InviteNotification";
import InviteWatcher from "@/components/InviteWatcher";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { LogOut } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bina Codes - Games Dashboard",
  description: "Play classic strategy games online.",
  icons: {
    icon: "/logo.png",
  },
};

const navItems = [
  { icon: LayoutGrid, label: "Library", path: "/" },
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#06b6d4",
          colorBackground: "#0f172a",
          colorText: "#f8fafc",
          colorInputBackground: "#1e293b",
          colorInputText: "#f8fafc",
        },
      }}
    >
      <ConvexClientProvider>
        <html lang="en" className="dark" suppressHydrationWarning>
          <body className={cn(inter.className, "bg-slate-950 text-white overflow-hidden font-sans flex flex-col md:flex-row h-screen")}>

            {/* Desktop Sidebar (client component — collapsible) */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative pb-16 md:pb-0">{children}</main>

            {/* Game Invite Toast Notifications */}
            <InviteNotification />
            <InviteWatcher />

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
              <SignedIn>
                <div className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-slate-400">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-5 h-5",
                        userButtonTrigger: "p-0",
                      },
                    }}
                  />
                  <span className="text-[10px] font-medium">Profile</span>
                </div>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Sign In</span>
                </Link>
              </SignedOut>
            </nav>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
