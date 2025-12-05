import React from 'react';
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

const rows: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'User', status: 'Suspended' },
];

export default function UserManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/20 dark:border-white/5">
        {/* Toolbar */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 dark:bg-black/20 backdrop-blur-xl">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border-none rounded-xl bg-background/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Search users..."
            />
          </div>
          <div className="flex gap-2">
            {/* Filter buttons could go here */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-muted-foreground">#{row.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {row.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-foreground">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{row.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {row.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      row.status === 'Active'
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50"
                        : row.status === 'Inactive'
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200/50"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5",
                        row.status === 'Active' ? "bg-emerald-500" : row.status === 'Inactive' ? "bg-gray-500" : "bg-red-500"
                      )} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (Mock) */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-white/20 dark:bg-black/10 backdrop-blur-md">
          <span>Showing 1 to 5 of 5 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md hover:bg-muted disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground">1</button>
            <button className="px-3 py-1 rounded-md hover:bg-muted">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}