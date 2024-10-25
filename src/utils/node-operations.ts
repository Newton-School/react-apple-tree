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

export function calculateNodeDepth(flatNode: FlatTreeItem): number {
  if (flatNode.forcedDepth) {
    return flatNode.forcedDepth;
  }
  return flatNode.path.length;
}

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
