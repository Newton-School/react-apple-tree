import {
  CanDragFn,
  CanNodeHaveChildrenFn,
  ExtendedNodeData,
  TreeItem,
} from '../types';
import { defaultAppleTreeProps } from './default-props';

/**
 * Checks if a node can be dragged based on the provided `canDragFn` function or value.
 *
 * @param {CanDragFn} canDragFn - A function or boolean that determines if dragging is allowed. If undefined or null, the default value from `defaultAppleTreeProps.canDrag` is used.
 * @param {ExtendedNodeData} extendedNodeData - The extended data of the node to be checked.
 * @returns {boolean} `true` if the node can be dragged, otherwise `false`.
 */
export function checkCanDragNode(
  canDragFn: CanDragFn,
  extendedNodeData: ExtendedNodeData,
): boolean {
  if (typeof canDragFn === 'undefined' || canDragFn === null) {
    return defaultAppleTreeProps.canDrag as boolean;
  }
  if (typeof canDragFn === 'boolean') {
    return canDragFn;
  }
  return canDragFn(extendedNodeData);
}

/**
 * Determines if a node can have children based on the provided function or boolean value.
 *
 * @template T - The type of the node's data.
 * @param {CanNodeHaveChildrenFn<T> | boolean | undefined} canNodeHaveChildrenFn - A function that takes a node and returns a boolean indicating if the node can have children,
 *                                or a boolean value directly, or undefined.
 * @param {TreeItem<T>} node - The node to check.
 * @returns {boolean} A boolean indicating if the node can have children.
 */
export function runCanNodeHaveChildren<T>(
  canNodeHaveChildrenFn: CanNodeHaveChildrenFn<T> | boolean | undefined,
  node: TreeItem<T>,
): boolean {
  if (
    typeof canNodeHaveChildrenFn === 'undefined' ||
    canNodeHaveChildrenFn === null
  ) {
    return defaultAppleTreeProps.canNodeHaveChildren as boolean;
  }
  if (typeof canNodeHaveChildrenFn === 'boolean') {
    return canNodeHaveChildrenFn;
  }
  return canNodeHaveChildrenFn(node);
}
