import {
  DraggingNodeInformation,
  DropZoneInformation,
  NodeAppendDirection,
  OnHoverNodeProps,
} from '../contexts/DNDContextTypes';
import {
  CanNodeHaveChildrenFn,
  FlatTreeItem,
  GetNodeKeyFn,
  NodeData,
  NodeKey,
  NumberOrStringArray,
  OnDragPreviousAndNextLocation,
  TreeItem,
  TreeMap,
} from '../types';
import {
  insertItemsIntoArrayAtGivenIndex,
  removeItemAtGivenIndexFromArray,
} from './common';
import { calculateNodeDepth, expandNode } from './node-operations';
import { runCanNodeHaveChildren } from './prop-utils';

/**
 * Calculates the temporary drop index based on the hover node parameters.
 * - This drop index is the index where the visual dropzone should be created.
 * - Actual drop location might be different based on nodes's siblings.
 *
 * @param {OnHoverNodeProps} onHoverNodeParams - The parameters related to the node being hovered over.
 * @returns {number} The calculated temporary drop index.
 */
export function calculateTempDropIndex(
  onHoverNodeParams: OnHoverNodeProps,
): number {
  let tmpDropIndex = onHoverNodeParams.nodeIndex;
  if (onHoverNodeParams.direction === NodeAppendDirection.Below) {
    tmpDropIndex += 1;
  }
  return tmpDropIndex;
}

/**
 * Removes the dragging node from the flat list if it exists.
 * Also adjusts the drop index in the new flat tree list.
 *
 * @param {number} dropIndex - The index where the node is being dropped.
 * @param {FlatTreeItem[]} flatList - The list of flat tree items.
 * @param {DraggingNodeInformation} draggingNodeInformation - Information about the node being dragged.
 * @returns {[number, FlatTreeItem[]]} A tuple containing the updated drop index and the updated flat list.
 */
export function removeDragggingNodeIfExists(
  dropIndex: number,
  flatList: FlatTreeItem[],
  draggingNodeInformation: DraggingNodeInformation,
): [number, FlatTreeItem[]] {
  if (
    !draggingNodeInformation.externalDrag &&
    flatList[draggingNodeInformation.dragStartIndex].mapId ===
      draggingNodeInformation.flatNode.mapId
  ) {
    flatList = removeItemAtGivenIndexFromArray(
      flatList,
      draggingNodeInformation.dragStartIndex,
    );
    if (dropIndex > draggingNodeInformation.dragStartIndex) {
      dropIndex -= 1;
    }
  }

  return [dropIndex, flatList];
}

/**
 * Removes the dropzone node from the flat list if it exists.
 * Used to remove previous dropzone nodes to create space for new dropzone.
 *
 * @param {number} dropIndex - The index where the node is being dropped.
 * @param {FlatTreeItem[]} flatList - The list of flat tree items.
 * @param {DropZoneInformation | null} dropzoneInformation - Information about the dropzone including the drop index and the flat node.
 * @returns {[number, FlatTreeItem[]]} A tuple containing the updated drop index and the updated flat list.
 */
export function removeDropzoneNodeIfExists(
  dropIndex: number,
  flatList: FlatTreeItem[],
  dropzoneInformation: DropZoneInformation | null,
): [number, FlatTreeItem[]] {
  if (
    dropzoneInformation &&
    dropzoneInformation.dropIndex < flatList.length &&
    flatList[dropzoneInformation.dropIndex].mapId ===
      dropzoneInformation.flatNode.mapId
  ) {
    flatList = removeItemAtGivenIndexFromArray(
      flatList,
      dropzoneInformation.dropIndex,
    );
    if (dropIndex > dropzoneInformation.dropIndex) {
      dropIndex -= 1;
    }
  }

  return [dropIndex, flatList];
}

/**
 * Calculates the actual drop depth based on the drop index and drop depth.
 *
 * @template T - The type of the node data.
 * @param {number} dropIndex - The index where the node is being dropped.
 * @param {number} dropDepth - The depth at which the node is being dropped.
 * @param {TreeMap} treeMap - A map representing the tree structure.
 * @param {FlatTreeItem[]} flatTree - A flat list of tree items.
 * @param {DraggingNodeInformation} draggingNodeInformation - Information about the node being dragged.
 * @param {DropZoneInformation} dropzoneInformation - Information about the drop zone, if any.
 * @param {CanNodeHaveChildrenFn<T> | boolean} canNodeHaveChildren - A function to check if a node can have children.
 * @returns
 */
