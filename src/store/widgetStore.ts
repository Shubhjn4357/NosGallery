import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeId } from '../themes/themes';
import { FontId } from '../fonts/fonts';

export interface WidgetCustomizations {
  fontId: FontId;
  fontSize: number;
  textColor?: string;
  backgroundColor?: string;
  backgroundType: 'solid' | 'gradient' | 'glass' | 'none';
  gradientColors?: [string, string];
  borderRadius: number;
  transparency: number; // 0 to 100
  blur: number; // 0 to 50
  shadowType: 'none' | 'soft' | 'medium' | 'hard' | 'glow';
  titleText?: string;
  valueText?: string;
  accentColor?: string;
  themeOverride?: ThemeId | 'none';
}

export interface ActiveWidget {
  id: string;
  templateId: string;
  x: number; // 0 to 3 (for 4 column layout)
  y: number; // grid row index
  w: number; // 2 or 4
  h: number; // 2 or 4
  customizations: WidgetCustomizations;
}

export interface WallpaperConfig {
  id: string;
  name: string;
  category: 'AMOLED' | 'Nothing' | 'Gradient' | 'Glass' | 'Abstract' | 'Minimal';
  uri: string;
  thumbnailUri: string;
}

export interface UserGoogleAccount {
  email: string;
  name: string;
  photoUrl?: string;
}

export interface SystemSettings {
  batterySaver: boolean;
  refreshInterval: 'realtime' | '1min' | '5min' | '15min';
  autoRefresh: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  dynamicColorSync: boolean;
}

interface WidgetState {
  widgets: ActiveWidget[];
  pendingWidget: ActiveWidget | null;
  wallpapers: WallpaperConfig[];
  selectedWallpaper: WallpaperConfig;
  activeTheme: ThemeId;
  selectedWidgetId: string | null;
  downloadedPresets: ActiveWidget[];
  settings: SystemSettings;
  activeTab: 'editor' | 'marketplace' | 'wallpapers' | 'settings';
  googleUser: UserGoogleAccount | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning' | null;
  
  // Widget Grid Actions
  addWidget: (templateId: string, w: number, h: number) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  updateWidgetSize: (id: string, w: number, h: number) => void;
  updateWidgetCustomizations: (id: string, updates: Partial<WidgetCustomizations>) => void;
  duplicateWidget: (id: string) => void;
  clearWidgets: () => void;

  // Pending Actions
  setPendingWidget: (widget: ActiveWidget | null) => void;
  applyPendingToGrid: (customId?: string) => void;

  // Preset Actions
  saveWidgetPreset: (widget: ActiveWidget) => void;
  deleteWidgetPreset: (presetId: string) => void;
  loadPresetToGrid: (preset: ActiveWidget) => void;

  // Global UI Actions
  selectWallpaper: (wallpaperId: string) => void;
  setActiveTheme: (theme: ThemeId) => void;
  setSelectedWidgetId: (id: string | null) => void;
  updateSettings: (updates: Partial<SystemSettings>) => void;
  setActiveTab: (tab: 'editor' | 'marketplace' | 'wallpapers' | 'settings') => void;
  setGoogleUser: (user: UserGoogleAccount | null) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
}

const DEFAULT_WALLPAPERS: WallpaperConfig[] = [
  {
    id: 'wall_nothing_dark',
    name: 'Nothing Dot Matrix',
    category: 'Nothing',
    uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'wall_cyber_neon',
    name: 'Neo Shinjuku',
    category: 'AMOLED',
    uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1080&auto=format&fit=crop&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'wall_pastel_glass',
    name: 'Liquid Pastel',
    category: 'Gradient',
    uri: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1080&auto=format&fit=crop&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'wall_luxury_obsidian',
    name: 'Luxury Marble',
    category: 'Minimal',
    uri: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1080&auto=format&fit=crop&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'wall_nordic_fog',
    name: 'Nordic Mist',
    category: 'Minimal',
    uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=60',
  },
  {
    id: 'wall_cosmic_glow',
    name: 'Deep Space Nebula',
    category: 'Abstract',
    uri: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1080&auto=format&fit=crop&q=80',
    thumbnailUri: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=200&auto=format&fit=crop&q=60',
  },
];

