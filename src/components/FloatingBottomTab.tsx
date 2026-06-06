import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useWidgetStore } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import * as LucideIcons from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = SCREEN_WIDTH - 32;
const TAB_COUNT = 4;
const TAB_WIDTH = CONTAINER_WIDTH / TAB_COUNT;

type TabId = 'editor' | 'marketplace' | 'wallpapers' | 'settings';

const tabIndices: Record<TabId, number> = {
  editor: 0,
  marketplace: 1,
  wallpapers: 2,
  settings: 3,
};

export const FloatingBottomTab: React.FC = () => {
  const { activeTab, setActiveTab } = useWidgetStore();
  const { triggerHaptic } = useFeedback();

  // Slide animation for background indicator pill
  const [slideAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const idx = tabIndices[activeTab] || 0;
    Animated.spring(slideAnim, {
      toValue: idx * TAB_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 8,
    }).start();
  }, [activeTab, slideAnim]);

  const handleTabPress = (tab: TabId) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'editor', label: 'Builder', icon: 'LayoutGrid' },
    { id: 'marketplace', label: 'Presets', icon: 'Layers' },
    { id: 'wallpapers', label: 'Wallpaper', icon: 'Image' },
    { id: 'settings', label: 'Settings', icon: 'SlidersHorizontal' },
  ];

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.frostedGlassCapsule}>
        
        {/* Animated Slide Background Indicator */}
        <Animated.View
          style={[
            styles.slideIndicator,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.indicatorPill} />
        </Animated.View>

        {/* Tab Buttons */}
        {tabs.map((tab) => {
          const IconComponent = (LucideIcons as any)[tab.icon] || LucideIcons.Layout;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => handleTabPress(tab.id)}
              style={styles.tabButton}
            >
              <IconComponent
                size={18}
                color={isActive ? '#7C9EFF' : '#8e8e93'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              
              {/* Active Dot Indicator */}
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 58,
    zIndex: 9999,
  },
  frostedGlassCapsule: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 10, 11, 0.85)',
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#1a1a1c',
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  slideIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  indicatorPill: {
    width: TAB_WIDTH - 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.12)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 10,
    position: 'relative',
  },
  tabLabel: {
    color: '#8e8e93',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: '#ffffff',
  },
  activeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#7C9EFF',
    position: 'absolute',
    bottom: 4,
  },
});
