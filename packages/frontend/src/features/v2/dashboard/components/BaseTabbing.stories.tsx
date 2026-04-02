import type { Meta, StoryObj } from '@storybook/react';
import { BaseTabbing, BaseTabbingContent, BaseTabbingList, BaseTabbingTrigger } from './base-tabbing';

const meta = {
  title: 'v2/Dashboard/Components/BaseTabbing',
  component: BaseTabbing,
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BaseTabbing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 'tab1',
    children: (
      <>
        <BaseTabbingList>
          <BaseTabbingTrigger value="tab1">Tab 1</BaseTabbingTrigger>
          <BaseTabbingTrigger value="tab2">Tab 2</BaseTabbingTrigger>
        </BaseTabbingList>
        <BaseTabbingContent value="tab1">
          <div className="h-40 p-4">Content for Tab 1</div>
        </BaseTabbingContent>
        <BaseTabbingContent value="tab2">
          <div className="h-40 p-4">Content for Tab 2</div>
        </BaseTabbingContent>
      </>
    ),
  },
};
