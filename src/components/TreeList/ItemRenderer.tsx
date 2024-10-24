import React from 'react';

import { FlatTreeItem } from '../../types';
import TreeItem from '../TreeItem';

interface ItemRendererProps {
  index: number;
  style: React.CSSProperties;
  data: Array<FlatTreeItem>;
}

function ItemRenderer({ index, style, data }: ItemRendererProps) {
  return (
    <TreeItem
      key={data[index].mapId}
      style={style}
      node={data[index]}
      nodeIndex={index}
    />
  );
}

export default ItemRenderer;
