import { ChevronDown, Maximize2, Trash2 } from 'lucide-react-native';

const LucideIcons = {
  ChevronDown,
  Maximize2,
  Trash2,
};
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Dimensions, PanResponder, PanResponderInstance, Animated, Modal, TextInput, Platform } from 'react-native';
import { useWidgetStore, ActiveWidget, WidgetCustomizations } from '../store/widgetStore';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { useFeedback } from '../hooks/useFeedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DotGridBackground } from '../components/DotGridBackground';
import { themes } from '../themes/themes';
import { fonts } from '../fonts/fonts';
import { AnimatedSlidingButton } from '../components/AnimatedSlidingButton';
import { CustomAlertBox } from '../components/CustomAlertBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLS = 4;
const GRID_PADDING = 8;
const DEVICE_WIDTH = SCREEN_WIDTH; // Edge-to-edge full bleed desktop
const CELL_SIZE = (DEVICE_WIDTH - (GRID_PADDING * 2)) / GRID_COLS;
const DEVICE_HEIGHT = CELL_SIZE * 4.2 + (GRID_PADDING * 2); // Perfectly fit 4+ rows

const PRESET_COLORS = [
  '#000000', '#ffffff', '#7C9EFF', '#007aff', '#39ff14', 
  '#ffcc00', '#dfba6b', '#1c1c1e', '#e5e5ea', '#f2f2f7'
];

const BORDER_RADII = [0, 8, 12, 16, 20, 24, 32];
const SHADOW_TYPES: WidgetCustomizations['shadowType'][] = ['none', 'soft', 'medium', 'hard', 'glow'];

