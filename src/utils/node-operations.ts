import {
  FlatTreeItem,
  GetNodeKeyFn,
  NodeKey,
  NumberOrStringArray,
  TreeItem,
  TreeMap,
} from '../types';
import {
  insertItemsIntoArrayAtGivenIndex,
  removeItemAtGivenIndexFromArray,
} from './common';

/**
 * Calculates the depth of a node in the tree.
 *
 * @param {FlatTreeItem} flatNode - The node for which to calculate the depth.
 * @returns {number} The depth of the node. If the node has a forced depth, that value is returned.
 *                   Otherwise, the depth is determined by the length of the node's path.
 */
export function calculateNodeDepth(flatNode: FlatTreeItem): number {
  if (flatNode.forcedDepth) {
    return flatNode.forcedDepth;
  }
  return flatNode.path.length;
}

/**
 * Flattens a tree structure into a map and an array of flat tree items.
 *
 * @template T - The type of the tree item data.
 * @param {Array<TreeItem<T>>} treeData - The tree data to flatten.
 * @param {GetNodeKeyFn<T>} getNodeKey - Function to get the unique key for a node.
 * @param {NumberOrStringArray} [initialPath=[]] - The initial path for the root nodes.
 * @param {NodeKey | null} [parentKey=null] - The key of the parent node, if any.
 * @returns {[TreeMap, Array<FlatTreeItem>]} - A tuple containing the map of nodes and the array of flattened tree items.
 */
export function flattenTreeData<T>(
  treeData: Array<TreeItem<T>>,
  getNodeKey: GetNodeKeyFn<T>,
  initialPath: NumberOrStringArray = [],
  parentKey: NodeKey | null = null,
): [TreeMap, Array<FlatTreeItem>] {
  const flattenedArray: Array<FlatTreeItem> = [];
  const map: TreeMap = {};

  const flattenNode = (
    node: TreeItem<T>,
    parentKey: NodeKey | null,
    path: NumberOrStringArray = [],
    addToRenderList: boolean = true,
  ): void => {
    const mapId = getNodeKey({ node, treeIndex: -1 });
    map[mapId] = node;
    if (addToRenderList) {
      flattenedArray.push({ mapId, path: [...path, mapId], parentKey });
    }

    (node.children || []).forEach((child) =>
      flattenNode(child, mapId, [...path, mapId], !!node.expanded),
    );
  };

  treeData.forEach((node) => flattenNode(node, parentKey, initialPath));

  return [map, flattenedArray];
}

/**
 * Expands a node in the tree structure.
 *
 * @template T - The type of the tree item.
 * @param {NodeKey} nodeKey - The key of the node to expand.
 * @param {TreeItem<T>} node - The tree item to expand.
 * @param {TreeMap} treeMap - The current tree map.
 * @param {Array<FlatTreeItem>} flatTree - The current flattened list for tree items.
 * @param {GetNodeKeyFn<T>} getNodeKey - Function to get the key of a node.
 * @returns {[TreeMap, Array<FlatTreeItem>]} - The updated tree map and flattened list.
 */
export function expandNode<T>(
  nodeKey: NodeKey,
  node: TreeItem<T>,
  treeMap: TreeMap,
  flatTree: Array<FlatTreeItem>,
  getNodeKey: GetNodeKeyFn<T>,
): [TreeMap, Array<FlatTreeItem>] {
  const idx = flatTree.findIndex((el) => el.mapId === nodeKey);
  if (idx !== -1 && !node.expanded) {
    node.expanded = true;
    const [map, flatArray] = flattenTreeData(
      [node],
      getNodeKey,
      flatTree[idx].path.slice(0, -1),
      flatTree[idx].parentKey,
    );
    treeMap = { ...treeMap, ...map };
    flatTree = [
      ...flatTree.slice(0, idx),
      ...flatArray,
      ...flatTree.slice(idx + 1),
    ];
  }
  return [treeMap, flatTree];
}

/**
 * Collapses a node in the tree, updating the tree map and flat tree structure.
 *
 * @template T - The type of the tree item data.
 * @param {NodeKey} nodeKey - The key of the node to collapse.
 * @param {TreeItem<T>} node - The tree item to collapse.
 * @param {TreeMap} treeMap - The map of all tree items.
 * @param {Array<FlatTreeItem>} flatTree - The flat array representation of the tree.
 * @returns {Array<FlatTreeItem>} - The updated flat tree array with the node collapsed.
 */
export function collapseNode<T>(
  nodeKey: NodeKey,
  node: TreeItem<T>,
  treeMap: TreeMap,
  flatTree: Array<FlatTreeItem>,
): Array<FlatTreeItem> {
  const idx = flatTree.findIndex((el) => el.mapId === nodeKey);
  if (idx !== -1 && node.expanded) {
    node.expanded = false;
    const nodeData = flatTree[idx];
    const start = idx;
    let end = idx + 1;
    while (end < flatTree.length) {
      const child = flatTree[end];
      if (calculateNodeDepth(child) > calculateNodeDepth(nodeData)) {
        treeMap[child.mapId].expanded = false;
        end += 1;
      } else {
        break;
      }
    }
    flatTree = [...flatTree.slice(0, start + 1), ...flatTree.slice(end)];
  }
  return flatTree;
}

