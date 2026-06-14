import { Calendar, CheckSquare, ChevronDown, Clock, CloudSun, Compass, Heart, Home, Layers, LayoutGrid, MessageSquare, Palette, Sliders, SlidersHorizontal, Sparkles, Terminal, TrendingUp } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SettingsScreen } from '../settings/settingsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWidgetStore, ActiveWidget } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import { DotGridBackground } from '../components/DotGridBackground';
import { LiquidGlassBackground } from '../components/LiquidGlassBackground';
import { widgetRegistry, WidgetTemplate, WidgetCategory } from '../widgets/registry';
import { themes, ThemeId } from '../themes/themes';
import { WidgetCard } from '../components/WidgetCard';
import { CustomizerDrawer } from '@/editor/CustomizerDrawer';
import { ExpoWidget } from '../../modules/expo-widget/src';
import { startNativeWidgetSync } from '../services/nativeWidgetSync';

const LucideIcons = {
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock,
  CloudSun,
  Compass,
  Heart,
  Home,
  Layers,
  LayoutGrid,
  MessageSquare,
  Palette,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  TrendingUp,
};

const { width: SW } = Dimensions.get('window');

// App accent – soft periwinkle blue
const ACCENT = '#7C9EFF';

type TabId = 'editor' | 'settings';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'editor', label: 'Gallery', icon: 'LayoutGrid' },
  { id: 'settings', label: 'Settings', icon: 'SlidersHorizontal' },
];

const CATEGORIES: { id: WidgetCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'Compass' },
  { id: 'clock', label: 'Clocks', icon: 'Clock' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { id: 'weather', label: 'Weather', icon: 'CloudSun' },
  { id: 'productivity', label: 'Tasks', icon: 'CheckSquare' },
  { id: 'health', label: 'Health', icon: 'Heart' },
  { id: 'finance', label: 'Finance', icon: 'TrendingUp' },
  { id: 'developer', label: 'Dev', icon: 'Terminal' },
  { id: 'social', label: 'Social', icon: 'MessageSquare' },
  { id: 'smart_home', label: 'Home', icon: 'Home' },
  { id: 'ai', label: 'AI', icon: 'Sparkles' },
];

const TAB_W = (SW - 48) / 2;

