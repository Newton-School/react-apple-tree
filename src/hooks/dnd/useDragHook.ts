import cloneDeep from 'lodash.clonedeep';
import { useContext } from 'react';
import { useDrag } from 'react-dnd';

import { DEFAULT_DND_TYPE } from '../../constants';
import { DNDContext } from '../../contexts/DNDContext';
import { DragHookProps, UseDragHookReturnProps } from './types';

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
export default function useDragHook({
  nodeIndex,
  listNode,
  dndType,
}: DragHookProps): UseDragHookReturnProps {
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
}
