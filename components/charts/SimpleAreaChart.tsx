import React from 'react';

interface DataPoint {
  label: string;
  value1: number;
  value2: number;
}

interface SimpleAreaChartProps {
  data: DataPoint[];
  title?: string;
  color1?: string;
  color2?: string;
}

export const SimpleAreaChart: React.FC<SimpleAreaChartProps> = ({
  data,
  title = 'Reservation Statistic',
  color1 = '#3B82F6',
  color2 = '#EF4444',
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map(d => Math.max(d.value1, d.value2)));
  const width = 100;
  const height = 60;

  const createPath = (values: number[]) => {
    const points = values.map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')} L ${width},${height} L 0,${height} Z`;
  };

  const path1 = createPath(data.map(d => d.value1));
  const path2 = createPath(data.map(d => d.value2));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600"><span className="text-gray-400">In</span></span>
          <span className="text-gray-600"><span className="text-gray-400">Out</span></span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color1} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color1} stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color2} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color2} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Area fills */}
        <path d={path1} fill="url(#gradient1)" />
        <path d={path2} fill="url(#gradient2)" />
        
        {/* Lines */}
        <path
          d={path1.replace(/ L \d+,\d+ L \d+,\d+ Z/, '')}
          fill="none"
          stroke={color1}
          strokeWidth="0.5"
        />
        <path
          d={path2.replace(/ L \d+,\d+ L \d+,\d+ Z/, '')}
          fill="none"
          stroke={color2}
          strokeWidth="0.5"
        />
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};
