import type { Meta, StoryObj } from '@storybook/react';
import { Bottom } from './Bottom';

const meta = {
  title: 'v2/Vote/Components/Bottom',
  component: Bottom,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Bottom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
