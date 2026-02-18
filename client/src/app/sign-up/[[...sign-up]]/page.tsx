import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            cardBox: "shadow-2xl shadow-purple-500/10",
                            card: "bg-slate-900/90 backdrop-blur-xl border border-slate-800/50",
                            headerTitle: "text-white",
                            headerSubtitle: "text-slate-400",
                            socialButtonsBlockButton:
                                "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
                            socialButtonsBlockButtonText: "text-white",
                            formFieldLabel: "text-slate-300",
                            formFieldInput:
                                "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500",
                            formButtonPrimary:
                                "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-lg shadow-purple-500/25",
                            footerActionLink: "text-purple-400 hover:text-purple-300",
                            footerActionText: "text-slate-400",
                            dividerLine: "bg-slate-700",
                            dividerText: "text-slate-500",
                            identityPreviewEditButton: "text-purple-400",
                            formFieldAction: "text-purple-400",
                            otpCodeFieldInput: "bg-slate-800 border-slate-700 text-white",
                        },
                    }}
                />

                {/* Continue as Guest */}
                <Link
                    href="/"
                    className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-700/60 transition-all duration-200"
                >
                    <span className="text-sm font-medium">Continue as Guest</span>
                    <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
