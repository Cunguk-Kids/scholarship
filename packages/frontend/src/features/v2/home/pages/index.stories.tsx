import type { Meta, StoryObj } from '@storybook/react';
import { HomePage } from './index';
import { V2StoryProvider } from '../../V2StoryProvider';

const meta = {
  title: 'v2/Pages/HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <V2StoryProvider>
        <div className="min-h-screen">
          <Story />
        </div>
      </V2StoryProvider>
    ),
  ],
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
