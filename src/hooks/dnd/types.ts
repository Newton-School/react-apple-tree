import React from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';

import {
  DraggingNodeInformation,
  OnHoverNodeProps,
} from '../../contexts/DNDContextTypes';
import { FlatTreeItem } from '../../types';

export interface DragHookProps {
  nodeIndex: number;
  listNode: FlatTreeItem;
  dndType?: string;
  draggingNodeInformation?: DraggingNodeInformation;
}

export interface UseDragHookReturnProps {
  isDragging: boolean;
  dragRef: ConnectDragSource;
  dragPreview: ConnectDragPreview;
}

export interface DropHookProps {
  nodeIndex: number;
  listNode: FlatTreeItem;
  nodeElement: React.MutableRefObject<null>;
  dndType?: string;
  onHoverNode: (params: OnHoverNodeProps) => void;
  completeDrop: () => void;
}

export interface DropHookReturnProps {
  isOver: boolean;
}

export interface UseDropHookReturnProps {
  isOver: boolean;
  dropRef: ConnectDropTarget;
}
