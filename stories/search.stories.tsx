import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import ReactAppleTree from '../src';
import { defaultAppleTreeProps } from '../src/utils/default-props';
import { defaultTreeData } from './default-treedata';

function ReactAppleTreeStory(args: any) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <input
        placeholder="Enter search query"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ReactAppleTree
        {...args}
        searchMethod={({ node, searchQuery }) => {
          if (node.title) {
            return String(node.title)
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          }
          return false;
        }}
        searchQuery={searchQuery}
      />
      ;
    </div>
  );
}

const meta: Meta<typeof ReactAppleTree> = {
  title: 'Search',
  component: ReactAppleTreeStory,
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