export const PreviewContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    widgets,
    selectedWallpaper,
    activeTheme,
    selectedWidgetId,
    removeWidget,
    setSelectedWidgetId,
    updateWidgetPosition,
    updateWidgetSize,
    updateWidgetCustomizations,
    pendingWidget,
    showToast,
  } = useWidgetStore();

  const { triggerHaptic, triggerSound } = useFeedback();

  // Deletion alert warning state
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Selected widget for editing
  const editingWidget = widgets.find(w => w.id === selectedWidgetId);

  const handleWidgetPress = (id: string) => {
    triggerHaptic('selection');
    triggerSound('click');
    setSelectedWidgetId(id);
  };

  const handleUpdate = (updates: Partial<WidgetCustomizations>) => {
    if (!editingWidget) return;
    updateWidgetCustomizations(editingWidget.id, updates);
    triggerHaptic('light');
  };

  const handleResize = () => {
    if (!editingWidget) return;
    triggerHaptic('medium');
    triggerSound('click');
    let nextW = 2;
    let nextH = 2;

    if (editingWidget.w === 2 && editingWidget.h === 2) {
      nextW = 4; nextH = 2;
    } else if (editingWidget.w === 4 && editingWidget.h === 2) {
      nextW = 2; nextH = 4;
    } else if (editingWidget.w === 2 && editingWidget.h === 4) {
      nextW = 4; nextH = 4;
    } else {
      nextW = 2; nextH = 2;
    }

    if (editingWidget.x + nextW > GRID_COLS) {
      updateWidgetPosition(editingWidget.id, 0, editingWidget.y);
    }
    updateWidgetSize(editingWidget.id, nextW, nextH);
  };

  const handleDelete = () => {
    if (!editingWidget) return;
    triggerHaptic('heavy');
    triggerSound('error');
    removeWidget(editingWidget.id);
    setSelectedWidgetId(null);
  };

  const handleAddToHomeScreen = () => {
    triggerHaptic('success');
    triggerSound('success');
    showToast('Widget Sync Complete! Drag to your Home Screen from the widget drawer.', 'success');
  };

  return (
    <View style={styles.container}>
      {/* Flat Desktop Grid View */}
      <ImageBackground
        source={{ uri: selectedWallpaper.uri }}
        style={styles.wallpaperBackdrop}
        imageStyle={{ borderRadius: 0 }}
      >
        <View style={styles.backdropOverlay}>
          <DotGridBackground />
          <ScrollView
            contentContainerStyle={styles.gridScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gridCanvas}>
              {/* Active Widgets */}
              {widgets.map((widget) => (
                <DraggableWidgetWrapper
                  key={widget.id}
                  widget={widget}
                  activeTheme={activeTheme}
                  widgets={widgets}
                  onPress={() => handleWidgetPress(widget.id)}
                  updateWidgetPosition={updateWidgetPosition}
                  CELL_SIZE={CELL_SIZE}
                  GRID_PADDING={GRID_PADDING}
                  GRID_COLS={GRID_COLS}
                  triggerHaptic={triggerHaptic}
                  triggerSound={triggerSound}
                />
              ))}

              {/* Pending Widget Preview */}
              {pendingWidget && (
                <View
                  style={[
                    styles.widgetWrapper,
                    {
                      position: 'absolute',
                      left: pendingWidget.x * CELL_SIZE + GRID_PADDING,
                      top: pendingWidget.y * CELL_SIZE + GRID_PADDING,
                      width: pendingWidget.w * CELL_SIZE,
                      height: pendingWidget.h * CELL_SIZE,
                      opacity: 0.65,
                      zIndex: 20,
                    },
                  ]}
                >
                  <WidgetRenderer
                    widget={pendingWidget}
                    globalTheme={activeTheme}
                  />
                  <View
                    style={[
                      styles.pendingBorder,
                      {
                        borderRadius: pendingWidget.customizations.borderRadius || 16,
                        width: pendingWidget.w * CELL_SIZE,
                        height: pendingWidget.h * CELL_SIZE,
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      {/* Slide-Up Customizer Drawer Modal */}
      <Modal
        visible={!!editingWidget}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedWidgetId(null)}
      >
        {editingWidget && (
          <View style={styles.modalOverlay}>
            <View style={[styles.drawerSheet, { paddingBottom: insets.bottom + 16 }]}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic('light');
                    setSelectedWidgetId(null);
                  }}
                  style={styles.closeBtn}
                >
                  <LucideIcons.ChevronDown size={20} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.drawerTitle}>CUSTOMIZE WIDGET</Text>
                <TouchableOpacity onPress={() => setShowDeleteAlert(true)} style={styles.deleteBtn}>
                  <LucideIcons.Trash2 size={16} color="#ff2d2d" />
                </TouchableOpacity>
              </View>

              {/* Customizer Body */}
              <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
                
                {/* Live Floating Preview Box */}
                <View style={styles.previewBox}>
                  <DotGridBackground />
                  
                  {/* Accent color background glow */}
                  <View
                    style={{
                      position: 'absolute',
                      width: 140,
                      height: 140,
                      backgroundColor: editingWidget.customizations.accentColor || '#ff9500',
                      borderRadius: 70,
                      opacity: 0.15,
                      ...Platform.select({
                        web: {
                          boxShadow: `0px 0px 40px ${editingWidget.customizations.accentColor || '#ff9500'}`,
                        },
                        default: {
                          shadowColor: editingWidget.customizations.accentColor || '#ff9500',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.9,
                          shadowRadius: 40,
                        },
                      }),
                      elevation: 10,
                      zIndex: 1,
                    }}
                  />
                  
                  <View style={{ transform: [{ scale: 1.05 }], zIndex: 10 }}>
                    <WidgetRenderer
                      widget={editingWidget}
                      globalTheme={activeTheme}
                      interactive={true}
                    />
                  </View>
                </View>

                {/* Properties list */}
                <View style={styles.propertiesContainer}>
                  
                  {/* Resize option */}
                  <View style={styles.propertyRow}>
                    <Text style={styles.propertyLabel}>Widget Dimensions</Text>
                    <TouchableOpacity style={styles.resizePill} onPress={handleResize}>
                      <LucideIcons.Maximize2 size={11} color="#000" style={{ marginRight: 4 }} />
                      <Text style={styles.resizePillText}>
                        Size: {editingWidget.w}x{editingWidget.h}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Header text inputs */}
                  <Text style={styles.sectionTitle}>Content Texts</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Widget Title</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editingWidget.customizations.titleText || ''}
                      onChangeText={(txt) => handleUpdate({ titleText: txt })}
                      placeholder="Title"
                      placeholderTextColor="#555"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description / Value</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editingWidget.customizations.valueText || ''}
                      onChangeText={(txt) => handleUpdate({ valueText: txt })}
                      placeholder="Value descriptor"
                      placeholderTextColor="#555"
                    />
                  </View>

                  {/* Background Type */}
                  <Text style={styles.sectionTitle}>Style & Layout</Text>
                  <Text style={styles.inputLabel}>Background Type</Text>
                  <View style={styles.segmentedControl}>
                    {(['solid', 'gradient', 'glass', 'none'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.segmentBtn,
                          editingWidget.customizations.backgroundType === type && styles.activeSegmentBtn,
                        ]}
                        onPress={() => handleUpdate({ backgroundType: type })}
                      >
                        <Text style={[styles.segmentBtnText, editingWidget.customizations.backgroundType === type && styles.activeSegmentBtnText]}>
                          {type.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                   {/* Color Palette (only if solid background) */}
                  {editingWidget.customizations.backgroundType === 'solid' && (
                    <>
                      <Text style={styles.inputLabel}>Background Color</Text>
                      <View style={styles.colorPalette}>
                        {PRESET_COLORS.map((c) => (
                          <TouchableOpacity
                            key={c}
                            style={[
                              styles.colorCircle,
                              { backgroundColor: c },
                              editingWidget.customizations.backgroundColor === c && { borderWidth: 2, borderColor: '#ffffff' },
                            ]}
                            onPress={() => handleUpdate({ backgroundColor: c })}
                          />
                        ))}
                      </View>
                    </>
                  )}

                  {/* Themes Skins */}
                  <Text style={styles.inputLabel}>Skin Override</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                    <TouchableOpacity
                      style={[
                        styles.choiceChip,
                        (!editingWidget.customizations.themeOverride || editingWidget.customizations.themeOverride === 'none') && styles.activeChoiceChip,
                      ]}
                      onPress={() => handleUpdate({ themeOverride: 'none' })}
                    >
                      <Text style={[styles.choiceChipText, (!editingWidget.customizations.themeOverride || editingWidget.customizations.themeOverride === 'none') && styles.activeChoiceChipText]}>Default</Text>
                    </TouchableOpacity>
                    {Object.values(themes).map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.choiceChip,
                          editingWidget.customizations.themeOverride === t.id && styles.activeChoiceChip,
                        ]}
                        onPress={() => handleUpdate({ themeOverride: t.id })}
                      >
                        <Text style={[styles.choiceChipText, editingWidget.customizations.themeOverride === t.id && styles.activeChoiceChipText]}>{t.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Fonts */}
                  <Text style={styles.inputLabel}>Typography Font</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                    {Object.values(fonts).map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={[
                          styles.choiceChip,
                          editingWidget.customizations.fontId === f.id && styles.activeChoiceChip,
                        ]}
                        onPress={() => handleUpdate({ fontId: f.id })}
                      >
                        <Text style={[styles.choiceChipText, editingWidget.customizations.fontId === f.id && styles.activeChoiceChipText]}>{f.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Border Radius */}
                  <Text style={styles.inputLabel}>Border Corners</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                    {BORDER_RADII.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.choiceChip,
                          editingWidget.customizations.borderRadius === r && styles.activeChoiceChip,
                        ]}
                        onPress={() => handleUpdate({ borderRadius: r })}
                      >
                        <Text style={[styles.choiceChipText, editingWidget.customizations.borderRadius === r && styles.activeChoiceChipText]}>{r}px</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Outer Shadow */}
                  <Text style={styles.inputLabel}>Outer Shadow / Glow</Text>
                  <View style={styles.segmentedControl}>
                    {SHADOW_TYPES.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.segmentBtn,
                          editingWidget.customizations.shadowType === s && styles.activeSegmentBtn,
                        ]}
                        onPress={() => handleUpdate({ shadowType: s })}
                      >
                        <Text style={[styles.segmentBtnText, editingWidget.customizations.shadowType === s && styles.activeSegmentBtnText]}>
                          {s.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Transparency */}
                  <Text style={styles.inputLabel}>Translucent Blend: {editingWidget.customizations.transparency}%</Text>
                  <View style={styles.sliderBar}>
                    {[0, 20, 40, 60, 80].map((val) => (
                      <TouchableOpacity
                        key={val}
                        style={[styles.sliderSegment, editingWidget.customizations.transparency === val && { backgroundColor: '#ffffff' }]}
                        onPress={() => handleUpdate({ transparency: val })}
                      >
                        <Text style={[styles.sliderLabelText, editingWidget.customizations.transparency === val && { color: '#000000' }]}>
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Fixed Action CTAs */}
              <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <AnimatedSlidingButton
                  onSwipeSuccess={handleAddToHomeScreen}
                  accentColor={editingWidget.customizations.accentColor}
                  title="Slide to Pin Widget"
                  successTitle="Added to Home Screen"
                />
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Custom warning alert for deletion */}
      <CustomAlertBox
        visible={showDeleteAlert}
        title="Delete Widget"
        message="Are you sure you want to remove this widget from your preview grid canvas? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isWarning={true}
        onConfirm={() => {
          handleDelete();
          setShowDeleteAlert(false);
        }}
        onCancel={() => setShowDeleteAlert(false)}
      />
    </View>
  );
};

