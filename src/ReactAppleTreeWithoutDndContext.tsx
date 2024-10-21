import React from "react";

import { ReactAppleTreeProps } from "./types";

import { TreeDataContextProvider } from "./contexts/TreeDataContext";
import { PropDataContextProvider } from "./contexts/PropDataContext";
import { DNDContextProvider } from "./contexts/DNDContext";

import TreeList from "./components/TreeList";
import { SearchContextProvider } from "./contexts/SearchContext";
import { StyledReactAppleTree } from "./ReactAppleTree.styles";

export default function ReactAppleTreeWithoutDndContext<T>(
  props: React.PropsWithChildren<ReactAppleTreeProps<T>>
) {
  return (
    <PropDataContextProvider>
      <TreeDataContextProvider>
        <SearchContextProvider>
          <DNDContextProvider>
            <StyledReactAppleTree className={props.className}>
              <TreeList {...props} />
            </StyledReactAppleTree>
          </DNDContextProvider>
        </SearchContextProvider>
      </TreeDataContextProvider>
    </PropDataContextProvider>
  );
}
