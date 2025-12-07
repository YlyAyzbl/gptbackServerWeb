import React from 'react';
import { Plus, MoreHorizontal, Clock, AlertCircle as AlertCircleIcon } from 'lucide-react';
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

export default function Support() {
  const { data: ticketsData, loading, error } = useApiCall<{ tickets: SupportTicket[]; total: number }>(
    () => apiService.getTickets(),
    true // auto-fetch on mount
  );

  const tickets = ticketsData?.tickets || [];

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
        <button className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
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
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  i === 0
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="glass-card rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg mt-1 sm:mt-0 ${
                    ticket.priority === 'High' ? 'bg-red-500/10 text-red-500' :
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
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    ticket.status === 'Open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {ticket.status}
                  </span>
                  <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
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
