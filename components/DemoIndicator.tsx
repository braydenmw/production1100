import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { features } from '../services/config';

interface DemoIndicatorProps {
  message?: string;
  className?: string;
  showIcon?: boolean;
}

const DemoIndicator: React.FC<DemoIndicatorProps> = ({
  message = "ADVERSIQ Intelligence Platform — API key required for live AI",
  className = "",
  showIcon = true
}) => {
  if (!features.shouldShowDemoIndicator()) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700 ${className}`}>
      {showIcon && <Sparkles size={12} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default DemoIndicator;