export function calculateActualDropDepth<T>(
  dropIndex: number,
  dropDepth: number,
  treeMap: TreeMap,
  flatTree: FlatTreeItem[],
  draggingNodeInformation: DraggingNodeInformation,
  dropzoneInformation: DropZoneInformation | null,
  canNodeHaveChildren?: CanNodeHaveChildrenFn<T> | boolean,
): number {
  let actualDropDepth = dropDepth;
  if (dropIndex === 0) {
    actualDropDepth = 0;
  } else {
    let start = dropIndex - 1;
    while (start >= 0) {
      if (
        flatTree[start].mapId === draggingNodeInformation.flatNode.mapId ||
        flatTree[start].mapId === dropzoneInformation?.flatNode.mapId ||
        calculateNodeDepth(flatTree[start]) > actualDropDepth
      ) {
        start -= 1;
      } else {
        break;
      }
    }
    dropIndex = start + 1;
  }
  if (dropIndex <= 0) {
    dropIndex = 0;
    actualDropDepth = 1;
  } else {
    const prevDepth = calculateNodeDepth(flatTree[dropIndex - 1]);
    if (actualDropDepth <= prevDepth) {
      actualDropDepth = prevDepth;
    } else if (
      runCanNodeHaveChildren(
        canNodeHaveChildren,
        treeMap[flatTree[dropIndex - 1].mapId] as TreeItem<T>,
      )
    ) {
      actualDropDepth = prevDepth + 1;
    } else {
      actualDropDepth = prevDepth;
    }
  }

  return actualDropDepth;
}

/**
 * Expands the previous node in the flat list to traverse its subtree while dragging a node.
 *
 * @param {number} hoverIndex - The index of the node being hovered over in the flat list.
 * @param {number} hoverDepth - The depth of the node being hovered over.
 * @param {TreeMap} treeMap - A map representing the tree structure.
 * @param {FlatTreeItem[]} flatList - A flat list of tree items.
 * @param {GetNodeKeyFn} getNodeKeyFn - A function to get the key of a node.
 * @returns {[TreeMap, FlatTreeItem[]]} A tuple containing the updated tree map and flat list.
 */
export function expandPreviousNodeToInsertInSubtree(
  hoverIndex: number,
  hoverDepth: number,
  treeMap: TreeMap,
  flatList: FlatTreeItem[],
  getNodeKeyFn: GetNodeKeyFn,
): [TreeMap, FlatTreeItem[]] {
  if (hoverIndex > 0) {
    const prevNode = flatList[hoverIndex - 1];
    const prevTreeNode = treeMap[prevNode.mapId];
    if (calculateNodeDepth(prevNode) < hoverDepth) {
      const [map, updatedFlatList] = expandNode(
        prevNode.mapId,
        prevTreeNode,
        treeMap,
        flatList,
        getNodeKeyFn,
      );
      treeMap = map;
      flatList = updatedFlatList;
    }
  }

  return [treeMap, flatList];
}

/**
 * Calculates the actual drop index for a node being dragged in a flat tree structure.
 * - This drop index is the index where the node will go after dropping the node on current hovering position.
 * - This index including hovering index combined can be used to show lines from hovering index to actual drop index.
 *
 * @param {number} hoverIndex - The index of the node currently being hovered over.
 * @param {number} hoverDepth - The depth of the node currently being hovered over.
 * @param {FlatTreeItem[]} flatList - The flat list of tree items.
 * @param {DraggingNodeInformation} draggingNodeInformation - Information about the node being dragged.
 * @param {DropZoneInformation | null} dropzoneInformation - Information about the drop zone, if any.
 * @returns {number} The actual drop index where the node should be placed.
 */
