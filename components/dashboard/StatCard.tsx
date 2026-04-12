import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red';
  bgColor?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-500',
    icon: 'text-white/30',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-400 to-green-500',
    icon: 'text-white/30',
    text: 'text-green-600',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-400 to-orange-500',
    icon: 'text-white/30',
    text: 'text-orange-600',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-400 to-red-500',
    icon: 'text-white/30',
    text: 'text-red-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor }) => {
  const colors = colorClasses[color];

  return (
    <div className={`${bgColor || colors.bg} rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
      {/* Background icon */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${colors.icon}`}>
        <div className="text-5xl">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className={`text-3xl font-bold ${colors.text} mb-1`}>
          {value}
        </h3>
        <p className={`text-sm ${colors.text} opacity-90`}>
          {title}
        </p>
      </div>
    </div>
  );
};
