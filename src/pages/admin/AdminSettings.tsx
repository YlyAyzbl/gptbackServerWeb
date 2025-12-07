import { Settings, Save, Shield } from 'lucide-react';
import { Select, MenuItem } from '@mui/material';

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

export default function AdminSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global system parameters and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-border bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">General Configuration</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Site Name</label>
              <input
                type="text"
                defaultValue="88code AI Hub"
                className="input-base"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Support Email</label>
              <input
                type="email"
                defaultValue="support@88code.com"
                className="input-base"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium">Maintenance Mode</h4>
                <p className="text-xs text-muted-foreground">Temporarily disable access for users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-border bg-white/40 dark:bg-black/20 backdrop-blur-xl flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">Security Policies</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">Password Policy</label>
              <Select
                defaultValue="Standard"
                fullWidth
                variant="outlined"
                sx={selectStyles}
                MenuProps={menuProps}
              >
                <MenuItem value="Standard">Standard (8+ chars)</MenuItem>
                <MenuItem value="Strict">Strict (12+ chars, symbols)</MenuItem>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-muted-foreground">Enforce 2FA for all admin accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
