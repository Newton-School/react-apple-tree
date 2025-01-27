import { useContext, useState } from 'react';
import { useDrop } from 'react-dnd';

import {
  DEFAULT_DND_TYPE,
  DEFAULT_SCAFFOLD_BLOCK_PX_WIDTH,
} from '../../constants';
import { NodeAppendDirection } from '../../contexts/DNDContextTypes';
import { PropDataContext } from '../../contexts/PropDataContext';
import {
  DragHookProps,
  DropHookProps,
  DropHookReturnProps,
  UseDropHookReturnProps,
} from './types';

/**
 * Custom hook to add drop functionality to the node.
 *
 * @param {DropHookProps} options - The options for the drop hook.
 * @param {number} options.nodeIndex - The index of the node.
 * @param {FlatTreeItem} options.listNode - The list node.
 * @param {React.MutableRefObject<null>} options.nodeElement - The reference to the node element.
 * @param {string} options.dndType - The drag and drop type.
 * @param {Function} options.onHoverNode - The function to call when hovering over a node.
 * @param {Function} options.completeDrop - The function to call when the drop is complete.
 * @returns {UseDropHookReturnProps} - The object containing the drag and drop properties.
 * @property {boolean} isOver - Indicates whether the item is being hovered over.
 * @property {ConnectDropTarget} dropRef - The reference for the drop element.
 */
export default function useDropHook({
  nodeIndex,
  listNode,
  nodeElement,
  dndType,
  onHoverNode,
  completeDrop,
}: DropHookProps): UseDropHookReturnProps {
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
            if (offsetY < targetHeight / 2) {
              onHoverNode({
                depth,
                direction: NodeAppendDirection.Below,
                nodeIndex,
                flatNode: listNode,
                draggingNodeInformation: item.draggingNodeInformation,
              });
            } else {
              onHoverNode({
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
}
