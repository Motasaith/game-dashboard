import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    collapsed?: boolean;
}

export const Logo = ({ className, collapsed = false }: LogoProps) => {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            {/* Icon Container */}
            <div className="relative w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
                <img
                    src="/logo.png"
                    alt="Bina Codes Logo"
                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                />
            </div>

            {/* Text */}
            {!collapsed && (
                <div className="hidden lg:flex flex-col">
                    <div className="flex items-baseline gap-1 font-black text-xl tracking-tight leading-none">
                        <span className="text-white">Bina</span>
                        <span className="text-cyan-500">Codes</span>
                    </div>
                </div>
            )}
        </div>
    );
};
