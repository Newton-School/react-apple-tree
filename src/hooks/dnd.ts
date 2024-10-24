import cloneDeep from 'lodash.clonedeep';
import React, { useContext, useState } from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
  useDrag,
  useDrop,
} from 'react-dnd';

import {
  DEFAULT_DND_TYPE,
  DEFAULT_SCAFFOLD_BLOCK_PX_WIDTH,
} from '../constants';
import { DNDContext } from '../contexts/DNDContext';
import {
  DraggingNodeInformation,
  NodeAppendDirection,
  OnHoverNodeProps,
} from '../contexts/DNDContextTypes';
import { PropDataContext } from '../contexts/PropDataContext';
import { FlatTreeItem } from '../types';

interface DragHookProps {
  nodeIndex: number;
  listNode: FlatTreeItem;
  dndType?: string;
  draggingNodeInformation?: DraggingNodeInformation;
}

interface UseDragHookReturnProps {
  isDragging: boolean;
  dragRef: ConnectDragSource;
  dragPreview: ConnectDragPreview;
}

interface DropHookProps {
  nodeIndex: number;
  listNode: FlatTreeItem;
  nodeElement: React.MutableRefObject<null>;
  dndType?: string;
  hoverNode: (params: OnHoverNodeProps) => void;
  completeDrop: () => void;
}

interface DropHookReturnProps {
  isOver: boolean;
}

interface UseDropHookReturnProps {
  isOver: boolean;
  dropRef: ConnectDropTarget;
}

/**
 * Custom hook to add drag functionality to the node.
 *
 * @param {DragHookProps} options - The options for the drag hook.
 * @param {number} options.nodeIndex - The index of the node.
 * @param {FlatTreeItem} options.listNode - The list node.
 * @param {string} options.dndType - The drag and drop type.
 * @returns {UseDragHookReturnProps} - The object containing the drag and drop properties.
 * @property {boolean} isDragging - Indicates whether the item is being dragged.
 * @property {ConnectDragSource} dragRef - The reference for the drag element.
 * @property {ConnectDragPreview} dragPreview - The reference for the drag preview element.
 */
export const useDragHook = ({
  nodeIndex,
  listNode,
  dndType,
}: DragHookProps): UseDragHookReturnProps => {
  const { getDraggingNodeInformationFromNodeIndex } = useContext(DNDContext);
  const draggingNodeInformation =
    getDraggingNodeInformationFromNodeIndex(nodeIndex);

  const [{ isDragging }, dragRef, dragPreview] = useDrag({
    type: dndType || DEFAULT_DND_TYPE,
    item: {
      nodeIndex,
      listNode,
      draggingNodeInformation: cloneDeep({
        ...draggingNodeInformation,
        externalDrag: true,
      }),
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return {
    isDragging,
    dragRef,
    dragPreview,
  };
};

/**
 * Custom hook to add drop functionality to the node.
 *
 * @param {DropHookProps} options - The options for the drop hook.
 * @param {number} options.nodeIndex - The index of the node.
 * @param {FlatTreeItem} options.listNode - The list node.
 * @param {React.MutableRefObject<null>} options.nodeElement - The reference to the node element.
 * @param {string} options.dndType - The drag and drop type.
 * @param {Function} options.hoverNode - The function to call when hovering over a node.
 * @param {Function} options.completeDrop - The function to call when the drop is complete.
 * @returns {UseDropHookReturnProps} - The object containing the drag and drop properties.
 * @property {boolean} isOver - Indicates whether the item is being hovered over.
 * @property {ConnectDropTarget} dropRef - The reference for the drop element.
 */
export const useDropHook = ({
  nodeIndex,
  listNode,
  nodeElement,
  dndType,
  hoverNode,
  completeDrop,
}: DropHookProps): UseDropHookReturnProps => {
  const [hoveredDepth, setHoveredDepth] = useState<number | null>(null);
  const { appleTreeProps } = useContext(PropDataContext);

  const [{ isOver }, dropRef] = useDrop<
    DragHookProps,
    any,
    DropHookReturnProps
  >({
    accept: dndType || DEFAULT_DND_TYPE,
    drop: () => {
      completeDrop();
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item, monitor) {
      if (nodeElement.current) {
        const targetRect = (
          nodeElement.current as HTMLElement
        ).getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();

        if (clientOffset) {
          const offsetX = clientOffset.x - targetRect.left;
          const offsetY = clientOffset.y - targetRect.top;
          const targetHeight = targetRect.height;
          const oneBlockWidth =
            appleTreeProps.scaffoldBlockPxWidth ||
            DEFAULT_SCAFFOLD_BLOCK_PX_WIDTH;
          let depth =
            Math.sign(offsetX) * Math.floor(Math.abs(offsetX / oneBlockWidth));
          if (depth === -0) {
            depth = 0;
          }
          if (hoveredDepth !== depth) {
            setHoveredDepth(depth);
            if (offsetY * 2 < targetHeight) {
              hoverNode({
                depth,
                direction: NodeAppendDirection.Below,
                nodeIndex,
                flatNode: listNode,
                draggingNodeInformation: item.draggingNodeInformation,
              });
            } else {
              hoverNode({
                depth,
                direction: NodeAppendDirection.Above,
                nodeIndex,
                flatNode: listNode,
                draggingNodeInformation: item.draggingNodeInformation,
              });
            }
          } else if (!monitor.isOver()) {
            setHoveredDepth(null);
          }
        }
      }
    },
  });

  return { isOver, dropRef };
};
