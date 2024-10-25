import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import ReactAppleTreeWithoutDndContext from './ReactAppleTreeWithoutDndContext';
import { ReactAppleTreeProps } from './types';

export default function ReactAppleTree<T>(
  props: React.PropsWithChildren<ReactAppleTreeProps<T>>,
) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ReactAppleTreeWithoutDndContext {...props} />
    </DndProvider>
  );
}