export default function Index() {
  const insets = useSafeAreaInsets();
  const {
    activeTab,
    setActiveTab,
    activeTheme,
    pendingWidget,
    setPendingWidget,
    applyPendingToGrid,
    setPendingWidgetSize,
    showToast,
  } = useWidgetStore();
  
  const currentTheme = themes[activeTheme as ThemeId] || themes.nos;
  const currentAccent = currentTheme.accentColor;
  
  const { triggerHaptic, triggerSound } = useFeedback();

  // Start native SharedPreferences sync on mount (no-op on non-Android/Expo Go)
  useEffect(() => {
    startNativeWidgetSync();
  }, []);

  // Navigation Sliding Indicator
  const TAB_IDS: TabId[] = ['editor', 'settings'];
  const [slideX] = useState(() => new Animated.Value(activeTab === 'settings' ? TAB_W : 0));
  const [scaleAnim] = useState(() => new Animated.Value(1));

  // View state
  const [activeCategory, setActiveCategory] = useState<WidgetCategory | 'all'>('all');
  
  // Preview Drawer Modal State
  const [previewOpen, setPreviewOpen] = useState(false);

  const allTemplates = Object.values(widgetRegistry);
  const filtered = activeCategory === 'all'
    ? allTemplates
    : allTemplates.filter(t => t.category === activeCategory);

  const handleTabPress = (tab: TabId) => {
    triggerHaptic('selection');
    const newIdx = TAB_IDS.indexOf(tab);
    
    Animated.parallel([
      Animated.spring(slideX, {
        toValue: newIdx * TAB_W,
        damping: 18,
        stiffness: 220,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, damping: 10, stiffness: 300, useNativeDriver: true }),
      ]),
    ]).start();

    setActiveTab(tab);
  };

  const handleWidgetCardPress = (template: WidgetTemplate) => {
    triggerHaptic('selection');
    
    // Create a pending widget configuration based on selected template
    const newWidget: ActiveWidget = {
      id: 'widget_pending',
      templateId: template.id,
      x: 0,
      y: 0,
      w: template.defaultWidth,
      h: template.defaultHeight,
    };
    
    setPendingWidget(newWidget);
    setPreviewOpen(true);
  };

  const handleUpdateSize = (w: number, h: number) => {
    if (!pendingWidget) return;
    setPendingWidgetSize(w, h);
    triggerHaptic('selection');
  };

  const getWidgetProviderName = (templateId: string) => {
    const template = widgetRegistry[templateId];
    const w = pendingWidget?.w ?? template?.defaultWidth ?? 2;
    const h = pendingWidget?.h ?? template?.defaultHeight ?? 2;
    return `NOSWidget${w}x${h}`;
  };

  const getWidgetCategory = (templateId: string): string => {
    const template = widgetRegistry[templateId];
    return template?.category ?? 'clock';
  };

  const handleAddToHomeScreen = async () => {
    if (!pendingWidget) return;
    
    // Pre-generate a unique ID for the widget to associate it with the home screen widget instance
    const newWidgetId = `widget_${Date.now()}`;
    const widgetToPin = { ...pendingWidget, id: newWidgetId };
    
    // Save widget to grid state
    applyPendingToGrid(newWidgetId);
    
    try {
      triggerHaptic('success');
      triggerSound('success');
      
      const providerName = getWidgetProviderName(pendingWidget.templateId);
      const category = getWidgetCategory(pendingWidget.templateId);
      
      const success = await ExpoWidget.requestPinWidget(
        providerName,
        newWidgetId,
        category,
        JSON.stringify(widgetToPin)
      );
      if (success) {
        showToast('Widget pinning request sent to your launcher!', 'success');
      } else {
        showToast('Widget saved! Add it from your launcher\'s widget drawer.', 'success');
      }
    } catch (err: any) {
      console.log('Pin widget failed:', err);
      showToast('Widget saved! Pin from Android home screen widget settings.', 'success');
    }
    
    setPreviewOpen(false);
  };

  return (
    <View style={styles.root}>
      {activeTheme === 'liquidglass' ? <LiquidGlassBackground /> : <DotGridBackground />}
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.logoRow}>
          <View style={[styles.accentDotWrap, { backgroundColor: `${currentAccent}22` }]}><View style={[styles.accentDot, { backgroundColor: currentAccent }]} /></View>
          <Text style={styles.headerTitle}>NOS  ·  STUDIO</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: `${currentAccent}18`, borderColor: `${currentAccent}55` }]}>
          <Text style={[styles.headerBadgeText, { color: currentAccent }]}>
            {activeTab === 'editor' ? `${filtered.length} WIDGETS` : 'SYSTEM SETTINGS'}
          </Text>
        </View>
      </View>

      {/* ── MAIN CONTENT VIEW (PAGE BASED) ── */}
      {activeTab === 'editor' ? (
        <View style={{ flex: 1 }}>
          {/* CATEGORY STRIP */}
          <View style={styles.categoryContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map(cat => {
                const IconComp = (LucideIcons as any)[cat.icon] as React.ComponentType<{ size?: number; color?: string }>;
                const isActive = activeCategory === cat.id;
                const activeTextThemeColor = currentAccent === '#000000' || currentTheme.backgroundColor === '#ffffff' ? '#ffffff' : '#0a0a0c';
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isActive && [styles.activeCategoryChip, { backgroundColor: currentAccent, borderColor: currentAccent }]]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setActiveCategory(cat.id);
                    }}
                  >
                    {IconComp && <IconComp size={11} color={isActive ? activeTextThemeColor : '#555'} />}
                    <Text style={[styles.categoryChipText, isActive && [styles.activeCategoryChipText, { color: activeTextThemeColor }]]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* WIDGET SHOWCASE GRID */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.gridContent, { paddingBottom: 160 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.widgetGrid}>
              {filtered.map(tpl => (
                <WidgetCard
                  key={tpl.id}
                  template={tpl}
                  activeTheme={activeTheme}
                  onPress={() => handleWidgetCardPress(tpl)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        // SETTINGS SCREEN INLINE PAGE
        <View style={{ flex: 1 }}>
          <SettingsScreen />
        </View>
      )}

      {/* ── FLOATING PILL TAB BAR ── */}
      <View style={styles.tabBarOuter}>
        <View style={styles.tabBarPill}>
          <Animated.View
            style={[
              styles.tabSlider,
              { transform: [{ translateX: slideX }, { scale: scaleAnim }], backgroundColor: currentAccent },
            ]}
          />

          {TABS.map((tab) => {
            const IconComp = (LucideIcons as any)[tab.icon] as React.ComponentType<{ size?: number; color?: string }>;
            const isActive = activeTab === tab.id;
            const activeTextThemeColor = currentAccent === '#000000' || currentTheme.backgroundColor === '#ffffff' ? '#ffffff' : '#0a0a0c';
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.85}
              >
                <View style={styles.tabIconWrap}>
                  {IconComp && (
                    <IconComp
                      size={isActive ? 19 : 17}
                      color={isActive ? activeTextThemeColor : '#666'}
                    />
                  )}
                </View>
                <Text style={[styles.tabLabel, isActive && [styles.activeTabLabel, { color: activeTextThemeColor }]]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── CONTEXTUAL WIDGET PREVIEW & CUSTOMIZATION DRAWER ── */}
      <CustomizerDrawer
        visible={previewOpen}
        pendingWidget={pendingWidget}
        activeTheme={activeTheme}
        onClose={() => setPreviewOpen(false)}
        handleUpdateSize={handleUpdateSize}
        handleAddToHomeScreen={handleAddToHomeScreen}
        triggerHaptic={triggerHaptic}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentDotWrap: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: `${ACCENT}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: ACCENT,
  },
  headerTitle: {
    color: '#e5e5ea',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  headerBadge: {
    backgroundColor: `${ACCENT}18`,
    borderWidth: 1,
    borderColor: `${ACCENT}55`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  headerBadgeText: {
    color: ACCENT,
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  categoryContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#0e0e10',
    borderWidth: 1,
    borderColor: '#202024',
  },
  activeCategoryChip: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  categoryChipText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
  },
  activeCategoryChipText: {
    color: '#0a0a0c',
  },
  scrollView: {
    flex: 1,
  },
  gridContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  tabBarOuter: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 20 : 32,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 99,
    pointerEvents: 'box-none',
  },
  tabBarPill: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#111115',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#222226',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 18px rgba(0, 0, 0, 0.55)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.55,
        shadowRadius: 18,
      },
    }),
    elevation: 20,
  },
  tabSlider: {
    position: 'absolute',
    left: 4,
    top: 6,
    width: TAB_W,
    height: 52,
    borderRadius: 28,
    backgroundColor: ACCENT,
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 1,
    paddingVertical: 4,
  },
  tabIconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: '#444',
    fontSize: 9,
    fontWeight: '800',
  },
  activeTabLabel: {
    color: '#0a0a0c',
  },
});
