import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Modal,
  PanResponder,
} from 'react-native';
import { EditorScreen } from '../editor/editorScreen';
import { GalleryScreen } from '../gallery/galleryScreen';
import { WallpaperScreen } from '../wallpapers/wallpaperScreen';
import { SettingsScreen } from '../settings/settingsScreen';
import { useWidgetStore } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import { DotGridBackground } from '../components/DotGridBackground';
import { widgetRegistry, WidgetTemplate, WidgetCategory, getTemplatesByCategory } from '../widgets/registry';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { ActiveWidget } from '../store/widgetStore';
import * as LucideIcons from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// App accent – soft periwinkle blue (calm, minimal, modern)
const ACCENT = '#7C9EFF';

type TabId = 'editor' | 'settings';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'editor', label: 'Widgets', icon: 'LayoutGrid' },
  { id: 'settings', label: 'Settings', icon: 'SlidersHorizontal' },
];

const CATEGORIES: { id: WidgetCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'LayoutGrid' },
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

// Bottom sheet heights
const SHEET_HEIGHTS: Record<TabId, number> = {
  editor: SH * 0.90,
  settings: SH * 0.80,
};

// ───────────────────────────────────────────
// BottomSheet component
// ───────────────────────────────────────────
interface BottomSheetProps {
  visible: boolean;
  tabId: TabId;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ visible, tabId, onClose, children }) => {
  const sheetH = SHEET_HEIGHTS[tabId];
  const slideAnim = useRef(new Animated.Value(sheetH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: sheetH,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) slideAnim.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 100 || gs.vy > 0.6) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 22,
            stiffness: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetH, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>
            {TABS.find(t => t.id === tabId)?.label.toUpperCase()}
          </Text>
        </View>

        {/* Sheet Content */}
        <View style={styles.sheetBody}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
};

