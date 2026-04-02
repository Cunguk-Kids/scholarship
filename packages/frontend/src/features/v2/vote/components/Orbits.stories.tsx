import type { Meta, StoryObj } from '@storybook/react';
import { Orbits } from './Orbits';

const meta = {
  title: 'v2/Vote/Components/Orbits',
  component: Orbits,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Orbits>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
