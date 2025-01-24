import { NodeKey, SearchData, TreeIndex } from '../types';
import { defaultAppleTreeProps } from './default-props';

/**
 * Retrieves the key for a node in the tree.
 *
 * @param {Object} data - An object containing the tree index.
 * @property {TreeIndex} data.treeIndex - The index of the node in the tree.
 * @returns The key of the node, which is the tree index.
 */
export function defaultGetNodeKey({ treeIndex }: TreeIndex): NodeKey {
  return treeIndex;
}

/**
 * Default search method for the nodes.
 *
 * @param {Object} params - The parameters for the search method.
 * @property {TreeItem} params.node - The current node being searched.
 * @property {NumberOrStringArray} params.path - The path to the current node.
 * @property {TreeIndex} params.treeIndex - The index of the current node in the tree.
 * @property {string} params.searchQuery - The search query string.
 * @returns {boolean} - Returns true if the node matches the search query, otherwise false.
 */
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
