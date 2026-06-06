import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useWidgetStore, ActiveWidget } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import * as LucideIcons from 'lucide-react-native';
import { widgetRegistry } from '../widgets/registry';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { DotGridBackground } from '../components/DotGridBackground';

interface PresetPackItem {
  id: string;
  name: string;
  creator: string;
  downloads: string;
  price: string;
  category: string;
  rating: string;
  templateId: string;
  accentColor: string;
  backgroundColor: string;
  w: number;
  h: number;
  defaultValue: string;
  defaultTitle: string;
}

const FEATURED_PACKS: PresetPackItem[] = [
  {
    id: 'preset_cal_rings',
    name: 'Macro Rings & Calories',
    creator: 'HealthCore',
    downloads: '18.4K',
    price: 'Free',
    category: 'Health',
    rating: '5.0',
    templateId: 'health_water', // Maps to steps/health with rings
    accentColor: '#ff9500',
    backgroundColor: '#ffffff',
    w: 4,
    h: 4,
    defaultValue: '13 000 kcal',
    defaultTitle: 'TOTAL THIS WEEK',
  },
  {
    id: 'preset_flip_bookings',
    name: 'Shift Flip Scheduler',
    creator: 'Chronos',
    downloads: '9.2K',
    price: 'Free',
    category: 'Productivity',
    rating: '4.8',
    templateId: 'clock_flip',
    accentColor: '#34c759',
    backgroundColor: '#121212',
    w: 4,
    h: 2,
    defaultValue: '08:30',
    defaultTitle: 'THU 08 BOOKINGS',
  },
  {
    id: 'preset_flight_tracker',
    name: 'Live Flight Status',
    creator: 'FlySpace',
    downloads: '14.1K',
    price: 'Free',
    category: 'Travel',
    rating: '4.9',
    templateId: 'developer_cicd', // Maps to timeline
    accentColor: '#00ffff',
    backgroundColor: '#000000',
    w: 4,
    h: 2,
    defaultValue: 'SFO ✈ YEG',
    defaultTitle: 'ARRIVES IN 47M',
  },
  {
    id: 'preset_noise_meter',
    name: 'Decibel Sound Meter',
    creator: 'Acoustic Labs',
    downloads: '7.8K',
    price: 'Free',
    category: 'Utility',
    rating: '4.7',
    templateId: 'developer_cpu', // Maps to meter/cpu
    accentColor: '#000000',
    backgroundColor: '#ffb300',
    w: 2,
    h: 2,
    defaultValue: '47.8 dB',
    defaultTitle: 'NOISE LEVEL',
  },
  {
    id: 'preset_square_clock',
    name: 'Radial Analog Clock',
    creator: 'Nothing Design',
    downloads: '24.5K',
    price: 'Free',
    category: 'Clock',
    rating: '5.0',
    templateId: 'clock_analog',
    accentColor: '#000000',
    backgroundColor: '#ffffff',
    w: 2,
    h: 2,
    defaultValue: '9:41',
    defaultTitle: 'ANALOG CLOCK',
  },
  {
    id: 'preset_espresso_timer',
    name: 'Barista Shot Timer',
    creator: 'CaffeineInc',
    downloads: '5.4K',
    price: 'Free',
    category: 'Productivity',
    rating: '4.9',
    templateId: 'clock_stopwatch',
    accentColor: '#ff9500',
    backgroundColor: '#0c0c0c',
    w: 4,
    h: 2,
    defaultValue: '16s Espresso',
    defaultTitle: 'SHOT EXTRACTOR',
  }
];

