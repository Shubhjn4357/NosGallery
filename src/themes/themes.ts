export type ThemeId =
  | 'nos'
  | 'native'
  | 'glassmorphism'
  | 'liquidglass'
  | 'neomorphism'
  | 'amoled'
  | 'cyberpunk'
  | 'luxury'
  | 'minimalwhite'
  | 'materialyou'
  | 'android17';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  backgroundColor: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  gradient?: string[];
  hasDots?: boolean;
  blurAmount?: number;
  glow?: boolean;
}

export const themes: Record<ThemeId, ThemeConfig> = {
  nos: {
    id: 'nos',
    name: 'Nothing OS',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    subtextColor: '#888888',
    accentColor: '#7C9EFF',
    borderColor: '#252528',
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    hasDots: true,
  },
  native: {
    id: 'native',
    name: 'Native UI',
    backgroundColor: '#f2f2f7',
    textColor: '#000000',
    subtextColor: '#8e8e93',
    accentColor: '#007aff',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gradient: ['#ffffff', '#f2f2f7'],
  },
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.6)',
    accentColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    blurAmount: 20,
  },
  liquidglass: {
    id: 'liquidglass',
    name: 'Liquid Glass',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.7)',
    accentColor: '#ff2d55',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
    borderRadius: 28,
    shadowColor: '#ff2d55',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    gradient: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)'],
    blurAmount: 30,
    glow: true,
  },
  neomorphism: {
    id: 'neomorphism',
    name: 'Neomorphism',
    backgroundColor: '#e0e0e0',
    textColor: '#4a4a4a',
    subtextColor: '#8a8a8a',
    accentColor: '#3f51b5',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 24,
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  amoled: {
    id: 'amoled',
    name: 'AMOLED Neon',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    subtextColor: '#666666',
    accentColor: '#39ff14',
    borderColor: '#39ff14',
    borderWidth: 1.5,
    borderRadius: 16,
    shadowColor: '#39ff14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
    glow: true,
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    backgroundColor: 'rgba(26, 8, 38, 0.9)',
    textColor: '#00ffff',
    subtextColor: '#ff0055',
    accentColor: '#f1f100',
    borderColor: '#ff0055',
    borderWidth: 2,
    borderRadius: 8,
    shadowColor: '#ff0055',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 4,
    gradient: ['#1a0826', '#0a0210'],
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury Obsidian',
    backgroundColor: '#0a0a0a',
    textColor: '#dfba6b',
    subtextColor: '#8f8f8f',
    accentColor: '#dfba6b',
    borderColor: '#dfba6b',
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: '#dfba6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    gradient: ['#1c1a17', '#0a0a0a'],
  },
  minimalwhite: {
    id: 'minimalwhite',
    name: 'Minimal White',
    backgroundColor: '#ffffff',
    textColor: '#1c1c1e',
    subtextColor: '#c7c7cc',
    accentColor: '#000000',
    borderColor: '#eaeaea',
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  materialyou: {
    id: 'materialyou',
    name: 'Material You',
    backgroundColor: '#f7ebec',
    textColor: '#403334',
    subtextColor: '#706061',
    accentColor: '#904e55',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gradient: ['#f7ebec', '#e9dcde'],
  },
  android17: {
    id: 'android17',
    name: 'Android 17 Dot Grid',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    subtextColor: '#8e8e93',
    accentColor: '#7C9EFF',
    borderColor: '#1a1a1c',
    borderWidth: 1.5,
    borderRadius: 24,
    shadowColor: '#7C9EFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    hasDots: true,
  },
};
