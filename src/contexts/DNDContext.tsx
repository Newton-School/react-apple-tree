import React, { createContext, useContext, useEffect, useState } from 'react';

import { SHARED_IS_DRAGGING_NODE_STATE } from '../constants';
import useSharedState from '../hooks/useSharedState';
import { ContextProviderProps } from '../types';
import {
  calculateActualDropDepth,
  calculateActualDropIndex,
  calculateTempDropIndex,
  constructDropzone,
  constructMoveNodeData,
  expandPreviousNodeToInsertInSubtree,
  removeDragggingNodeIfExists,
  removeDropzoneNodeIfExists,
} from '../utils/hover-node';
import {
  calculateNodeDepth,
  collapseNode,
  getParentKeyAndSiblingCountFromList,
  moveNodeToDifferentParent,
} from '../utils/node-operations';
import {
  DraggingNodeInformation,
  DropZoneInformation,
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
  onHoverNode: (params: OnHoverNodeProps) => void;
  completeDrop: (isDroppedOutsideTree?: boolean) => void;
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
  onHoverNode: () => {},
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
  const [onHoverNodeParams, setOnHoverNodeParams] =
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
  function onHoverNode(params: OnHoverNodeProps) {
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
    setOnHoverNodeParams(params);
  }

  useEffect(() => {
    if (draggingNodeInformation && onHoverNodeParams) {
      const flatNode = flatTree[onHoverNodeParams.nodeIndex];
      let newFlatList = [...flatTree];
      let newTreeMap = { ...treeMap };

      // Calculate temp drop index
      let hoverDropIndex = calculateTempDropIndex(onHoverNodeParams);

      // Removing dragging node if exists
      [hoverDropIndex, newFlatList] = removeDragggingNodeIfExists(
        hoverDropIndex,
        newFlatList,
        draggingNodeInformation,
      );

      // Removing dropzone node if exists
      [hoverDropIndex, newFlatList] = removeDropzoneNodeIfExists(
        hoverDropIndex,
        newFlatList,
        dropzoneInformation,
      );

      // Calculate actual depth
      const tmpDropDepth =
        calculateNodeDepth(flatNode) + onHoverNodeParams.depth;
      const hoverDropDepth = calculateActualDropDepth(
        hoverDropIndex,
        tmpDropDepth,
        newTreeMap,
        newFlatList,
        draggingNodeInformation,
        dropzoneInformation,
        appleTreeProps.canNodeHaveChildren,
      );

      // Expanding previous node
      [newTreeMap, newFlatList] = expandPreviousNodeToInsertInSubtree(
        hoverDropIndex,
        hoverDropDepth,
        newTreeMap,
        newFlatList,
        appleTreeProps.getNodeKey,
      );

      // Calculating actual drop location
      const actualDropIndex = calculateActualDropIndex(
        hoverDropIndex,
        hoverDropDepth,
        newFlatList,
        draggingNodeInformation,
        dropzoneInformation,
      );

      // Get position of node in tree
      const [parentKey, siblingCount] = getParentKeyAndSiblingCountFromList(
        flatTree,
        onHoverNodeParams.nodeIndex,
      );

      // Construct move node data
      const moveNodeData = constructMoveNodeData(
        newTreeMap,
        newFlatList,
        parentKey,
        actualDropIndex,
        draggingNodeInformation,
      );

      // Checking can drop
      let canDrop = true;
      if (appleTreeProps.canDrop) {
        canDrop = appleTreeProps.canDrop(moveNodeData);
      }

      // Creating new dropzone node
      newFlatList = constructDropzone(
        hoverDropIndex,
        hoverDropDepth,
        canDrop,
        newFlatList,
        draggingNodeInformation,
      );
      const newFlatNode = newFlatList[hoverDropIndex];

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
  }, [draggingNodeInformation, onHoverNodeParams]);

  // Node is dropped
  function completeDrop(isDroppedOutsideTree: boolean = false) {
    if (draggingNodeInformation && dropzoneInformation) {
      let newTree = [];
      if (isDroppedOutsideTree) {
        newTree = appleTreeProps.treeData;
      } else {
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
        onHoverNode,
        completeDrop,
        getDraggingNodeInformationFromNodeIndex,
      }}
    >
      {props.children}
    </DNDContext.Provider>
  );
}

export { DNDContext, DNDContextProvider };
