import React, { createContext, useContext, useEffect, useState } from 'react';

import { SHARED_IS_DRAGGING_NODE_STATE } from '../constants';
import { useSharedState } from '../hooks/useSharedState';
import {
  ContextProviderProps,
  FlatTreeItem,
  NumberOrStringArray,
} from '../types';
import { removeItemAtGivenIndexFromArray } from '../utils/common';
import {
  calculateNodeDepth,
  collapseNode,
  expandNode,
  getParentKeyAndSiblingCountFromList,
  moveNodeToDifferentParent,
} from '../utils/node-operations';
import { runCanNodeHaveChildren } from '../utils/prop-utils';
import {
  DraggingNodeInformation,
  DropZoneInformation,
  NodeAppendDirection,
  OnHoverNodeProps,
  StartDragProps,
} from './DNDContextTypes';
import { PropDataContext } from './PropDataContext';
import { TreeDataContext } from './TreeDataContext';

interface DNDContextProps {
  isDraggingNode: boolean | null;
  setIsDraggingNode?: any;
  draggingNodeInformation: DraggingNodeInformation | null;
  dropzoneInformation: DropZoneInformation | null;
  startDrag: (params: StartDragProps) => void;
  hoverNode: (params: OnHoverNodeProps) => void;
  completeDrop: (shouldRemoveDragDetailsOnly?: boolean) => void;
  getDraggingNodeInformationFromNodeIndex: (
    nodeIndex: number,
  ) => DraggingNodeInformation | null;
}

const DNDContext = createContext<DNDContextProps>({
  isDraggingNode: null,
  setIsDraggingNode: () => {},
  draggingNodeInformation: null,
  dropzoneInformation: null,
  startDrag: () => {},
  hoverNode: () => {},
  completeDrop: () => {},
  getDraggingNodeInformationFromNodeIndex: () => null,
});

