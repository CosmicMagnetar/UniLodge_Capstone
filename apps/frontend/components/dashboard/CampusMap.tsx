"use client";
import React from 'react';

interface CampusMapProps {
  universityName: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({ universityName }) => {
  const [customMap, setCustomMap] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCustomMap(localStorage.getItem('uni_settings_map'));
    }
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
      {customMap ? (
        <img 
          src={customMap} 
          alt="Custom Campus Map" 
          className="w-full h-full object-cover min-h-[300px]"
        />
      ) : (
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, minHeight: '300px' }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(universityName)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          title={`${universityName} Campus Map`}
        ></iframe>
      )}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md pointer-events-none">
        <p className="font-bold text-slate-900 text-sm">Campus Navigator</p>
        <p className="text-xs text-slate-500">{universityName} - Assigned Lodge Location</p>
      </div>
    </div>
  );
};
