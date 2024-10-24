/* eslint-disable indent */
import {
  AddNodeAtDepthAndIndexFnParams,
  AddNodeAtDepthAndIndexFnReturnType,
  AddNodeUnderParentFnParams,
  AddNodeUnderParentFnReturnType,
  ChangeNodeAtPathFnParams,
  ChangeNodeAtPathFnReturnType,
  FindFnParams,
  FindFnReturnType,
  FindFnTraverseParams,
  GetDescendantCountFnParams,
  GetDescendantCountFnReturnType,
  GetFlatDataFromTreeFnParams,
  GetFlatDataFromTreeFnReturnType,
  GetNodeAtPathFnParams,
  GetNodeAtPathFnReturnType,
  GetNodeDataAtTreeIndexOrNextIndexFnParams,
  GetTreeFromFlatDataFnParams,
  GetTreeFromFlatDataFnReturnType,
  GetVisibleNodeCountFnParams,
  GetVisibleNodeCountFnReturnType,
  GetVisibleNodeInfoAtIndexFnParams,
  GetVisibleNodeInfoAtIndexFnReturnType,
  InsertNodeFnParams,
  InsertNodeFnReturnType,
  MapDescendantsFnParams,
  MapFnParams,
  MapFnReturnType,
  NodeData,
  NodeKey,
  NumberOrStringArray,
  RemoveNodeAtPathFnParams,
  RemoveNodeAtPathFnReturnType,
  RemoveNodeFnParams,
  RemoveNodeFnReturnType,
  ToggleExpandedForAllFnParams,
  ToggleExpandedForAllFnReturnType,
  TreeItem,
  TreeNode,
  WalkDescendantsFnParams,
  WalkFnParams,
  WalkFnReturnType,
} from '../types';

/**
 * Performs a depth-first traversal over all of the node descendants,
 * incrementing currentIndex by 1 for each
 */
function getNodeDataAtTreeIndexOrNextIndex<T>({
  targetIndex,
  node,
  currentIndex,
  getNodeKey,
  path = [],
  lowerSiblingCounts = [],
  ignoreCollapsed = true,
  isPseudoRoot = false,
}: GetNodeDataAtTreeIndexOrNextIndexFnParams<T>): any {
  // The pseudo-root is not considered in the path
  const selfPath = !isPseudoRoot
    ? [...path, getNodeKey({ node, treeIndex: currentIndex })]
    : [];

  // Return target node when found
  if (currentIndex === targetIndex) {
    return {
      node,
      lowerSiblingCounts,
      path: selfPath,
    };
  }

  // Add one and continue for nodes with no children or hidden children
  if (!node.children || (ignoreCollapsed && node.expanded !== true)) {
    return { nextIndex: currentIndex + 1 };
  }

  // Iterate over each child and their descendants and return the
  // target node if childIndex reaches the targetIndex
  let childIndex = currentIndex + 1;
  const childCount = node.children.length;
  for (let i = 0; i < childCount; i += 1) {
    const result = getNodeDataAtTreeIndexOrNextIndex({
      ignoreCollapsed,
      getNodeKey,
      targetIndex,
      node: node.children[i],
      currentIndex: childIndex,
      lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
      path: selfPath,
    });

    if (result.node) {
      return result;
    }

    childIndex = result.nextIndex;
  }

  // If the target node is not found, return the farthest traversed index
  return { nextIndex: childIndex };
}

/**
 * Calculates the number of descendants for a given node.
 *
 * @template T - The type of the node.
 * @param {GetDescendantCountFnParams<T>} params - The parameters for calculating the descendant count.
 * @param {TreeItem} params.node - The node for which to calculate the descendant count.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {number} - The number of descendants for the given node.
 */
export function getDescendantCount<T>({
  node,
  ignoreCollapsed = true,
}: GetDescendantCountFnParams<T>): GetDescendantCountFnReturnType {
  if (!node.children || (ignoreCollapsed && node.expanded !== true)) {
    return 0;
  }
  let count = node.children.length;
  if (!ignoreCollapsed || node.expanded) {
    node.children.forEach((child) => {
      count += getDescendantCount({ node: child, ignoreCollapsed });
    });
  }
  return count;
}

/**
 * Calculates the count of visible nodes in a tree data structure.
 *
 * @template T - The type of the tree node.
 * @param {GetVisibleNodeCountFnParams<T>} params - The parameters for calculating the visible node count.
 * @param {Array<TreeItem<T>>} params.treeData - The array representing tree data.
 * @returns {GetDescendantCountFnReturnType} - The count of visible nodes in the tree.
 */
