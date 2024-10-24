import React, { createContext, useContext, useMemo, useState } from 'react';

import { ContextProviderProps, FlatTreeItem, NodeKey, TreeMap } from '../types';
import {
  collapseNode,
  expandNode,
  flattenTreeData,
} from '../utils/node-operations';
import { PropDataContext } from './PropDataContext';

interface TreeContextProps {
  treeMap: TreeMap;
  setTreeMap: any;
  flatTree: Array<FlatTreeItem>;
  setFlatTree: any;
  expandOrCollapseNode: (nodeKey: NodeKey) => void;
}

const TreeDataContext = createContext<TreeContextProps>({
  treeMap: {},
  setTreeMap: () => {},
  flatTree: [],
  setFlatTree: () => {},
  expandOrCollapseNode: () => {},
});

function TreeDataContextProvider(
  props: ContextProviderProps,
): React.JSX.Element {
  const [treeMap, setTreeMap] = useState<TreeMap>({});
  const [flatTree, setFlatTree] = useState<Array<FlatTreeItem>>([]);
  const { appleTreeProps } = useContext(PropDataContext);

  useMemo(() => {
    if (appleTreeProps && appleTreeProps.treeData) {
      const [map, flatArray] = flattenTreeData(
        appleTreeProps.treeData,
        appleTreeProps.getNodeKey,
      );
      setTreeMap({ ...map });
      setFlatTree([...flatArray]);
    }
  }, [appleTreeProps]);

  function expandOrCollapseNode(nodeKey: NodeKey) {
    if (!treeMap[nodeKey].expanded) {
      const [map, flatArray] = expandNode(
        nodeKey,
        treeMap[nodeKey],
        treeMap,
        flatTree,
        appleTreeProps.getNodeKey,
      );

      setTreeMap({ ...map });
      setFlatTree([...flatArray]);
    } else {
      const flatArray = collapseNode(
        nodeKey,
        treeMap[nodeKey],
        treeMap,
        flatTree,
      );
      setFlatTree([...flatArray]);
    }
    appleTreeProps.onChange(appleTreeProps.treeData);
  }

  return (
    <TreeDataContext.Provider
      value={{
        treeMap,
        setTreeMap,
        flatTree,
        setFlatTree,
        expandOrCollapseNode,
      }}
    >
      {props.children}
    </TreeDataContext.Provider>
  );
}

export { TreeDataContext, TreeDataContextProvider };
