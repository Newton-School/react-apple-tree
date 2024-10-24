import { RowDirection } from '../../types';

export interface StyledTreeItemRowProps {
  $rowDirection?: RowDirection;
  $rowHeight: number;
}

export interface StyledLineBlockProps {
  $scaffoldWidth: number;
}

export type highlightedLinePosition = 'start' | 'mid' | 'end';

export interface StyledHighlightedLineBlockProps {
  $position: highlightedLinePosition;
}

export interface StyledRowMainButtonProps {
  $isCollapsed: boolean;
  $scaffoldWidth: number;
}

export enum DropZoneValues {
  Self = 'self',
  Allow = 'allow',
  Disallow = 'disallow',
}
export interface StyledRowMainContentWrapperProps {
  $isDragging?: boolean;
  $dropzone?: DropZoneValues;
  $isSearchedNode?: boolean;
  $isSearchFocus?: boolean;
}
