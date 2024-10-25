import cloneDeep from 'lodash.clonedeep';
import React, { createContext, useState } from 'react';

import {
  ContextProviderProps,
  ReactAppleTreeProps,
  ThemeProps,
} from '../types';
import { defaultAppleTreeProps } from '../utils/default-props';

interface PropDataContextProps {
  appleTreeProps: ReactAppleTreeProps;
  setAppleTreeProps: any;
}

const PropDataContext = createContext<PropDataContextProps>({
  appleTreeProps: defaultAppleTreeProps,
  setAppleTreeProps: () => {},
});

function PropDataContextProvider(
  props: ContextProviderProps,
): React.JSX.Element {
  const [appleTreeProps, setAppleTreeProps] = useState<ReactAppleTreeProps>(
    defaultAppleTreeProps,
  );

  const mergeThemeProps = (themeProps: any): ThemeProps => {
    const mergedTheme: any = {
      style: { ...themeProps.theme?.style, ...themeProps.style },
      innerStyle: {
        ...themeProps.theme?.innerStyle,
        ...themeProps.innerStyle,
      },
      reactVirtualizedListProps: {
        ...themeProps.theme?.reactVirtualizedListProps,
        ...themeProps.reactVirtualizedListProps,
      },
    };
    const overridableThemeDefaults: any = {
      rowHeight: defaultAppleTreeProps.rowHeight,
      scaffoldBlockPxWidth: defaultAppleTreeProps.scaffoldBlockPxWidth,
      slideRegionSize: defaultAppleTreeProps.slideRegionSize,
    };
    Object.keys(overridableThemeDefaults).forEach((propKey) => {
      if (themeProps[propKey] === null) {
        mergedTheme[propKey] =
          typeof themeProps.theme[propKey] !== 'undefined'
            ? themeProps.theme[propKey]
            : overridableThemeDefaults[propKey];
      } else {
        mergedTheme[propKey] = themeProps[propKey];
      }
    });
    return mergedTheme;
  };

  return (
    <PropDataContext.Provider
      value={{
        appleTreeProps,
        setAppleTreeProps: (props: ReactAppleTreeProps) => {
          setAppleTreeProps((prevAppleTreeProps) => {
            const mergedTheme: ThemeProps = mergeThemeProps({
              ...prevAppleTreeProps,
              ...props,
            });
            return cloneDeep({
              ...prevAppleTreeProps,
              ...props,
              ...mergedTheme,
            });
          });
        },
      }}
    >
      {props.children}
    </PropDataContext.Provider>
  );
}

export { PropDataContext, PropDataContextProvider };
