import ReactAppleTree from '../src';
import type { Meta, StoryObj } from '@storybook/react';
import { defaultAppleTreeProps } from '../src/utils/default-props';
import { defaultTreeData } from './default-treedata';

const meta: Meta<typeof ReactAppleTree> = {
  title: 'ReactAppleTree',
  component: ReactAppleTree,
};

export default meta;

type Story = StoryObj<typeof ReactAppleTree>;

export const Default: Story = {
  name: 'Default',
  args: {
    ...(defaultAppleTreeProps as any),
    treeData: defaultTreeData,
    getNodeKey: ({ node }) => node.title,
  },
};
