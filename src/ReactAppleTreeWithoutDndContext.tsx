import React from 'react';

import TreeList from './components/TreeList';
import { DNDContextProvider } from './contexts/DNDContext';
import { PropDataContextProvider } from './contexts/PropDataContext';
import { SearchContextProvider } from './contexts/SearchContext';
import { TreeDataContextProvider } from './contexts/TreeDataContext';
import { StyledReactAppleTree } from './ReactAppleTree.styles';
import { ReactAppleTreeProps } from './types';

export default function ReactAppleTreeWithoutDndContext<T>(
  props: React.PropsWithChildren<ReactAppleTreeProps<T>>,
) {
  return (
    <PropDataContextProvider>
      <TreeDataContextProvider>
        <SearchContextProvider>
          <DNDContextProvider>
            <StyledReactAppleTree className={props.className}>
              <TreeList {...props} />
            </StyledReactAppleTree>
          </DNDContextProvider>
        </SearchContextProvider>
      </TreeDataContextProvider>
    </PropDataContextProvider>
  );
}