export function calculateActualDropIndex(
  hoverIndex: number,
  hoverDepth: number,
  flatList: FlatTreeItem[],
  draggingNodeInformation: DraggingNodeInformation,
  dropzoneInformation: DropZoneInformation | null,
): number {
  let actualDropIndex = hoverIndex;
  while (actualDropIndex < flatList.length) {
    if (
      flatList[actualDropIndex].mapId ===
        draggingNodeInformation.flatNode.mapId ||
      flatList[actualDropIndex].mapId === dropzoneInformation?.flatNode.mapId ||
      calculateNodeDepth(flatList[actualDropIndex]) > hoverDepth
    ) {
      actualDropIndex += 1;
    } else {
      break;
    }
  }
  return actualDropIndex;
}

/**
 * Constructs the data required to move a node within a tree structure.
 * This data is used in callbacks for checking if a node can be moved, and for moving the node.
 *
 * @template T - The type of the node data.
 * @param {TreeMap} treeMap - The map of tree nodes.
 * @param {FlatTreeItem[]} flatList - The flat list representation of the tree.
 * @param {NodeKey | null} parentKey - The key of the parent node where the node is being moved to, or null if moving to the root.
 * @param {number} actualDropIndex - The index where the node is being dropped.
 * @param {DraggingNodeInformation} draggingNodeInformation - Information about the node being dragged.
 * @returns {OnDragPreviousAndNextLocation<T> & NodeData<T>} - The data required to move the node, including previous and next locations.
 */
export function constructNodeMoveData<T>(
  treeMap: TreeMap,
  flatList: FlatTreeItem[],
  parentKey: NodeKey | null,
  actualDropIndex: number,
  draggingNodeInformation: DraggingNodeInformation,
): OnDragPreviousAndNextLocation<T> & NodeData<T> {
  let prevParent = null;
  if (draggingNodeInformation.flatNode.path.at(-2)) {
    prevParent = treeMap[draggingNodeInformation.flatNode.path.at(-2) || ''];
  }
  let nextParent = null;
  let nextParentPath: NumberOrStringArray = [];
  if (parentKey) {
    nextParent = treeMap[parentKey];
    const nextParentIndex = flatList.findIndex(
      (node) => node.mapId === parentKey,
    );
    if (nextParentIndex !== -1) {
      nextParentPath = flatList[nextParentIndex].path;
    }
  }

  const nodeMoveData = {
    node: draggingNodeInformation.treeNode,
    path: [...nextParentPath, draggingNodeInformation.flatNode.mapId],
    treeIndex: draggingNodeInformation.dragStartIndex,
    nextParent,
    nextPath: [...nextParentPath, draggingNodeInformation.flatNode.mapId],
    nextTreeIndex: actualDropIndex - 1,
    prevParent,
    prevPath: draggingNodeInformation.flatNode.path,
    prevTreeIndex: draggingNodeInformation.dragStartIndex,
  };

  return nodeMoveData as OnDragPreviousAndNextLocation<T> & NodeData<T>;
}

/**
 * Constructs a dropzone by modifying the flat list of tree items.
 * - This function is used to create a visual dropzone when dragging a node.
 * - The new dropzone created might be of 3 types: drop success, drop error, or dragging node.
 * - The dropzone is created at the hover index and depth, not the actual location where the node will be dropped.
 *
 * @param {number} hoverIndex - The index at which the node is being hovered over.
 * @param {number} hoverDepth - The depth at which the node is being hovered over.
 * @param {boolean} canDrop - A boolean indicating whether the node can be dropped at the hover position.
 * @param {FlatTreeItem[]} flatList - The flat list of tree items.
 * @param {DraggingNodeInformation} draggingNodeInformation - Information about the node being dragged, including its original index and depth.
 */
export function constructDropzone(
  hoverIndex: number,
  hoverDepth: number,
  canDrop: boolean,
  flatList: FlatTreeItem[],
  draggingNodeInformation: DraggingNodeInformation,
): FlatTreeItem[] {
  const newFlatNode: FlatTreeItem = {
    ...draggingNodeInformation.flatNode,
    forcedDepth: hoverDepth,
  };

  if (
    hoverIndex === draggingNodeInformation.dragStartIndex &&
    hoverDepth === draggingNodeInformation.dragStartDepth
  ) {
    newFlatNode.draggingNode = true;
  } else if (canDrop) {
    newFlatNode.dropSuccessNode = true;
  } else {
    newFlatNode.dropErrorNode = true;
  }

  return insertItemsIntoArrayAtGivenIndex(flatList, hoverIndex, newFlatNode);
}
