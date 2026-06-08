import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronDown, Layers, Palette, Sliders } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveWidget, WidgetCustomizations } from '../store/widgetStore';
import { widgetRegistry } from '../widgets/registry';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { DotGridBackground } from '../components/DotGridBackground';
import { AnimatedSlidingButton } from '../components/AnimatedSlidingButton';
import { DesignStylesEditor } from './components/DesignStylesEditor';
import { TextContentEditor } from './components/TextContentEditor';
import { ThemeId } from '../themes/themes';

interface CustomizerDrawerProps {
  visible: boolean;
  pendingWidget: ActiveWidget | null;
  activeTheme: ThemeId;
  customizeMode: boolean;
  setCustomizeMode: (mode: boolean) => void;
  editorTab: 'style' | 'text';
  setEditorTab: (tab: 'style' | 'text') => void;
  onClose: () => void;
  handleUpdate: (updates: Partial<WidgetCustomizations>) => void;
  handleAddToHomeScreen: () => void;
  triggerHaptic: (type: 'light' | 'medium' | 'selection' | 'success') => void;
}

export const CustomizerDrawer: React.FC<CustomizerDrawerProps> = ({
  visible,
  pendingWidget,
  activeTheme,
  customizeMode,
  setCustomizeMode,
  editorTab,
  setEditorTab,
  onClose,
  handleUpdate,
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
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
            >
              <ChevronDown size={20} color="#ffffff" />
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
                    <Layers size={10} color="#666" />
                    <Text style={styles.metaChipText}>Size {pendingWidget.w}x{pendingWidget.h}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Palette size={10} color="#666" />
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
                  <Sliders size={14} color="#000000" style={{ marginRight: 6 }} />
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
                  <DesignStylesEditor
                    customizations={pendingWidget.customizations}
                    handleUpdate={handleUpdate}
                  />
                ) : (
                  <TextContentEditor
                    customizations={pendingWidget.customizations}
                    handleUpdate={handleUpdate}
                  />
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
  backToPreviewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  backToPreviewBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  drawerFooter: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
});
