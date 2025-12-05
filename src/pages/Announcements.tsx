import React from 'react';
import { Bell, Tag, Calendar, ChevronRight } from 'lucide-react';

const announcements = [
    {
        id: 1,
        title: 'Introducing Gemini Pro 1.5 Support',
        excerpt: 'We are excited to announce full support for Google\'s latest Gemini Pro 1.5 model, featuring a massive context window.',
        date: 'Dec 05, 2025',
        tag: 'New Feature',
        color: 'bg-purple-500',
    },
    {
        id: 2,
        title: 'Scheduled Maintenance: API Gateway',
        excerpt: 'We will be performing routine maintenance on our API gateway this Sunday. Expected downtime is less than 5 minutes.',
        date: 'Dec 02, 2025',
        tag: 'Maintenance',
        color: 'bg-amber-500',
    },
    {
        id: 3,
        title: 'Pricing Update for 2026',
        excerpt: 'Starting next month, we are lowering the prices for all GPT-3.5 input tokens by 50%.',
        date: 'Nov 28, 2025',
        tag: 'Pricing',
        color: 'bg-emerald-500',
    },
];

export default function Announcements() {
    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 sm:p-12 text-white shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md mb-4 border border-white/30">
                        <Bell className="mr-2 h-4 w-4" />
                        What's New
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        Latest Updates & News
                    </h1>
                    <p className="text-lg text-white/80">
                        Stay informed about platform updates, new features, and maintenance schedules.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-60 w-60 rounded-full bg-black/10 blur-3xl"></div>
            </div>

            <div className="grid gap-6">
                {announcements.map((item) => (
                    <div key={item.id} className="glass-card rounded-2xl p-6 sm:p-8 hover:border-primary/30 group transition-all duration-300">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex flex-col items-center justify-center text-center border border-border">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">{item.date.split(' ')[0]}</span>
                                    <span className="text-xl font-bold text-foreground">{item.date.split(' ')[1].replace(',', '')}</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`inline-block w-2 h-2 rounded-full ${item.color}`}></span>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.tag}</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.excerpt}
                                </p>
                            </div>

                            <div className="flex items-center self-start sm:self-center">
                                <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
