import React from 'react';
import { ArrowRight, Zap, BookOpen, MessageSquare, Star } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function Home() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-10 sm:p-16 text-center shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Welcome to 88code
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Your centralized hub for AI model management, token tracking, and high-performance API services.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                            Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link to="/services" className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-slate-200/50 dark:bg-white/10 backdrop-blur-md text-slate-800 dark:text-white font-bold text-lg hover:bg-slate-300/50 dark:hover:bg-white/20 transition-colors border border-slate-300/50 dark:border-white/10">
                            Browse Services
                        </Link>
                    </div>
                </div>

                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-500/20 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full"></div>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickCard
                    icon={<Zap className="w-6 h-6 text-yellow-400" />}
                    title="Fast Integration"
                    desc="Get your API keys and start coding in seconds."
                    bg="bg-yellow-500/10"
                    border="hover:border-yellow-500/50"
                />
                <QuickCard
                    icon={<BookOpen className="w-6 h-6 text-blue-400" />}
                    title="Documentation"
                    desc="Comprehensive guides for all supported models."
                    bg="bg-blue-500/10"
                    border="hover:border-blue-500/50"
                />
                <QuickCard
                    icon={<MessageSquare className="w-6 h-6 text-emerald-400" />}
                    title="Community Support"
                    desc="Join our Discord and connect with other developers."
                    bg="bg-emerald-500/10"
                    border="hover:border-emerald-500/50"
                />
            </div>

            {/* Recent Updates Section */}
            <div className="glass rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Star className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Featured Highlights</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">New Arrival</span>
                        <h3 className="text-xl font-bold mb-2">Claude 3 Opus Available</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Experience the most capable model from Anthropic, now available via our API gateway with reduced latency.
                        </p>
                        <Link to="/services" className="text-sm font-semibold text-primary hover:underline">Learn more &rarr;</Link>
                    </div>
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                        <span className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2 block">Promotion</span>
                        <h3 className="text-xl font-bold mb-2">50% Off GPT-3.5 Tokens</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            For a limited time, all GPT-3.5 input tokens are half price. Perfect for high-volume batch processing tasks.
                        </p>
                        <Link to="/announcements" className="text-sm font-semibold text-pink-500 hover:underline">View details &rarr;</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickCard({ icon, title, desc, bg, border }: { icon: React.ReactNode, title: string, desc: string, bg: string, border: string }) {
    return (
        <div className={`glass-card rounded-2xl p-6 flex flex-col gap-4 border border-transparent ${border} transition-all duration-300 hover:-translate-y-1`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
