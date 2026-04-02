import type { Meta, StoryObj } from '@storybook/react';
import { VotePage } from './index';
import { V2StoryProvider, mockQueryClient } from '../../V2StoryProvider';
import { useEffect } from 'react';

const meta = {
  title: 'v2/Vote/Pages/VotePage',
  component: VotePage,
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
            name: 'Innovators Grant',
            description: 'Funding next-generation technical pioneers.',
            creator: '0xabc...',
            endAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            startAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            votingAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            ongoingAt: new Date(Date.now() + 86400000 * 5).toISOString(),
            totalRecipients: 2,
            totalFund: '500',
            milestoneType: 'milestone',
            milestonesProgram: 2,
          },
        ];
        mockQueryClient.setQueryData(['programs', undefined], mockPrograms);

        // Mock Students for the applicant list modal
        const mockStudents = {
          studentss: {
            items: [
              {
                id: '1',
                fullName: 'Charlie Developer',
                financialSituation: 'Bootcamp',
                studentAddress: '0x1111222233334444555566667777888899990000',
                milestones: {
                  items: [
                    { amount: '250', description: 'Laptop', estimation: '1', score: 5, summary: 'Setup' },
                  ]
                }
              }
            ]
          }
        };
        mockQueryClient.setQueryData(['students', 1], mockStudents); // match programId=1
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
} satisfies Meta<typeof VotePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
