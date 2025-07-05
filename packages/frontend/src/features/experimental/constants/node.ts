import type { Node } from "@xyflow/react";

export const initialEdges = [
  { id: 'e1-2', source: 'C1', target: 'C5', animated: true, type: "stright" },
  { id: 'e1-3', source: 'C5', target: 'C3', animated: true, type: "stright" },
  { id: 'e1-4', source: 'C3', target: 'C4', animated: true, type: "stright" },
  { id: 'e1-5', source: 'C5', target: 'C6', animated: true, type: "stright" },
  { id: 'e1-6', source: 'C4', target: 'C7', animated: true, type: "stright" },
  { id: 'e1-7', source: 'C7', target: 'C2', animated: true, type: "stright" },
  { id: 'e1-8', source: 'C2', target: 'C8', animated: true, type: "stright" },
  { id: 'e1-9', source: 'C8', target: 'C9', animated: true, type: "stright" },
];

export const initialNodes: Node[] = [
  {
    id: 'G1',
    type: 'group',
    data: { label: "Contract Creation" },
    position: { x: 0, y: 0 },
    style: { width: 500, height: 700, },
    draggable: false
  },
  {
    id: 'C1',
    type: 'nodeItem',
    data: { label: 'Create Contract', isExpanded: false, key: "createContract" },
    position: { x: 200, y: 50 },
    parentId: 'G1',
    extent: 'parent',
    draggable: false
  },

  // voter
  {
    id: 'G2',
    type: 'group',
    data: { label: "Voter" },
    position: { x: 50, y: 300 },
    style: { width: 200, height: 200 },
    parentId: 'G1',
    extent: 'parent',
    draggable: false
  },
  {
    id: 'C2',
    type: 'nodeItem',
    data: { label: 'Vote', isExpanded: false, key: "voteForm" },
    parentId: 'G2',
    extent: 'parent',
    draggable: false,
    position: { x: 10, y: 50 },

  },

  // donor
  {
    id: 'G3',
    type: 'group',
    data: { label: "Donor" },
    position: { x: 250, y: 100 },
    style: { width: 200, height: 200 },
    draggable: false,
    parentId: 'G1',
    extent: 'parent',
  },
  {
    id: 'C3',
    type: 'nodeItem',
    data: { label: 'Make Donation', isExpanded: false, key: "makeDonation" },
    position: { x: 50, y: 50 },
    parentId: 'G3',
    extent: 'parent',
    draggable: false
  },

  // applicant
  {
    id: 'G4',
    type: 'group',
    data: { label: "Applicant" },
    position: { x: 250, y: 300 },
    style: { width: 200, height: 200 },
    draggable: false,
    parentId: 'G1',
    extent: 'parent',
  },
  {
    id: 'C4',
    type: 'nodeItem',
    data: { label: 'Apply Program', isExpanded: false, key: "applyDonation" },
    position: { x: 50, y: 50 },
    parentId: 'G4',
    extent: 'parent',
    draggable: false
  },
  {
    id: 'C9',
    type: 'nodeItem',
    data: { label: 'Withdraw Milestone', isExpanded: false, key: "applyDonation" },
    position: { x: 50, y: 80 },
    parentId: 'G4',
    extent: 'parent',
    draggable: false
  },

  // admin
  {
    id: 'G5',
    type: 'group',
    data: { label: "Admin" },
    position: { x: 50, y: 100 },

    style: { width: 200, height: 200 },
    parentId: 'G1',
    extent: 'parent',
    draggable: false
  },
  {
    id: 'C5',
    type: 'nodeItem',
    data: { label: 'Open Donation', isExpanded: false, key: "openDonation" },
    position: { x: 10, y: 50 },

    parentId: 'G5',
    extent: 'parent',
    draggable: false
  },
  {
    id: 'C6',
    type: 'nodeItem',
    data: { label: 'Create Milestone Template', isExpanded: false, key: "createMilestoneTemplate" },
    position: { x: 10, y: 80 },

    parentId: 'G5',
    extent: 'parent',
    draggable: false
  },
  {
    id: 'C7',
    type: 'nodeItem',
    data: { label: 'Open Vote', isExpanded: false, key: "openVote" },
    position: { x: 10, y: 110 },
    parentId: 'G5',
    extent: 'parent',
    draggable: false
  },
  {
    id: 'C8',
    type: 'nodeItem',
    data: { label: 'Close Vote/Batch', isExpanded: false, key: "closeBatch" },
    position: { x: 10, y: 140 },
    parentId: 'G5',
    extent: 'parent',
    draggable: false
  },
];
