import type { Meta, StoryObj } from '@storybook/react';
import { Hands } from './Hands';

const meta = {
  title: 'v2/Vote/Components/Hands',
  component: Hands,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Hands>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
