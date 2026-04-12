import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  minDuration?: number; // milliseconds
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ minDuration = 2500 }) => {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(false);
    }, minDuration);
    
    return () => clearTimeout(timer);
  }, [minDuration]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-fadeIn">
      <div className="text-center">
        {/* Logo/Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6 animate-pulse">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-3 flex items-center justify-center">
            <img src="/images/UniLodge.png" alt="Loading" className="w-10 h-10 object-contain" />
          </div>
        </div>
        
        {/* Text */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h3>
        <p className="text-gray-600 text-sm">Please wait</p>
      </div>
    </div>
  );
};
