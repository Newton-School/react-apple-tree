import styled, { css } from "styled-components";
import {
  DropZoneValues,
  StyledHighlightedLineBlockProps,
  StyledLineBlockProps,
  StyledRowMainButtonProps,
  StyledRowMainContentWrapperProps,
  StyledTreeItemRowProps,
} from "./types";

export const StyledTreeItemRow = styled.div<StyledTreeItemRowProps>`
  min-height: ${({ $rowHeight }) => $rowHeight + 10}px;
  display: flex;
  flex-direction: ${({ $rowDirection }) =>
    $rowDirection ? ($rowDirection === "rtl" ? "row-reverse" : "row") : "row"};
  white-space: nowrap;
`;

export const StyledTreeItemIndentation = styled.div`
  display: flex;
`;

const StyledLineBlock = styled.div<StyledLineBlockProps>`
  width: ${({ $scaffoldWidth }) => $scaffoldWidth}px;
  height: 100%;
  position: relative;

  &::after {
    position: absolute;
    content: "";
    background-color: var(--ns-rat-tree-lines-color);
  }
  &::before {
    position: absolute;
    content: "";
    background-color: var(--ns-rat-tree-lines-color);
  }
`;

export const StyledEmptyBlock = styled(StyledLineBlock)``;

export const StyledVerticalLineBlock = styled(StyledLineBlock)`
  &::after {
    width: 1px;
    height: 100%;
    left: 50%;
    top: 0;
  }
`;

export const StyledHorizontalLineBlock = styled(StyledLineBlock)`
  &::before {
    height: 1px;
    width: 50%;
    right: 0;
    top: 50%;
  }
`;

export const StyledVerticalAndHorizontalLineBlock = styled(StyledLineBlock)`
  &::after {
    width: 1px;
    height: 100%;
    left: 50%;
    top: 0;
  }
  &::before {
    height: 1px;
    width: 50%;
    right: 0;
    top: 50%;
  }
`;

export const StlyedHighlightedLineBlock = styled(
  StyledLineBlock
)<StyledHighlightedLineBlockProps>`
  &::after {
    z-index: 1;
    background-color: var(--ns-rat-special-line-color);
    width: 5px;
    left: calc(50% - 2px);
  }
  &::before {
    z-index: 1;
    background-color: var(--ns-rat-special-line-color);
    height: 5px;
    right: 0;
  }
  ${({ $position }) =>
    $position === "start" &&
    css`
      &::after {
        height: 50%;
        top: 50%;
      }
      &::before {
        width: 50%;
        top: 50%;
      }
    `}
  ${({ $position }) =>
    $position === "mid" &&
    css`
      &::after {
        height: 100%;
        top: 0;
      }
      &::before {
        width: 0;
      }
    `}
  ${({ $position }) =>
    $position === "end" &&
    css`
      &::after {
        height: 100%;
        top: 0;
      }
      &::before {
        width: 50%;
        bottom: 0;
      }
    `}
`;

export const StyledRowMainButton = styled.div<StyledRowMainButtonProps>`
  height: 100%;
  position: relative;
  cursor: pointer;

  &::before {
    height: 12px;
    width: 12px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: absolute;
    content: "";
    border-radius: 50%;
    background-image: url("../../assets/Triangle.svg");
    background-repeat: no-repeat;
    background-position: center;
    transition: transform 0.3s;
    ${({ $isCollapsed }) =>
      $isCollapsed &&
      css`
        transform: rotate(-90deg);
      `}
    font-size: 10px;
    top: calc(50% - 6px);
    left: -${({ $scaffoldWidth }) => 6 + $scaffoldWidth / 2}px;
  }
`;

export const StyledRowMainContentWrapper = styled.div<StyledRowMainContentWrapperProps>`
  height: 80%;
  display: flex;
  align-items: center;
  padding: 10px 10px 10px 0;
  position: absolute;

  ${({ $isSearchedNode }) =>
    $isSearchedNode &&
    css`
      border: 3px solid var(--ns-rat-search-node-outline-color);
    `}

  ${({ $isSearchFocus }) =>
    $isSearchFocus &&
    css`
      border: 3px solid var(--ns-rat-search-focus-outline-color);
    `}

  ${({ $isDragging, $dropzone }) =>
    ($isDragging || $dropzone) &&
    css`
      &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
        width: 100%;
        height: 100%;
        ${$isDragging &&
        css`
          background-color: var(--ns-rat-node-hover-color);
        `}
        ${$dropzone === DropZoneValues.Allow &&
        css`
          background-color: var(--ns-rat-can-drop-color);
        `}
        ${$dropzone === DropZoneValues.Disallow &&
        css`
          background-color: var(--ns-rat-cannot-drop-color);
        `}
      }
    `}
`;

export const StyledRowDragIcon = styled.div`
  padding: 5px 2px;
  display: flex;
  align-items: center;
  opacity: 0.6;
  cursor: move;

  &:hover {
    background-color: #898c94;
  }
`;

export const StyledRowTitleContentWrapper = styled.div`
  font-weight: 600;
  margin-left: 10px;
`;

export const StyledRowButtonsWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 20px;
  gap: 10px;
`;

export const StyledTreeItemContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  &:hover ${StyledRowMainContentWrapper} {
    background-color: var(--ns-rat-node-hover-color);
  }
`;
