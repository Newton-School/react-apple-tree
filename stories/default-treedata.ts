export const defaultTreeData = [
  {
    id: 1,
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

export const defaultSecondTreeData = [
  {
    id: 8,
    title: 'Node 1',
    children: [{ id: 9, title: 'Node 1.1' }],
  },
  {
    id: 10,
    title: 'Node 2',
    children: [
      { id: 11, title: 'Node 2.1' },
      {
        id: 12,
        title: 'Node 2.2',
        children: [{ id: 13, title: 'Node 2.2.1' }],
      },
    ],
  },
  {
    id: 14,
    title: 'Node 3',
  },
];
