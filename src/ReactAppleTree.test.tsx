import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import ReactAppleTree from './ReactAppleTree';
import { ReactAppleTreeProps } from './types';

interface GetDummyNodeProps {
  id: number;
  children?: Array<any>;
  expanded?: boolean;
}

const getDummyNode = ({ id, children, expanded }: GetDummyNodeProps) => ({
  id,
  name: `Node ${id}`,
  children,
  expanded,
});

const treeData = [
  getDummyNode({
    id: 1,
    children: [
      getDummyNode({ id: 2, children: [getDummyNode({ id: 3 })] }),
      getDummyNode({ id: 4 }),
    ],
  }),
  getDummyNode({ id: 5 }),
];

const expandedTreeData = [
  getDummyNode({
    id: 1,
    expanded: true,
    children: [
      getDummyNode({
        id: 2,
        expanded: true,
        children: [getDummyNode({ id: 3 })],
      }),
      getDummyNode({ id: 4 }),
    ],
  }),
  getDummyNode({ id: 5 }),
];

const defaultProps: ReactAppleTreeProps<any> = {
  treeData,
  onChange: () => {},
  getNodeKey: ({ node }) => node.id,
};

describe('ReactAppleTree', () => {
  // Rendering
  it('renders without crashing', () => {
    const { container } = render(<ReactAppleTree {...defaultProps} />);

    expect(container).toBeInTheDocument();
  });

  // Custom node renderer
  it('renders with custom node renderer', () => {
    render(
      <ReactAppleTree
        {...defaultProps}
        generateNodeProps={({ node }) => ({
          title: () => `Node - ${node.name}`,
        })}
      />,
    );
    expect(screen.queryByText('Node - Node 1')).toBeInTheDocument();
  });

  // Rendering nodes
  it('should render 0 nodes for empty treeData', () => {
    render(<ReactAppleTree {...defaultProps} treeData={[]} />);
    expect(screen.queryAllByRole('row').length).toEqual(0);
  });
  it('should render 1 node for treeData with 1 node', () => {
    render(
      <ReactAppleTree {...defaultProps} treeData={[getDummyNode({ id: 1 })]} />,
    );
    expect(screen.queryAllByRole('row').length).toEqual(1);
  });
  it('should render 3 nodes for treeData with 3 nodes', () => {
    render(
      <ReactAppleTree
        {...defaultProps}
        treeData={[
          getDummyNode({ id: 1 }),
          getDummyNode({ id: 2 }),
          getDummyNode({ id: 3 }),
        ]}
      />,
    );
    expect(screen.queryAllByRole('row').length).toEqual(3);
  });

  // Nested Tree
  it('should render nested, expanded tree', () => {
    render(<ReactAppleTree {...defaultProps} treeData={expandedTreeData} />);
    expect(screen.queryAllByRole('row').length).toEqual(5);
  });
  it('should render nested, collapsed tree', () => {
    render(<ReactAppleTree {...defaultProps} treeData={treeData} />);
    expect(screen.queryAllByRole('row').length).toEqual(2);
  });

  // Expand/Collapse
  it('should expand/collapse nodes', () => {
    const onVisibilityToggle = jest.fn();

    render(
      <ReactAppleTree
        {...defaultProps}
        generateNodeProps={({ node }) => ({
          title: () => `Node - ${node.name}`,
        })}
        treeData={treeData}
        onVisibilityToggle={onVisibilityToggle}
      />,
    );
    expect(screen.queryAllByRole('row').length).toEqual(2);

    // Expanding Node 1
    fireEvent.click(screen.getByTestId('tree-item-visibility-toggle-button-1'));
    expect(screen.queryAllByRole('row').length).toEqual(4);
    expect(screen.getByText('Node - Node 2')).toBeInTheDocument();
    expect(screen.queryByText('Node - Node 3')).not.toBeInTheDocument();
    expect(screen.getByText('Node - Node 4')).toBeInTheDocument();
    expect(onVisibilityToggle).toHaveBeenCalled();

    // Expanding Node 2
    fireEvent.click(screen.getByTestId('tree-item-visibility-toggle-button-2'));
    expect(screen.queryAllByRole('row').length).toEqual(5);
    expect(screen.getByText('Node - Node 3')).toBeInTheDocument();
    expect(onVisibilityToggle).toHaveBeenCalled();

    // Collapsing Node 1
    fireEvent.click(screen.getByTestId('tree-item-visibility-toggle-button-1'));
    expect(screen.queryAllByRole('row').length).toEqual(2);
    expect(screen.queryByText('Node - Node 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Node - Node 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Node - Node 4')).not.toBeInTheDocument();
    expect(onVisibilityToggle).toHaveBeenCalled();
  });

  // Non Virtualized List
  it('should render non-virtualized list, isVirtualized false', () => {
    render(<ReactAppleTree {...defaultProps} isVirtualized={false} />);
    expect(screen.queryByTestId('virtualized-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('non-virtualized-list')).toBeInTheDocument();
  });

  // Theme Props
  it('should render with custom row height', () => {
    render(<ReactAppleTree {...defaultProps} rowHeight={100} />);
    expect(screen.getByTestId('tree-item-1')).toHaveStyle('min-height: 110px');
  });
  it('should render with custom scaffold width', () => {
    render(<ReactAppleTree {...defaultProps} scaffoldBlockPxWidth={50} />);
    expect(
      screen.getByTestId('tree-item-indentation-main-block-1'),
    ).toHaveStyle('width: 50px');
  });

  // Search Feature
  it('should call searchFinishCallback on search', () => {
    const searchFinishCallback = jest.fn();

    render(
      <ReactAppleTree
        {...defaultProps}
        searchMethod={({ node, searchQuery }) =>
          searchQuery && node.name.indexOf(searchQuery) > -1
        }
        searchQuery="Node 1"
        searchFinishCallback={searchFinishCallback}
      />,
    );
    expect(searchFinishCallback).toHaveBeenCalledWith([
      { node: treeData[0], path: [1], treeIndex: 0 },
    ]);
  });
});