// ───────────────────────────────────────────
// Widget preview card
// ───────────────────────────────────────────
const WidgetCard: React.FC<{ template: WidgetTemplate; activeTheme: string; onPress: () => void }> = ({
  template,
  activeTheme,
  onPress,
}) => {
  const PREVIEW_W = (SW - 48) / 2;
  const widgetW = template.defaultWidth * 80;
  const widgetH = template.defaultHeight * 80;
  const scale = Math.min((PREVIEW_W - 16) / widgetW, 104 / widgetH);

  const mockWidget: ActiveWidget = {
    id: `showcase_${template.id}`,
    templateId: template.id,
    x: 0, y: 0,
    w: template.defaultWidth,
    h: template.defaultHeight,
    customizations: {
      fontId: 'inter',
      fontSize: 10,
      backgroundType: 'solid',
      backgroundColor: '#0a0a0c',
      borderRadius: 14,
      transparency: 0,
      blur: 0,
      shadowType: 'none',
      titleText: template.defaultTitle,
      valueText: template.defaultValue,
      themeOverride: 'none',
    },
  };

  return (
    <TouchableOpacity style={[styles.widgetCard, { width: PREVIEW_W }]} onPress={onPress} activeOpacity={0.8}>
      {/* Preview box */}
      <View style={styles.widgetPreviewBox}>
        <View style={{
          width: widgetW,
          height: widgetH,
          transform: [{ scale }],
        }}>
          <WidgetRenderer widget={mockWidget} globalTheme={activeTheme as any} interactive={false} />
        </View>
      </View>
      {/* Label */}
      <View style={styles.widgetCardFooter}>
        <Text style={styles.widgetCardName} numberOfLines={1}>{template.name}</Text>
        <Text style={styles.widgetCardSize}>{template.defaultWidth}×{template.defaultHeight}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ───────────────────────────────────────────
// Main App
// ───────────────────────────────────────────
const TAB_W = (SW - 48) / 2; // 2 tabs, 24px margin each side

export default function Index() {
  const { activeTab, setActiveTab, activeTheme } = useWidgetStore();
  const { triggerHaptic } = useFeedback();

  // Sliding indicator animation
  const TAB_IDS: TabId[] = ['editor', 'settings'];
  const slideX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<WidgetCategory | 'all'>('all');

  const allTemplates = Object.values(widgetRegistry);
  const filtered = activeCategory === 'all'
    ? allTemplates
    : allTemplates.filter(t => t.category === activeCategory);

  const handleTabPress = (tab: TabId) => {
    triggerHaptic('selection');
    const newIdx = TAB_IDS.indexOf(tab);
    // Bounce + slide animation
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

    if (sheetOpen && activeTab === tab) {
      setSheetOpen(false);
    } else {
      setActiveTab(tab);
      setSheetOpen(true);
    }
  };

  const handleWidgetCardPress = (template: WidgetTemplate) => {
    triggerHaptic('selection');
    // Open builder with this template pre-selected
    setActiveTab('editor');
    setSheetOpen(true);
  };

  const renderSheetContent = () => {
    switch (activeTab as string) {
      case 'editor': return <EditorScreen />;
      case 'settings': return <SettingsScreen />;
      default: return null;
    }
  };

  return (
    <View style={styles.root}>
      <DotGridBackground />
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 16 }]}>
        <View style={styles.logoRow}>
          <View style={styles.accentDotWrap}><View style={styles.accentDot} /></View>
          <Text style={styles.headerTitle}>NOS  ·  STUDIO</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{filtered.length} WIDGETS</Text>
        </View>
      </View>

      {/* ── CATEGORY STRIP ── (partially peeking at bottom of viewport) */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(cat => {
            const IconComp = (LucideIcons as any)[cat.icon] as React.ComponentType<{ size?: number; color?: string }>;
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveCategory(cat.id);
                }}
              >
                {IconComp && <IconComp size={11} color={isActive ? '#0a0a0c' : '#555'} />}
                <Text style={[styles.categoryChipText, isActive && styles.activeCategoryChipText]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── WIDGET SHOWCASE GRID ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.gridContent, { paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 2-column card grid */}
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

      {/* ── BOTTOM SHEET (slide-up drawer) ── */}
      <BottomSheet
        visible={sheetOpen}
        tabId={activeTab as TabId}
        onClose={() => setSheetOpen(false)}
      >
        {renderSheetContent()}
      </BottomSheet>

      {/* ── FLOATING PILL TAB BAR ── */}
      <View style={styles.tabBarOuter} pointerEvents="box-none">
        <View style={styles.tabBarPill}>
          {/* Sliding active indicator */}
          <Animated.View
            style={[
              styles.tabSlider,
              { transform: [{ translateX: slideX }, { scale: scaleAnim }] },
            ]}
          />

          {TABS.map((tab, idx) => {
            const IconComp = (LucideIcons as any)[tab.icon] as React.ComponentType<{ size?: number; color?: string }>;
            const isActive = activeTab === tab.id && sheetOpen;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.85}
              >
                <Animated.View style={[styles.tabIconWrap, isActive && styles.activeTabIconWrap]}>
                  {IconComp && (
                    <IconComp
                      size={isActive ? 19 : 17}
                      color={isActive ? '#000000' : '#666'}
                    />
                  )}
                </Animated.View>
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // ── Header ──
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

  // ── Category strip ──
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

  // ── Widget Grid ──
  scrollView: {
    flex: 1,
  },
  gridContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  widgetCard: {
    backgroundColor: '#0d0d10',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1c1c20',
    overflow: 'hidden',
    marginBottom: 4,
  },
  widgetPreviewBox: {
    height: 120,
    backgroundColor: '#060609',
    borderRadius: 18,
    margin: 8,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  widgetCardFooter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: '#151518',
  },
  widgetCardName: {
    color: '#e5e5ea',
    fontSize: 11.5,
    fontWeight: '700',
  },
  widgetCardSize: {
    color: '#444',
    fontSize: 9.5,
    fontWeight: '600',
  },

  // ── Bottom Sheet ──
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0c',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: '#1a1a1c',
    overflow: 'hidden',
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#151518',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2c2c2e',
    marginBottom: 8,
  },
  sheetTitle: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sheetBody: {
    flex: 1,
    overflow: 'hidden',
  },

  // ── Floating Pill Tab Bar ──
  tabBarOuter: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 20 : 32,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 99,
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
    // Shadow/elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
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
  activeTabIconWrap: {},
  tabLabel: {
    color: '#444',
    fontSize: 9,
    fontWeight: '800',
  },
  activeTabLabel: {
    color: '#0a0a0c',
  },
});
