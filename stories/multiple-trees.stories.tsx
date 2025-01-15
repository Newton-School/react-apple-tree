import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import ReactAppleTree, { ReactAppleTreeWithoutDndContext } from '../src';
import { defaultAppleTreeProps } from '../src/utils/default-props';
import { defaultSecondTreeData, defaultTreeData } from './default-treedata';

function MultipleTrees() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', gap: 20 }}>
        <ReactAppleTreeWithoutDndContext
          {...defaultAppleTreeProps}
          treeData={defaultTreeData}
          getNodeKey={({ node }) => node.id || -1}
        />
        <ReactAppleTreeWithoutDndContext
          {...defaultAppleTreeProps}
          treeData={defaultSecondTreeData}
          getNodeKey={({ node }) => node.id || -1}
        />
      </div>
    </DndProvider>
  );
}

const meta: Meta<typeof ReactAppleTree> = {
  title: 'Multiple Trees',
  component: MultipleTrees,
};

export default meta;

type Story = StoryObj<typeof ReactAppleTree>;

export const Default: Story = {
  args: {
    ...(defaultAppleTreeProps as any),
    treeData: defaultTreeData,
    getNodeKey: ({ node }) => node.title,
  },
};
