import React from 'react';
import { User, Lock, Bell, CreditCard, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { useMenu } from '../hooks/useMenu';

// Icon mapping for settings tabs
const settingsIconMap: Record<string, React.ReactNode> = {
    'user': <User className="w-4 h-4" />,
    'lock': <Lock className="w-4 h-4" />,
    'credit-card': <CreditCard className="w-4 h-4" />,
    'bell': <Bell className="w-4 h-4" />,
};

export default function Settings() {
    const [activeTab, setActiveTab] = React.useState('profile');
    const { settingsTabs } = useMenu();

    const tabs = settingsTabs.map(tab => ({
        ...tab,
        icon: settingsIconMap[tab.icon],
    }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-card rounded-3xl p-8 min-h-[600px] border border-white/20 dark:border-white/5 bg-white/40 dark:bg-slate-900/40">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-6 pb-8 border-b border-border">
                                <div className="relative group">
                                    <img
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-background"
                                    />
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium backdrop-blur-sm">
                                        Change
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-foreground">Tom Cook</h3>
                                    <p className="text-sm text-muted-foreground">Product Designer at 88code</p>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-foreground">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Tom Cook"
                                        className="input-base"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-foreground">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="tom.cook@example.com"
                                        className="input-base"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-foreground">Bio</label>
                                    <textarea
                                        className="input-base min-h-[120px]"
                                        defaultValue="Passionate about building great user experiences and scalable applications."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button className="btn-primary">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </button>
                                <button className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 max-w-xl animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="pb-6 border-b border-border">
                                <h3 className="text-lg font-bold mb-1">Password & Authentication</h3>
                                <p className="text-sm text-muted-foreground">Manage your access security.</p>
                            </div>
                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="input-base" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <input type="password" className="input-base" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Confirm New Password</label>
                                    <input type="password" className="input-base" />
                                </div>
                                <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-lg mt-2">Update Password</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-1">Current Plan</p>
                                        <h2 className="text-3xl font-bold mb-4">Pro Plan</h2>
                                        <p className="text-white/80 max-w-sm mb-6">You are on the Pro plan with 1M tokens/month limit.</p>
                                        <button className="px-5 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-white/90">Manage Subscription</button>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                        <CreditCard className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                {/* Decoration */}
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl"></div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                                            <span className="font-bold text-xs">VISA</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Visa ending in 4242</p>
                                            <p className="text-xs text-muted-foreground">Expires 12/28</p>
                                        </div>
                                    </div>
                                    <button className="text-sm font-medium text-primary hover:underline">Edit</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-lg font-bold mb-4">Email Notifications</h3>
                                <div className="space-y-4">
                                    {['Marketing emails', 'Security alerts', 'Usage reports'].map((item) => (
                                        <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/50">
                                            <span className="font-medium text-sm">{item}</span>
                                            <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
