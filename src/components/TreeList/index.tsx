import React, { useContext, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';

import { DEFAULT_ROW_HEIGHT } from '../../constants';
import { PropDataContext } from '../../contexts/PropDataContext';
import { SearchContext } from '../../contexts/SearchContext';
import { TreeDataContext } from '../../contexts/TreeDataContext';
import { ReactAppleTreeProps } from '../../types';
import TreeItem from '../TreeItem';
import { StyledNormalList } from './index.styles';
import ItemRenderer from './ItemRenderer';

export default function TreeList<T>(props: ReactAppleTreeProps<T>) {
  const { appleTreeProps, setAppleTreeProps } = useContext(PropDataContext);
  const { flatTree } = useContext(TreeDataContext);
  const { searchedNodeIndex } = useContext(SearchContext);
  const virtualListRef = useRef<List>(null);
  const normalListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAppleTreeProps(props);
  }, [props]);

  const scrollVirtualList = (index: number) => {
    if (virtualListRef.current) {
      virtualListRef.current.scrollToItem(index, 'smart');
    }
  };

  const scrollNormalList = (index: number) => {
    if (normalListRef.current) {
      normalListRef.current.scrollTo({
        top: 33 * index,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (searchedNodeIndex) {
      scrollVirtualList(searchedNodeIndex);
      scrollNormalList(searchedNodeIndex);
    }
  }, [searchedNodeIndex]);

  return appleTreeProps.isVirtualized ? (
    <List
      ref={virtualListRef}
      height={500}
      width="100%"
      itemSize={appleTreeProps.rowHeight || DEFAULT_ROW_HEIGHT}
      itemCount={flatTree.length}
      itemData={flatTree}
      itemKey={(index, data) => data[index].mapId}
      data-testid="virtualized-list"
      {...appleTreeProps.reactVirtualizedListProps}
    >
      {ItemRenderer}
    </List>
  ) : (
    <StyledNormalList ref={normalListRef} data-testid="non-virtualized-list">
      {flatTree.map((node, i) => (
        <TreeItem
          key={node.mapId}
          node={node}
          nodeIndex={i}
          style={{
            position: 'absolute',
            left: 0,
            top: (appleTreeProps.rowHeight || DEFAULT_ROW_HEIGHT) * i,
            height: `${appleTreeProps.rowHeight || DEFAULT_ROW_HEIGHT}px`,
            width: '100%',
          }}
        />
      ))}
    </StyledNormalList>
  );
}
