import React, { useState } from 'react';
import { Server, Cpu, Zap, Shield, Globe, Clock, ArrowRight, AlertCircle, X, Settings, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useApiCall } from '../hooks/useApiCall';
import apiService from '../api/apiService';

interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
  uptime: string;
  icon: string;
  bg: string;
  model_id?: string;
  max_tokens?: number;
  rate_limit?: number;
  price?: number;
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  cpu: <Cpu className="w-6 h-6 text-purple-500" />,
  zap: <Zap className="w-6 h-6 text-orange-500" />,
  globe: <Globe className="w-6 h-6 text-blue-500" />,
  server: <Server className="w-6 h-6 text-emerald-500" />,
  shield: <Shield className="w-6 h-6 text-indigo-500" />,
};

export default function Services() {
  const { data: servicesData, loading, error } = useApiCall<{ services: Service[]; total: number }>(
    () => apiService.getServices(),
    true
  );

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const services = servicesData?.services || [];

  const handleOpenDetail = (service: Service) => {
    setSelectedService(service);
    setDetailDialogOpen(true);
  };

  const handleOpenSubscribe = () => {
    setSubscribeDialogOpen(true);
  };

  // 可订阅的新服务列表
  const availableServices = [
    { id: 'llama-3', name: 'Llama 3 70B', provider: 'Meta', description: 'Open-source large language model', icon: 'server', price: 0.002 },
    { id: 'deepseek', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Specialized for code generation', icon: 'cpu', price: 0.001 },
    { id: 'qwen', name: 'Qwen 2.5', provider: 'Alibaba', description: 'Multilingual LLM with strong Chinese support', icon: 'globe', price: 0.003 },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
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
          <h2 className="text-xl font-bold mb-2">Failed to load services</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Services</h1>
        <p className="text-muted-foreground mt-2">Manage your subscribed AI models and API services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="glass-card rounded-2xl p-6 flex flex-col hover:border-primary/50 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${service.bg} group-hover:scale-110 transition-transform duration-300`}>
                {iconMap[service.icon] || <Server className="w-6 h-6" />}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${service.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50'
                }`}>
                {service.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">{service.description}</p>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Uptime: <span className="font-semibold text-foreground">{service.uptime}</span></span>
              </div>
              <button
                onClick={() => handleOpenDetail(service)}
                className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                Manage <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Service Card */}
        <button
          onClick={handleOpenSubscribe}
          className="rounded-2xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 min-h-[250px]"
        >
          <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10">
            <PlusIcon className="w-8 h-8" />
          </div>
          <span className="font-semibold">Subscribe to New Service</span>
        </button>
      </div>

      {/* Service Detail Dialog */}
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
            <div className={`p-2 rounded-lg ${selectedService?.bg}`}>
              {iconMap[selectedService?.icon || 'server']}
            </div>
            <span>{selectedService?.name}</span>
          </div>
          <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: 'hsl(var(--muted-foreground))' }}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6 pt-4">
            {/* 状态信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${selectedService?.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                  {selectedService?.status}
                </span>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                <p className="text-lg font-bold text-emerald-500">{selectedService?.uptime}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Max Tokens</p>
                <p className="text-lg font-bold text-foreground">{selectedService?.max_tokens?.toLocaleString() || '128K'}</p>
              </div>
              <div className="glass rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Rate Limit</p>
                <p className="text-lg font-bold text-foreground">{selectedService?.rate_limit || 100}/min</p>
              </div>
            </div>

            {/* 描述 */}
            <div className="glass rounded-xl p-4">
              <h4 className="font-semibold text-foreground mb-2">Description</h4>
              <p className="text-muted-foreground">{selectedService?.description}</p>
            </div>

            {/* API 端点 */}
            <div className="glass rounded-xl p-4">
              <h4 className="font-semibold text-foreground mb-2">API Endpoint</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded-lg text-sm font-mono text-foreground">
                  https://api.example.com/v1/chat/completions
                </code>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </button>
              <button className="px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors">
                View Docs
              </button>
              <button className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 font-medium hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors">
                Unsubscribe
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscribe Dialog */}
      <Dialog
        open={subscribeDialogOpen}
        onClose={() => setSubscribeDialogOpen(false)}
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
          Subscribe to New Service
          <IconButton onClick={() => setSubscribeDialogOpen(false)} sx={{ color: 'hsl(var(--muted-foreground))' }}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="text-muted-foreground mb-6">Choose from available AI models and services to add to your account.</p>

          <div className="space-y-4">
            {availableServices.map((service) => (
              <div
                key={service.id}
                className="glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-all group"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                  {iconMap[service.icon] || <Server className="w-6 h-6 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{service.name}</h4>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{service.provider}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Starting at</p>
                  <p className="text-lg font-bold text-primary">${service.price}/1K tokens</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