function DNDContextProvider(props: ContextProviderProps): React.JSX.Element {
  const { treeMap, setTreeMap, flatTree, setFlatTree } =
    useContext(TreeDataContext);
  const { appleTreeProps, setAppleTreeProps } = useContext(PropDataContext);

  const [isDraggingNode, setIsDraggingNode] = useSharedState<boolean>(
    SHARED_IS_DRAGGING_NODE_STATE,
    false,
  );
  const [draggingNodeInformation, setDraggingNodeInformation] =
    useState<DraggingNodeInformation | null>(null);
  const [dropzoneInformation, setDropzoneInformation] =
    useState<DropZoneInformation | null>(null);
  const [hoverNodeParams, setHoverNodeParams] =
    useState<OnHoverNodeProps | null>(null);

  function getDraggingNodeInformationFromNodeIndex(
    nodeIndex: number,
  ): DraggingNodeInformation | null {
    const flatNode = flatTree[nodeIndex];
    const treeNode = treeMap[flatNode.mapId];
    return {
      treeNode,
      flatNode,
      dragStartIndex: nodeIndex,
      dragStartDepth: calculateNodeDepth(flatNode),
      initialExpanded: treeNode.expanded,
    };
  }

  // When drag start on any node
  function startDrag(params: StartDragProps) {
    const flatNode = flatTree[params.nodeIndex];
    const treeNode = treeMap[flatNode.mapId];
    setDraggingNodeInformation(
      getDraggingNodeInformationFromNodeIndex(params.nodeIndex),
    );
    const flatArray = collapseNode(flatNode.mapId, treeNode, treeMap, flatTree);
    setFlatTree([...flatArray]);
    setIsDraggingNode(true);
  }

  // When dragging node is hovering over some node
  function hoverNode(params: OnHoverNodeProps) {
    if (
      draggingNodeInformation === null &&
      params.draggingNodeInformation &&
      !treeMap[params.draggingNodeInformation.flatNode.mapId]
    ) {
      setDraggingNodeInformation(params.draggingNodeInformation);
      setTreeMap({
        ...treeMap,
        [params.draggingNodeInformation.flatNode.mapId]:
          params.draggingNodeInformation.treeNode,
      });
    }
    setHoverNodeParams(params);
  }

  useEffect(() => {
    if (draggingNodeInformation && hoverNodeParams) {
      if (!draggingNodeInformation) {
        return;
      }
      const flatNode = flatTree[hoverNodeParams.nodeIndex];

      // Calculate temp drop index
      let tmpDropIndex = hoverNodeParams.nodeIndex;
      if (hoverNodeParams.direction === NodeAppendDirection.Below) {
        tmpDropIndex += 1;
      }
      let hoverDropIndex = tmpDropIndex;
      let newFlatList = [...flatTree];
      let newTreeMap = { ...treeMap };

      // Removing dragging node if exists
      if (
        !draggingNodeInformation.externalDrag &&
        newFlatList[draggingNodeInformation.dragStartIndex].mapId ===
          draggingNodeInformation.flatNode.mapId
      ) {
        newFlatList = removeItemAtGivenIndexFromArray(
          newFlatList,
          draggingNodeInformation.dragStartIndex,
        );
        if (hoverDropIndex > draggingNodeInformation.dragStartIndex) {
          hoverDropIndex -= 1;
        }
      }

      // Removing dropzone node if exists
      if (
        dropzoneInformation &&
        dropzoneInformation.dropIndex < newFlatList.length &&
        newFlatList[dropzoneInformation.dropIndex].mapId ===
          dropzoneInformation.flatNode.mapId
      ) {
        newFlatList = removeItemAtGivenIndexFromArray(
          newFlatList,
          dropzoneInformation.dropIndex,
        );
        if (hoverDropIndex > dropzoneInformation.dropIndex) {
          hoverDropIndex -= 1;
        }
      }

      // Calculate actual depth
      let dropNodeDepth = calculateNodeDepth(flatNode) + hoverNodeParams.depth;
      if (tmpDropIndex === 0) {
        dropNodeDepth = 0;
      } else {
        let start = tmpDropIndex - 1;
        while (start >= 0) {
          if (
            flatTree[start].mapId === draggingNodeInformation.flatNode.mapId ||
            flatTree[start].mapId === dropzoneInformation?.flatNode.mapId ||
            calculateNodeDepth(flatTree[start]) > dropNodeDepth
          ) {
            start -= 1;
          } else {
            break;
          }
        }
        tmpDropIndex = start + 1;
      }
      if (tmpDropIndex <= 0) {
        tmpDropIndex = 0;
        dropNodeDepth = 1;
      } else {
        const prevDepth = calculateNodeDepth(flatTree[tmpDropIndex - 1]);
        if (dropNodeDepth <= prevDepth) {
          dropNodeDepth = prevDepth;
        } else if (
          runCanNodeHaveChildren(
            appleTreeProps.canNodeHaveChildren,
            treeMap[flatTree[tmpDropIndex - 1].mapId],
          )
        ) {
          dropNodeDepth = prevDepth + 1;
        } else {
          dropNodeDepth = prevDepth;
        }
      }

      const hoverDropDepth = dropNodeDepth;

      // Expanding previous node
      if (hoverDropIndex > 0) {
        const prevNode = newFlatList[hoverDropIndex - 1];
        const prevTreeNode = treeMap[prevNode.mapId];
        if (calculateNodeDepth(prevNode) < hoverDropDepth) {
          const [map, updatedFlatList] = expandNode(
            prevNode.mapId,
            prevTreeNode,
            treeMap,
            newFlatList,
            appleTreeProps.getNodeKey,
          );
          newTreeMap = { ...map };
          newFlatList = [...updatedFlatList];
        }
      }

      // Calculating actual drop location
      let actualDropIndex = hoverDropIndex;
      while (actualDropIndex < flatTree.length) {
        if (
          flatTree[actualDropIndex].mapId ===
            draggingNodeInformation.flatNode.mapId ||
          flatTree[actualDropIndex].mapId ===
            dropzoneInformation?.flatNode.mapId ||
          calculateNodeDepth(flatTree[actualDropIndex]) > dropNodeDepth
        ) {
          actualDropIndex += 1;
        } else {
          break;
        }
      }

      // Get position of node in tree
      const [parentKey, siblingCount] = getParentKeyAndSiblingCountFromList(
        flatTree,
        hoverNodeParams.nodeIndex,
      );

      // Checking can drop
      let canDrop = true;
      let prevParent = null;
      if (draggingNodeInformation.flatNode.path.at(-2)) {
        prevParent =
          treeMap[draggingNodeInformation.flatNode.path.at(-2) || ''];
      }
      let nextParent = null;
      let nextParentPath: NumberOrStringArray = [];
      if (parentKey) {
        nextParent = treeMap[parentKey];
        const nextParentIndex = newFlatList.findIndex(
          (node) => node.mapId === parentKey,
        );
        if (nextParentIndex !== -1) {
          nextParentPath = newFlatList[nextParentIndex].path;
        }
      }

      const moveNodeData = {
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
      if (appleTreeProps.canDrop) {
        canDrop = appleTreeProps.canDrop(moveNodeData);
      }

      // Creating new dropzone node
      const newFlatNode: FlatTreeItem = {
        ...draggingNodeInformation.flatNode,
        forcedDepth: hoverDropDepth,
      };
      if (
        hoverDropIndex === draggingNodeInformation.dragStartIndex &&
        hoverDropDepth === draggingNodeInformation.dragStartDepth
      ) {
        newFlatNode.draggingNode = true;
      } else if (canDrop) {
        newFlatNode.dropSuccessNode = true;
      } else {
        newFlatNode.dropErrorNode = true;
      }
      newFlatList = [
        ...newFlatList.slice(0, hoverDropIndex),
        { ...newFlatNode },
        ...newFlatList.slice(hoverDropIndex),
      ];

      // Updating UI
      setFlatTree([...newFlatList]);
      setTreeMap({ ...newTreeMap });
      setDropzoneInformation({
        dropIndex: hoverDropIndex,
        dropDepth: hoverDropDepth,
        actualDropIndex,
        flatNode: newFlatNode,
        flatList: newFlatList,
        nextParentKey: parentKey,
        siblingIndex: siblingCount,
        canDrop,
        moveNodeData,
      });
    }
  }, [draggingNodeInformation, hoverNodeParams]);

  // Node is dropped
  function completeDrop(shouldRemoveDragDetailsOnly: boolean = false) {
    if (draggingNodeInformation && dropzoneInformation) {
      let newTree = appleTreeProps.treeData;
      if (!shouldRemoveDragDetailsOnly) {
        newTree = moveNodeToDifferentParent(
          appleTreeProps.treeData,
          treeMap,
          draggingNodeInformation.flatNode.mapId,
          draggingNodeInformation.flatNode.parentKey,
          dropzoneInformation.nextParentKey,
          dropzoneInformation.siblingIndex,
          appleTreeProps.getNodeKey,
        );
        if (draggingNodeInformation.initialExpanded) {
          draggingNodeInformation.treeNode.expanded = true;
        }
        appleTreeProps.onMoveNode?.({
          ...dropzoneInformation.moveNodeData,
          treeData: structuredClone(newTree),
          nextParentNode: dropzoneInformation.moveNodeData.nextParent,
        });
      }
      setAppleTreeProps({ treeData: [...newTree] });
      setDropzoneInformation(null);
      setDraggingNodeInformation(null);
      setIsDraggingNode(false);
    }
  }

  return (
    <DNDContext.Provider
      value={{
        isDraggingNode,
        setIsDraggingNode,
        draggingNodeInformation,
        dropzoneInformation,
        startDrag,
        hoverNode,
        completeDrop,
        getDraggingNodeInformationFromNodeIndex,
      }}
    >
      {props.children}
    </DNDContext.Provider>
  );
}

export { DNDContext, DNDContextProvider };