// Sub-component to manage PanResponder drag & drop for each widget
interface DraggableWidgetWrapperProps {
  widget: ActiveWidget;
  activeTheme: any;
  widgets: ActiveWidget[];
  onPress: () => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  CELL_SIZE: number;
  GRID_PADDING: number;
  GRID_COLS: number;
  triggerHaptic: any;
  triggerSound: any;
}

const DraggableWidgetWrapper: React.FC<DraggableWidgetWrapperProps> = ({
  widget,
  activeTheme,
  widgets,
  onPress,
  updateWidgetPosition,
  CELL_SIZE,
  GRID_PADDING,
  GRID_COLS,
  triggerHaptic,
  triggerSound,
}) => {
  const [pan] = useState(() => new Animated.ValueXY());
  const [isDragging, setIsDragging] = useState(false);

  // Position based on grid
  const initialLeft = widget.x * CELL_SIZE + GRID_PADDING;
  const initialTop = widget.y * CELL_SIZE + GRID_PADDING;

  useEffect(() => {
    if (!isDragging) {
      pan.setValue({ x: initialLeft, y: initialTop });
    }
  }, [widget.x, widget.y, isDragging, initialLeft, initialTop, pan]);

  // Keep props references updated to avoid stale closures in PanResponder callbacks
  const widgetsRef = useRef(widgets);
  const widgetRef = useRef(widget);
  const updateWidgetPositionRef = useRef(updateWidgetPosition);

  useEffect(() => {
    widgetsRef.current = widgets;
    widgetRef.current = widget;
    updateWidgetPositionRef.current = updateWidgetPosition;
  }, [widgets, widget, updateWidgetPosition]);

  const [panResponder, setPanResponder] = useState<PanResponderInstance | null>(null);

  useEffect(() => {
    setPanResponder(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        },
        onPanResponderGrant: () => {
          setIsDragging(true);
          triggerHaptic('light');
          pan.setOffset({
            x: (pan.x as any)._value,
            y: (pan.y as any)._value,
          });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (e, gestureState) => {
          setIsDragging(false);
          pan.flattenOffset();

          const currentWidget = widgetRef.current;
          const currentWidgets = widgetsRef.current;

          const releaseX = (pan.x as any)._value;
          const releaseY = (pan.y as any)._value;

          let gridX = Math.round((releaseX - GRID_PADDING) / CELL_SIZE);
          let gridY = Math.round((releaseY - GRID_PADDING) / CELL_SIZE);

          gridX = Math.max(0, Math.min(GRID_COLS - currentWidget.w, gridX));
          gridY = Math.max(0, gridY);

          const hasCollision = currentWidgets.some((other) => {
            if (other.id === currentWidget.id) return false;
            return (
              gridX < other.x + other.w &&
              gridX + currentWidget.w > other.x &&
              gridY < other.y + other.h &&
              gridY + currentWidget.h > other.y
            );
          });

          if (!hasCollision) {
            triggerHaptic('medium');
            updateWidgetPositionRef.current(currentWidget.id, gridX, gridY);
          } else {
            triggerHaptic('warning');
            triggerSound('error');
            Animated.spring(pan, {
              toValue: { x: currentWidget.x * CELL_SIZE + GRID_PADDING, y: currentWidget.y * CELL_SIZE + GRID_PADDING },
              useNativeDriver: false,
            }).start();
          }
        },
      })
    );
  }, [pan, triggerHaptic, triggerSound, CELL_SIZE, GRID_COLS, GRID_PADDING]);

  return (
    <Animated.View
      {...(panResponder ? panResponder.panHandlers : {})}
      style={[
        styles.widgetWrapper,
        {
          position: 'absolute',
          transform: pan.getTranslateTransform(),
          width: widget.w * CELL_SIZE,
          height: widget.h * CELL_SIZE,
          zIndex: isDragging ? 100 : 10,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        <WidgetRenderer
          widget={widget}
          globalTheme={activeTheme}
          interactive={false} // Interactive disabled in home grid screen so tap triggers drawer sheet
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  wallpaperBackdrop: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    overflow: 'hidden',
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingTop: GRID_PADDING,
  },
  gridScroll: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  gridCanvas: {
    width: DEVICE_WIDTH,
    minHeight: DEVICE_HEIGHT - 20,
    position: 'relative',
  },
  widgetWrapper: {
    padding: 3,
  },
  pendingBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: '#7C9EFF',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
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
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  deleteBtn: {
    padding: 4,
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
  propertiesContainer: {
    gap: 12,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  propertyLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  resizePillText: {
    color: '#000000',
    fontSize: 10.5,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
    opacity: 0.8,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
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
    marginTop: 4,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242426',
  },
  chipsRow: {
    marginTop: 4,
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
  drawerFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1c',
    gap: 12,
  },
  addHomeBtn: {
    flex: 1.2,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(255, 255, 255, 0.2)',
      },
      default: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
    elevation: 4,
  },
  addHomeBtnText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '900',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#242426',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '900',
  },
});

