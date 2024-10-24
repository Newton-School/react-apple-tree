import cloneDeep from 'lodash.clonedeep';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  ContextProviderProps,
  FlatTreeItem,
  NodeData,
  NumberOrStringArray,
  SearchedNodeMap,
  TreeItem,
  TreeMap,
} from '../types';
import { collapseTree, expandNode } from '../utils/node-operations';
import { dfs } from '../utils/tree-traversal';
import { PropDataContext } from './PropDataContext';
import { TreeDataContext } from './TreeDataContext';

interface SearchContextProps {
  searchedNodeMap: SearchedNodeMap;
  searchedNodeIndex: number | null;
}

const SearchContext = createContext<SearchContextProps>({
  searchedNodeMap: {},
  searchedNodeIndex: null,
});

function SearchContextProvider(props: ContextProviderProps): React.JSX.Element {
  const { appleTreeProps } = useContext(PropDataContext);
  const { treeMap, flatTree, setTreeMap, setFlatTree } =
    useContext(TreeDataContext);

  const [searchedNodeMap, setSearchedNodeMap] = useState<SearchedNodeMap>({});
  const [searchedNodeIndex, setSearchedNodeIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    let searchedNodesList: Array<NodeData> = [];
    let newTreeMap: TreeMap = { ...treeMap };
    let newFlatArray: Array<FlatTreeItem> = [...flatTree];
    if (appleTreeProps.searchQuery === false) {
      setSearchedNodeIndex(null);
      setSearchedNodeMap({});
    } else {
      if (
        appleTreeProps.onlyExpandSearchedNodes ||
        appleTreeProps.searchQuery === ''
      ) {
        newFlatArray = collapseTree(
          appleTreeProps.treeData,
          treeMap,
          flatTree,
          appleTreeProps.getNodeKey,
        );
      }
      if (appleTreeProps.searchQuery && appleTreeProps.searchMethod) {
        const newSearchedNodeMap: SearchedNodeMap = {};
        let treeIndexStack: Array<number> = [-1];
        let siblingStack: Array<number> = [];
        let lastDepth = 1;
        const path: NumberOrStringArray = [];
        dfs({
          treeData: appleTreeProps.treeData,
          callback: (node: TreeItem) => {
            const isNodeExpanded =
              !!node.expanded && !appleTreeProps.onlyExpandSearchedNodes;
            const parentKey = path.length > 1 ? path[path.length - 2] : null;
            const isParentExpanded = parentKey
              ? !!treeMap[parentKey].expanded
              : false;
            let searchMatch = false;
            if (appleTreeProps.searchMethod) {
              searchMatch = appleTreeProps.searchMethod({
                node,
                treeIndex: treeIndexStack[treeIndexStack.length - 1],
                path: cloneDeep(path),
                searchQuery: appleTreeProps.searchQuery,
              });
              const key = appleTreeProps.getNodeKey({
                node,
                treeIndex: treeIndexStack[treeIndexStack.length - 1],
              });
              if (searchMatch) {
                searchedNodesList.push({
                  node,
                  path: cloneDeep(path),
                  treeIndex: treeIndexStack[treeIndexStack.length - 1],
                });
                newSearchedNodeMap[key] = true;
                path.slice(0, path.length - 1).forEach((nodeKey) => {
                  const [map, flatArray] = expandNode(
                    nodeKey,
                    newTreeMap[nodeKey],
                    newTreeMap,
                    newFlatArray,
                    appleTreeProps.getNodeKey,
                  );
                  newTreeMap = { ...newTreeMap, ...map };
                  newFlatArray = [...flatArray];
                });
              } else {
                newSearchedNodeMap[key] = false;
              }
            }
            if (
              (isNodeExpanded && !appleTreeProps.onlyExpandSearchedNodes) ||
              (isParentExpanded && !appleTreeProps.onlyExpandSearchedNodes) ||
              searchMatch ||
              lastDepth === path.length
            ) {
              if (treeIndexStack.length > 1) {
                treeIndexStack = Array.from(
                  treeIndexStack,
                  () => treeIndexStack[treeIndexStack.length - 1],
                );
                siblingStack = Array.from(siblingStack, () => 0);
              }
              lastDepth = path.length;
            }
          },
          ignoreCollapsed: false,
          onGoingInside: (node: TreeItem) => {
            siblingStack = siblingStack.slice(0, path.length + 1);
            if (siblingStack.length < path.length + 1) {
              siblingStack.push(1);
            } else {
              siblingStack[siblingStack.length - 1] += 1;
            }
            if (treeIndexStack.length === 1 && treeIndexStack[0] !== 0) {
              treeIndexStack.push(treeIndexStack[0] + 1);
            } else {
              treeIndexStack.push(
                treeIndexStack[treeIndexStack.length - 1] +
                  siblingStack[path.length],
              );
            }
            path.push(
              appleTreeProps.getNodeKey({
                node,
                treeIndex: treeIndexStack[treeIndexStack.length - 1],
              }),
            );
          },
          onGoingOutside: () => {
            treeIndexStack.pop();
            if (lastDepth >= path.length) {
              lastDepth = path.length;
            }
            path.pop();
          },
        });
        setSearchedNodeMap({ ...newSearchedNodeMap });
      } else {
        setSearchedNodeMap({});
        searchedNodesList = [];
      }
      const highlightedNodeIndex =
        searchedNodesList[appleTreeProps.searchFocusOffset || 0]?.treeIndex;
      setSearchedNodeIndex(highlightedNodeIndex);
      if (appleTreeProps.searchFinishCallback) {
        appleTreeProps.searchFinishCallback(searchedNodesList);
      }
      setFlatTree(newFlatArray);
      setTreeMap({ ...newTreeMap });
    }
  }, [appleTreeProps.searchQuery]);

  return (
    <SearchContext.Provider value={{ searchedNodeMap, searchedNodeIndex }}>
      {props.children}
    </SearchContext.Provider>
  );
}

export { SearchContext, SearchContextProvider };
