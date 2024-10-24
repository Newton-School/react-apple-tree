import React from 'react';
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
} from 'react-dnd';
import { ListProps } from 'react-window';

export type FlatTreeItem = {
  mapId: NodeKey;
  path: NumberOrStringArray;
  parentKey: NodeKey | null;
  draggingNode?: boolean;
  dropSuccessNode?: boolean;
  dropErrorNode?: boolean;
  forcedDepth?: number;
};

// Common Types
export type NumberOrStringArray = Array<string | number>;
export type ContextProviderProps = { children: React.JSX.Element };
export type NodeKey = string | number;
export type TreeMap = Record<NodeKey, TreeItem>;
export type SearchedNodeMap = Record<NodeKey, boolean>;

export type TreeItem<T = {}> = T & {
  title?: React.ReactNode | undefined;
  subtitle?: React.ReactNode | undefined;
  expanded?: boolean | undefined;
  children?: Array<TreeItem<T>> | undefined;
};

export interface TreeNode<T = {}> {
  node: TreeItem<T>;
}

export interface TreePath {
  path: NumberOrStringArray;
}

export interface TreeIndex {
  treeIndex: number;
}

export interface FullTree<T = {}> {
  treeData: Array<TreeItem<T>>;
}

export interface NodeData<T = {}> extends TreeNode<T>, TreePath, TreeIndex {}

export interface FlatDataItem<T = {}> extends TreeNode<T>, TreePath {
  lowerSiblingCounts: number[];
  parentNode: TreeItem<T>;
}

export interface SearchData<T = {}> extends NodeData<T> {
  searchQuery: any;
}

export interface ExtendedNodeData<T = {}> extends NodeData<T> {
  parentNode?: TreeItem<T>;
  lowerSiblingCounts: number[];
  isSearchMatch: boolean;
  isSearchFocus: boolean;
}

export interface ExtendedNodeProps {
  buttons?: Array<React.ReactNode>;
  title?: () => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface OnVisibilityToggleData<T = {}>
  extends FullTree<T>,
    TreeNode<T> {
  expanded: boolean;
}

export interface OnDragStateChangedData<T = {}> {
  isDragging: boolean;
  draggedNode: TreeItem<T>;
}

interface PreviousAndNextLocation {
  prevTreeIndex: number;
  prevPath: NumberOrStringArray;
  nextTreeIndex: number;
  nextPath: NumberOrStringArray;
}

export interface OnDragPreviousAndNextLocation<T = {}>
  extends PreviousAndNextLocation {
  prevParent: TreeItem<T> | null;
  nextParent: TreeItem<T> | null;
}

export interface ShouldCopyData<T = {}> {
  node: TreeNode<T>;
  prevPath: NumberOrStringArray;
  prevTreeIndex: number;
}

export interface OnMovePreviousAndNextLocation<T = {}>
  extends PreviousAndNextLocation {
  nextParentNode: TreeItem<T> | null;
}

export type NodeRenderer<T = {}> = React.ComponentType<NodeRendererProps<T>>;

export interface NodeRendererProps<T = {}> {
  node: TreeItem<T>;
  path: NumberOrStringArray;
  treeIndex: number;
  isSearchMatch: boolean;
  isSearchFocus: boolean;
  canDrag: boolean;
  scaffoldBlockPxWidth: number;
  toggleChildrenVisibility?(data: NodeData<T>): void;
  buttons?: React.JSX.Element[] | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  title?:
    | ((data: NodeData<T>) => React.JSX.Element | React.JSX.Element)
    | undefined;
  subtitle?:
    | ((data: NodeData<T>) => React.JSX.Element | React.JSX.Element)
    | undefined;
  icons?: React.JSX.Element[] | undefined;
  lowerSiblingCounts: number[];
  swapDepth?: number | undefined;
  swapFrom?: number | undefined;
  swapLength?: number | undefined;
  listIndex: number;
  treeId: string;
  rowDirection?: 'ltr' | 'rtl' | undefined;

