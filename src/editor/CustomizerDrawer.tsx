import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronDown, Layers, Palette } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveWidget } from '../store/widgetStore';
import { widgetRegistry } from '../widgets/registry';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { DotGridBackground } from '../components/DotGridBackground';
import { AnimatedSlidingButton } from '../components/AnimatedSlidingButton';
import { ThemeId } from '../themes/themes';

interface CustomizerDrawerProps {
  visible: boolean;
  pendingWidget: ActiveWidget | null;
  activeTheme: ThemeId;
  onClose: () => void;
  handleUpdateSize: (w: number, h: number) => void;
  handleAddToHomeScreen: () => void;
  triggerHaptic: (type: 'light' | 'medium' | 'selection' | 'success') => void;
}

const SUPPORTED_SIZES = [
  { label: '1 × 1', w: 1, h: 1 },
  { label: '2 × 1', w: 2, h: 1 },
  { label: '1 × 2', w: 1, h: 2 },
  { label: '2 × 2', w: 2, h: 2 },
  { label: '4 × 2', w: 4, h: 2 },
  { label: '2 × 4', w: 2, h: 4 },
];

export const CustomizerDrawer: React.FC<CustomizerDrawerProps> = ({
  visible,
  pendingWidget,
  activeTheme,
  onClose,
  handleUpdateSize,
  handleAddToHomeScreen,
  triggerHaptic,
}) => {
  const insets = useSafeAreaInsets();

  if (!pendingWidget) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.drawerSheet}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <ChevronDown size={20} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.drawerTitle}>WIDGET PREVIEW</Text>
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

            <View style={styles.detailsContainer}>
              <Text style={styles.widgetTitleText}>
                {widgetRegistry[pendingWidget.templateId]?.name || 'Custom Widget'}
              </Text>
              <Text style={styles.widgetDescText}>
                {widgetRegistry[pendingWidget.templateId]?.description || 'A customizable Nothing OS widget.'}
              </Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Layers size={10} color="#666" />
                  <Text style={styles.metaChipText}>Size {pendingWidget.w}x{pendingWidget.h}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Palette size={10} color="#666" />
                  <Text style={styles.metaChipText}>Theme OS compatible</Text>
                </View>
              </View>

              {/* Size Selection Section */}
              <View style={styles.sizeSection}>
                <Text style={styles.sizeSectionTitle}>CHOOSE WIDGET SIZE</Text>
                <View style={styles.sizeGrid}>
                  {SUPPORTED_SIZES.map((size) => {
                    const isSelected = pendingWidget.w === size.w && pendingWidget.h === size.h;
                    return (
                      <TouchableOpacity
                        key={`${size.w}x${size.h}`}
                        style={[styles.sizeChip, isSelected && styles.activeSizeChip]}
                        onPress={() => {
                          triggerHaptic('selection');
                          handleUpdateSize(size.w, size.h);
                        }}
                      >
                        <Text style={[styles.sizeChipText, isSelected && styles.activeSizeChipText]}>
                          {size.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Fixed Swipe CTA */}
          <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <AnimatedSlidingButton
              onSwipeSuccess={handleAddToHomeScreen}
              accentColor="#7C9EFF"
              title="Slide to Pin Widget"
              successTitle="Adding Widget..."
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  drawerSheet: {
    backgroundColor: '#0a0a0b',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '75%',
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
  drawerFooter: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sizeSection: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  sizeSectionTitle: {
    color: '#8e8e93',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  sizeChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222225',
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 78,
  },
  activeSizeChip: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  sizeChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8e8e93',
  },
  activeSizeChipText: {
    color: '#000000',
  },
});
