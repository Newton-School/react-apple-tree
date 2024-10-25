import {
  CanDragFn,
  CanNodeHaveChildrenFn,
  ExtendedNodeData,
  TreeItem,
} from '../types';
import { defaultAppleTreeProps } from './default-props';

export function checkCanDragNode(
  canDragFn: CanDragFn,
  extendedNodeData: ExtendedNodeData,
): boolean {
  if (typeof canDragFn !== 'undefined' && canDragFn !== null) {
    if (typeof canDragFn === 'boolean') {
      return canDragFn;
    }
    return canDragFn(extendedNodeData);
  }
  return true;
}

export function runCanNodeHaveChildren<T>(
  canNodeHaveChildrenFn: CanNodeHaveChildrenFn<T> | boolean | undefined,
  node: TreeItem<T>,
) {
  if (typeof canNodeHaveChildrenFn === 'undefined') {
    return defaultAppleTreeProps.canNodeHaveChildren;
  }
  if (typeof canNodeHaveChildrenFn === 'boolean') {
    return canNodeHaveChildrenFn;
  }
  return canNodeHaveChildrenFn(node);
}
