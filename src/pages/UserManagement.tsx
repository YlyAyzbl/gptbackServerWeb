import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogActions, Button, Select, MenuItem } from '@mui/material';
import { cn } from '../lib/utils';
import { useApiCall } from '../hooks/useApiCall';
import apiService from '../api/apiService';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

// Custom styles for MUI Select to match Tailwind 'input-base'
const selectStyles = {
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  backgroundColor: 'rgba(var(--background), 0.5)',
  borderRadius: '0.75rem',
  border: '1px solid hsl(var(--input))',
  fontSize: '0.875rem',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: 'hsl(var(--ring))',
  },
  '&.Mui-focused': {
    borderColor: 'hsl(var(--ring))',
    boxShadow: '0 0 0 2px hsl(var(--ring))',
  },
};

const menuProps = {
  PaperProps: {
    className: "bg-background/95 backdrop-blur-xl border border-border shadow-xl rounded-xl mt-2",
    sx: {
      '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
        margin: '4px 8px',
        '&:hover': {
          backgroundColor: 'hsl(var(--muted))',
        },
        '&.Mui-selected': {
          backgroundColor: 'hsl(var(--primary) / 0.1)',
          color: 'hsl(var(--primary))',
          '&:hover': {
            backgroundColor: 'hsl(var(--primary) / 0.2)',
          },
        },
      },
    },
  },
};

export default function UserManagement() {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users data
  const { data: usersData, loading, error, fetch: refetchUsers } = useApiCall<{ users: User[]; total: number }>(
    () => apiService.getUsers(),
    true // auto-fetch on mount
  );

  const users = usersData?.users || [];

  const handleOpen = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ role: 'User', status: 'Active' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const userData = {
      name: formData.name!,
      email: formData.email!,
      role: formData.role || 'User',
      status: (formData.status || 'Active') as 'Active' | 'Inactive' | 'Suspended',
    };

    try {
      if (editingUser) {
        // Update existing user
        await apiService.updateUser(editingUser.id, userData);
      } else {
        // Create new user
        await apiService.createUser(userData);
      }

      // Refetch users list
      await refetchUsers();
      handleClose();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setActionLoading(true);
      try {
        await apiService.deleteUser(id);
        await refetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load users</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => refetchUsers()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions.</p>
        </div>
        <button
          onClick={() => handleOpen()}
          disabled={actionLoading}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
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
              className="input-base pl-10"
              placeholder="Search users..."
            />
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
              {users.map((row) => (
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
                      <button
                        onClick={() => handleOpen(row)}
                        disabled={actionLoading}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={actionLoading}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-white/20 dark:bg-black/10 backdrop-blur-md">
          <span>Showing 1 to {users.length} of {usersData?.total || 0} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-md hover:bg-muted disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground">1</button>
            <button className="px-3 py-1 rounded-md hover:bg-muted">Next</button>
          </div>
        </div>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: "bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl",
          style: { borderRadius: '1.5rem' }
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        <form onSubmit={handleSave}>
          <DialogContent className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                name="name"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                className="input-base"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
                className="input-base"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <Select
                value={formData.role || 'User'}
                onChange={e => setFormData({...formData, role: e.target.value})}
                fullWidth
                variant="outlined"
                sx={selectStyles}
                MenuProps={menuProps}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Editor">Editor</MenuItem>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select
                value={formData.status || 'Active'}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                fullWidth
                variant="outlined"
                sx={selectStyles}
                MenuProps={menuProps}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </div>
          </DialogContent>
          <DialogActions className="p-6 border-t border-border">
            <Button onClick={handleClose} disabled={actionLoading} className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4">
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-2">
              {actionLoading ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
