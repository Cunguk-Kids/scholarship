import type { Meta, StoryObj } from '@storybook/react';
import { Arrow } from './Arrow';
import { Button } from './Button';
import { CardForm } from './CardForm';
import { ConfirmationModal } from './ConfirmationModal';
import HoverPopover from './HoverPopover';
import { Input } from './Input';
import { StatusBadge } from './StatusBadge';
import { Tabbing } from './Tabbing';
import Timeline from './Timeline';
import { Header } from './header';

const meta = {
  title: 'v2/General Components',
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

export const DemoArrow: StoryObj<typeof Arrow> = {
  render: () => <Arrow direction="right" onClick={() => console.log('Arrow Clicked')} />,
};

export const DemoButton: StoryObj<typeof Button> = {
  render: () => <Button label="Click Me" onClick={() => console.log('Button Clicked')} />,
};

export const DemoCardForm: StoryObj<typeof CardForm> = {
  render: () => (
    <CardForm
      type="applicant"
      totalStep={2}
      onSubmit={(data) => console.log('Submitted', data)}
    />
  ),
};

export const DemoConfirmationModal: StoryObj<typeof ConfirmationModal> = {
  render: () => (
    <ConfirmationModal
      isOpen={true}
      onClose={() => console.log('Closed')}
      onSubmit={() => console.log('Submitted')}
      title="Are you sure?"
      desc="This action cannot be undone."
      primaryLabel="Confirm"
      secondaryLabel="Cancel"
    />
  ),
};

export const DemoHoverPopover: StoryObj<typeof HoverPopover> = {
  render: () => (
    <HoverPopover 
      trigger={<button className="px-4 py-2 bg-blue-500 text-white rounded">Hover Me</button>}
      content={<div className="p-4 bg-white text-black rounded shadow">Popover Content</div>}
    />
  ),
};

export const DemoInput: StoryObj<typeof Input> = {
  render: () => (
    <div className="w-64">
      <Input type="input" placeholder="Enter text..." onChange={(val) => console.log(val)} />
    </div>
  ),
};

export const DemoStatusBadge: StoryObj<typeof StatusBadge> = {
  render: () => <StatusBadge status="ACTIVE" />,
};

export const DemoTabbing: StoryObj<typeof Tabbing> = {
  render: () => (
    <Tabbing
      tabs={[
        { id: '1', label: 'Tab 1', color: 'bg-red-500' },
        { id: '2', label: 'Tab 2', color: 'bg-green-500' },
      ]}
      type="program"
      programs={[]}
    />
  ),
};

export const DemoTimeline: StoryObj<typeof Timeline> = {
  render: () => (
    <Timeline
      items={[
        { blockchainId: 1, amount: 1000000, description: 'Kickoff', score: "10", summary: "Great", estimation: null },
        { blockchainId: 2, amount: 500000, description: 'Halfway', score: "8", summary: "Good", estimation: null },
        { blockchainId: 3, amount: 200000, description: 'Finished', score: null, summary: null, estimation: null },
      ]}
    />
  ),
};

export const DemoHeader: StoryObj<typeof Header> = {
  render: () => <Header />,
};
