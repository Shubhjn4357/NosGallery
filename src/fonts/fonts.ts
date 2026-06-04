import { Platform } from 'react-native';

export type FontId =
  | 'nos_dot'
  | 'inter'
  | 'sf_pro'
  | 'poppins'
  | 'roboto'
  | 'manrope'
  | 'outfit'
  | 'dm_sans'
  | 'space_grotesk'
  | 'jetbrains_mono'
  | 'geist'
  | 'circular'
  | 'montserrat'
  | 'ubuntu'
  | 'figtree'
  | 'satoshi';

export interface FontConfig {
  id: FontId;
  name: string;
  fontFamily: string;
  fallbackStyle: {
    fontFamily: string;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  };
}

export const fonts: Record<FontId, FontConfig> = {
  nos_dot: {
    id: 'nos_dot',
    name: 'NOS Dot Matrix',
    fontFamily: 'CourierNew-Bold',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }),
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
  },
  inter: {
    id: 'inter',
    name: 'Inter',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  sf_pro: {
    id: 'sf_pro',
    name: 'SF Pro',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  poppins: {
    id: 'poppins',
    name: 'Poppins',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Arial', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  roboto: {
    id: 'roboto',
    name: 'Roboto',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Helvetica', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  manrope: {
    id: 'manrope',
    name: 'Manrope',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'HelveticaNeue', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  outfit: {
    id: 'outfit',
    name: 'Outfit',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Avenir', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  dm_sans: {
    id: 'dm_sans',
    name: 'DM Sans',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Helvetica', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  space_grotesk: {
    id: 'space_grotesk',
    name: 'Space Grotesk',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Courier', android: 'sans-serif-condensed', default: 'sans-serif' }),
    },
  },
  jetbrains_mono: {
    id: 'jetbrains_mono',
    name: 'JetBrains Mono',
    fontFamily: 'Courier',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    },
  },
  geist: {
    id: 'geist',
    name: 'Geist Sans',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-light', default: 'sans-serif' }),
    },
  },
  circular: {
    id: 'circular',
    name: 'Circular Std',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'ArialRoundedMTBold', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  montserrat: {
    id: 'montserrat',
    name: 'Montserrat',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Trebuchet MS', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  ubuntu: {
    id: 'ubuntu',
    name: 'Ubuntu',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Gill Sans', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  figtree: {
    id: 'figtree',
    name: 'Figtree',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Optima', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
  satoshi: {
    id: 'satoshi',
    name: 'Satoshi',
    fontFamily: 'System',
    fallbackStyle: {
      fontFamily: Platform.select({ ios: 'Futura', android: 'sans-serif', default: 'sans-serif' }),
    },
  },
};

export const getFontStyle = (fontId: FontId) => {
  const font = fonts[fontId] || fonts.sf_pro;
  return font.fallbackStyle;
};
