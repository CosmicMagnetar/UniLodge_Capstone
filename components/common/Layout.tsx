import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const DotPattern = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed h-full w-full">
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

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen font-sans antialiased transition-colors duration-300 bg-white text-slate-900 selection:bg-blue-200 selection:text-blue-900 relative">
      <DotPattern />
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
