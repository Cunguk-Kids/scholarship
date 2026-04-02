import type { Meta, StoryObj } from '@storybook/react';
import { ApplicantListModal } from './ApplicantListModal';
import { V2StoryProvider } from '../../V2StoryProvider';
import { useEffect } from 'react';
import { mockQueryClient } from '../../V2StoryProvider';

const meta = {
  title: 'v2/Vote/Components/ApplicantListModal',
  component: ApplicantListModal,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, context) => {
      useEffect(() => {
        // Inject mock data for useStudents hook
        const mockStudents = {
          studentss: {
            items: [
              {
                id: '1',
                fullName: 'Alice Johnson',
                financialSituation: 'High School',
                studentAddress: '0x1234567890123456789012345678901234567890',
                milestones: {
                  items: [
                    { amount: '100', description: 'Tuition', estimation: '1', score: 5, summary: 'Term 1' },
                    { amount: '50', description: 'Books', estimation: '2', score: 4, summary: 'Materials' },
                  ]
                }
              },
              {
                id: '2',
                fullName: 'Bob Smith',
                financialSituation: 'University',
                studentAddress: '0x0987654321098765432109876543210987654321',
                milestones: {
                  items: [
                    { amount: '500', description: 'Living Costs', estimation: '1', score: 4, summary: 'Rent' },
                  ]
                }
              }
            ]
          }
        };
        mockQueryClient.setQueryData(['students', 'test-program'], mockStudents);
      }, []);

      return (
        <V2StoryProvider>
          <Story />
        </V2StoryProvider>
      );
    },
  ],
} satisfies Meta<typeof ApplicantListModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    programId: 1,
    programIndexerId: 'test-program',
    onClose: () => console.log('Closed modal'),
  },
};
