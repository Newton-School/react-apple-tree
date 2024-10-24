import { NodeKey, SearchData, TreeIndex } from '../types';
import { defaultAppleTreeProps } from './default-props';

export function defaultGetNodeKey({ treeIndex }: TreeIndex): NodeKey {
  return treeIndex;
}

export function defaultSearchMethod({
  node,
  path,
  treeIndex,
  searchQuery,
}: SearchData): boolean {
  if (defaultAppleTreeProps.searchMethod) {
    return defaultAppleTreeProps.searchMethod({
      node,
      searchQuery,
      path,
      treeIndex,
    });
  }
  return false;
}