/**
 * Collapses the tree structure into a flat array of tree items.
 *
 * @template T - The type of the tree item data.
 * @param {Array<TreeItem<T>>} treeData - The array of tree items representing the tree structure.
 * @param {TreeMap} treeMap - A map of tree nodes for quick lookup.
 * @param {Array<FlatTreeItem>} flatTree - The array to store the flattened tree items.
 * @param {GetNodeKeyFn<T>} getNodeKey - A function to get the unique key for a tree node.
 * @returns {Array<FlatTreeItem>} - The flattened array of tree items.
 */
export function collapseTree<T>(
  treeData: Array<TreeItem<T>>,
  treeMap: TreeMap,
  flatTree: Array<FlatTreeItem>,
  getNodeKey: GetNodeKeyFn<T>,
): Array<FlatTreeItem> {
  treeData.forEach((node) => {
    if (node.expanded) {
      flatTree = collapseNode(
        getNodeKey({ node, treeIndex: -1 }),
        node,
        treeMap,
        flatTree,
      );
    }
  });
  return flatTree;
}

/**
 * Retrieves the parent key and sibling count for a node in a flat tree structure.
 *
 * @param {Array<FlatTreeItem>} flatTree - An array representing the flat tree structure.
 * @param {number} nodeIndex - The index of the node in the flat tree for which the parent key and sibling count are to be determined.
 * @returns {[NodeKey | null, number]} A tuple where the first element is the parent key (or null if no parent exists) and the second element is the sibling count.
 */
export function getParentKeyAndSiblingCountFromList(
  flatTree: Array<FlatTreeItem>,
  nodeIndex: number,
): [NodeKey | null, number] {
  const flatNode = flatTree[nodeIndex];
  const nodeDepth = calculateNodeDepth(flatNode);

  let parentKey: NodeKey | null = null;
  let siblingCount = 0;

  let start = nodeIndex - 1;
  while (start >= 0) {
    const sibling = flatTree[start];
    if (calculateNodeDepth(sibling) === nodeDepth) {
      siblingCount += 1;
    } else if (calculateNodeDepth(sibling) < nodeDepth) {
      parentKey = sibling.mapId;
      break;
    }
    start -= 1;
  }
  if (start === -1) {
    parentKey = null;
  }
  return [parentKey, siblingCount];
}

/**
 * Moves a node from one parent to another within a tree structure.
 *
 * @param {Array<TreeItem>} treeData - The array representing the tree data.
 * @param {TreeMap} treeMap - A map of all nodes in the tree, keyed by node key.
 * @param {NodeKey} nodeKey - The key of the node to be moved.
 * @param {NodeKey | null} prevParentKey - The key of the previous parent node. If null, the node is at the root level.
 * @param {NodeKey | null} nextParentKey - The key of the next parent node. If null, the node will be moved to the root level.
 * @param {number} siblingIndex - The index at which the node should be inserted among the next parent's children.
 * @param {GetNodeKeyFn} getNodeKey - A function to get the key of a node.
 * @returns {Array<TreeItem>} The updated tree data array.
 */
export function moveNodeToDifferentParent(
  treeData: Array<TreeItem>,
  treeMap: TreeMap,
  nodeKey: NodeKey,
  prevParentKey: NodeKey | null,
  nextParentKey: NodeKey | null,
  siblingIndex: number,
  getNodeKey: GetNodeKeyFn,
): Array<TreeItem> {
  const treeNode = treeMap[nodeKey];

  // Removing given node from previous parent
  const prevParent = prevParentKey ? treeMap[prevParentKey] : null;
  let prevChildren = prevParent ? prevParent.children || [] : treeData;
  const idx = prevChildren.findIndex(
    (node) => nodeKey === getNodeKey({ node, treeIndex: -1 }),
  );
  prevChildren = removeItemAtGivenIndexFromArray(prevChildren, idx);
  if (prevParent) {
    prevParent.children = prevChildren;
  } else {
    treeData = prevChildren;
  }

  // Appendig to next parent
  const nextParent = nextParentKey ? treeMap[nextParentKey] : null;
  let nextChildren: Array<TreeItem> = nextParent
    ? nextParent.children || []
    : treeData;
  nextChildren = insertItemsIntoArrayAtGivenIndex(
    nextChildren,
    siblingIndex,
    treeNode,
  );
  if (nextParent) {
    nextParent.children = nextChildren;
  } else {
    treeData = nextChildren;
  }

  return treeData;
}