export function getVisibleNodeCount<T>({
  treeData,
}: GetVisibleNodeCountFnParams<T>): GetVisibleNodeCountFnReturnType {
  function traverse(node: TreeItem<T>): number {
    if (
      !node.children ||
      node.expanded !== true ||
      typeof node.children === 'function'
    ) {
      return 1;
    }

    return (
      1 +
      node.children.reduce(
        (total, currentNode) => total + traverse(currentNode),
        0,
      )
    );
  }

  return treeData.reduce(
    (total, currentNode) => total + traverse(currentNode),
    0,
  );
}

/**
 * Retrieves information about a visible node at a specific index in the tree.
 *
 * @template T - The type of the tree node.
 * @param {GetVisibleNodeInfoAtIndexFnParams<T>} params - The parameters for retrieving the visible node information.
 * @param {T[]} params.treeData - The array of tree data.
 * @param {number} params.index - The index of the target node.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - The function to get the unique key of a tree node.
 * @returns {GetVisibleNodeInfoAtIndexFnReturnType<T> | null} - The information about the visible node at the specified index, or null if not found.
 */
export function getVisibleNodeInfoAtIndex<T>({
  treeData,
  index: targetIndex,
  getNodeKey,
}: GetVisibleNodeInfoAtIndexFnParams<T>): GetVisibleNodeInfoAtIndexFnReturnType<T> {
  if (!treeData || treeData.length < 1) {
    return null;
  }

  // Call the tree traversal with a pseudo-root node
  const result = getNodeDataAtTreeIndexOrNextIndex({
    targetIndex,
    getNodeKey,
    node: {
      children: treeData,
      expanded: true,
    } as TreeItem<T>,
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: [],
    isPseudoRoot: true,
  });

  if (result.node) {
    return result;
  }

  return null;
}

