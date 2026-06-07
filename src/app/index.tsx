import { Calendar, CheckSquare, ChevronDown, Clock, CloudSun, Compass, Heart, Home, Layers, LayoutGrid, MessageSquare, Palette, Sliders, SlidersHorizontal, Sparkles, Terminal, TrendingUp } from 'lucide-react-native';

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
import React, { useState } from 'react';
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
  TextInput,
} from 'react-native';
import { SettingsScreen } from '../settings/settingsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWidgetStore, ActiveWidget, WidgetCustomizations } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import { DotGridBackground } from '../components/DotGridBackground';
import { widgetRegistry, WidgetTemplate, WidgetCategory } from '../widgets/registry';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { themes, ThemeId } from '../themes/themes';
import { fonts } from '../fonts/fonts';
import { AnimatedSlidingButton } from '../components/AnimatedSlidingButton';
import NosWidgetPinning from '../../modules/nos-widget-pinning/src/NosWidgetPinningModule';

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

const PRESET_COLORS = [
  '#000000', '#ffffff', '#7C9EFF', '#007aff', '#39ff14', 
  '#ff2d55', '#dfba6b', '#1a0826', '#e0e0e0', '#f7ebec'
];

const BORDER_RADII = [0, 8, 12, 16, 20, 24, 32];
const SHADOW_TYPES: WidgetCustomizations['shadowType'][] = ['none', 'soft', 'medium', 'hard', 'glow'];
const TRANSPARENCIES = [0, 20, 40, 60, 80];
const FONT_SIZES = [10, 12, 14, 16, 20, 24, 28, 32];

// ───────────────────────────────────────────
// Widget preview card (Showcase Grid)
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
      <View style={styles.widgetPreviewBox}>
        <View style={{
          width: widgetW,
          height: widgetH,
          transform: [{ scale }],
        }}>
          <WidgetRenderer widget={mockWidget} globalTheme={activeTheme as any} interactive={false} />
        </View>
      </View>
      <View style={styles.widgetCardFooter}>
        <Text style={styles.widgetCardName} numberOfLines={1}>{template.name}</Text>
        <Text style={styles.widgetCardSize}>{template.defaultWidth}×{template.defaultHeight}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ───────────────────────────────────────────
// Main App Page
// ───────────────────────────────────────────
const TAB_W = (SW - 48) / 2;

