import React, { useState } from 'react';
import { Plus, MoreHorizontal, Clock, AlertCircle as AlertCircleIcon, X, Send, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, Select, MenuItem, IconButton, Menu, MenuItem as MuiMenuItem } from '@mui/material';
import { useApiCall } from '../hooks/useApiCall';
import apiService from '../api/apiService';

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created: string;
  category: string;
}

// 样式配置
const selectStyles = {
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '& .MuiSelect-select': {
    backgroundColor: 'hsl(var(--muted))',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: 'hsl(var(--foreground))',
  },
  '& .MuiSvgIcon-root': { color: 'hsl(var(--muted-foreground))' },
};

const menuProps = {
  PaperProps: {
    sx: {
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      '& .MuiMenuItem-root': {
        color: 'hsl(var(--foreground))',
        '&:hover': { backgroundColor: 'hsl(var(--muted))' },
        '&.Mui-selected': {
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          color: 'hsl(var(--primary))',
        },
      },
    },
  },
};

export default function Support() {
  const { data: ticketsData, loading, error } = useApiCall<{ tickets: SupportTicket[]; total: number }>(
    () => apiService.getTickets(),
    true
  );

  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTicket, setMenuTicket] = useState<SupportTicket | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'technical',
  });

  const [replyContent, setReplyContent] = useState('');

  const tickets = ticketsData?.tickets || [];

  // 根据Tab过滤工单
  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 0) return true; // All
    if (activeTab === 1) return ticket.status === 'Open';
    if (activeTab === 2) return ticket.status === 'In Progress';
    if (activeTab === 3) return ticket.status === 'Resolved';
    return true;
  });

  const handleOpenDialog = () => {
    setFormData({ subject: '', description: '', priority: 'medium', category: 'technical' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 调用API创建工单
    console.log('Creating ticket:', formData);
    handleCloseDialog();
    // refetch(); // 刷新列表
  };

  const handleOpenDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setDetailDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ticket: SupportTicket) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuTicket(ticket);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTicket(null);
  };

  const handleSendReply = () => {
    if (!replyContent.trim()) return;
    console.log('Sending reply:', replyContent);
    setReplyContent('');
    // TODO: 调用API发送回复
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load tickets</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Support Center</h1>
          <p className="text-muted-foreground mt-2">Get help with your issues or browse documentation.</p>
        </div>
        <button
          onClick={handleOpenDialog}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {['All Tickets', 'Open', 'In Progress', 'Resolved'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === i
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="glass-card rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => handleOpenDetail(ticket)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg mt-1 sm:mt-0 ${ticket.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                      ticket.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                      <AlertCircleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{ticket.subject}</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border">{ticket.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.created}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                      {ticket.status}
                    </span>
                    <button
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                      onClick={(e) => handleMenuOpen(e, ticket)}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar / FAQ */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['API Documentation', 'System Status', 'Community Forum', 'Developer Guide'].map((link) => (
                <li key={link}>
                  <a href="#" className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors group">
                    {link}
                    <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <h3 className="font-bold text-lg mb-2">Need urgent help?</h3>
            <p className="text-sm text-muted-foreground mb-4">Our premium support team is available 24/7 for enterprise customers.</p>
            <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
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
          alignItems: 'center',
          color: 'hsl(var(--foreground))',
          fontWeight: 700,
          fontSize: '1.25rem',
        }}>
          Create New Ticket
          <IconButton onClick={handleCloseDialog} sx={{ color: 'hsl(var(--muted-foreground))' }}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-base w-full"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-base w-full min-h-[120px] resize-none"
                placeholder="Provide more details about your issue..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  fullWidth
                  sx={selectStyles}
                  MenuProps={menuProps}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  fullWidth
                  sx={selectStyles}
                  MenuProps={menuProps}
                >
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="account">Account</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
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
          alignItems: 'center',
          color: 'hsl(var(--foreground))',
          fontWeight: 700,
          fontSize: '1.25rem',
        }}>
          <div className="flex items-center gap-3">
            <span>{selectedTicket?.subject}</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border">{selectedTicket?.id}</span>
          </div>
          <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: 'hsl(var(--muted-foreground))' }}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6 pt-2">
            {/* 工单信息 */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedTicket?.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  selectedTicket?.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                  {selectedTicket?.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <span className={`text-sm font-medium ${selectedTicket?.priority === 'High' ? 'text-red-500' :
                  selectedTicket?.priority === 'Medium' ? 'text-orange-500' :
                    'text-blue-500'
                  }`}>
                  {selectedTicket?.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <span className="text-sm font-medium text-foreground">{selectedTicket?.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium text-foreground">{selectedTicket?.created}</span>
              </div>
            </div>

            {/* 回复区域 */}
            <div className="border-t border-border pt-6">
              <h4 className="font-semibold text-foreground mb-4">Conversation</h4>
              <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                {/* 示例消息 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">U</div>
                  <div className="flex-1 glass rounded-xl p-3">
                    <p className="text-sm text-foreground">This is the initial message of the ticket.</p>
                    <span className="text-xs text-muted-foreground mt-2 block">2 hours ago</span>
                  </div>
                </div>
              </div>

              {/* 回复输入 */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="input-base w-full min-h-[80px] resize-none pr-12"
                    placeholder="Type your reply..."
                    rows={3}
                  />
                  <button
                    onClick={handleSendReply}
                    className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            '& .MuiMenuItem-root': {
              color: 'hsl(var(--foreground))',
              fontSize: '0.875rem',
              '&:hover': { backgroundColor: 'hsl(var(--muted))' },
            },
          },
        }}
      >
        <MuiMenuItem onClick={() => { handleOpenDetail(menuTicket!); handleMenuClose(); }}>View Details</MuiMenuItem>
        <MuiMenuItem onClick={handleMenuClose}>Mark as Resolved</MuiMenuItem>
        <MuiMenuItem onClick={handleMenuClose} sx={{ color: 'hsl(var(--destructive)) !important' }}>Delete</MuiMenuItem>
      </Menu>
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
