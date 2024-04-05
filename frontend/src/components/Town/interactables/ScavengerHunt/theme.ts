import { extendTheme } from '@chakra-ui/react';
import '@fontsource/bungee';
import '@fontsource-variable/cabin';

const theme = extendTheme({
  fonts: {
    heading: `'Bungee', sans-serif`,
    body: `'Cabin Variable', sans-serif`,
  },
});

export default theme;