function walkDescendants<T>({
  callback,
  getNodeKey,
  ignoreCollapsed,
  isPseudoRoot = false,
  node,
  parentNode = null,
  currentIndex,
  path = [],
  lowerSiblingCounts = [],
}: WalkDescendantsFnParams<T>): any {
  // The pseudo-root is not considered in the path
  const selfPath = isPseudoRoot
    ? []
    : [...path, getNodeKey({ node, treeIndex: currentIndex })];
  const selfInfo = isPseudoRoot
    ? null
    : {
        node,
        parentNode,
        path: selfPath,
        lowerSiblingCounts,
        treeIndex: currentIndex,
      };

  if (!isPseudoRoot) {
    const callbackResult = callback(selfInfo);

    // Cut walk short if the callback returned false
    if (callbackResult === false) {
      return false;
    }
  }

  // Return self on nodes with no children or hidden children
  if (
    !node.children ||
    (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
  ) {
    return currentIndex;
  }

  // Get all descendants
  let childIndex: number | false = currentIndex;
  const childCount = node.children.length;
  if (typeof node.children !== 'function') {
    for (let i = 0; i < childCount; i += 1) {
      childIndex = walkDescendants({
        callback,
        getNodeKey,
        ignoreCollapsed,
        node: node.children[i],
        parentNode: isPseudoRoot ? null : node,
        currentIndex: childIndex + 1,
        lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
        path: selfPath,
      });

      // Cut walk short if the callback returned false
      if (childIndex === false) {
        return false;
      }
    }
  }

  return childIndex;
}

/**
 * Walks through the tree data and performs a callback function on each node.
 *
 * @template T - The type of the tree node.
 * @param {WalkFnParams<T>} params - The parameters for the walk function.
 * @param {Array<TreeItem>} params.treeData - The tree data to walk through.
 * @param {GetNodeKeyFn} params.getNodeKey - The function to get the key of a tree node.
 * @param {Function} params.callback - The callback function to be performed on each node.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {void} - Returns nothing.
 */
export function walk<T>({
  treeData,
  getNodeKey,
  callback,
  ignoreCollapsed = true,
}: WalkFnParams<T>): WalkFnReturnType {
  if (!treeData || treeData.length < 1) {
    return;
  }

  walkDescendants({
    callback,
    getNodeKey,
    ignoreCollapsed,
    isPseudoRoot: true,
    node: { children: treeData } as TreeItem<T>,
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: [],
  });
}

function mapDescendants<T>({
  callback,
  getNodeKey,
  ignoreCollapsed,
  isPseudoRoot = false,
  node,
  parentNode = null,
  currentIndex,
  path = [],
  lowerSiblingCounts = [],
}: MapDescendantsFnParams<T>): any {
  const nextNode = { ...node };

  // The pseudo-root is not considered in the path
  const selfPath = isPseudoRoot
    ? []
    : [...path, getNodeKey({ node: nextNode, treeIndex: currentIndex })];
  const selfInfo = {
    node: nextNode,
    parentNode,
    path: selfPath,
    lowerSiblingCounts,
    treeIndex: currentIndex,
  };

  // Return self on nodes with no children or hidden children
  if (
    !nextNode.children ||
    (nextNode.expanded !== true && ignoreCollapsed && !isPseudoRoot)
  ) {
    return {
      treeIndex: currentIndex,
      node: callback(selfInfo),
    };
  }

  // Get all descendants
  let childIndex = currentIndex;
  const childCount = nextNode.children.length;
  if (typeof nextNode.children !== 'function') {
    nextNode.children = nextNode.children.map((child, i) => {
      const mapResult = mapDescendants({
        callback,
        getNodeKey,
        ignoreCollapsed,
        node: child,
        parentNode: isPseudoRoot ? null : nextNode,
        currentIndex: childIndex + 1,
        lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
        path: selfPath,
      });
      childIndex = mapResult.treeIndex;

      return mapResult.node;
    });
  }

  return {
    node: callback(selfInfo),
    treeIndex: childIndex,
  };
}

/**
 * Maps over the tree data and returns an array of mapped values.
 *
 * @template T - The type of the tree data.
 * @param {MapFnParams<T>} params - The parameters for the map function.
 * @param {Array<TreeItem>} params.treeData - The tree data to be mapped.
 * @param {GetNodeKeyFn} params.getNodeKey - The function to get the unique key of each node.
 * @param {Function} params.callback - The callback function to be called for each node.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {Array<T>} - The array of mapped values.
 */
export function map<T>({
  treeData,
  getNodeKey,
  callback,
  ignoreCollapsed = true,
}: MapFnParams<T>): MapFnReturnType<T> {
  if (!treeData || treeData.length < 1) {
    return [];
  }

  return mapDescendants({
    callback,
    getNodeKey,
    ignoreCollapsed,
    isPseudoRoot: true,
    node: { children: treeData } as TreeItem<T>,
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: [],
  }).node.children;
}

/**
 * Toggles the expanded state for all nodes in the tree data.
 *
 * @template T - The type of the tree data nodes.
 * @param {ToggleExpandedForAllFnParams<T>} params - The parameters for toggling the expanded state.
 * @param {Array<TreeItem>} params.treeData - The tree data containing the nodes.
 * @param {boolean} [params.expanded=true] - The desired expanded state. Defaults to `true`.
 * @returns {ToggleExpandedForAllFnReturnType} - The updated tree data with the expanded state toggled.
 */
export function toggleExpandedForAll<T>({
  treeData,
  expanded = true,
}: ToggleExpandedForAllFnParams<T>): ToggleExpandedForAllFnReturnType<T> {
  return map({
    treeData,
    callback: ({ node }) => ({ ...node, expanded }),
    getNodeKey: ({ treeIndex }) => treeIndex,
    ignoreCollapsed: false,
  });
}

/**
 * Changes a node at a specific path in a tree data structure.
 *
 * @template T - The type of the node.
 * @param {ChangeNodeAtPathFnParams<T>} options - The options for changing the node.
 * @param {Array<TreeItem>} options.treeData - The tree data structure.
 * @param {NumberOrStringArray} options.path - The path to the node.
 * @param {TreeItem | ((params: { node: TreeItem, treeIndex: number }) => TreeItem)} options.newNode - The new node or a function that returns the new node.
 * @param {GetNodeKeyFn} options.getNodeKey - The function to get the key of a node.
 * @param {boolean} [options.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {Array<TreeItem>} - The updated tree data structure.
 * @throws {Error} - If the path references children of a node with no children or if no node is found at the given path.
 */
export function changeNodeAtPath<T>({
  treeData,
  path,
  newNode,
  getNodeKey,
  ignoreCollapsed = true,
}: ChangeNodeAtPathFnParams<T>): ChangeNodeAtPathFnReturnType<T> {
  const RESULT_MISS = 'RESULT_MISS';
  const traverse = ({
    isPseudoRoot = false,
    node,
    currentTreeIndex,
    pathIndex,
  }: any): any => {
    if (
      !isPseudoRoot &&
      getNodeKey({ node, treeIndex: currentTreeIndex }) !== path[pathIndex]
    ) {
      return RESULT_MISS;
    }

    if (pathIndex >= path.length - 1) {
      // If this is the final location in the path, return its changed form
      return typeof newNode === 'function'
        ? newNode({ node, treeIndex: currentTreeIndex })
        : newNode;
    }
    if (!node.children) {
      // If this node is part of the path, but has no children, return the unchanged node
      throw new Error('Path referenced children of node with no children.');
    }

    let nextTreeIndex = currentTreeIndex + 1;
    for (let i = 0; i < node.children.length; i += 1) {
      const result = traverse({
        node: node.children[i],
        currentTreeIndex: nextTreeIndex,
        pathIndex: pathIndex + 1,
      });

      // If the result went down the correct path
      if (result !== RESULT_MISS) {
        if (result) {
          // If the result was truthy (in this case, an object),
          //  pass it to the next level of recursion up
          return {
            ...node,
            children: [
              ...node.children.slice(0, i),
              result,
              ...node.children.slice(i + 1),
            ],
          };
        }
        // If the result was falsy (returned from the newNode function), then
        //  delete the node from the array.
        return {
          ...node,
          children: [
            ...node.children.slice(0, i),
            ...node.children.slice(i + 1),
          ],
        };
      }

      nextTreeIndex +=
        1 + getDescendantCount({ node: node.children[i], ignoreCollapsed });
    }

    return RESULT_MISS;
  };

  // Use a pseudo-root node in the beginning traversal
  const result = traverse({
    node: { children: treeData },
    currentTreeIndex: -1,
    pathIndex: -1,
    isPseudoRoot: true,
  });

  if (result === RESULT_MISS) {
    throw new Error('No node found at the given path.');
  }

  return result.children;
}

/**
 * Removes a node at the specified path in the tree data.
 *
 * @template T - The type of the tree data.
 * @param {RemoveNodeAtPathFnParams<T>} params - The parameters for removing a node.
 * @param {Array<TreeItem<T>>} params.treeData - The tree data.
 * @param {NumberOrStringArray} params.path - The path to the node to be removed.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - The function to get the key of a node.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {RemoveNodeAtPathFnReturnType<T>} - The updated tree data after removing the node.
 */
export function removeNodeAtPath<T>({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true,
}: RemoveNodeAtPathFnParams<T>): RemoveNodeAtPathFnReturnType<T> {
  return changeNodeAtPath({
    treeData,
    path,
    getNodeKey,
    ignoreCollapsed,
    newNode: null,
  });
}

/**
 * Removes a node from the tree data and return information about new treedata and removed node.
 *
 * @template T - The type of the tree node.
 * @param {RemoveNodeFnParams<T>} params - The parameters for removing the node.
 * @param {Array<TreeItem<T>>} params.treeData - The tree data.
 * @param {NumberOrStringArray} params.path - The path to the node to be removed.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - The function to get the key of a node.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {RemoveNodeFnReturnType<T>} - The result of removing the node.
 * @property {Array<TreeItem<T>>} treeData - The updated tree data after removing the node.
 * @property {TreeItem<T>} node - The removed node.
 * @property {number} treeIndex - The index of the removed node in the tree.
 */
export function removeNode<T>({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true,
}: RemoveNodeFnParams<T>): RemoveNodeFnReturnType<T> {
  let removedNode = null;
  let removedTreeIndex = null;
  const nextTreeData = changeNodeAtPath({
    treeData,
    path,
    getNodeKey,
    ignoreCollapsed,
    newNode: ({ node, treeIndex }) => {
      removedNode = node;
      removedTreeIndex = treeIndex;
      return null;
    },
  });

  return {
    treeData: nextTreeData,
    node: removedNode,
    treeIndex: removedTreeIndex,
  };
}

/**
 * Retrieves the node at the specified path in the tree data.
 *
 * @template T - The type of the tree node.
 * @param {GetNodeAtPathFnParams<T>} params - The parameters for retrieving the node.
 * @param {NumberOrStringArray} params.path - The path to the node in the tree data.
 * @param {Array<TreeItem<T>>} params.treeData - The tree data.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - The function to get the key of a node.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {NodeData<T> | null} - The found node information or null if not found.
 */
export function getNodeAtPath<T>({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true,
}: GetNodeAtPathFnParams<T>): GetNodeAtPathFnReturnType<T> {
  let foundNodeInfo = null;

  try {
    changeNodeAtPath({
      treeData,
      path,
      getNodeKey,
      ignoreCollapsed,
      newNode: ({ node, treeIndex }) => {
        foundNodeInfo = { node, treeIndex };
        return node;
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return null;
  }

  return foundNodeInfo;
}

/**
 * Adds a new node under a parent node in a tree data.
 *
 * @template T - The type of the tree node.
 * @param {AddNodeUnderParentFnParams<T>} params - The parameters for adding the node.
 * @param {Array<TreeItem<T>>} params.treeData - The array representing the tree data.
 * @param {TreeItem<T>} params.newNode - The new node to be added.
 * @param {NumberOrStringArray} [params.parentKey=null] - The key of the parent node. If null, the new node will be added as the root node.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - The function to get the key of a node.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @param {boolean} [params.expandParent=false] - Whether to expand the parent node after adding the new node.
 * @param {boolean} [params.addAsFirstChild=false] - Whether to add the new node as the first child of the parent node.
 * @returns {AddNodeUnderParentFnReturnType<T>} - The updated tree data and the index of the inserted node.
 * @throws {Error} - If no node is found with the given parent key.
 * @throws {Error} - If trying to add to children defined by a function.
 */
export function addNodeUnderParent<T>({
  treeData,
  newNode,
  parentKey = null,
  getNodeKey,
  ignoreCollapsed = true,
  expandParent = false,
  addAsFirstChild = false,
}: AddNodeUnderParentFnParams<T>): AddNodeUnderParentFnReturnType<T> {
  if (parentKey === null) {
    return addAsFirstChild
      ? {
          treeData: [newNode, ...(treeData || [])],
          treeIndex: 0,
        }
      : {
          treeData: [...(treeData || []), newNode],
          treeIndex: (treeData || []).length,
        };
  }

  let insertedTreeIndex = null;
  let hasBeenAdded = false;
  const changedTreeData = map({
    treeData,
    getNodeKey,
    ignoreCollapsed,
    callback: ({ node, treeIndex, path }) => {
      const key = path ? path[path.length - 1] : null;
      // Return nodes that are not the parent as-is
      if (hasBeenAdded || key !== parentKey) {
        return node;
      }
      hasBeenAdded = true;

      const parentNode = {
        ...node,
      };

      if (expandParent) {
        parentNode.expanded = true;
      }

      // If no children exist yet, just add the single newNode
      if (!parentNode.children) {
        insertedTreeIndex = treeIndex + 1;
        return {
          ...parentNode,
          children: [newNode],
        };
      }

      if (typeof parentNode.children === 'function') {
        throw new Error('Cannot add to children defined by a function');
      }

      let nextTreeIndex = treeIndex + 1;
      for (let i = 0; i < parentNode.children.length; i += 1) {
        nextTreeIndex +=
          1 +
          getDescendantCount({ node: parentNode.children[i], ignoreCollapsed });
      }

      insertedTreeIndex = nextTreeIndex;

      const children = addAsFirstChild
        ? [newNode, ...parentNode.children]
        : [...parentNode.children, newNode];

      return {
        ...parentNode,
        children,
      };
    },
  });

  if (!hasBeenAdded) {
    throw new Error('No node found with the given key.');
  }

  return {
    treeData: changedTreeData,
    treeIndex: insertedTreeIndex,
  };
}

function addNodeAtDepthAndIndex<T>({
  targetDepth,
  minimumTreeIndex,
  newNode,
  ignoreCollapsed,
  expandParent,
  isPseudoRoot = false,
  isLastChild,
  node,
  currentIndex,
  currentDepth,
  getNodeKey,
  path = [],
}: AddNodeAtDepthAndIndexFnParams<T>): AddNodeAtDepthAndIndexFnReturnType<T> {
  const selfPath = (node: TreeItem<T>) =>
    isPseudoRoot
      ? []
      : [...path, getNodeKey({ node, treeIndex: currentIndex })];

  // If the current position is the only possible place to add, add it
  if (
    currentIndex >= minimumTreeIndex - 1 ||
    (isLastChild && !(node.children && node.children.length))
  ) {
    if (typeof node.children === 'function') {
      throw new Error('Cannot add to children defined by a function');
    } else {
      const extraNodeProps = expandParent ? { expanded: true } : {};
      const nextNode = {
        ...node,
        ...extraNodeProps,
        children: node.children ? [newNode, ...node.children] : [newNode],
      };

      return {
        node: nextNode,
        nextIndex: currentIndex + 2,
        insertedTreeIndex: currentIndex + 1,
        parentPath: selfPath(nextNode),
        parentNode: isPseudoRoot ? null : nextNode,
      };
    }
  }

  // If this is the target depth for the insertion,
  // i.e., where the newNode can be added to the current node's children
  if (currentDepth >= targetDepth - 1) {
    // Skip over nodes with no children or hidden children
    if (
      !node.children ||
      typeof node.children === 'function' ||
      (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
    ) {
      return { node, nextIndex: currentIndex + 1 };
    }

    // Scan over the children to see if there's a place among them that fulfills
    // the minimumTreeIndex requirement
    let childIndex = currentIndex + 1;
    let insertedTreeIndex = null;
    let insertIndex = null;
    for (let i = 0; i < node.children.length; i += 1) {
      // If a valid location is found, mark it as the insertion location and
      // break out of the loop
      if (childIndex >= minimumTreeIndex) {
        insertedTreeIndex = childIndex;
        insertIndex = i;
        break;
      }

      // Increment the index by the child itself plus the number of descendants it has
      childIndex +=
        1 + getDescendantCount({ node: node.children[i], ignoreCollapsed });
    }

    // If no valid indices to add the node were found
    if (insertIndex === null) {
      // If the last position in this node's children is less than the minimum index
      // and there are more children on the level of this node, return without insertion
      if (childIndex < minimumTreeIndex && !isLastChild) {
        return { node, nextIndex: childIndex };
      }

      // Use the last position in the children array to insert the newNode
      insertedTreeIndex = childIndex;
      insertIndex = node.children.length;
    }

    // Insert the newNode at the insertIndex
    const nextNode = {
      ...node,
      children: [
        ...node.children.slice(0, insertIndex),
        newNode,
        ...node.children.slice(insertIndex),
      ],
    };

    // Return node with successful insert result
    return {
      node: nextNode,
      nextIndex: childIndex,
      insertedTreeIndex,
      parentPath: selfPath(nextNode),
      parentNode: isPseudoRoot ? null : nextNode,
    };
  }

  // Skip over nodes with no children or hidden children
  if (
    !node.children ||
    typeof node.children === 'function' ||
    (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
  ) {
    return { node, nextIndex: currentIndex + 1 };
  }

  // Get all descendants
  let insertedTreeIndex: number | null | undefined = null;
  let pathFragment: NumberOrStringArray | null | undefined = null;
  let parentNode = null;
  let childIndex = currentIndex + 1;
  let newChildren = node.children;
  if (typeof newChildren !== 'function') {
    newChildren = newChildren.map((child, i) => {
      if (insertedTreeIndex !== null) {
        return child;
      }

      const mapResult = addNodeAtDepthAndIndex({
        targetDepth,
        minimumTreeIndex,
        newNode,
        ignoreCollapsed,
        expandParent,
        isLastChild: isLastChild && i === newChildren.length - 1,
        node: child,
        currentIndex: childIndex,
        currentDepth: currentDepth + 1,
        getNodeKey,
        path: [], // Cannot determine the parent path until the children have been processed
      });

      if ('insertedTreeIndex' in mapResult) {
        ({
          insertedTreeIndex,
          parentNode,
          parentPath: pathFragment,
        } = mapResult);
      }

      childIndex = mapResult.nextIndex;

      return mapResult.node;
    });
  }

  const nextNode = { ...node, children: newChildren };
  const result: AddNodeAtDepthAndIndexFnReturnType<T> = {
    node: nextNode,
    nextIndex: childIndex,
  };

  if (insertedTreeIndex !== null) {
    result.insertedTreeIndex = insertedTreeIndex;
    result.parentPath = [...selfPath(nextNode), ...(pathFragment || [])];
    result.parentNode = parentNode;
  }

  return result;
}

/**
 * Inserts a node into a tree data at the given depth, after the minimum index.
 *
 * @template T - The type of the tree node.
 * @param {InsertNodeFnParams<T>} params - The parameters for inserting the node.
 * @param {Array<TreeItem<T>>} params.treeData - The array representing the tree data.
 * @param {number} params.depth - The depth at which to insert the node.
 * @param {number} params.minimumTreeIndex - The minimum tree index.
 * @param {TreeItem<T>} params.newNode - The new node to be inserted.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - The function to get the key of a node.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @param {boolean} [params.expandParent=false] - Whether to expand the parent node.
 * @returns {InsertNodeFnReturnType<T>} - The result of inserting the node.
 */
export function insertNode<T>({
  treeData,
  depth: targetDepth,
  minimumTreeIndex,
  newNode,
  getNodeKey,
  ignoreCollapsed = true,
  expandParent = false,
}: InsertNodeFnParams<T>): InsertNodeFnReturnType<T> {
  if (!treeData && targetDepth === 0) {
    return {
      treeData: [newNode],
      treeIndex: 0,
      path: [getNodeKey({ node: newNode, treeIndex: 0 })],
      parentNode: null,
    };
  }

  const insertResult = addNodeAtDepthAndIndex({
    targetDepth,
    minimumTreeIndex,
    newNode,
    ignoreCollapsed,
    expandParent,
    getNodeKey,
    isPseudoRoot: true,
    isLastChild: true,
    node: { children: treeData } as TreeItem<T>,
    currentIndex: -1,
    currentDepth: -1,
  });

  if (!('insertedTreeIndex' in insertResult)) {
    throw new Error('No suitable position found to insert.');
  }

  const treeIndex = insertResult.insertedTreeIndex;
  return {
    treeData: insertResult.node.children,
    treeIndex,
    path: [
      ...(insertResult.parentPath || []),
      getNodeKey({ node: newNode, treeIndex: treeIndex || -1 }),
    ],
    parentNode: insertResult.parentNode,
  };
}

/**
 * Get tree data flattened.
 *
 * @template T - The type of data stored in the tree nodes.
 * @param {GetFlatDataFromTreeFnParams<T>} params - The parameters for retrieving flat data from the tree.
 * @param {Array<TreeItem<T>>} params.treeData - The tree data to retrieve flat data from.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - The function to get the unique key of each node in the tree.
 * @param {boolean} [params.ignoreCollapsed=true] - Whether to ignore collapsed nodes.
 * @returns {GetFlatDataFromTreeFnReturnType<T>} - The flat data retrieved from the tree.
 */
export function getFlatDataFromTree<T>({
  treeData,
  getNodeKey,
  ignoreCollapsed = true,
}: GetFlatDataFromTreeFnParams<T>): GetFlatDataFromTreeFnReturnType<T> {
  if (!treeData || treeData.length < 1) {
    return [];
  }

  const flattened: Array<TreeNode<T>> = [];
  walk({
    treeData,
    getNodeKey,
    ignoreCollapsed,
    callback: (nodeInfo) => {
      flattened.push(nodeInfo);
    },
  });

  return flattened;
}

/**
 * Converts flat data into a tree structure.
 *
 * @template T - The type of the data in the tree.
 * @param {GetTreeFromFlatDataFnParams<T>} params - The parameters for converting the flat data into a tree.
 * @param {Array<TreeItem<T>>} options.flatData - The flat data to be converted.
 * @param {GetFlatNodeKeyFn} [options.getKey] - The function to get the key of a node. Defaults to using the `id` property of the node.
 * @param {GetFlatNodeKeyFn} [options.getParentKey] - The function to get the parent key of a node. Defaults to using the `parentId` property of the node.
 * @param {NodeKey} [options.rootKey="0"] - The root key of the tree. Defaults to "0".
 * @returns {GetTreeFromFlatDataFnReturnType<T>} - The tree structure generated from the flat data.
 */
export function getTreeFromFlatData<T>({
  flatData,
  getKey = (node) => node.id,
  getParentKey = (node) => node.parentId,
  rootKey = '0',
}: GetTreeFromFlatDataFnParams<T>): GetTreeFromFlatDataFnReturnType<T> {
  if (!flatData) {
    return [];
  }

  const childrenToParents: Record<NodeKey, Array<TreeItem<T>>> = {};
  flatData.forEach((child) => {
    const parentKey = getParentKey(child);

    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child);
    } else {
      childrenToParents[parentKey] = [child];
    }
  });

  if (rootKey !== null && !(rootKey in childrenToParents)) {
    return [];
  }

  const trav = (parent: TreeItem<T>): TreeItem<T> => {
    const parentKey = getKey(parent);
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map((child) => trav(child)),
      };
    }

    return { ...parent };
  };

  return childrenToParents[rootKey].map((child) => trav(child));
}

/**
 * Checks if a tree item is a descendant of another tree item.
 *
 * @template T - The type of the data in the tree.
 * @param older - Potential ancestor of younger node
 * @param younger - Potential descendant of older node
 * @returns A boolean indicating whether the younger tree item is a descendant of the older tree item.
 */
export function isDescendant<T>(
  older: TreeItem<T>,
  younger: TreeItem<T>,
): boolean {
  return (
    !!older.children &&
    typeof older.children !== 'function' &&
    older.children.some(
      (child) => child === younger || isDescendant(child, younger),
    )
  );
}

/**
 * Get the maximum depth of the children (the depth of the root node is 0).
 *
 * @template T - The type of the data in the tree.
 * @param {TreeItem<T>} node - Node in the tree
 * @param {?number} depth - The current depth
 *
 * @returns {number} maxDepth - The deepest depth in the tree
 */
export function getDepth<T>(node: TreeItem<T>, depth: number = 0): number {
  if (!node.children) {
    return depth;
  }

  if (typeof node.children === 'function') {
    return depth + 1;
  }

  return node.children.reduce(
    (deepest, child) => Math.max(deepest, getDepth(child, depth + 1)),
    depth,
  );
}

/**
 * Find nodes matching a search query in the tree,
 *
 * @template T - The type of the data in the tree.
 * @param {FindFnParams<T>} params - The parameters for finding nodes in the tree.
 * @param {GetNodeKeyFn<T>} params.getNodeKey - Function to get the key from the nodeData and tree index
 * @param {Array<TreeItem<T>>} params.treeData - Tree data
 * @param {SearchQuery} params.searchQuery - Function returning a boolean to indicate whether the node is a match or not
 * @param {SearchMethodFn} params.searchMethod - Function returning a boolean to indicate whether the node is a match or not
 * @param {SearchFocusOffset}params.searchFocusOffset - The offset of the match to focus on
 *                                      (e.g., 0 focuses on the first match, 1 on the second)
 * @param {boolean} [params.expandAllMatchPaths=false] - If true, expands the paths to any matched node
 * @param {boolean} [params.expandFocusMatchPaths=true] - If true, expands the path to the focused node
 *
 * @return {Array<NodeData<T>>} matches - An array of objects containing the matching `node`s, their `path`s and `treeIndex`s
 * @return {Array<TreeItem<T>>} treeData - The original tree data with all relevant nodes expanded.
 */
export function find<T>({
  getNodeKey,
  treeData,
  searchQuery,
  searchMethod,
  searchFocusOffset,
  expandAllMatchPaths = false,
  expandFocusMatchPaths = true,
}: FindFnParams<T>): FindFnReturnType<T> {
  let matchCount = 0;
  const trav = ({
    isPseudoRoot = false,
    node,
    currentIndex,
    path = [],
  }: FindFnTraverseParams<T>) => {
    let matches: Array<NodeData<T>> = [];
    let isSelfMatch = false;
    let hasFocusMatch = false;
    // The pseudo-root is not considered in the path
    const selfPath = isPseudoRoot
      ? []
      : [...path, getNodeKey({ node, treeIndex: currentIndex })];
    const extraInfo = isPseudoRoot
      ? null
      : {
          path: selfPath,
          treeIndex: currentIndex,
        };

    // Nodes with children that aren't lazy
    const hasChildren =
      node.children &&
      typeof node.children !== 'function' &&
      node.children.length > 0;

    // Examine the current node to see if it is a match
    if (
      !isPseudoRoot &&
      searchMethod({ path: [], treeIndex: -1, node, searchQuery, ...extraInfo })
    ) {
      if (matchCount === searchFocusOffset) {
        hasFocusMatch = true;
      }

      // Keep track of the number of matching nodes, so we know when the searchFocusOffset
      //  is reached
      matchCount += 1;

      // We cannot add this node to the matches right away, as it may be changed
      //  during the search of the descendants. The entire node is used in
      //  comparisons between nodes inside the `matches` and `treeData` results
      //  of this method (`find`)
      isSelfMatch = true;
    }

    let childIndex = currentIndex;
    const newNode = { ...node };
    if (hasChildren) {
      // Get all descendants
      newNode.children = newNode.children?.map((child) => {
        const mapResult = trav({
          node: child,
          currentIndex: childIndex + 1,
          path: selfPath,
        });

        // Ignore hidden nodes by only advancing the index counter to the returned treeIndex
        // if the child is expanded.
        //
        // The child could have been expanded from the start,
        // or expanded due to a matching node being found in its descendants
        if (mapResult.node.expanded) {
          childIndex = mapResult.treeIndex;
        } else {
          childIndex += 1;
        }

        if (mapResult.matches.length > 0 || mapResult.hasFocusMatch) {
          matches = [...matches, ...mapResult.matches];
          if (mapResult.hasFocusMatch) {
            hasFocusMatch = true;
          }

          // Expand the current node if it has descendants matching the search
          // and the settings are set to do so.
          if (
            (expandAllMatchPaths && mapResult.matches.length > 0) ||
            ((expandAllMatchPaths || expandFocusMatchPaths) &&
              mapResult.hasFocusMatch)
          ) {
            newNode.expanded = true;
          }
        }

        return mapResult.node;
      });
    }

    // Cannot assign a treeIndex to hidden nodes
    if (!isPseudoRoot && !newNode.expanded) {
      matches = matches.map((match) => ({
        ...match,
        treeIndex: -1,
      }));
    }

    // Add this node to the matches if it fits the search criteria.
    // This is performed at the last minute so newNode can be sent in its final form.
    if (isSelfMatch) {
      matches = [
        { path: [], treeIndex: -1, node: newNode, ...extraInfo },
        ...matches,
      ];
    }

    return {
      node: matches.length > 0 ? newNode : node,
      matches,
      hasFocusMatch,
      treeIndex: childIndex,
    };
  };

  const result = trav({
    node: { children: treeData } as TreeItem<T>,
    isPseudoRoot: true,
    currentIndex: -1,
  });

  return {
    matches: result.matches,
    treeData: result.node.children || [],
  };
}