export const GalleryScreen: React.FC = () => {
  const { downloadedPresets, deleteWidgetPreset, setPendingWidget, setActiveTab } = useWidgetStore();
  const { triggerHaptic, triggerSound } = useFeedback();
  const [activeSubTab, setActiveSubTab] = useState<'my_presets' | 'marketplace'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');

  const handleApplyPreset = (preset: ActiveWidget) => {
    triggerHaptic('success');
    triggerSound('apply');
    
    setPendingWidget({
      ...preset,
      id: 'widget_pending',
    });
    setActiveTab('editor');
  };

  const handleInstallPack = (pack: PresetPackItem) => {
    triggerHaptic('success');
    triggerSound('apply');

    const mockPreset: ActiveWidget = {
      id: 'widget_pending',
      templateId: pack.templateId,
      x: 0,
      y: 0,
      w: pack.w,
      h: pack.h,
      customizations: {
        fontId: pack.templateId.includes('analog') ? 'nos_dot' : 'inter',
        fontSize: pack.w === 4 ? 20 : 14,
        backgroundType: 'solid',
        backgroundColor: pack.backgroundColor,
        borderRadius: 24,
        transparency: 0,
        blur: 0,
        shadowType: 'glow',
        titleText: pack.defaultTitle,
        valueText: pack.defaultValue,
        accentColor: pack.accentColor,
        themeOverride: pack.backgroundColor === '#ffffff' ? 'minimalwhite' : 'nos',
      }
    };

    setPendingWidget(mockPreset);
    setActiveTab('editor');
  };

  const handleDeletePreset = (id: string) => {
    triggerHaptic('heavy');
    triggerSound('error');
    deleteWidgetPreset(id);
  };

  const filteredPacks = FEATURED_PACKS.filter(pack => 
    pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <DotGridBackground />

      {/* Sub Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeSubTab === 'marketplace' && styles.activeTabButton]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveSubTab('marketplace');
          }}
        >
          <Text style={[styles.tabText, activeSubTab === 'marketplace' && styles.activeTabText]}>
            Explore Market
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeSubTab === 'my_presets' && styles.activeTabButton]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveSubTab('my_presets');
          }}
        >
          <Text style={[styles.tabText, activeSubTab === 'my_presets' && styles.activeTabText]}>
            Saved Presets ({downloadedPresets.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeSubTab === 'marketplace' ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchBox}>
            <LucideIcons.Search size={14} color="#8e8e93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search widgets, creators, categories..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Dynamic Scattered Widgets Grid */}
          <Text style={styles.sectionHeader}>CREATOR WIDGETS</Text>
          <View style={styles.featuredGrid}>
            {filteredPacks.map((pack, idx) => {
              // Alternating rotation angles for the dynamic scattered look
              const rotations = ['-2.5deg', '1.8deg', '-1.5deg', '2.2deg', '-2.2deg', '1.5deg'];
              const rotate = rotations[idx % rotations.length];

              const mockWidget: ActiveWidget = {
                id: pack.id,
                templateId: pack.templateId,
                x: 0, y: 0, w: pack.w, h: pack.h,
                customizations: {
                  fontId: 'inter',
                  fontSize: pack.w === 4 ? 18 : 13,
                  backgroundType: 'solid',
                  backgroundColor: pack.backgroundColor,
                  borderRadius: 24,
                  transparency: 0,
                  blur: 0,
                  shadowType: 'glow',
                  titleText: pack.defaultTitle,
                  valueText: pack.defaultValue,
                  accentColor: pack.accentColor,
                  themeOverride: 'none',
                }
              };

              return (
                <View 
                  key={pack.id} 
                  style={[
                    styles.packCard,
                    { transform: [{ rotate }] }
                  ]}
                >
                  {/* Glow Shadow matching widget accent */}
                  <View style={[styles.cardGlow, { backgroundColor: pack.accentColor }]} />

                  {/* Widget Live Rendering */}
                  <View style={styles.widgetWrapper}>
                    <WidgetRenderer widget={mockWidget} globalTheme="nos" />
                  </View>

                  {/* Pack Footer Details */}
                  <View style={styles.packDetailsRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.packNameText} numberOfLines={1}>{pack.name}</Text>
                      <Text style={styles.packCreatorText}>by {pack.creator}</Text>
                    </View>
                    <TouchableOpacity style={styles.downloadBtn} onPress={() => handleInstallPack(pack)}>
                      <Text style={styles.downloadBtnText}>GET</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {downloadedPresets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LucideIcons.Layers size={32} color="#222" />
              <Text style={styles.emptyTitle}>No saved presets yet</Text>
              <Text style={styles.emptyDesc}>
                Customize a widget in the Studio Builder, then select "Save Preset" to store layout designs.
              </Text>
            </View>
          ) : (
            <View style={styles.presetsList}>
              {downloadedPresets.map((preset) => (
                <View key={preset.id} style={styles.presetItemCard}>
                  <View style={styles.presetItemInfo}>
                    <LucideIcons.LayoutGrid size={18} color="#7C9EFF" />
                    <View style={styles.presetItemTexts}>
                      <Text style={styles.presetItemTitle}>
                        {preset.customizations.titleText || 'Custom Layout'}
                      </Text>
                      <Text style={styles.presetItemSub}>
                        Size: {preset.w}x{preset.h} • Accent: {preset.customizations.accentColor || 'Default'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.presetItemActions}>
                    <TouchableOpacity
                      style={styles.applyBtn}
                      onPress={() => handleApplyPreset(preset)}
                    >
                      <LucideIcons.Plus size={12} color="#000000" />
                      <Text style={styles.applyBtnText}>ADD</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeletePreset(preset.id)}
                    >
                      <LucideIcons.Trash2 size={13} color="#7C9EFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0c0c0c',
    borderWidth: 1,
    borderColor: '#151515',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 3,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#7C9EFF', // Minimal red active pill
  },
  tabText: {
    color: '#8e8e93',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070707',
    borderWidth: 1,
    borderColor: '#111111',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 11.5,
    padding: 0,
  },
  sectionHeader: {
    color: '#666666',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 8,
  },
  packCard: {
    width: '47%',
    backgroundColor: '#080808',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#141414',
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
    }),
    elevation: 3,
  },
  cardGlow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 30,
    borderRadius: 24,
    opacity: 0.06,
    zIndex: -1,
  },
  widgetWrapper: {
    transform: [{ scale: 0.9 }],
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  packDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#121212',
    marginTop: 4,
  },
  packNameText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  packCreatorText: {
    color: '#555555',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  downloadBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(255, 255, 255, 0.2)',
      },
      default: {
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  downloadBtnText: {
    color: '#000000',
    fontSize: 8.5,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyDesc: {
    color: '#555555',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 20,
  },
  presetsList: {
    gap: 10,
  },
  presetItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#121212',
    borderRadius: 24,
    padding: 12,
  },
  presetItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  presetItemTexts: {
    flex: 1,
  },
  presetItemTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  presetItemSub: {
    color: '#555555',
    fontSize: 9.5,
    marginTop: 2.5,
  },
  presetItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 2,
  },
  applyBtnText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderRadius: 14,
    padding: 6,
  },
});
