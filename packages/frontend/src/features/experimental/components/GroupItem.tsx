import { type FC } from 'react';

interface ProcessNodeProps {
  data: {
    label: string;
    isExpanded: boolean;
  };
}

const GroupItem: FC<ProcessNodeProps> = ({ data }) => {
  return (
    <div className="relative">
      <div className="p-1 rounded-sm  shadow-md border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <p style={{ fontSize: '8px' }}>{data.label}</p>
        </div>
      </div>
    </div>
  );
};

export default GroupItem;
