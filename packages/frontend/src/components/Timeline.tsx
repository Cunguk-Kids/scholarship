import { formatCurrency, formatUSDC } from '@/util/currency';
import React from 'react';

export interface TimelineItem {
  amount: number | null;
  blockchainId: number | null;
  estimation: number | null;
  description: string | null;
}

interface TimelineProps {
  title?: string;
  items: TimelineItem[];
  className?: string;
  rate?: number;
}

const Timeline: React.FC<TimelineProps> = ({ title, items, className = '', rate }) => {
  return (
    <div className={`w-full max-w-md ${className}`}>
      {title && <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>}

      <div className="relative">
        {items.map((item, index) => {
          return (
            <div key={item.blockchainId} className="relative flex items-center pb-6 last:pb-0">
              {index !== items.length - 1 && (
                <div className="absolute left-1 top-4 h-8 w-2 bg-gray-300" />
              )}

              {/* dot */}
              <div
                className={`relative z-10 w-4 h-4 rounded-full border-4 border-gray-300 bg-gray-200 `}
              />

              {/* content */}
              <div className="ml-4 flex-1 flex justify-between items-center">
                <span className={`text-sm font-bold`}>{item.description}</span>
                <span className={`text-sm font-bold`}>
                  {formatCurrency(formatUSDC(item.amount ?? 0), "USD")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
