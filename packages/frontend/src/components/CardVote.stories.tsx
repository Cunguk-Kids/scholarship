import type { Meta, StoryObj } from '@storybook/react';
import { CardVote } from './CardVote';

const meta = {
  title: 'v2/Components/CardVote',
  component: CardVote,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CardVote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Alex Johnson',
    institution: 'Binus University',
    onSubmit: () => console.log('Vote submitted'),
    milestones: [
      { amount: '0', description: 'Bought a new workstation', estimation: '2', score: 8, summary: 'Setup phase' },
      { amount: '0', description: 'First project release', estimation: '4', score: 9, summary: 'Development' },
    ],
    rate: 15000,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-stone-300 p-8 rounded-xl">
        <Story />
      </div>
    ),
  ],
};
