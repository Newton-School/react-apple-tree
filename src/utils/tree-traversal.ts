import { TreeItem } from '../types';

interface DFSProps<T> {
  treeData: Array<TreeItem<T>>;
  callback: (data: TreeItem) => void;
  ignoreCollapsed?: boolean;
  onGoingInside?: (data: TreeItem) => void;
  onGoingOutside?: (data: TreeItem) => void;
}

/**
 * Performs a depth-first search (DFS) traversal on a tree structure.
 *
 * @template T - The type of the tree nodes.
 * @param {DFSProps<T>} params - The parameters for the DFS traversal.
 * @property {Array<TreeItem<T>>} params.treeData - The tree data to traverse.
 * @property {(node: TreeItem) => void} params.callback - The callback function to execute on each node.
 * @property {boolean} params.ignoreCollapsed=false - Whether to ignore collapsed nodes during traversal.
 * @property {(node: TreeItem) => void} params.onGoingInside - The callback function to execute when going inside a node.
 * @property {(node: TreeItem) => void} params.onGoingOutside - The callback function to execute when going outside a node.
 */
export function dfs<T>({
  treeData,
  callback = () => {},
  ignoreCollapsed = false,
  onGoingInside,
  onGoingOutside,
}: DFSProps<T>) {
  function _dfs(node: TreeItem) {
    if (onGoingInside) {
      onGoingInside(node);
    }
    callback(node);
    if ((!ignoreCollapsed || node.expanded) && node.children) {
      node.children.forEach(_dfs);
    }
    if (onGoingOutside) {
      onGoingOutside(node);
    }
  }
  treeData.forEach(_dfs);
}
