import { type FC } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ProcessNodeProps {
  data: {
    label: string;
    isExpanded: boolean;
  };
}

const NodeItem: FC<ProcessNodeProps> = ({ data }) => {
  console.log(data, '-----data------');

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
          <h3 className="font-semibold text-gray-800 mb-2">Decision Properties</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Question:</label>
              <input
                type="text"
                defaultValue={data.label.replace('\n', ' ')}
                className="w-full px-3 py-2 border rounded-md text-sm nodrag"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Input Type:</label>
              <select className="w-full px-3 py-2 border rounded-md text-sm nodrag">
                <option>Text Input</option>
                <option>Multiple Choice</option>
                <option>Yes/No</option>
                <option>Number</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Required:</label>
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">This field is required</span>
            </div>
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
