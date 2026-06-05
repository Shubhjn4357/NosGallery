import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { PreviewContainer } from '../preview/previewContainer';
import { EditorScreen } from '../editor/editorScreen';
import { GalleryScreen } from '../gallery/galleryScreen';
import { WallpaperScreen } from '../wallpapers/wallpaperScreen';
import { SettingsScreen } from '../settings/settingsScreen';
import { useWidgetStore } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import * as LucideIcons from 'lucide-react-native';

type TabId = 'editor' | 'marketplace' | 'wallpapers' | 'settings';

export default function Index() {
  const { widgets, selectedWidgetId, activeTab, setActiveTab } = useWidgetStore();
  const { triggerHaptic } = useFeedback();

  const handleTabPress = (tab: TabId) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return <EditorScreen />;
      case 'marketplace':
        return <GalleryScreen />;
      case 'wallpapers':
        return <WallpaperScreen />;
      case 'settings':
        return <SettingsScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Title */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require('../../assets/images/logo_vibrant.png')}
              style={styles.logoHeader}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>NOS Gallery</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>STUDIO MODE</Text>
          </View>
        </View>

        {/* Studio Workspace Layout */}
        <ScrollView style={styles.workspaceScroll} contentContainerStyle={styles.workspaceContent} showsVerticalScrollIndicator={false}>
          {/* Top Panel: Live Device Preview */}
          <View style={styles.previewPanel}>
            <PreviewContainer />
            {selectedWidgetId ? (
              <Text style={styles.selectionTip}>
                ✓ Widget Selected. Adjust properties below.
              </Text>
            ) : (
              <Text style={styles.previewTip}>
                💡 Tap any widget above to drag, resize, customize, or delete.
              </Text>
            )}
          </View>

          {/* Bottom Panel: Workspace Panel Controller */}
          <View style={styles.controlPanel}>
            {/* Toolbar Buttons */}
            <View style={styles.toolbar}>
              <TouchableOpacity
                style={[styles.toolbarTab, activeTab === 'editor' && styles.activeToolbarTab]}
                onPress={() => handleTabPress('editor')}
              >
                <LucideIcons.LayoutTemplate size={16} color={activeTab === 'editor' ? '#007aff' : '#8e8e93'} />
                <Text style={[styles.toolbarText, activeTab === 'editor' && styles.activeToolbarText]}>
                  Studio Builder
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolbarTab, activeTab === 'marketplace' && styles.activeToolbarTab]}
                onPress={() => handleTabPress('marketplace')}
              >
                <LucideIcons.ShoppingBag size={16} color={activeTab === 'marketplace' ? '#007aff' : '#8e8e93'} />
                <Text style={[styles.toolbarText, activeTab === 'marketplace' && styles.activeToolbarText]}>
                  Marketplace
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolbarTab, activeTab === 'wallpapers' && styles.activeToolbarTab]}
                onPress={() => handleTabPress('wallpapers')}
              >
                <LucideIcons.Image size={16} color={activeTab === 'wallpapers' ? '#007aff' : '#8e8e93'} />
                <Text style={[styles.toolbarText, activeTab === 'wallpapers' && styles.activeToolbarText]}>
                  Wallpapers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toolbarTab, activeTab === 'settings' && styles.activeToolbarTab]}
                onPress={() => handleTabPress('settings')}
              >
                <LucideIcons.Sliders size={16} color={activeTab === 'settings' ? '#007aff' : '#8e8e93'} />
                <Text style={[styles.toolbarText, activeTab === 'settings' && styles.activeToolbarText]}>
                  Settings
                </Text>
              </TouchableOpacity>
            </View>

            {/* Panel Body */}
            <View style={styles.panelBody}>{renderTabContent()}</View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoHeader: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  badge: {
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    borderWidth: 1,
    borderColor: '#39ff14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#39ff14',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  workspaceScroll: {
    flex: 1,
  },
  workspaceContent: {
    flexGrow: 1,
  },
  previewPanel: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
    alignItems: 'center',
  },
  previewTip: {
    color: '#8e8e93',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  selectionTip: {
    color: '#007aff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  controlPanel: {
    flex: 1,
    backgroundColor: '#000000',
    minHeight: 460,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
    height: 48,
  },
  toolbarTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeToolbarTab: {
    backgroundColor: '#121214',
    borderBottomWidth: 2,
    borderBottomColor: '#007aff',
  },
  toolbarText: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeToolbarText: {
    color: '#ffffff',
  },
  panelBody: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
