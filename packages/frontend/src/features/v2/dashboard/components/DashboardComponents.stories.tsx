import type { Meta, StoryObj } from '@storybook/react';
import { CurrentBalance } from './current-balance';
import { SwitchDashboard } from './switch-dashboard';
import { NotFoundStudentFallback } from './notfound-student-fallback';
import { V2StoryProvider } from '../../V2StoryProvider';

const meta = {
  title: 'v2/Dashboard/Components',
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

export const Balance: StoryObj<typeof CurrentBalance> = {
  render: () => <CurrentBalance />,
};

export const SwitchBtn: StoryObj<typeof SwitchDashboard> = {
  render: () => (
    <SwitchDashboard
      role="student"
      onChangeRole={(r) => console.log('Change role', r)}
    />
  ),
};

export const NotFoundStudent: StoryObj<typeof NotFoundStudentFallback> = {
  render: () => <NotFoundStudentFallback />,
};
