import { createElement, type FC } from 'react';
import { Handle, Position } from '@xyflow/react';
import CreateProgram from './form/CreateProgram';
import OpenDonation from './form/OpenDonation';
import MakeDonation from './form/MakeDonation';

interface ProcessNodeProps {
  data: {
    label: string;
    isExpanded: boolean;
    key: string;
  };
}

const componentMap: Record<string, React.ComponentType> = {
  createContract: CreateProgram,
  openDonation: OpenDonation,
  makeDonation: MakeDonation,
};

const NodeItem: FC<ProcessNodeProps> = ({ data }) => {
  return (
    <div className="relative">
      <div className="p-1 rounded-sm bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <p style={{ fontSize: '8px' }}>{data.label}</p>
        </div>
      </div>

      {data.isExpanded && (
        <div className=" expanded-panel absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl border p-4 animate-fade-in z-50">
          <h3 className="font-semibold text-gray-800 mb-2">{data.label}</h3>
          <div className="space-y-2">
            {data.key && componentMap[data.key] ? (
              createElement(componentMap[data.key])
            ) : (
              <div className="text-gray-400 text-sm italic">No form available.</div>
            )}
          </div>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-400 border-2 border-white"
      />
    </div>
  );
};

export default NodeItem;
