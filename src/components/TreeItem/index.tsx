import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  StyledRowButtonsWrapper,
  StyledRowDragIcon,
  StyledRowMainButton,
  StyledRowMainButtonSvgContainer,
  StyledRowMainContentWrapper,
  StyledRowTitleContentWrapper,
  StyledTreeItemContent,
  StyledTreeItemRow,
} from "./index.styles";
import { TreeDataContext } from "../../contexts/TreeDataContext";
import { PropDataContext } from "../../contexts/PropDataContext";
import { DNDContext } from "../../contexts/DNDContext";
import { ExtendedNodeData, ExtendedNodeProps, FlatTreeItem } from "../../types";
import { useDragHook, useDropHook } from "../../hooks/dnd";
import DragHandle from "../../assets/DragHandle";
import TriangleSvg from "../../assets/Triangle";
import { DropZoneValues } from "./types";
import { checkCanDragNode } from "../../utils/prop-utils";
import { SearchContext } from "../../contexts/SearchContext";
import {
  DEFAULT_ROW_HEIGHT,
  DEFAULT_SCAFFOLD_BLOCK_PX_WIDTH,
} from "../../constants";
import TreeItemIndentation from "./TreeItemIndentation";

interface TreeItemComponentProps {
  style?: React.CSSProperties;
  nodeIndex: number;
  node: FlatTreeItem;
}

