import React, { useState } from 'react';
import { Search, Edit2, Trash2, HeadphonesIcon, MessageSquare, CheckCircle2, Clock, X, User, Shield } from 'lucide-react';
import { Select, MenuItem, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { cn } from '../../lib/utils';

interface Ticket {
  id: string;
  subject: string;
  user: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  lastUpdate: string;
  conversation?: { sender: string; role: 'user' | 'admin'; message: string; time: string }[];
}

const initialTickets: Ticket[] = [
  { 
    id: 'T-1024', 
    subject: 'Cannot access GPT-4 API', 
    user: 'alice@example.com', 
    priority: 'High', 
    status: 'Open', 
    lastUpdate: '10 mins ago',
    conversation: [
      { sender: 'Alice', role: 'user', message: 'I am getting a 403 error when trying to access the GPT-4 endpoint. My API key should be valid.', time: '10 mins ago' }
    ]
  },
  { 
    id: 'T-1023', 
    subject: 'Billing discrepancy on invoice #402', 
    user: 'bob@corp.com', 
    priority: 'Medium', 
    status: 'In Progress', 
    lastUpdate: '2 hours ago',
    conversation: [
      { sender: 'Bob', role: 'user', message: 'My invoice shows $50 but I only used $30 worth of credits.', time: '2 hours ago' },
      { sender: 'Support Agent', role: 'admin', message: 'Hello Bob, I am looking into your usage logs now. Please hold on.', time: '1 hour ago' }
    ]
  },
  { 
    id: 'T-1022', 
    subject: 'Feature request: Dark mode for docs', 
    user: 'charlie@dev.io', 
    priority: 'Low', 
    status: 'Resolved', 
    lastUpdate: '1 day ago',
    conversation: [
        { sender: 'Charlie', role: 'user', message: 'Please add dark mode to the documentation.', time: '1 day ago' },
        { sender: 'Support Agent', role: 'admin', message: 'Great news! We just pushed an update that includes dark mode.', time: '2 hours ago' }
    ]
  },
  { 
    id: 'T-1021', 
    subject: 'Account suspension inquiry', 
    user: 'dave@badactor.net', 
    priority: 'Urgent', 
    status: 'Closed', 
    lastUpdate: '3 days ago',
    conversation: []
  },
];

// Reusable Styles
const selectStyles = {
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
  backgroundColor: 'rgba(var(--background), 0.5)',
  borderRadius: '0.75rem',
  border: '1px solid hsl(var(--input))',
  fontSize: '0.875rem',
  transition: 'all 0.2s',
  '&:hover': { borderColor: 'hsl(var(--ring))' },
  '&.Mui-focused': { borderColor: 'hsl(var(--ring))', boxShadow: '0 0 0 2px hsl(var(--ring))' },
};

const menuProps = {
  PaperProps: {
    className: "bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-xl mt-2",
    sx: {
      '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
        margin: '4px 8px',
        '&:hover': { backgroundColor: 'hsl(var(--muted))' },
        '&.Mui-selected': {
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          color: 'hsl(var(--primary))',
          '&:hover': { backgroundColor: 'hsl(var(--primary) / 0.2)' },
        },
      },
    },
  },
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [open, setOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  const handleOpen = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setReplyMessage('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTicket(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        const updatedConversation = [...(ticket.conversation || [])];
        if (replyMessage.trim()) {
            updatedConversation.push({
                sender: 'Support Agent',
                role: 'admin',
                message: replyMessage,
                time: 'Just now'
            });
        }
        return {
          ...ticket,
          status: newStatus as any,
          lastUpdate: 'Just now',
          conversation: updatedConversation
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    handleClose();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and respond to user support requests.</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/20 dark:border-white/5">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 dark:bg-black/20 backdrop-blur-xl">
           <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="input-base pl-10"
              placeholder="Search tickets..."
            />
          </div>
           <div className="flex gap-2">
            <Select
              defaultValue="All"
              sx={{ ...selectStyles, width: '140px' }}
              MenuProps={menuProps}
              displayEmpty
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Update</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-muted-foreground">{ticket.id}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{ticket.subject}</td>
                  <td className="px-6 py-4 text-muted-foreground">{ticket.user}</td>
                  <td className="px-6 py-4">
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-md",
                         ticket.priority === 'Urgent' ? "bg-red-500/10 text-red-600" :
                         ticket.priority === 'High' ? "bg-orange-500/10 text-orange-600" :
                         ticket.priority === 'Medium' ? "bg-blue-500/10 text-blue-600" :
                         "bg-gray-500/10 text-gray-600"
                    )}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      ticket.status === 'Open' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200/50" :
                      ticket.status === 'In Progress' ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50" :
                      ticket.status === 'Resolved' ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200/50" :
                      "bg-gray-200 text-gray-600 dark:bg-gray-900 dark:text-gray-500 border-gray-300/50"
                    )}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                     <div className="flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {ticket.lastUpdate}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpen(ticket)}
                      className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" />
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply/Edit Ticket Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "bg-background/95 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl",
          style: { borderRadius: '1.5rem' }
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
             <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Ticket Details</h2>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">{selectedTicket?.id}</span>
             </div>
             <p className="text-sm text-muted-foreground mt-1">{selectedTicket?.subject}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="flex flex-col h-[600px]">
          {/* Conversation Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-muted/10">
            {selectedTicket?.conversation && selectedTicket.conversation.length > 0 ? (
                selectedTicket.conversation.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-3", msg.role === 'admin' ? "flex-row-reverse" : "")}>
                        {/* Avatar */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          msg.role === 'admin' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                           {msg.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={cn(
                          "max-w-[80%] rounded-2xl p-4 text-sm shadow-sm",
                          msg.role === 'admin' 
                            ? "bg-primary/10 text-foreground rounded-tr-sm" 
                            : "bg-white dark:bg-muted/50 text-foreground rounded-tl-sm border border-border"
                        )}>
                            <div className="flex justify-between items-center gap-4 mb-1 text-xs opacity-70">
                                <span className="font-semibold">{msg.sender}</span>
                                <span>{msg.time}</span>
                            </div>
                            <p className="leading-relaxed">{msg.message}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                    <p>No conversation history.</p>
                </div>
            )}
          </div>

          {/* Action Area */}
          <form onSubmit={handleSave} className="p-6 bg-background border-t border-border">
             <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                    <textarea 
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={3}
                        className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all resize-none"
                        placeholder="Type your reply here..."
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              variant="outlined"
                              size="small"
                              sx={{ ...selectStyles, height: '40px' }}
                              MenuProps={menuProps}
                           >
                              <MenuItem value="Open">Open</MenuItem>
                              <MenuItem value="In Progress">In Progress</MenuItem>
                              <MenuItem value="Resolved">Resolved</MenuItem>
                              <MenuItem value="Closed">Closed</MenuItem>
                           </Select>
                           <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors ml-2">
                              <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                              Internal Note
                           </label>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleClose} className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4">Cancel</Button>
                            <Button type="submit" variant="contained" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 shadow-lg shadow-primary/20">
                              Send Reply
                            </Button>
                        </div>
                    </div>
                </div>
             </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}