  connectDragPreview: ConnectDragPreview;
  connectDragSource: ConnectDragSource;
  parentNode?: TreeItem<T> | undefined;
  startDrag: any;
  endDrag: any;
  isDragging: boolean;
  didDrop: boolean;
  draggedNode?: TreeItem<T> | undefined;
  isOver: boolean;
  canDrop?: boolean | undefined;
}

export type PlaceholderRenderer<T = {}> = React.ComponentType<
  PlaceholderRendererProps<T>
>;

export interface PlaceholderRendererProps<T = {}> {
  isOver: boolean;
  canDrop: boolean;
  draggedNode: TreeItem<T>;
}

export type TreeRenderer<T = {}> = React.ComponentType<TreeRendererProps<T>>;

export interface TreeRendererProps<T = {}> {
  treeIndex: number;
  treeId: string;
  swapFrom?: number | undefined;
  swapDepth?: number | undefined;
  swapLength?: number | undefined;
  scaffoldBlockPxWidth: number;
  lowerSiblingCounts: number[];
  rowDirection?: 'ltr' | 'rtl' | undefined;

  listIndex: number;
  children: React.JSX.Element[];
  style?: React.CSSProperties | undefined;

  // Drop target
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  canDrop?: boolean | undefined;
  draggedNode?: TreeItem<T> | undefined;

  // used in dndManager
  getPrevRow: () => FlatDataItem | null;
  node: TreeItem<T>;
  path: NumberOrStringArray;
}

interface ThemeTreeProps<T = {}> {
  /**
   * The style for the tree.
   * @type {React.CSSProperties}
   */
  style?: React.CSSProperties | undefined;
  /**
   * The style for the inner tree.
   * @type {React.CSSProperties}
   */
  innerStyle?: React.CSSProperties | undefined;
  /**
   * The props for the virtualized list.
   * @type {Partial<ListProps>}
   */
  reactVirtualizedListProps?: Partial<ListProps> | undefined;
  /**
   * The width of the scaffold block.
   * @type {number}
   * @default 44
   */
  scaffoldBlockPxWidth?: number | undefined; //
  /**
   * The size of the slide region.
   * @type {number}
   * @default 100
   */
  slideRegionSize?: number | undefined;
  /**
   * The height of the row.
   * @type {number}
   * @default 62
   */
  rowHeight?: number | undefined; //
  nodeContentRenderer?: NodeRenderer<T> | undefined;
  placeholderRenderer?: PlaceholderRenderer<T> | undefined;
}

export interface ThemeProps<T = {}> extends ThemeTreeProps<T> {
  treeNodeRenderer?: TreeRenderer<T> | undefined;
}

// Prop Functions
export type OnChangeFn<T> = (treeData: Array<TreeItem<T>>) => void;
export type GetNodeKeyFn<T = {}> = (data: TreeNode<T> & TreeIndex) => NodeKey;
export type GetFlatNodeKeyFn<T = {}> = (node: TreeItem<T> | any) => NodeKey;
export type GenerateNodePropsFn<T> = (
  data: ExtendedNodeData<T>,
) => ExtendedNodeProps;
export type OnMoveNodeFn<T> = (
  data: NodeData<T> & FullTree<T> & OnMovePreviousAndNextLocation<T>,
) => void;
export type OnVisibilityToggleFn<T> = (data: OnVisibilityToggleData<T>) => void;
export type OnDragStateChangedFn<T> = (data: OnDragStateChangedData<T>) => void;
export type MaxDepth = number | undefined;
export type RowDirection = 'ltr' | 'rtl' | undefined;
export type CanDragFn =
  | ((data: ExtendedNodeData) => boolean)
  | boolean
  | undefined;
export type CanDropFn<T> = (
  data: OnDragPreviousAndNextLocation<T> & NodeData<T>,
) => boolean;
export type CanNodeHaveChildrenFn<T> = (node: TreeItem<T>) => boolean;
export type SearchMethodFn<T> = (data: SearchData<T>) => boolean;
export type SearchQuery = string | any | undefined;
export type SearchFocusOffset = number | undefined;
export type OnlyExpandSearchedNodes = boolean | undefined;
export type SearchFinishCallbackFn<T> = (matches: Array<NodeData<T>>) => void;
export type DNDType = string | undefined;
export type ShouldCopyOnOutsideDropFn<T> =
  | boolean
  | ((data: ShouldCopyData<T>) => boolean)
  | undefined;
export type Classname = string | undefined;
export type IsVirtualized = boolean | undefined;

export interface ReactAppleTreeProps<T = {}> extends ThemeTreeProps<T> {
  /**
   * The array of tree items in the form of a tree data structure.
   *
   * @type {Array<TreeItem<T>>}
   */
  treeData: Array<TreeItem<T>>;

