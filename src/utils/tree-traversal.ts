import { GetNodeKeyFn, TreeItem } from '../types';

interface DFSProps<T> {
  treeData: Array<TreeItem<T>>;
  getNodeKey?: GetNodeKeyFn<T>;
  callback: (data: TreeItem) => void;
  ignoreCollapsed?: boolean;
  onGoingInside?: (data: TreeItem) => void;
  onGoingOutside?: (data: TreeItem) => void;
}

export function dfs<T>({
  treeData,
  callback,
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
