import { addons, types } from '@storybook/addons';
import { themes } from '@storybook/theming';
import packageJson from '../package.json';
import React from 'react';
import VersionSwitcher from './addons/VersionSwitcher';

addons.register('storybook/version-switcher', () => {
  addons.add('storybook/version-switcher', {
    title: 'Versions',
    type: types.TOOL,
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => React.createElement(VersionSwitcher),
  });
});

addons.setConfig({
  theme: {
    ...themes.light,
    brandTitle: `React Apple Tree (v${packageJson.version})`,
  },
});
