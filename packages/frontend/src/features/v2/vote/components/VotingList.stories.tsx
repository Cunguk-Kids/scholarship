import type { Meta, StoryObj } from '@storybook/react';
import { VotingList } from './VotingList';
import { V2StoryProvider, mockQueryClient } from '../../V2StoryProvider';
import { useEffect } from 'react';

const meta = {
  title: 'v2/Vote/Components/VotingList',
  component: VotingList,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => {
      useEffect(() => {
        const mockPrograms = [
          {
            id: '1',
            blockchainId: 1,
            name: 'Ethereum Foundation Scholars',
            description: 'Supporting bright minds in crypto',
            creator: '0x123...',
            endAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            startAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            votingAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            ongoingAt: new Date(Date.now() + 86400000 * 5).toISOString(),
            totalRecipients: 5,
            totalFund: '1000',
            milestoneType: 'monthly',
            milestonesProgram: 3,
          },
        ];
        mockQueryClient.setQueryData(['programs', undefined], mockPrograms);
      }, []);

      return (
        <V2StoryProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Story />
          </div>
        </V2StoryProvider>
      );
    },
  ],
} satisfies Meta<typeof VotingList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClickVote: (id, indexerId) => console.log('Vote clicked', { id, indexerId }),
  },
};
