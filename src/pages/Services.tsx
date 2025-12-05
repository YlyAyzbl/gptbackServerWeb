import React from 'react';
import { Server, Cpu, Zap, Shield, Globe, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const services = [
    {
        id: 1,
        name: 'OpenAI GPT-4 Turbo',
        description: 'Latest high-intelligence model with larger context window.',
        status: 'Active',
        uptime: '99.99%',
        icon: <Cpu className="w-6 h-6 text-purple-500" />,
        bg: 'bg-purple-500/10',
    },
    {
        id: 2,
        name: 'Claude 3 Opus',
        description: 'Most powerful model for complex reasoning and coding.',
        status: 'Active',
        uptime: '99.95%',
        icon: <Zap className="w-6 h-6 text-orange-500" />,
        bg: 'bg-orange-500/10',
    },
    {
        id: 3,
        name: 'Gemini Pro 1.5',
        description: 'Balanced performance and cost for general tasks.',
        status: 'Maintenance',
        uptime: '98.50%',
        icon: <Globe className="w-6 h-6 text-blue-500" />,
        bg: 'bg-blue-500/10',
    },
    {
        id: 4,
        name: 'Mistral Large',
        description: 'Top-tier open weights model served via API.',
        status: 'Active',
        uptime: '99.90%',
        icon: <Server className="w-6 h-6 text-emerald-500" />,
        bg: 'bg-emerald-500/10',
    },
];

export default function Services() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Services</h1>
                <p className="text-muted-foreground mt-2">Manage your subscribed AI models and API services.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div key={service.id} className="glass-card rounded-2xl p-6 flex flex-col hover:border-primary/50 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${service.bg} group-hover:scale-110 transition-transform duration-300`}>
                                {service.icon}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${service.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50'
                                }`}>
                                {service.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-1">{service.description}</p>

                        <div className="pt-4 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>Uptime: <span className="font-semibold text-foreground">{service.uptime}</span></span>
                            </div>
                            <button className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Manage <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Service Card */}
                <button className="rounded-2xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 min-h-[250px]">
                    <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10">
                        <PlusIcon className="w-8 h-8" />
                    </div>
                    <span className="font-semibold">Subscribe to New Service</span>
                </button>
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
