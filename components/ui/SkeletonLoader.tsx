import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'avatar' | 'button';
  lines?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  lines = 1,
  className = '' 
}) => {
  if (type === 'card') {
    return (
      <div className={`bg-white border border-gray-200 p-6 rounded-lg ${className}`}>
        <div className="skeleton h-48 w-full rounded mb-4" />
        <div className="skeleton h-4 w-3/4 rounded mb-2" />
        <div className="skeleton h-4 w-1/2 rounded" />
      </div>
    );
  }

  if (type === 'avatar') {
    return <div className={`skeleton h-12 w-12 rounded-full ${className}`} />;
  }

  if (type === 'button') {
    return <div className={`skeleton h-10 w-24 rounded ${className}`} />;
  }

  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 rounded mb-2 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
};
