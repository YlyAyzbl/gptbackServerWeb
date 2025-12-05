import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Megaphone, Calendar, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogActions, Button, Select, MenuItem, Tabs, Tab } from '@mui/material';
import { cn } from '../../lib/utils';

interface Announcement {
  id: number;
  title: string;
  type: 'Info' | 'Warning' | 'Critical' | 'Success';
  date: string;
  author: string;
  status: 'Published' | 'Draft';
  content?: string;
}

const initialAnnouncements: Announcement[] = [
  {
      id: 1,
      title: 'System Maintenance Scheduled',
      type: 'Warning',
      date: '2023-10-25',
      author: 'System Admin',
      status: 'Published',
      content: 'We will be performing routine maintenance on the database servers this Sunday.\n\n**Expected Downtime:**\n- Start: 02:00 AM UTC\n- End: 04:00 AM UTC\n\nPlease ensure all critical jobs are paused during this window.'
  },
  {
      id: 2,
      title: 'New Models Available: GPT-4 Turbo',
      type: 'Success',
      date: '2023-10-20',
      author: 'Product Team',
      status: 'Published',
      content: 'We are excited to announce the immediate availability of GPT-4 Turbo!\n\nFeatures:\n- 128k Context Window\n- Updated Knowledge Cutoff\n- Lower Pricing\n\nCheck the docs for more info.'
  },
  {
      id: 3,
      title: 'API Rate Limit Updates',
      type: 'Info',
      date: '2023-10-15',
      author: 'Dev Ops',
      status: 'Published',
      content: 'To ensure fair usage, we are updating the rate limits for the free tier.\n\nNew Limit: 60 RPM'
  },
  {
      id: 4,
      title: 'Service Outage Report',
      type: 'Critical',
      date: '2023-10-10',
      author: 'Support Team',
      status: 'Draft',
      content: 'Post-mortem on the outage experienced last Friday.'
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

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({});
  const [previewMode, setPreviewMode] = useState(false);

  const handleOpen = (item?: Announcement, viewOnly: boolean = false) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
      setPreviewMode(viewOnly);
    } else {
      setEditingItem(null);
      setFormData({ type: 'Info', status: 'Draft' });
      setPreviewMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({});
    setPreviewMode(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: formData.title!,
      type: (formData.type || 'Info') as any,
      status: (formData.status || 'Draft') as any,
      content: formData.content || '',
      date: editingItem?.date || new Date().toISOString().split('T')[0],
      author: editingItem?.author || 'Admin',
    };

    if (editingItem) {
      setAnnouncements(announcements.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
    } else {
      setAnnouncements([...announcements, { id: announcements.length + 1, ...data } as Announcement]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this announcement?')) {
      setAnnouncements(announcements.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Announcement Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage system-wide notifications.</p>
        </div>
        <button 
          onClick={() => handleOpen()}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </button>
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
              placeholder="Search announcements..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {announcements.map((item) => (
                <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", 
                        item.type === 'Info' ? "bg-blue-500/10 text-blue-500" :
                        item.type === 'Warning' ? "bg-amber-500/10 text-amber-500" :
                        item.type === 'Critical' ? "bg-red-500/10 text-red-500" :
                        "bg-emerald-500/10 text-emerald-500"
                      )}>
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-foreground">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn("text-xs font-medium px-2 py-1 rounded-md",
                        item.type === 'Info' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                        item.type === 'Warning' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                        item.type === 'Critical' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                     )}>
                       {item.type}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.author}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      item.status === 'Published'
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200/50"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5",
                        item.status === 'Published' ? "bg-emerald-500" : "bg-gray-500"
                      )} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpen(item, true)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpen(item, false)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
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

      {/* Add/Edit Announcement Dialog */}
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
          <h2 className="text-xl font-bold">
            {previewMode ? 'Announcement Details' : (editingItem ? 'Edit Announcement' : 'New Announcement')}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <DialogContent className="space-y-6 p-6">
            
            {/* Toggle between Edit and Preview if in edit mode */}
            {!previewMode && (
                <div className="flex justify-end">
                   <Button 
                     size="small" 
                     onClick={() => setPreviewMode(!previewMode)}
                     className="text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-3"
                   >
                     {previewMode ? 'Switch to Edit' : 'Preview Content'}
                   </Button>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        <input 
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            readOnly={previewMode}
                            className={cn("input-base", previewMode && "border-transparent bg-transparent pl-0 font-bold text-lg")}
                            placeholder="Announcement Title"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Type</label>
                            {previewMode ? (
                                <div className="py-2 font-medium">{formData.type}</div>
                            ) : (
                                <Select
                                    value={formData.type || 'Info'}
                                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                                    fullWidth
                                    variant="outlined"
                                    sx={selectStyles}
                                    MenuProps={menuProps}
                                >
                                    <MenuItem value="Info">Info</MenuItem>
                                    <MenuItem value="Success">Success</MenuItem>
                                    <MenuItem value="Warning">Warning</MenuItem>
                                    <MenuItem value="Critical">Critical</MenuItem>
                                </Select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            {previewMode ? (
                                <div className="py-2 font-medium">{formData.status}</div>
                            ) : (
                                <Select
                                    value={formData.status || 'Draft'}
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                    fullWidth
                                    variant="outlined"
                                    sx={selectStyles}
                                    MenuProps={menuProps}
                                >
                                    <MenuItem value="Draft">Draft</MenuItem>
                                    <MenuItem value="Published">Published</MenuItem>
                                </Select>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Content</label>
                    {previewMode ? (
                         <div className="w-full rounded-xl border border-border bg-muted/10 p-6 min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed">
                            {formData.content || <span className="text-muted-foreground italic">No content provided.</span>}
                         </div>
                    ) : (
                        <textarea 
                            value={formData.content || ''}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                            rows={12}
                            className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all resize-none font-mono"
                            placeholder="Write your announcement here... (Markdown supported)"
                        />
                    )}
                </div>
            </div>

          </DialogContent>
          {!previewMode && (
              <DialogActions className="p-6 border-t border-border">
                <Button onClick={handleClose} className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4">Cancel</Button>
                <Button type="submit" variant="contained" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
                  {editingItem ? 'Save Changes' : 'Post Announcement'}
                </Button>
              </DialogActions>
          )}
          {previewMode && (
             <DialogActions className="p-6 border-t border-border">
                <Button onClick={handleClose} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">Close</Button>
             </DialogActions>
          )}
        </form>
      </Dialog>
    </div>
  );
}