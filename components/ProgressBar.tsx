import React from 'react';

interface ProgressBarProps {
  percentage: number;
  label: string;
  subtext: string;
  colorClass: string; // Tailwind color class for the bar
  isActive?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  label, 
  subtext, 
  colorClass,
  isActive = true
}) => {
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={`mb-8 p-4 rounded-xl bg-slate-800 shadow-lg border border-slate-700 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50 grayscale'}`}>
      <div className="flex justify-between items-end mb-2">
        <h3 className="text-lg font-semibold text-slate-200">{label}</h3>
        <span className="text-2xl font-bold text-white">{clampedPercentage.toFixed(1)}%</span>
      </div>
      
      <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden mb-2 relative">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${clampedPercentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-white/10 w-full animate-pulse" />
        </div>
      </div>
      
      <p className="text-sm text-slate-400 font-medium">{subtext}</p>
    </div>
  );
};