import type { Meta, StoryObj } from '@storybook/react';
import { CardScholarship } from './CardScholarship';

const meta = {
  title: 'v2/Components/CardScholarship',
  component: CardScholarship,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CardScholarship>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    program: {
      id: 1,
      name: 'Future Leaders Dev Grant',
      description: 'A comprehensive grant for promising frontend developers building Web3 tools.',
      targetApplicant: 5,
      totalFund: BigInt(5000),
      startDate: new Date(Date.now() - 86400000).getTime(),
      endDate: new Date(Date.now() + 86400000 * 14).getTime(),
      votingAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      ongoingAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      blockchainId: 10,
      creator: '0xabc',
      initiatorAddress: '0xabc',
      milestoneType: 'monthly',
      programContractAddress: '0x123',
    },
    labelButton: 'View Details',
    onClickButton: () => console.log('Clicked!'),
    liskToIDR: 15000,
  },
};
