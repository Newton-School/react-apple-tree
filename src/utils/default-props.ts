import {
  DEFAULT_DND_TYPE,
  DEFAULT_ROW_HEIGHT,
  DEFAULT_SCAFFOLD_BLOCK_PX_WIDTH,
  DEFAULT_SLIDE_REGION_SIZE,
} from '../constants';
import { ReactAppleTreeProps } from '../types';
import { getReactElementText } from './common';

export const defaultAppleTreeProps: ReactAppleTreeProps = {
  treeData: [],
  onChange: () => {},
  getNodeKey: () => -1,
  canDrag: true,
  canDrop: () => true,
  canNodeHaveChildren: true,
  searchMethod: ({ node, searchQuery }) => {
    let titleMatch: boolean = false;
    let subtitleMatch = false;

    if (typeof node.title === 'object') {
      titleMatch = getReactElementText(node.title).indexOf(searchQuery) > -1;
    } else {
      titleMatch = node.title
        ? String(node.title).indexOf(searchQuery) > -1
        : false;
    }

    if (typeof node.subtitle === 'object') {
      subtitleMatch =
        getReactElementText(node.subtitle).indexOf(searchQuery) > -1;
    } else {
      subtitleMatch = node.subtitle
        ? String(node.subtitle).indexOf(searchQuery) > -1
        : false;
    }

    return titleMatch || subtitleMatch;
  },
  onlyExpandSearchedNodes: false,
  dndType: DEFAULT_DND_TYPE,
  isVirtualized: true,
  rowHeight: DEFAULT_ROW_HEIGHT,
  scaffoldBlockPxWidth: DEFAULT_SCAFFOLD_BLOCK_PX_WIDTH,
  slideRegionSize: DEFAULT_SLIDE_REGION_SIZE,
};
