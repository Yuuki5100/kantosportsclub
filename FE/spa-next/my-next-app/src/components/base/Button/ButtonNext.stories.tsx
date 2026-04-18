// src/stories/ButtonNext.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ButtonNext from '@base/Button/ButtonNext';
import { fn } from '@storybook/test'; // onClick監視用（アクションパネル）

const meta: Meta<typeof ButtonNext> = {
  title: 'MUI/ButtonNext',
  component: ButtonNext,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ButtonNext>;

export const Default: Story = {
  args: {
    color: 'primary',
    size: 'medium',
  },
};


export const Disabled: Story = {
  args: {
    color: 'primary',
    disabled: true,
  },
};

export const Success: Story = {
  args: {
    color: 'success',
  },
};

export const CustomWidth: Story = {
  args: {
    width: 300,
  },
};
