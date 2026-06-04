import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useWidgetStore, ActiveWidget } from '../store/widgetStore';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { useFeedback } from '../hooks/useFeedback';
import * as LucideIcons from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEVICE_WIDTH = 340;
const DEVICE_HEIGHT = 640;
const GRID_COLS = 4;
const CELL_SIZE = 75; // 75px per grid cell (4 * 75 = 300px total grid width)
const GRID_PADDING = 12;

export const PreviewContainer: React.FC = () => {
  const {
    widgets,
    selectedWallpaper,
    activeDevice,
    activeTheme,
    selectedWidgetId,
    removeWidget,
    duplicateWidget,
    setSelectedWidgetId,
    updateWidgetPosition,
    updateWidgetSize,
    pendingWidget,
  } = useWidgetStore();

  const { triggerHaptic, triggerSound } = useFeedback();

  const handleWidgetPress = (id: string) => {
    triggerHaptic('selection');
    triggerSound('click');
    setSelectedWidgetId(selectedWidgetId === id ? null : id);
  };

  const handleMove = (widget: ActiveWidget, direction: 'left' | 'right' | 'up' | 'down') => {
    triggerHaptic('light');
    let { x, y, w, h } = widget;
    
    if (direction === 'left' && x > 0) x -= 1;
    if (direction === 'right' && x + w < GRID_COLS) x += 1;
    if (direction === 'up' && y > 0) y -= 1;
    if (direction === 'down') y += 1; // Grid expands downwards

    // Check collision
    const overlaps = widgets.some(other => {
      if (other.id === widget.id) return false;
      return (
        x < other.x + other.w &&
        x + w > other.x &&
        y < other.y + other.h &&
        y + h > other.y
      );
    });

    if (!overlaps) {
      updateWidgetPosition(widget.id, x, y);
    } else {
      triggerHaptic('warning');
    }
  };

  const handleResize = (widget: ActiveWidget) => {
    triggerHaptic('medium');
    triggerSound('click');
    let nextW = 2;
    let nextH = 2;

    // Cycle layouts: 2x2 -> 4x2 -> 2x4 -> 4x4
    if (widget.w === 2 && widget.h === 2) {
      nextW = 4; nextH = 2;
    } else if (widget.w === 4 && widget.h === 2) {
      nextW = 2; nextH = 4;
    } else if (widget.w === 2 && widget.h === 4) {
      nextW = 4; nextH = 4;
    } else {
      nextW = 2; nextH = 2;
    }

    // boundary check
    if (widget.x + nextW > GRID_COLS) {
      updateWidgetPosition(widget.id, 0, widget.y); // Snap to left to allow expansion
    }

    updateWidgetSize(widget.id, nextW, nextH);
  };

  const handleDelete = (id: string) => {
    triggerHaptic('heavy');
    triggerSound('error');
    removeWidget(id);
  };

  const handleDuplicate = (id: string) => {
    triggerHaptic('success');
    triggerSound('apply');
    duplicateWidget(id);
  };

  const renderStatusIcons = () => {
    if (activeDevice === 'ios') {
      return (
        <View style={styles.statusBar}>
          <Text style={styles.statusBarText}>9:41</Text>
          <View style={styles.notch} />
          <View style={styles.statusBarRight}>
            <LucideIcons.Wifi size={11} color="#ffffff" style={styles.statusIcon} />
            <LucideIcons.Signal size={11} color="#ffffff" style={styles.statusIcon} />
            <LucideIcons.Battery size={13} color="#ffffff" />
          </View>
        </View>
      );
    } else if (activeDevice === 'android') {
      return (
        <View style={styles.statusBar}>
          <Text style={styles.statusBarText}>21:09</Text>
          <View style={styles.cameraPunch} />
          <View style={styles.statusBarRight}>
            <LucideIcons.Wifi size={11} color="#ffffff" style={styles.statusIcon} />
            <LucideIcons.BatteryMedium size={13} color="#ffffff" />
          </View>
        </View>
      );
    }
    // Lock screen status bar
    return (
      <View style={styles.statusBar}>
        <LucideIcons.Lock size={12} color="#ffffff" />
        <View style={styles.statusBarRight}>
          <LucideIcons.Battery size={13} color="#ffffff" />
        </View>
      </View>
    );
  };

  const renderSelectedControls = (widget: ActiveWidget) => {
    return (
      <View style={styles.controlsOverlay}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#ff3b30' }]} onPress={() => handleDelete(widget.id)}>
            <LucideIcons.Trash2 size={13} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#34c759' }]} onPress={() => handleResize(widget)}>
            <LucideIcons.Maximize2 size={13} color="#ffffff" />
            <Text style={styles.controlText}>Size</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, { backgroundColor: '#007aff' }]} onPress={() => handleDuplicate(widget.id)}>
            <LucideIcons.Copy size={13} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.arrowRow}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => handleMove(widget, 'up')}>
            <LucideIcons.ChevronUp size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={[styles.arrowRow, { justifyContent: 'space-between', paddingHorizontal: 20 }]}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => handleMove(widget, 'left')}>
            <LucideIcons.ChevronLeft size={14} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.positionIndicator}>{widget.w}x{widget.h} ({widget.x},{widget.y})</Text>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => handleMove(widget, 'right')}>
            <LucideIcons.ChevronRight size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.arrowRow}>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => handleMove(widget, 'down')}>
            <LucideIcons.ChevronDown size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLockScreenContent = () => {
    return (
      <View style={styles.lockScreenContainer}>
        <Text style={styles.lockScreenTime}>21:09</Text>
        <Text style={styles.lockScreenDate}>Thursday, June 4</Text>
        
        {/* Render a horizontal widget shelf (Lock Screen Widgets) */}
        <View style={styles.lockShelf}>
          {widgets.slice(0, 2).map((widget) => (
            <View key={widget.id} style={{ opacity: 0.85, transform: [{ scale: 0.8 }] }}>
              <WidgetRenderer widget={widget} globalTheme={activeTheme} />
            </View>
          ))}
        </View>
        
        <View style={styles.lockScreenBottom}>
          <View style={styles.lockIconCircle}>
            <LucideIcons.Camera size={18} color="#ffffff" />
          </View>
          <View style={styles.swipeIndicator} />
          <View style={styles.lockIconCircle}>
            <LucideIcons.Flashlight size={18} color="#ffffff" />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.deviceFrame}>
        <ImageBackground
          source={{ uri: selectedWallpaper.uri }}
          style={styles.deviceWallpaper}
          imageStyle={{ borderRadius: 36 }}
        >
          {/* Overlay gradient/darkener to ensure text stands out */}
          <View style={styles.wallpaperOverlay}>
            {renderStatusIcons()}

            {activeDevice === 'lockscreen' ? (
              renderLockScreenContent()
            ) : (
              <ScrollView
                contentContainerStyle={styles.gridScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.gridCanvas}>
                  {/* Grid Lines helper (only shown when editing) */}
                  {selectedWidgetId && (
                    <View style={styles.gridHelper}>
                      {Array.from({ length: 4 }).map((_, col) => (
                        <View key={col} style={[styles.gridHelperCol, { left: col * CELL_SIZE + GRID_PADDING }]} />
                      ))}
                    </View>
                  )}

                  {/* Active Widgets */}
                  {widgets.map((widget) => {
                    const isSelected = selectedWidgetId === widget.id;
                    const left = widget.x * CELL_SIZE + GRID_PADDING;
                    const top = widget.y * CELL_SIZE + GRID_PADDING;
                    
                    return (
                      <View
                        key={widget.id}
                        style={[
                          styles.widgetWrapper,
                          {
                            position: 'absolute',
                            left,
                            top,
                            width: widget.w * CELL_SIZE,
                            height: widget.h * CELL_SIZE,
                            zIndex: isSelected ? 100 : 10,
                          },
                        ]}
                      >
                        <WidgetRenderer
                          widget={widget}
                          globalTheme={activeTheme}
                          onPress={() => handleWidgetPress(widget.id)}
                          interactive={isSelected}
                        />

                        {/* Selected Outline */}
                        {isSelected && (
                          <View
                            style={[
                              styles.selectedBorder,
                              {
                                borderRadius: widget.customizations.borderRadius || 16,
                                width: widget.w * CELL_SIZE,
                                height: widget.h * CELL_SIZE,
                              },
                            ]}
                          />
                        )}

                        {/* Edit controls if selected */}
                        {isSelected && renderSelectedControls(widget)}
                      </View>
                    );
                  })}

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
            )}

            {/* Simulated home indicator line */}
            <View style={styles.homeIndicator} />
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  deviceFrame: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    borderRadius: 40,
    backgroundColor: '#1c1c1e',
    padding: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  deviceWallpaper: {
    flex: 1,
  },
  wallpaperOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 36,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  statusBar: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  statusBarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  notch: {
    width: 100,
    height: 18,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    position: 'absolute',
    left: '50%',
    marginLeft: -50,
    top: 0,
  },
  cameraPunch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    position: 'absolute',
    left: '50%',
    marginLeft: -5,
    top: 3,
  },
  gridScroll: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 40,
  },
  gridCanvas: {
    width: DEVICE_WIDTH - 12,
    minHeight: DEVICE_HEIGHT - 80,
    position: 'relative',
  },
  gridHelper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    opacity: 0.15,
  },
  gridHelperCol: {
    position: 'absolute',
    top: GRID_PADDING,
    bottom: GRID_PADDING,
    width: 2,
    backgroundColor: '#ffffff',
    borderStyle: 'dashed',
  },
  widgetWrapper: {
    padding: 3,
  },
  selectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: '#007aff',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: -90,
    left: -10,
    right: -10,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 12,
    padding: 6,
    zIndex: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  controlText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  arrowBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    padding: 2,
  },
  positionIndicator: {
    color: '#aaa',
    fontSize: 9,
  },
  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  // Lock Screen
  lockScreenContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 30,
    alignItems: 'center',
  },
  lockScreenTime: {
    color: '#ffffff',
    fontSize: 54,
    fontWeight: '300',
  },
  lockScreenDate: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: -5,
  },
  lockShelf: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: -10,
    height: 100,
  },
  lockScreenBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  lockIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicator: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  pendingBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: '#007aff',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
});