export default function Index() {
  const insets = useSafeAreaInsets();
  const {
    activeTab,
    setActiveTab,
    activeTheme,
    pendingWidget,
    setPendingWidget,
    updateWidgetCustomizations,
    applyPendingToGrid,
    showToast,
  } = useWidgetStore();
  
  const currentTheme = themes[activeTheme as ThemeId] || themes.nos;
  const currentAccent = currentTheme.accentColor;
  
  const { triggerHaptic, triggerSound } = useFeedback();

  // Navigation Sliding Indicator
  const TAB_IDS: TabId[] = ['editor', 'settings'];
  const [slideX] = useState(() => new Animated.Value(activeTab === 'settings' ? TAB_W : 0));
  const [scaleAnim] = useState(() => new Animated.Value(1));

  // View state
  const [activeCategory, setActiveCategory] = useState<WidgetCategory | 'all'>('all');
  
  // Preview Drawer Modal State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customizeMode, setCustomizeMode] = useState(false);
  const [editorTab, setEditorTab] = useState<'style' | 'text'>('style');

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
      customizations: {
        fontId: 'inter',
        fontSize: template.defaultWidth === 4 ? 20 : 14,
        backgroundType: 'solid',
        backgroundColor: '#0c0c0c',
        borderRadius: 16,
        transparency: 10,
        blur: 10,
        shadowType: 'glow',
        titleText: template.defaultTitle,
        valueText: template.defaultValue,
        themeOverride: 'none',
        accentColor: '#7C9EFF',
      },
    };
    
    setPendingWidget(newWidget);
    setCustomizeMode(false);
    setPreviewOpen(true);
  };

  const handleUpdate = (updates: Partial<WidgetCustomizations>) => {
    if (!pendingWidget) return;
    updateWidgetCustomizations('widget_pending', updates);
    triggerHaptic('light');
  };

  const getWidgetProviderName = (templateId: string) => {
    if (templateId.startsWith('clock_')) return 'NOSClockWidget';
    if (templateId.startsWith('calendar_')) return 'NOSCalendarWidget';
    if (templateId.startsWith('weather_')) return 'NOSWeatherWidget';
    if (templateId.startsWith('productivity_')) return 'NOSProductivityWidget';
    if (templateId.startsWith('health_')) return 'NOSHealthWidget';
    if (templateId.startsWith('finance_')) return 'NOSFinanceWidget';
    if (templateId.startsWith('developer_')) return 'NOSDeveloperWidget';
    if (templateId.startsWith('social_')) return 'NOSSocialWidget';
    if (templateId.startsWith('smart_home_')) return 'NOSSmartHomeWidget';
    if (templateId.startsWith('ai_')) return 'NOSAiWidget';
    return 'NOSClockWidget';
  };

  const handleAddToHomeScreen = async () => {
    if (!pendingWidget) return;
    
    // Save widget to grid state
    applyPendingToGrid();
    
    // Request Android launcher to pin the widget for real (no simulation)
    try {
      triggerHaptic('success');
      triggerSound('success');
      
      const providerName = getWidgetProviderName(pendingWidget.templateId);
      const success = await NosWidgetPinning.requestPinWidget(providerName);
      if (success) {
        showToast('Widget pinning request sent to your launcher!', 'success');
      } else {
        showToast('Successfully updated widget! Drag it from the launcher drawer if not added.', 'success');
      }
    } catch (err: any) {
      console.log('Pin widget failed:', err);
      showToast('Successfully saved! Pin this widget from your Android home settings.', 'success');
    }
    
    setPreviewOpen(false);
  };

  return (
    <View style={styles.root}>
      <DotGridBackground />
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
      {pendingWidget && (
        <Modal
          visible={previewOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setPreviewOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.drawerSheet}>
              {/* Header */}
              <View style={styles.drawerHeader}>
                <TouchableOpacity
                  onPress={() => setPreviewOpen(false)}
                  style={styles.closeBtn}
                >
                  <LucideIcons.ChevronDown size={20} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.drawerTitle}>
                  {customizeMode ? 'CUSTOMIZE DESIGN' : 'WIDGET PREVIEW'}
                </Text>
                <View style={{ width: 20 }} />
              </View>

              {/* Body */}
              <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
                {/* Live Preview Box */}
                <View style={styles.previewBox}>
                  <DotGridBackground />
                  <View style={{ transform: [{ scale: 1.05 }], zIndex: 10 }}>
                    <WidgetRenderer
                      widget={pendingWidget}
                      globalTheme={activeTheme}
                      interactive={false}
                    />
                  </View>
                </View>

                {!customizeMode ? (
                  /* Simple Preview Flow Details */
                  <View style={styles.detailsContainer}>
                    <Text style={styles.widgetTitleText}>
                      {widgetRegistry[pendingWidget.templateId]?.name || 'Custom Widget'}
                    </Text>
                    <Text style={styles.widgetDescText}>
                      {widgetRegistry[pendingWidget.templateId]?.description || 'A customizable Nothing OS widget.'}
                    </Text>
                    
                    <View style={styles.metaRow}>
                      <View style={styles.metaChip}>
                        <LucideIcons.Layers size={10} color="#666" />
                        <Text style={styles.metaChipText}>Size {pendingWidget.w}x{pendingWidget.h}</Text>
                      </View>
                      <View style={styles.metaChip}>
                        <LucideIcons.Palette size={10} color="#666" />
                        <Text style={styles.metaChipText}>Theme OS compatible</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.customizeTriggerBtn}
                      onPress={() => {
                        triggerHaptic('selection');
                        setCustomizeMode(true);
                      }}
                    >
                      <LucideIcons.Sliders size={14} color="#000000" style={{ marginRight: 6 }} />
                      <Text style={styles.customizeTriggerBtnText}>Customize Layout & Content</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Customization Design Mode */
                  <View style={styles.propertiesContainer}>
                    {/* Customizer Sub-Tabs */}
                    <View style={styles.customizerTabsHeader}>
                      <TouchableOpacity
                        style={[styles.customizerTabBtn, editorTab === 'style' && styles.activeCustomizerTabBtn]}
                        onPress={() => setEditorTab('style')}
                      >
                        <Text style={[styles.customizerTabText, editorTab === 'style' && styles.activeCustomizerTabText]}>Design Styles</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.customizerTabBtn, editorTab === 'text' && styles.activeCustomizerTabBtn]}
                        onPress={() => setEditorTab('text')}
                      >
                        <Text style={[styles.customizerTabText, editorTab === 'text' && styles.activeCustomizerTabText]}>Content Texts</Text>
                      </TouchableOpacity>
                    </View>

                    {editorTab === 'style' ? (
                      /* Design style options */
                      <View style={{ gap: 12 }}>
                        {/* Theme overrides */}
                        <Text style={styles.inputLabel}>Skin Style Override</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                          <TouchableOpacity
                            style={[
                              styles.choiceChip,
                              (!pendingWidget.customizations.themeOverride || pendingWidget.customizations.themeOverride === 'none') && styles.activeChoiceChip,
                            ]}
                            onPress={() => handleUpdate({ themeOverride: 'none' })}
                          >
                            <Text style={[styles.choiceChipText, (!pendingWidget.customizations.themeOverride || pendingWidget.customizations.themeOverride === 'none') && styles.activeChoiceChipText]}>Global Default</Text>
                          </TouchableOpacity>
                          {Object.values(themes).map((t) => (
                            <TouchableOpacity
                              key={t.id}
                              style={[
                                styles.choiceChip,
                                pendingWidget.customizations.themeOverride === t.id && styles.activeChoiceChip,
                              ]}
                              onPress={() => handleUpdate({ themeOverride: t.id })}
                            >
                              <Text style={[styles.choiceChipText, pendingWidget.customizations.themeOverride === t.id && styles.activeChoiceChipText]}>{t.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        {/* Background style */}
                        <Text style={styles.inputLabel}>Background Fill Style</Text>
                        <View style={styles.segmentedControl}>
                           {(['solid', 'gradient', 'glass', 'none'] as const).map((type) => (
                            <TouchableOpacity
                              key={type}
                              style={[
                                styles.segmentBtn,
                                pendingWidget.customizations.backgroundType === type && styles.activeSegmentBtn,
                              ]}
                              onPress={() => handleUpdate({ backgroundType: type })}
                            >
                              <Text style={[styles.segmentBtnText, pendingWidget.customizations.backgroundType === type && styles.activeSegmentBtnText]}>
                                {type.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Colors Palette (only if solid background) */}
                        {pendingWidget.customizations.backgroundType === 'solid' && (
                          <>
                            <Text style={styles.inputLabel}>Solid Background Color</Text>
                            <View style={styles.colorPalette}>
                              {PRESET_COLORS.map((c) => (
                                <TouchableOpacity
                                  key={c}
                                  style={[
                                    styles.colorCircle,
                                    { backgroundColor: c },
                                    pendingWidget.customizations.backgroundColor === c && { borderWidth: 2, borderColor: '#ffffff' },
                                  ]}
                                  onPress={() => handleUpdate({ backgroundColor: c })}
                                />
                              ))}
                            </View>
                          </>
                        )}

                        {/* Fonts */}
                        <Text style={styles.inputLabel}>Typography Font Family</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                          {Object.values(fonts).map((f) => (
                            <TouchableOpacity
                              key={f.id}
                              style={[
                                styles.choiceChip,
                                pendingWidget.customizations.fontId === f.id && styles.activeChoiceChip,
                              ]}
                              onPress={() => handleUpdate({ fontId: f.id })}
                            >
                              <Text style={[styles.choiceChipText, pendingWidget.customizations.fontId === f.id && styles.activeChoiceChipText]}>{f.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        {/* Corner Radius */}
                        <Text style={styles.inputLabel}>Corner Border Radius</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                          {BORDER_RADII.map((r) => (
                            <TouchableOpacity
                              key={r}
                              style={[
                                styles.choiceChip,
                                pendingWidget.customizations.borderRadius === r && styles.activeChoiceChip,
                              ]}
                              onPress={() => handleUpdate({ borderRadius: r })}
                            >
                              <Text style={[styles.choiceChipText, pendingWidget.customizations.borderRadius === r && styles.activeChoiceChipText]}>{r}px</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        {/* Shadows */}
                        <Text style={styles.inputLabel}>Shadow Effect Glow</Text>
                        <View style={styles.segmentedControl}>
                          {SHADOW_TYPES.map((s) => (
                            <TouchableOpacity
                              key={s}
                              style={[
                                styles.segmentBtn,
                                pendingWidget.customizations.shadowType === s && styles.activeSegmentBtn,
                              ]}
                              onPress={() => handleUpdate({ shadowType: s })}
                            >
                              <Text style={[styles.segmentBtnText, pendingWidget.customizations.shadowType === s && styles.activeSegmentBtnText]}>
                                {s.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Transparency */}
                        <Text style={styles.inputLabel}>Translucent Blend: {pendingWidget.customizations.transparency}%</Text>
                        <View style={styles.sliderBar}>
                          {TRANSPARENCIES.map((val) => (
                            <TouchableOpacity
                              key={val}
                              style={[styles.sliderSegment, pendingWidget.customizations.transparency === val && { backgroundColor: '#ffffff' }]}
                              onPress={() => handleUpdate({ transparency: val })}
                            >
                              <Text style={[styles.sliderLabelText, pendingWidget.customizations.transparency === val && { color: '#000000' }]}>
                                {val}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ) : (
                      /* Text Content Options */
                      <View style={{ gap: 12 }}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Widget Header / Title</Text>
                          <TextInput
                            style={styles.textInput}
                            value={pendingWidget.customizations.titleText || ''}
                            onChangeText={(txt) => handleUpdate({ titleText: txt })}
                            placeholder="Title Text"
                            placeholderTextColor="#555"
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Widget Value / Description</Text>
                          <TextInput
                            style={[styles.textInput, { height: 80 }]}
                            multiline
                            numberOfLines={4}
                            value={pendingWidget.customizations.valueText || ''}
                            onChangeText={(txt) => handleUpdate({ valueText: txt })}
                            placeholder="Value description"
                            placeholderTextColor="#555"
                          />
                        </View>

                        <Text style={styles.inputLabel}>Font Size: {pendingWidget.customizations.fontSize || 14}px</Text>
                        <View style={styles.sliderBar}>
                          {FONT_SIZES.map((sz) => (
                            <TouchableOpacity
                              key={sz}
                              style={[styles.sliderSegment, pendingWidget.customizations.fontSize === sz && { backgroundColor: '#ffffff' }]}
                              onPress={() => handleUpdate({ fontSize: sz })}
                            >
                              <Text style={[styles.sliderLabelText, pendingWidget.customizations.fontSize === sz && { color: '#000000' }]}>{sz}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.backToPreviewBtn}
                      onPress={() => setCustomizeMode(false)}
                    >
                      <Text style={styles.backToPreviewBtnText}>Back to Preview</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>

              {/* Bottom Fixed Swipe CTA */}
              <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <AnimatedSlidingButton
                  onSwipeSuccess={handleAddToHomeScreen}
                  accentColor={pendingWidget.customizations.accentColor}
                  title="Slide to Pin Widget"
                  successTitle="Adding Widget..."
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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

  // Modal Sheet Drawer Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  drawerSheet: {
    backgroundColor: '#0a0a0b',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    width: '100%',
    borderWidth: 1,
    borderColor: '#1a1a1c',
    paddingBottom: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1c',
  },
  closeBtn: {
    padding: 4,
  },
  drawerTitle: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  drawerBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewBox: {
    height: 160,
    backgroundColor: '#000000',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#161618',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 16,
  },
  detailsContainer: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 12,
  },
  widgetTitleText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  widgetDescText: {
    fontSize: 11.5,
    color: '#8e8e93',
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#242426',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  metaChipText: {
    fontSize: 9,
    color: '#8e8e93',
    fontWeight: 'bold',
  },
  customizeTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    width: '100%',
  },
  customizeTriggerBtnText: {
    color: '#000000',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  propertiesContainer: {
    gap: 12,
  },
  customizerTabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#161618',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  customizerTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeCustomizerTabBtn: {
    backgroundColor: '#ffffff',
  },
  customizerTabText: {
    color: '#8e8e93',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  activeCustomizerTabText: {
    color: '#000000',
  },
  inputLabel: {
    color: '#8e8e93',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#161618',
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegmentBtn: {
    backgroundColor: '#ffffff',
  },
  segmentBtnText: {
    color: '#8e8e93',
    fontSize: 9,
    fontWeight: 'bold',
  },
  activeSegmentBtnText: {
    color: '#000000',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242426',
  },
  chipsRow: {
    paddingVertical: 2,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#161618',
    marginRight: 8,
  },
  activeChoiceChip: {
    backgroundColor: '#ffffff',
  },
  choiceChipText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  activeChoiceChipText: {
    color: '#000000',
  },
  sliderBar: {
    flexDirection: 'row',
    backgroundColor: '#161618',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sliderSegment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#242426',
  },
  sliderLabelText: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputGroup: {
    gap: 6,
  },
  textInput: {
    backgroundColor: '#161618',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242426',
    color: '#ffffff',
    padding: 12,
    fontSize: 13,
  },
  backToPreviewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#242426',
    borderRadius: 20,
    paddingVertical: 12,
    marginTop: 14,
  },
  backToPreviewBtnText: {
    color: '#8e8e93',
    fontSize: 11,
    fontWeight: 'bold',
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1c',
  },
});
