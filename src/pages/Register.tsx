import React, { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock registration delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full opacity-30 animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-purple-500/20 blur-[120px] rounded-full opacity-30 animate-pulse delay-1000" />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="glass rounded-3xl p-8 sm:p-10 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-white mb-6 shadow-lg shadow-primary/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Create Account</h1>
            <p className="text-muted-foreground mt-2 text-sm">Join 88code AI Hub today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-background/80"
                  placeholder="John Doe" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-background/50 border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-background/80"
                  placeholder="name@company.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-background/50 border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all hover:bg-background/80"
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className={`absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${isLoading ? 'translate-y-0 animate-pulse' : ''}`} />
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? 'Creating Account...' : 'Sign Up'} 
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline transition-all">Sign In</Link>
            </p>
          </div>
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-xs text-muted-foreground mt-8 opacity-60">
          &copy; 2025 88code AI Hub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