  /**
   * The callback function triggered when the tree data changes.
   *
   * @type {OnChangeFn<T>}
   * @param {Array<TreeItem<T>>} treeData - The updated tree data.
   * @returns {void}
   */
  onChange: OnChangeFn<T>;

  /**
   * A function that returns the unique key for each tree node.
   *
   * @type {GetNodeKeyFn<T>}
   * @param {TreeNode & TreeIndex} data - The data of the node.
   * @property {TreeItem<T>} data.node - The tree node.
   * @property {number} data.treeIndex - The index of the node in the tree.
   * @returns {string | number} - The unique key for the node.
   */
  getNodeKey: GetNodeKeyFn<T>;

  /**
   * A function that generates additional props for each tree node.
   *
   * @type {GenerateNodePropsFn<T>}
   * @param {ExtendedNodeData<T>} data - The data of the node.
   * @property {TreeItem<T>} data.node - The tree node.
   * @property {number} data.treeIndex - The index of the node in the tree.
   * @property {NumberOrStringArray} data.path - The path of the node.
   * @property {TreeItem<T>} data.parentNode - The parent node of the node.
   * @property {number[]} data.lowerSiblingCounts - The number of siblings below each ancestor of the node.
   * @property {boolean} data.isSearchMatch - Whether the node is a search match.
   * @property {boolean} data.isSearchFocus - Whether the node is the search focus.
   * @returns {ExtendedNodeProps} props - Additional props for the node.
   * @property {React.ReactNode[]} props.buttons - The buttons for the node.
   * @property {()=>React.ReactNode} props.title - The title for the node.
   * @property {React.CSSProperties} props.style - The style for the node.
   * @property {string} props.className - The class name for the node.
   */
  generateNodeProps?: GenerateNodePropsFn<T>;

  /**
   * A function that is called when a node is moved within the tree.
   *
   * @type {OnMoveNodeFn<T>}
   * @param {NodeData<T> & FullTree<T> & OnMovePreviousAndNextLocation<T>} data - The data of the moved node.
   * @property {TreeItem<T>} data.node - The moved node.
   * @property {number} data.treeIndex - The index of the moved node in the tree.
   * @property {NumberOrStringArray} data.path - The path of the moved node.
   * @property {Array<TreeItem<T>>} treeData - The updated tree data.
   * @property {number} data.prevTreeIndex - The previous index of the moved node.
   * @property {NumberOrStringArray} data.prevPath - The previous path of the moved node.
   * @property {number} data.nextTreeIndex - The next index of the moved node.
   * @property {NumberOrStringArray} data.nextPath - The next path of the moved node.
   * @property {TreeItem<T>} data.nextParentNode - The parent node of the moved node.
   * @returns {void}
   */
  onMoveNode?: OnMoveNodeFn<T>;

  /**
   * A function that is called when a node's visibility is toggled.
   *
   * @type {OnVisibilityToggleFn<T>}
   * @param {OnVisibilityToggleData<T>} data - The data of the toggled node.
   * @property {Array<TreeItem<T>>} data.treeData - The updated tree data.
   * @property {TreeItem<T>} data.node - The toggled node.
   * @property {boolean} data.expanded - Whether the node is expanded.
   * @returns {void}
   */
  onVisibilityToggle?: OnVisibilityToggleFn<T>;

  /**
   * A function that is called when the drag state changes for a node.
   *
   * @type {OnDragStateChangedFn<T>}
   * @param {OnDragStateChangedData<T>} data - The data of the drag state.
   * @property {boolean} data.isDragging - Whether a node is being dragged.
   * @property {TreeItem<T>} data.draggedNode - The dragged node.
   * @returns {void}
   */
  onDragStateChanged?: OnDragStateChangedFn<T>;

