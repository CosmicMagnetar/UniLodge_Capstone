import React from 'react';

// --- Utility ---
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- Button Component ---
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = ({ className, variant = 'primary', ...props }) => {
  const baseClasses = "px-6 py-2.5 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 hover:-translate-y-0.5',
    outline: 'bg-transparent text-slate-600 border border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };

  return <button className={cn(baseClasses, variantClasses[variant], className)} {...props} />;
};

// --- Input Component ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input
    className={cn(
      "block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-slate-900 transition-shadow",
      className
    )}
    {...props}
  />
);

// --- Card Component ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => (
  <div className={cn("bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden", className)}>{children}</div>
);

// --- Badge Component ---
export const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 tracking-wide uppercase", className)}>
    {children}
  </span>
);

// --- FeatureCard Component ---
export const FeatureCard = ({ icon: Icon, title, desc, className }: { icon: any, title: string, desc: string, className?: string }) => (
  <div className={cn("p-8 rounded-xl border transition-all duration-300 hover:-translate-y-1 bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5", className)}>
    <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-6 bg-blue-50 text-blue-600">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
    <p className="text-base leading-relaxed text-slate-600">{desc}</p>
  </div>
);

// --- StatCard Component ---
export const StatCard = ({ value, label, className }: { value: string, label: string, className?: string }) => (
  <div className={cn("text-center p-6 border-r last:border-r-0 border-slate-100", className)}>
    <div className="text-4xl font-bold mb-2 text-blue-600">{value}</div>
    <div className="text-sm font-semibold uppercase tracking-wider text-slate-500">{label}</div>
  </div>
);

// --- DotPattern Component ---
export const DotPattern = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-pattern"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(0 0)"
          >
            <circle cx="1" cy="1" r="1" fill="#1e3a8a" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>
      {/* Radial Gradient Fade Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent h-40 w-full" />
    </div>
  );
};