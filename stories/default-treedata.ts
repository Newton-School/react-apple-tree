export const defaultTreeData = [
  {
    id: 2,
    title: 'Node 1',
    children: [{ id: 2, title: 'Node 1.1' }],
  },
  {
    id: 3,
    title: 'Node 2',
    children: [
      { id: 4, title: 'Node 2.1' },
      { id: 5, title: 'Node 2.2', children: [{ id: 6, title: 'Node 2.2.1' }] },
    ],
  },
  {
    id: 7,
    title: 'Node 3',
  },
];