  /**
   * The maximum depth of the tree.
   *
   * @type {number}
   */
  maxDepth?: MaxDepth;

  /**
   * The direction in which the rows of the tree are rendered.
   *
   * @type {RowDirection}
   * @default "ltr"
   */
  rowDirection?: RowDirection;

  /**
   * A function that determines if a node can be dragged.
   *
   * @type {CanDragFn}
   * @param {ExtendedNodeData} data - The data of the node.
   * @property {TreeItem<T>} data.node - The tree node.
   * @property {number} data.treeIndex - The index of the node in the tree.
   * @property {NumberOrStringArray} data.path - The path of the node.
   * @property {TreeItem<T>} data.parentNode - The parent node of the node.
   * @property {number[]} data.lowerSiblingCounts - The number of siblings below each ancestor of the node.
   * @property {boolean} data.isSearchMatch - Whether the node is a search match.
   * @property {boolean} data.isSearchFocus - Whether the node is the search focus.
   * @returns {boolean} - Whether the node can be dragged.
   */
  canDrag?: CanDragFn;

  /**
   * A function that determines if a node can accept a drop.
   *
   * @type {CanDropFn<T>}
   * @param {OnDragPreviousAndNextLocation<T> & NodeData<T>} data - The data of the drop.
   * @property {TreeItem<T>} data.node - The tree node.
   * @property {number} data.treeIndex - The index of the node in the tree.
   * @property {NumberOrStringArray} data.path - The path of the node.
   * @property {TreeItem<T>} data.prevParent - The parent node of the node before the drop.
   * @property {TreeItem<T>} data.nextParent - The parent node of the node after the drop.
   * @returns {boolean} - Whether the node can accept the drop.
   */
  canDrop?: CanDropFn<T>;

  /**
   * A function that determines if a node can have children.
   *
   * @type {CanNodeHaveChildrenFn<T> | boolean}
   * @param {TreeItem<T>} node - The tree node.
   * @returns {boolean} - Whether the node can have children.
   */
  canNodeHaveChildren?: CanNodeHaveChildrenFn<T> | boolean;

  /**
   * The theme configuration for the tree.
   *
   * @type {ThemeProps<T> | undefined}
   */
  theme?: ThemeProps<T> | undefined;

  /**
   * A function that defines the search method for filtering nodes.
   *
   * @type {SearchMethodFn<T>}
   * @param {SearchData<T>} data - The data of the search.
   * @property {TreeItem<T>} data.node - The tree node.
   * @property {number} data.treeIndex - The index of the node in the tree.
   * @property {NumberOrStringArray} data.path - The path of the node.
   * @property {string | any} data.searchQuery - The search query.
   * @returns {boolean} - Whether the node matches the search query.
   */
  searchMethod?: SearchMethodFn<T>;

  /**
   * The search query used to filter nodes.
   *
   * @type {string}
   */
  searchQuery?: SearchQuery;

  /**
   * The index of searched items to focus on.
   *
   * @type {number}
   */
  searchFocusOffset?: SearchFocusOffset;

  /**
   * Whether only the searched nodes should be expanded.
   *
   * @type {boolean}
   */
  onlyExpandSearchedNodes?: OnlyExpandSearchedNodes;

  /**
   * A callback function that is called when the search finishes.
   *
   * @type {SearchFinishCallbackFn<T>}
   * @param {Array<NodeData<T>>} matches - The nodes that match the search query.
   * @returns {void}
   */
  searchFinishCallback?: SearchFinishCallbackFn<T>;

  /**
   * The type of drag and drop operation.
   *
   * @type {DNDType}
   * @default "REACT_APPLE_TREE_ITEM"
   */
  dndType?: DNDType;

