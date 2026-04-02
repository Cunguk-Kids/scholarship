import type { Meta, StoryObj } from '@storybook/react';
import { ApplicantModal } from './ApplicantModal';
import { CurrencyConverter } from './CurrencyConverter';
import { ScholarshipModal } from './ScholarshipModal';
import { V2StoryProvider } from '../../V2StoryProvider';

const meta = {
  title: 'v2/Scholarship/Components',
  decorators: [
    (Story) => (
      <V2StoryProvider>
        <div className="p-8">
          <Story />
        </div>
      </V2StoryProvider>
    ),
  ],
} satisfies Meta;

export default meta;

export const DemoApplicantModal: StoryObj<typeof ApplicantModal> = {
  render: () => <ApplicantModal isOpen={true} onClose={() => console.log('Close')} />,
};

export const DemoCurrencyConverter: StoryObj<typeof CurrencyConverter> = {
  render: () => <CurrencyConverter value={100} />,
};

export const DemoScholarshipModal: StoryObj<typeof ScholarshipModal> = {
  render: () => <ScholarshipModal isOpen={true} onClose={() => console.log('Close')} />,
};
