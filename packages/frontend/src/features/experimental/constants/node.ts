import type { Node } from "@xyflow/react";
import { cloneDeep } from "lodash";

export const initialEdges = [
  { id: 'e1-2', source: 'C1', target: 'C2', animated: true, type: "stright" },
];

export const initialNodes: Node[] = [
  {
    id: 'G1',
    type: 'group',
    data: { label: "Contract Creation" },
    position: { x: 0, y: 0 },
    style: { width: 500, height: 500 },
  },
  {
    id: 'C1',
    type: 'nodeItem',
    data: { label: 'Create Contract', isExpanded: false },
    position: { x: 10, y: 10 },
    parentId: 'G1',
    extent: 'parent',
  },

  // applicant
  {
    id: 'G2',
    type: 'group',
    data: { label: "Applicant" },
    position: { x: 0, y: 0 },
    parentId: 'G1',
    extent: 'parent',
  },
  {
    id: 'C2',
    type: 'nodeItem',
    data: { label: 'child node 2', isExpanded: false },
    position: { x: 10, y: 10 },
    parentId: 'G2',
    extent: 'parent',
  },

  // donor
  {
    id: 'G3',
    type: 'group',
    data: { label: "Donor" },
    position: { x: 0, y: 0 },
    parentId: 'G1',
    extent: 'parent',
  },
  {
    id: 'C3',
    type: 'nodeItem',
    data: { label: 'Donor', isExpanded: false },
    position: { x: 10, y: 10 },
    parentId: 'G3',
    extent: 'parent',
  },

  // voter
  {
    id: 'G4',
    type: 'group',
    data: { label: "Voter" },
    position: { x: 0, y: 0 },
    parentId: 'G1',
    extent: 'parent',
  },
  {
    id: 'C4',
    type: 'nodeItem',
    data: { label: 'vote', isExpanded: false },
    position: { x: 10, y: 10 },
    parentId: 'G4',
    extent: 'parent',
  },

  // admin
  {
    id: 'G5',
    type: 'group',
    data: { label: "Voter" },
    position: { x: 0, y: 0 },
    parentId: 'G1',
    extent: 'parent',
  },
  {
    id: 'C5',
    type: 'nodeItem',
    data: { label: 'vote', isExpanded: false },
    position: { x: 10, y: 10 },
    parentId: 'G5',
    extent: 'parent',
  },
];

interface LayoutChild {
  id: string;
  position: { x: number; y: number; };
}

interface LayoutOptions {
  spacingY?: number;
  startX?: number;
  startY?: number;
  groupWidth?: number;
  nodeWidth?: number;
}

function layoutGroupChildren(
  childIds: string[],
  options: LayoutOptions = {}
): LayoutChild[] {
  const {
    spacingY = 100,
    startX = 0,
    startY = 40,
    groupWidth = 170,
    nodeWidth = 130,
  } = options;

  const centeredX = startX + (groupWidth - nodeWidth) / 2;

  return childIds.map((id, index) => ({
    id,
    position: {
      x: centeredX,
      y: startY + index * spacingY,
    },
  }));
}


export function getLayoutedInitialNodes(nodes: Node[]): Node[] {
  const updated = cloneDeep(nodes);

  const groupNodes = updated.filter((n) => n.type === 'group');
  const spacing = 100;
  const padding = 40;

  groupNodes.forEach((group) => {
    const childNodes = updated.filter((n) => n.parentId === group.id);
    const layout = layoutGroupChildren(
      childNodes.map((c) => c.id),
      {
        spacingY: 100,
        startY: 40,
        groupWidth: typeof group?.style?.width === "number"
          ? group.style.width
          : typeof group?.style?.width === "string"
            ? parseFloat(group.style.width)
            : 170,
        nodeWidth: 130,
      }
    );

    // Update each child node's position
    layout.forEach((layoutItem) => {
      const targetNode = updated.find((n) => n.id === layoutItem.id);
      if (targetNode) {
        targetNode.position = layoutItem.position;
      }
    });

    // 🔧 Set height of group node dynamically
    const requiredHeight = layout.length > 0
      ? layout[layout.length - 1].position.y + spacing
      : 150;

    const targetGroup = updated.find((n) => n.id === group.id);
    if (targetGroup) {
      targetGroup.style = {
        ...(targetGroup.style || {}),
        height: requiredHeight + padding,
      };
    }
  });

  return updated;
}