const INITIAL_WIDGETS: ActiveWidget[] = [
  {
    id: 'init_clock',
    templateId: 'clock_dot',
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    customizations: {
      fontId: 'nos_dot',
      fontSize: 32,
      backgroundType: 'solid',
      backgroundColor: '#000000',
      borderRadius: 16,
      transparency: 15,
      blur: 10,
      shadowType: 'glow',
      titleText: 'NOTHING CLOCK',
      valueText: '10:42 PM',
      accentColor: '#ff0000',
      themeOverride: 'nos',
    },
  },
  {
    id: 'init_weather',
    templateId: 'weather_aqi',
    x: 0,
    y: 2,
    w: 2,
    h: 2,
    customizations: {
      fontId: 'inter',
      fontSize: 14,
      backgroundType: 'glass',
      borderRadius: 20,
      transparency: 20,
      blur: 20,
      shadowType: 'soft',
      titleText: 'LONDON',
      valueText: '12 AQI',
      accentColor: '#39ff14',
      themeOverride: 'glassmorphism',
    },
  },
  {
    id: 'init_steps',
    templateId: 'health_steps',
    x: 2,
    y: 2,
    w: 2,
    h: 2,
    customizations: {
      fontId: 'outfit',
      fontSize: 14,
      backgroundType: 'gradient',
      gradientColors: ['#1c1a17', '#0a0a0a'],
      borderRadius: 24,
      transparency: 0,
      blur: 0,
      shadowType: 'medium',
      titleText: 'STEPS TODAY',
      valueText: '8,432',
      accentColor: '#dfba6b',
      themeOverride: 'luxury',
    },
  },
];

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set) => ({
      widgets: INITIAL_WIDGETS,
      pendingWidget: null,
      wallpapers: DEFAULT_WALLPAPERS,
      selectedWallpaper: DEFAULT_WALLPAPERS[0],
      activeTheme: 'nos',
      selectedWidgetId: null,
      activeTab: 'editor',
      googleUser: null,
      toastMessage: null,
      toastType: null,
      showToast: (msg, type = 'info') => set({ toastMessage: msg, toastType: type }),
      hideToast: () => set({ toastMessage: null, toastType: null }),
      downloadedPresets: [
    {
      id: 'preset_flip_clock',
      templateId: 'clock_flip',
      x: 0, y: 0, w: 4, h: 2,
      customizations: {
        fontId: 'space_grotesk',
        fontSize: 28,
        backgroundType: 'solid',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        transparency: 0,
        blur: 0,
        shadowType: 'hard',
        titleText: 'FLIP CLOCK',
        valueText: '21:09',
        themeOverride: 'none',
      }
    },
    {
      id: 'preset_crypto',
      templateId: 'finance_crypto',
      x: 0, y: 0, w: 2, h: 2,
      customizations: {
        fontId: 'jetbrains_mono',
        fontSize: 13,
        backgroundType: 'solid',
        backgroundColor: '#000000',
        borderRadius: 16,
        transparency: 10,
        blur: 0,
        shadowType: 'glow',
        titleText: 'BTC / USD',
        valueText: '$67,490',
        accentColor: '#39ff14',
        themeOverride: 'amoled',
      }
    }
  ],
  settings: {
    batterySaver: false,
    refreshInterval: 'realtime',
    autoRefresh: true,
    hapticsEnabled: true,
    soundEnabled: true,
    dynamicColorSync: true,
  },

  // Widget actions
  addWidget: (templateId, w, h) => set((state) => {
    // Find next available spot on grid
    const busyCells = new Set<string>();
    state.widgets.forEach(widget => {
      for (let dx = 0; dx < widget.w; dx++) {
        for (let dy = 0; dy < widget.h; dy++) {
          busyCells.add(`${widget.x + dx},${widget.y + dy}`);
        }
      }
    });

    let x = 0;
    let y = 0;
    let found = false;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col <= 4 - w; col++) {
        let fits = true;
        for (let dx = 0; dx < w; dx++) {
          for (let dy = 0; dy < h; dy++) {
            if (busyCells.has(`${col + dx},${row + dy}`)) {
              fits = false;
              break;
            }
          }
          if (!fits) break;
        }
        if (fits) {
          x = col;
          y = row;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      // Just put it at the bottom
      y = state.widgets.length > 0 ? Math.max(...state.widgets.map(w => w.y + w.h)) : 0;
    }

    const newWidget: ActiveWidget = {
      id: `widget_${Date.now()}`,
      templateId,
      x,
      y,
      w,
      h,
      customizations: {
        fontId: 'inter',
        fontSize: 14,
        backgroundType: 'solid',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        transparency: 10,
        blur: 10,
        shadowType: 'soft',
        themeOverride: 'none',
      },
    };

    return {
      widgets: [newWidget, ...state.widgets],
      selectedWidgetId: newWidget.id,
    };
  }),

  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter((w) => w.id !== id),
    selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
  })),

  updateWidgetPosition: (id, x, y) => set((state) => ({
    widgets: state.widgets.map((w) => (w.id === id ? { ...w, x, y } : w)),
  })),

  updateWidgetSize: (id, w, h) => set((state) => ({
    widgets: state.widgets.map((widget) => (widget.id === id ? { ...widget, w, h } : widget)),
  })),

  updateWidgetCustomizations: (id, updates) => set((state) => {
    if (state.pendingWidget && state.pendingWidget.id === id) {
      return {
        pendingWidget: {
          ...state.pendingWidget,
          customizations: { ...state.pendingWidget.customizations, ...updates }
        }
      };
    }
    return {
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, customizations: { ...w.customizations, ...updates } } : w
      )
    };
  }),

  duplicateWidget: (id) => set((state) => {
    const original = state.widgets.find((w) => w.id === id);
    if (!original) return {};

    const copy: ActiveWidget = {
      ...original,
      id: `widget_${Date.now()}`,
      y: original.y + original.h, // shift down
    };

    return {
      widgets: [copy, ...state.widgets],
      selectedWidgetId: copy.id,
    };
  }),

  clearWidgets: () => set({ widgets: [], selectedWidgetId: null }),

  // Pending Actions
  setPendingWidget: (widget) => set((state) => {
    if (!widget) return { pendingWidget: null };

    // Find next available spot on grid for this widget size
    const w = widget.w;
    const h = widget.h;
    const busyCells = new Set<string>();
    state.widgets.forEach(activeW => {
      for (let dx = 0; dx < activeW.w; dx++) {
        for (let dy = 0; dy < activeW.h; dy++) {
          busyCells.add(`${activeW.x + dx},${activeW.y + dy}`);
        }
      }
    });

    let x = 0;
    let y = 0;
    let found = false;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col <= 4 - w; col++) {
        let fits = true;
        for (let dx = 0; dx < w; dx++) {
          for (let dy = 0; dy < h; dy++) {
            if (busyCells.has(`${col + dx},${row + dy}`)) {
              fits = false;
              break;
            }
          }
          if (!fits) break;
        }
        if (fits) {
          x = col;
          y = row;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      y = state.widgets.length > 0 ? Math.max(...state.widgets.map(w => w.y + w.h)) : 0;
    }

    const positionedWidget = {
      ...widget,
      x,
      y,
    };

    return { pendingWidget: positionedWidget };
  }),

  applyPendingToGrid: (customId?: string) => set((state) => {
    if (!state.pendingWidget) return {};
    const newWidget: ActiveWidget = {
      ...state.pendingWidget,
      id: customId || `widget_${Date.now()}`,
    };
    return {
      widgets: [newWidget, ...state.widgets],
      selectedWidgetId: newWidget.id,
      pendingWidget: null,
    };
  }),

  // Presets
  saveWidgetPreset: (widget) => set((state) => ({
    downloadedPresets: [
      ...state.downloadedPresets,
      {
        ...widget,
        id: `preset_${Date.now()}`,
      },
    ],
  })),

  deleteWidgetPreset: (presetId) => set((state) => ({
    downloadedPresets: state.downloadedPresets.filter((w) => w.id !== presetId),
  })),

  loadPresetToGrid: (preset) => set((state) => {
    // Determine new position and load preset
    const newWidget: ActiveWidget = {
      ...preset,
      id: `widget_${Date.now()}`,
      x: 0,
      y: state.widgets.length > 0 ? Math.max(...state.widgets.map(w => w.y + w.h)) : 0,
    };
    return {
      widgets: [newWidget, ...state.widgets],
      selectedWidgetId: newWidget.id,
    };
  }),

  // UI Actions
  selectWallpaper: (wallpaperId) => set((state) => {
    const wall = state.wallpapers.find((w) => w.id === wallpaperId);
    return wall ? { selectedWallpaper: wall } : {};
  }),

  setActiveTheme: (theme) => set({ activeTheme: theme }),

  setSelectedWidgetId: (id) => set({ selectedWidgetId: id }),

  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
  })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setGoogleUser: (user) => set({ googleUser: user }),
    }),
    {
      name: 'nos-gallery-widget-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        widgets: state.widgets,
        selectedWallpaper: state.selectedWallpaper,
        activeTheme: state.activeTheme,
        settings: state.settings,
        googleUser: state.googleUser,
      }),
    }
  )
);


