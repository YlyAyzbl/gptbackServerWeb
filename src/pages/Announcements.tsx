import { useState } from 'react';
import { Bell, ChevronRight, X, Calendar, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useApiCall } from '../hooks/useApiCall';
import apiService from '../api/apiService';

interface Announcement {
    id: string;
    title: string;
    content?: string;
    excerpt: string;
    tag: string;
    color: string;
    published_at?: string;
    created_at?: string;
}

// 默认公告数据（后备数据）
const defaultAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'Introducing Gemini Pro 1.5 Support',
        content: `We are excited to announce full support for Google's latest Gemini Pro 1.5 model.

## Key Features
- Massive 1M token context window
- Improved reasoning capabilities
- Better code generation

Start using it today!`,
        excerpt: "We are excited to announce full support for Google's latest Gemini Pro 1.5 model, featuring a massive context window.",
        tag: 'New Feature',
        color: 'bg-purple-500',
        published_at: 'Dec 05, 2025',
    },
    {
        id: '2',
        title: 'Scheduled Maintenance: API Gateway',
        content: `We will be performing routine maintenance on our API gateway this Sunday.

## Schedule
- Start: Sunday 2:00 AM UTC
- Duration: ~5 minutes

Please plan accordingly.`,
        excerpt: 'We will be performing routine maintenance on our API gateway this Sunday. Expected downtime is less than 5 minutes.',
        tag: 'Maintenance',
        color: 'bg-amber-500',
        published_at: 'Dec 02, 2025',
    },
    {
        id: '3',
        title: 'Pricing Update for 2026',
        content: `Great news! Starting next month, we are lowering the prices for all GPT-3.5 input tokens by 50%.

## New Pricing
- Input: $0.50 / 1M tokens
- Output: $1.50 / 1M tokens`,
        excerpt: 'Starting next month, we are lowering the prices for all GPT-3.5 input tokens by 50%.',
        tag: 'Pricing',
        color: 'bg-emerald-500',
        published_at: 'Nov 28, 2025',
    },
];

export default function Announcements() {
    const { data: announcementsData, loading } = useApiCall<{ announcements: Announcement[]; total: number }>(
        () => apiService.getAnnouncements?.() || Promise.resolve({ code: 200, message: 'ok', data: { announcements: defaultAnnouncements, total: 3 } }),
        false // 先不自动加载，使用默认数据
    );

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    // 使用API数据或默认数据
    const announcements = announcementsData?.announcements || defaultAnnouncements;

    const handleOpenDetail = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setDetailDialogOpen(true);
    };

    // 简单的 Markdown 渲染（仅支持基本语法）
    const renderMarkdown = (content: string) => {
        if (!content) return null;

        const lines = content.split('\n');
        return lines.map((line, index) => {
            // 标题
            if (line.startsWith('## ')) {
                return <h3 key={index} className="text-lg font-bold text-foreground mt-4 mb-2">{line.slice(3)}</h3>;
            }
            if (line.startsWith('# ')) {
                return <h2 key={index} className="text-xl font-bold text-foreground mt-4 mb-2">{line.slice(2)}</h2>;
            }
            // 列表
            if (line.startsWith('- ')) {
                return <li key={index} className="text-muted-foreground ml-4">{line.slice(2)}</li>;
            }
            // 空行
            if (line.trim() === '') {
                return <br key={index} />;
            }
            // 普通文本
            return <p key={index} className="text-muted-foreground">{line}</p>;
        });
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        // 如果已经是格式化的日期，直接返回
        if (dateStr.includes(',') || dateStr.includes('/')) return dateStr;
        // 否则尝试解析
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading announcements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero Banner */}
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

            {/* Announcements List */}
            <div className="grid gap-6">
                {announcements.map((item) => {
                    const dateStr = formatDate(item.published_at || item.created_at);
                    const dateParts = dateStr.split(' ');

                    return (
                        <div
                            key={item.id}
                            className="glass-card rounded-2xl p-6 sm:p-8 hover:border-primary/30 group transition-all duration-300 cursor-pointer"
                            onClick={() => handleOpenDetail(item)}
                        >
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex flex-col items-center justify-center text-center border border-border">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">{dateParts[0]}</span>
                                        <span className="text-xl font-bold text-foreground">{dateParts[1]?.replace(',', '')}</span>
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
                                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors group-hover:translate-x-1 duration-300">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Announcement Detail Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: 'hsl(var(--card))',
                        backgroundImage: 'none',
                        borderRadius: '1.5rem',
                        border: '1px solid hsl(var(--border))',
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    color: 'hsl(var(--foreground))',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    paddingBottom: 0,
                }}>
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`inline-block w-3 h-3 rounded-full ${selectedAnnouncement?.color}`}></span>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-1 rounded-full">
                                {selectedAnnouncement?.tag}
                            </span>
                        </div>
                        <span className="leading-tight">{selectedAnnouncement?.title}</span>
                    </div>
                    <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: 'hsl(var(--muted-foreground))' }}>
                        <X className="w-5 h-5" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="space-y-6 pt-4">
                        {/* 元信息 */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(selectedAnnouncement?.published_at || selectedAnnouncement?.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                <span>{selectedAnnouncement?.tag}</span>
                            </div>
                        </div>

                        {/* 内容 */}
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {renderMarkdown(selectedAnnouncement?.content || selectedAnnouncement?.excerpt || '')}
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-3 pt-4 border-t border-border">
                            <button
                                onClick={() => setDetailDialogOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                            >
                                Got it
                            </button>
                            <button className="px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors">
                                Share
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
