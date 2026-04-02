import type { Meta, StoryObj } from '@storybook/react';
import { ScholarshipsPage } from './index';
import { V2StoryProvider, mockQueryClient } from '../../V2StoryProvider';
import { useEffect } from 'react';

const meta = {
  title: 'v2/Pages/ScholarshipsPage',
  component: ScholarshipsPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        // Mock Programs
        const mockPrograms = [
          {
            id: '1',
            blockchainId: 1,
            name: 'Pioneers Tech Fund',
            description: 'Tech funding for upcoming talent',
            creator: '0x123...',
            endAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            startAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            votingAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            ongoingAt: new Date(Date.now() + 86400000 * 5).toISOString(),
            totalRecipients: 10,
            totalFund: '5000',
            milestoneType: 'monthly',
            milestonesProgram: 4,
          },
        ];
        mockQueryClient.setQueryData(['programs', undefined], mockPrograms);
      }, []);

      return (
        <V2StoryProvider>
          <div className="min-h-screen">
            <Story />
          </div>
        </V2StoryProvider>
      );
    },
  ],
} satisfies Meta<typeof ScholarshipsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