  /**
   * A function that determines if a node should be copied on an outside drop.
   *
   * @type {ShouldCopyOnOutsideDropFn<T> | boolean}
   * @param {ShouldCopyData<T>} data - The data of the node.
   * @property {TreeNode<T>} data.node - The tree node.
   * @property {NumberOrStringArray} data.prevPath - The previous path of the node.
   * @property {number} data.prevTreeIndex - The previous index of the node.
   * @returns {boolean} - Whether the node should be copied on an outside drop.
   * @default false
   */
  shouldCopyOnOutsideDrop?: ShouldCopyOnOutsideDropFn<T>;

  /**
   * The CSS class name for the component.
   *
   * @type {string}
   */
  className?: Classname;

  /**
   * Whether the tree should be virtualized for improved performance.
   *
   * @type {boolean}
   * @default true
   */
  isVirtualized?: IsVirtualized;

  /**
   * The drag and drop manager.
   *
   * @type {any}
   */
  dragDropManager?: any;
}

// Export Utility Fucntions

export interface GetNodeDataAtTreeIndexOrNextIndexFnParams<T> {
  targetIndex: number;
  currentIndex: number;
  node: TreeItem<T>;
  getNodeKey: GetNodeKeyFn<T>;
  path?: NumberOrStringArray;
  lowerSiblingCounts?: number[];
  ignoreCollapsed?: boolean;
  isPseudoRoot?: boolean;
}

export interface GetDescendantCountFnParams<T> {
  node: TreeItem<T>;
  ignoreCollapsed?: boolean;
}
export type GetDescendantCountFnReturnType = number;

export interface GetVisibleNodeCountFnParams<T> {
  treeData: Array<TreeItem<T>>;
}
export type GetVisibleNodeCountFnReturnType = number;

export interface GetVisibleNodeInfoAtIndexFnParams<T> {
  treeData: Array<TreeItem<T>>;
  index: number;
  getNodeKey: GetNodeKeyFn<T>;
}
export type GetVisibleNodeInfoAtIndexFnReturnType<T> = NodeData<T> | null;

export interface WalkDescendantsFnParams<T> {
  node: TreeItem<T>;
  currentIndex: number;
  parentNode?: TreeItem<T> | null;
  path: NumberOrStringArray;
  lowerSiblingCounts: number[];
  getNodeKey: GetNodeKeyFn<T>;
  callback: any;
  ignoreCollapsed?: boolean;
  isPseudoRoot?: boolean;
}

export interface WalkFnParams<T> {
  treeData: Array<TreeItem<T>>;
  getNodeKey: GetNodeKeyFn<T>;
  callback: (data: NodeData<T>) => void;
  ignoreCollapsed?: boolean;
}
export type WalkFnReturnType = void;

export interface MapDescendantsFnParams<T> {
  node: TreeItem<T>;
  currentIndex: number;
  parentNode?: TreeItem<T> | null;
  path: NumberOrStringArray;
  lowerSiblingCounts: number[];
  getNodeKey: GetNodeKeyFn<T>;
  callback: any;
  ignoreCollapsed?: boolean;
  isPseudoRoot?: boolean;
}
export interface MapFnParams<T> {
  treeData: Array<TreeItem<T>>;
  getNodeKey: GetNodeKeyFn<T>;
  callback: (data: NodeData<T>) => void;
  ignoreCollapsed?: boolean;
}
export type MapFnReturnType<T> = Array<TreeItem<T>>;

export interface ToggleExpandedForAllFnParams<T> {
  treeData: Array<TreeItem<T>>;
  expanded?: boolean;
}
export type ToggleExpandedForAllFnReturnType<T> = Array<TreeItem<T>>;

export interface ChangeNodeAtPathFnParams<T> {
  treeData: Array<TreeItem<T>>;
  path: NumberOrStringArray;
  newNode: TreeItem<T> | ((data: any) => TreeItem<T> | null) | null;
  getNodeKey: GetNodeKeyFn<T>;
  ignoreCollapsed?: boolean;
}
export type ChangeNodeAtPathFnReturnType<T> = Array<TreeItem<T>>;

export interface RemoveNodeAtPathFnParams<T> {
  treeData: Array<TreeItem<T>>;
  path: NumberOrStringArray;
  getNodeKey: GetNodeKeyFn<T>;
  ignoreCollapsed?: boolean;
}
export type RemoveNodeAtPathFnReturnType<T> = Array<TreeItem<T>>;

export interface RemoveNodeFnParams<T> {
  treeData: Array<TreeItem<T>>;
  path: NumberOrStringArray;
  getNodeKey: GetNodeKeyFn<T>;
  ignoreCollapsed?: boolean;
}
export type RemoveNodeFnReturnType<T> = {
  treeData: Array<TreeItem<T>>;
  node?: TreeItem<T> | null;
  treeIndex?: number | null;
};

export interface GetNodeAtPathFnParams<T> {
  treeData: Array<TreeItem<T>>;
  path: NumberOrStringArray;
  getNodeKey: GetNodeKeyFn<T>;
  ignoreCollapsed?: boolean;
}
export type GetNodeAtPathFnReturnType<T> = NodeData<T> | null;

export interface AddNodeUnderParentFnParams<T> {
  treeData: Array<TreeItem<T>>;
  parentKey: NodeKey | null;
  newNode: TreeItem<T>;
  getNodeKey: GetNodeKeyFn<T>;
  ignoreCollapsed?: boolean;
  expandParent?: boolean;
  addAsFirstChild?: boolean;
}
export type AddNodeUnderParentFnReturnType<T> = {
  treeData: Array<TreeItem<T>>;
  treeIndex: number | null;
};

export interface AddNodeAtDepthAndIndexFnParams<T> {
  node: TreeItem<T>;
  path?: NumberOrStringArray;
  newNode: TreeItem<T>;
  getNodeKey: GetNodeKeyFn<T>;
  currentIndex: number;
  currentDepth: number;
  targetDepth: number;
  minimumTreeIndex: number;
  ignoreCollapsed: boolean;
  expandParent: boolean;
  isPseudoRoot?: boolean;
  isLastChild: boolean;
}
export type AddNodeAtDepthAndIndexFnReturnType<T> = {
  node: TreeItem<T>;
  nextIndex: number;
  insertedTreeIndex?: number | null;
  parentPath?: NumberOrStringArray;
  parentNode?: TreeItem<T> | null;
};

export interface InsertNodeFnParams<T> {
  treeData: Array<TreeItem<T>>;
  depth: number;
  minimumTreeIndex: number;
  newNode: TreeItem<T>;
  getNodeKey: GetNodeKeyFn<T>;
  ignoreCollapsed?: boolean;
  expandParent?: boolean;
}
export type InsertNodeFnReturnType<T> = {
  treeData?: Array<TreeItem<T>>;
  treeIndex?: number | null;
  path?: NumberOrStringArray;
  parentNode?: TreeItem<T> | null;
};

export interface GetFlatDataFromTreeFnParams<T> {
  treeData: Array<TreeItem<T>>;
  getNodeKey: GetNodeKeyFn<T>;
  ignoreCollapsed?: boolean;
}
export type GetFlatDataFromTreeFnReturnType<T> = Array<TreeNode<T>>;

export interface GetTreeFromFlatDataFnParams<T> {
  flatData: Array<TreeItem<T>>;
  getKey: GetFlatNodeKeyFn<T>;
  getParentKey: GetFlatNodeKeyFn<T>;
  rootKey: NodeKey;
}
export type GetTreeFromFlatDataFnReturnType<T> = Array<TreeItem<T>>;

export interface FindFnParams<T> {
  treeData: Array<TreeItem<T>>;
  getNodeKey: GetNodeKeyFn<T>;
  searchQuery: SearchQuery;
  searchMethod: SearchMethodFn<T>;
  searchFocusOffset?: SearchFocusOffset;
  expandAllMatchPaths?: boolean;
  expandFocusMatchPaths?: boolean;
}
export type FindFnReturnType<T> = {
  matches: Array<NodeData<T>>;
  treeData: Array<TreeItem<T>>;
};
export interface FindFnTraverseParams<T> {
  node: TreeItem<T>;
  currentIndex: number;
  path?: NumberOrStringArray;
  isPseudoRoot?: boolean;
}
