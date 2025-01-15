import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';
import packageJson from '../package.json';

addons.setConfig({
  theme: {
    ...themes.light,
    brandTitle: `React Apple Tree (v${packageJson.version})`,
  },
});
