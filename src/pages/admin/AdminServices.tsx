import React, { useState } from 'react';
import { Plus, Search, Trash2, Package, X, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogActions, Button, Select, MenuItem } from '@mui/material';
import { cn } from '../../lib/utils';

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  status: 'Active' | 'Draft' | 'Archived';
  users: number;
  // Enhanced Configuration Fields
  description?: string;
  modelId?: string;
  maxTokens?: number;
  rateLimit?: number; // RPM
}

const initialServices: Service[] = [
  {
    id: 'SRV-001',
    name: 'GPT-4 API Access',
    category: 'AI Models',
    price: '$0.03 / 1K tokens',
    status: 'Active',
    users: 1240,
    description: 'High-end model access for complex reasoning tasks.',
    modelId: 'gpt-4-1106-preview',
    maxTokens: 128000,
    rateLimit: 500
  },
  {
    id: 'SRV-002',
    name: 'DALL-E 3 Image Gen',
    category: 'Image Generation',
    price: '$0.04 / img',
    status: 'Active',
    users: 850,
    description: 'State-of-the-art image generation from natural language descriptions.',
    modelId: 'dall-e-3',
    maxTokens: 0,
    rateLimit: 50
  },
  {
    id: 'SRV-003',
    name: 'Claude 2.1 Access',
    category: 'AI Models',
    price: '$0.02 / 1K tokens',
    status: 'Draft',
    users: 0,
    description: 'Anthropic\'s latest model with massive context window.',
    modelId: 'claude-2.1',
    maxTokens: 200000,
    rateLimit: 1000
  },
  {
    id: 'SRV-004',
    name: 'Legacy Translation',
    category: 'NLP',
    price: 'Free',
    status: 'Archived',
    users: 120
  },
  {
    id: 'SRV-005',
    name: 'Whisper Audio',
    category: 'Audio',
    price: '$0.006 / min',
    status: 'Active',
    users: 340
  },
];

// Reusable Styles (could be moved to a constant file)
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

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({});

  const handleOpen = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({ status: 'Active', maxTokens: 4096, rateLimit: 60 });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingService(null);
    setFormData({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      ...formData,
      status: (formData.status || 'Active') as any,
    };

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } as Service : s));
    } else {
      const newId = `SRV-${String(services.length + 1).padStart(3, '0')}`;
      setServices([...services, { id: newId, users: 0, ...serviceData } as Service]);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Service Management</h1>
          <p className="text-muted-foreground mt-1">Configure and manage available AI services.</p>
        </div>
        <button
          onClick={() => handleOpen()}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/20 dark:border-white/5">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/40 dark:bg-black/20 backdrop-blur-xl">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="input-base pl-10"
              placeholder="Search services..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Active Users</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{service.name}</div>
                        <div className="text-xs text-muted-foreground">{service.modelId || service.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{service.category}</td>
                  <td className="px-6 py-4 font-medium">{service.price}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      service.status === 'Active'
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50"
                        : service.status === 'Draft'
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200/50"
                    )}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{service.users}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpen(service)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Configure Service"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
      </div>

      {/* Add/Edit Service Dialog */}
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
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            {editingService ? 'Configure Service' : 'New Service Configuration'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <DialogContent className="p-6 space-y-6">

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Name</label>
                  <input
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input-base"
                    placeholder="e.g. GPT-4 API"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <input
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="input-base"
                    placeholder="e.g. AI Models"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
                  placeholder="Brief description of the service..."
                />
              </div>
            </div>

            {/* Technical Config */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Technical Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model ID (API Identifier)</label>
                  <input
                    value={formData.modelId || ''}
                    onChange={e => setFormData({ ...formData, modelId: e.target.value })}
                    className="input-base font-mono text-xs"
                    placeholder="e.g. gpt-4-1106-preview"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pricing Display</label>
                  <input
                    value={formData.price || ''}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="input-base"
                    placeholder="e.g. $0.03 / 1K tokens"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Tokens</label>
                  <input
                    type="number"
                    value={formData.maxTokens || ''}
                    onChange={e => setFormData({ ...formData, maxTokens: Number(e.target.value) })}
                    className="input-base"
                    placeholder="4096"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate Limit (RPM)</label>
                  <input
                    type="number"
                    value={formData.rateLimit || ''}
                    onChange={e => setFormData({ ...formData, rateLimit: Number(e.target.value) })}
                    className="input-base"
                    placeholder="60"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Status</label>
              <Select
                value={formData.status || 'Active'}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                fullWidth
                variant="outlined"
                sx={selectStyles}
                MenuProps={menuProps}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </div>

          </DialogContent>
          <DialogActions className="p-6 border-t border-border">
            <Button onClick={handleClose} className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4">Cancel</Button>
            <Button type="submit" variant="contained" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