const TreeItem = ({ style, nodeIndex, node }: TreeItemComponentProps) => {
  const { appleTreeProps } = useContext(PropDataContext);
  const { treeMap, expandOrCollapseNode } = useContext(TreeDataContext);
  const {
    isDraggingNode,
    setIsDraggingNode,
    draggingNodeInformation,
    dropzoneInformation,
    startDrag,
    hoverNode,
    completeDrop,
  } = useContext(DNDContext);
  const { searchedNodeMap, searchedNodeIndex } = useContext(SearchContext);

  const [treeNode, setTreeNode] = useState(treeMap[node.mapId]);
  const [parentNode, setParentNode] = useState(
    treeMap[node.path[node.path.length - 1]]
  );
  const [extendedNodeData, setExtendedNodeData] = useState<ExtendedNodeData>({
    node: treeNode,
    isSearchFocus: false,
    isSearchMatch: false,
    lowerSiblingCounts: [],
    parentNode,
    path: node.path,
    treeIndex: nodeIndex,
  });
  const [nodePropsData, setNodePropsData] = useState<ExtendedNodeProps>({});
  const [canDragNode, setCanDragNode] = useState(true);

  useEffect(() => {
    setExtendedNodeData({
      node: treeNode,
      isSearchFocus:
        typeof appleTreeProps.searchFocusOffset === "number" &&
        !!searchedNodeMap[node.mapId] &&
        searchedNodeIndex === nodeIndex,
      isSearchMatch: !!searchedNodeMap[node.mapId],
      lowerSiblingCounts: [],
      parentNode,
      path: node.path,
      treeIndex: nodeIndex,
    });
  }, [treeNode, searchedNodeIndex, searchedNodeMap]);

  useEffect(() => {
    if (typeof appleTreeProps.canDrag !== "undefined") {
      const checkDrag = checkCanDragNode(
        appleTreeProps.canDrag,
        extendedNodeData
      );
      setCanDragNode(checkDrag);
    }
  }, [appleTreeProps.canDrag, extendedNodeData]);

  useEffect(() => {
    setTreeNode(treeMap[node.mapId]);
    setParentNode(treeMap[node.path[node.path.length - 2]]);
  }, [node, treeMap]);

  useMemo(() => {
    if (appleTreeProps.generateNodeProps) {
      setNodePropsData(appleTreeProps.generateNodeProps(extendedNodeData));
    }
  }, [appleTreeProps.generateNodeProps, extendedNodeData]);

  useEffect(() => {
    if (appleTreeProps.onVisibilityToggle) {
      appleTreeProps.onVisibilityToggle({
        expanded: treeNode.expanded || false,
        node: treeNode,
        treeData: appleTreeProps.treeData,
      });
    }
  }, [treeNode.expanded]);

  const nodeElement = useRef(null);

  const { isDragging, dragRef, dragPreview } = useDragHook({
    nodeIndex,
    listNode: node,
  });
  const { dropRef } = useDropHook({
    nodeIndex,
    listNode: node,
    nodeElement,
    hoverNode,
    completeDrop,
  });

  useEffect(() => {
    if (isDragging) {
      startDrag({ nodeIndex, flatNode: node });
    } else {
      if (
        dropzoneInformation &&
        draggingNodeInformation &&
        !draggingNodeInformation.externalDrag &&
        node.mapId === draggingNodeInformation.flatNode.mapId
      ) {
        completeDrop(true);
        setIsDraggingNode(false);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDraggingNode) {
    } else {
      if (
        dropzoneInformation &&
        draggingNodeInformation &&
        draggingNodeInformation.externalDrag &&
        node.mapId === draggingNodeInformation.flatNode.mapId
      ) {
        completeDrop(true);
      }
    }
  }, [isDraggingNode]);

  return (
    <StyledTreeItemRow
      style={{ ...style }}
      $rowDirection={appleTreeProps.rowDirection}
      $rowHeight={appleTreeProps.rowHeight || DEFAULT_ROW_HEIGHT}
      ref={(node) => dropRef(node)}
      role="row"
      data-testid={`tree-item-${node.mapId}`}
    >
      <TreeItemIndentation nodeIndex={nodeIndex} node={node} />
      <StyledTreeItemContent ref={nodeElement}>
        {treeNode.children && treeNode.children.length > 0 && (
          <StyledRowMainButton
            onClick={() => expandOrCollapseNode(node.mapId)}
            data-testid={`tree-item-visibility-toggle-button-${node.mapId}`}
          >
            <StyledRowMainButtonSvgContainer
              $isCollapsed={!treeNode.expanded}
              $scaffoldWidth={
                appleTreeProps.scaffoldBlockPxWidth ||
                DEFAULT_SCAFFOLD_BLOCK_PX_WIDTH
              }
            >
              <TriangleSvg />
            </StyledRowMainButtonSvgContainer>
          </StyledRowMainButton>
        )}
        <StyledRowMainContentWrapper
          className={nodePropsData.className || ""}
          style={{ ...nodePropsData.style }}
          ref={(node) => dragPreview(node)}
          $isSearchedNode={!!searchedNodeMap[node.mapId]}
          $isSearchFocus={
            typeof appleTreeProps.searchFocusOffset === "number" &&
            !!searchedNodeMap[node.mapId] &&
            searchedNodeIndex === nodeIndex
          }
          $isDragging={isDragging}
          $dropzone={
            node.dropSuccessNode
              ? DropZoneValues.Allow
              : node.dropErrorNode
                ? DropZoneValues.Disallow
                : undefined
          }
        >
          {canDragNode && (
            <StyledRowDragIcon
              ref={(node) => dragRef(node)}
              data-testid={`tree-item-drag-handle-${node.mapId}`}
            >
              <DragHandle />
            </StyledRowDragIcon>
          )}
          <StyledRowTitleContentWrapper>
            {nodePropsData.title ? (
              nodePropsData.title()
            ) : (
              <div>{treeNode.title || ""}</div>
            )}
          </StyledRowTitleContentWrapper>
          {nodePropsData.buttons && (
            <StyledRowButtonsWrapper>
              {nodePropsData.buttons.map((btn) => btn)}
            </StyledRowButtonsWrapper>
          )}
        </StyledRowMainContentWrapper>
      </StyledTreeItemContent>
    </StyledTreeItemRow>
  );
};

export default TreeItem;
