/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
} from '@xyflow/react';
import type { Node, Edge, NodeTypes, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCallback, useRef } from 'react';
import { initialEdges, initialNodes } from '../constants/node';
import { Button } from '@/components/Button';
import NodeItem from '../components/NodeItem';
import GroupItem from '../components/GroupItem';
import AddressGroup from '../components/AddressGroup';
import { ExperimentalInjection } from '../context/experimental-context';
import BalanceDisplay from '../components/BalanceDisplay';

const nodeTypes: NodeTypes = {
  nodeItem: NodeItem,
  group: GroupItem,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } => {
  return { nodes, edges };
};

export function ExperimentalPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // CONTEXT
  const {
    data: {
      address,
      contractBalance: { data: balance },
    },
  } = ExperimentalInjection.use();

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'straight',
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const target = event.target as HTMLElement;

      if (target.closest('.expanded-panel') || target.closest('.nodrag')) {
        return;
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isExpanded: !n.data.isExpanded } }
            : { ...n, data: { ...n.data, isExpanded: false } },
        ),
      );
    },
    [setNodes],
  );

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes(
      layouted.nodes.map((node) => ({
        ...node,
        type: node.type ?? 'nodeItem',
        data: {
          ...node.data,
          isExpanded: (node.data as any).isExpanded ?? false,
        },
      })),
    );
    setEdges(
      layouted.edges.map((edge) => ({
        ...edge,
        type: edge.type ?? 'straight',
        animated: edge.animated ?? false,
      })),
    );
    fitView();
  }, [nodes, edges, setNodes, setEdges, fitView]);

  return (
    <div className="m-10 relative">
      <div className="w-full grid grid-cols-2 ">
        <div className="w-fit mb-4">
          <Button onClick={onLayout} label="Fit View" />
        </div>
        <div className="w-full flex flex-row justify-between">
          <BalanceDisplay balance={balance?.value || BigInt(0)} currency="ETH" />
          <div className="w-fit mb-4">
            <Button label={address || 'No Address Selected'} />
          </div>
        </div>
      </div>
      <AddressGroup />

      <div
        ref={reactFlowWrapper}
        className="w-auto h-[70vh] bg-gradient-to-br from-blue-50 to-purple-50 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          fitView>
          <Background />
          <Controls />
          <MiniMap className="bg-white shadow-lg rounded-lg border" nodeStrokeWidth={2} />
        </ReactFlow>
      </div>
    </div>
  );
}
