import type { Meta, StoryObj } from '@storybook/react';
import { Choose } from './Choose';

const meta = {
  title: 'v2/Vote/Components/Choose',
  component: Choose,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Choose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
