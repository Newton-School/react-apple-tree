import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';

const version = process.env.LIBRARY_VERSION || 'Unknown Version';

addons.setConfig({
  theme: {
    ...themes.light,
    brandTitle: `React Apple Tree (v${version})`,
  },
});
