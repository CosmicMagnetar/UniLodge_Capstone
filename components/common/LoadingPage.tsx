import React from 'react';
import AnimatedLoadingSkeleton from '../ui/animated-loading-skeleton';

export const LoadingPage: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <AnimatedLoadingSkeleton />
    </div>
  );
};
