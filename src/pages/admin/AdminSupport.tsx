import React from 'react';
import { Search, Edit2, Trash2, HeadphonesIcon, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { Select, MenuItem } from '@mui/material';
import { cn } from '../../lib/utils';

interface Ticket {
  id: string;
  subject: string;
  user: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  lastUpdate: string;
}

const tickets: Ticket[] = [
  { id: 'T-1024', subject: 'Cannot access GPT-4 API', user: 'alice@example.com', priority: 'High', status: 'Open', lastUpdate: '10 mins ago' },
  { id: 'T-1023', subject: 'Billing discrepancy on invoice #402', user: 'bob@corp.com', priority: 'Medium', status: 'In Progress', lastUpdate: '2 hours ago' },
  { id: 'T-1022', subject: 'Feature request: Dark mode for docs', user: 'charlie@dev.io', priority: 'Low', status: 'Resolved', lastUpdate: '1 day ago' },
  { id: 'T-1021', subject: 'Account suspension inquiry', user: 'dave@badactor.net', priority: 'Urgent', status: 'Closed', lastUpdate: '3 days ago' },
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
                    <button className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
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
    </div>
  );
}
