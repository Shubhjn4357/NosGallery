import { Battery, Layers, LayoutGrid, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useWidgetStore } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';

const LucideIcons = {
  Battery,
  Layers,
  LayoutGrid,
  Trash2,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.76;

interface DrawerSidebarProps {
  visible: boolean;
  onClose: () => void;
  onClearCanvas: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const DrawerSidebar: React.FC<DrawerSidebarProps> = ({
  visible,
  onClose,
  onClearCanvas,
}) => {
  const { widgets, settings, updateSettings, activeTheme } = useWidgetStore();
  const { triggerHaptic } = useFeedback();

  const [slideAnim] = useState(() => new Animated.Value(-SIDEBAR_WIDTH));
  const [backdropOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 75,
          friction: 9,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const handleToggleBattery = (val: boolean) => {
    triggerHaptic('selection');
    updateSettings({ batterySaver: val });
  };

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  // Battery estimation cost
  const getBatteryCost = () => {
    let cost = 0.15 + widgets.length * 0.05;
    if (settings.refreshInterval === 'realtime') cost += 0.45;
    if (settings.batterySaver) cost *= 0.5;
    return cost.toFixed(2);
  };

  return (
    <View style={styles.container}>
      {/* Backdrop Area */}
      <AnimatedTouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      />

      {/* Slide-out Sidebar Panel */}
      <Animated.View style={[styles.sidebarPanel, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* User Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarBorder}>
              <Text style={styles.avatarSymbol}>⚙️</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>NOTHING DEVELOPER</Text>
              <Text style={styles.profileSubText}>nothing.dev@gmail.com</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Quick Stats Panel */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Studio Metrics</Text>
            
            <View style={styles.metricCard}>
              <LucideIcons.LayoutGrid size={15} color="#8e8e93" />
              <Text style={styles.metricLabel}>Canvas Widgets:</Text>
              <Text style={styles.metricValue}>{widgets.length}</Text>
            </View>

            <View style={styles.metricCard}>
              <LucideIcons.Layers size={15} color="#8e8e93" />
              <Text style={styles.metricLabel}>Layout Skin:</Text>
              <Text style={styles.metricValue}>{activeTheme.toUpperCase()}</Text>
            </View>

            <View style={styles.metricCard}>
              <LucideIcons.Battery size={15} color="#8e8e93" />
              <Text style={styles.metricLabel}>Battery Drain:</Text>
              <Text style={styles.metricValue}>{getBatteryCost()}% / hr</Text>
            </View>
          </View>

          {/* Quick Settings Toggles */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Quick Settings</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={styles.switchTitle}>Battery Optimization</Text>
                <Text style={styles.switchDesc}>Throttles updates to save battery</Text>
              </View>
              <Switch
                value={settings.batterySaver}
                onValueChange={handleToggleBattery}
                trackColor={{ false: '#333', true: '#39ff14' }}
              />
            </View>
          </View>

          {/* Canvas Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Canvas Operations</Text>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                onClearCanvas();
              }}
              style={styles.actionBtn}
            >
              <LucideIcons.Trash2 size={14} color="#7C9EFF" />
              <Text style={styles.actionBtnText}>Clear Canvas Grid</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerText}>NOS GALLERY STUDIO</Text>
          <Text style={styles.footerVersion}>v1.0.0 • ANDROID 17 EDITION</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
  },
  sidebarPanel: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#0a0a0b',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1c',
    paddingTop: 54,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#7C9EFF',
    backgroundColor: '#161618',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSymbol: {
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  profileSubText: {
    color: '#8e8e93',
    fontSize: 9,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1c',
    marginVertical: 8,
  },
  section: {
    marginTop: 18,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    opacity: 0.7,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#242426',
  },
  metricLabel: {
    color: '#8e8e93',
    fontSize: 10.5,
    fontWeight: '700',
    flex: 1,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161618',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#242426',
  },
  switchLabelCol: {
    flex: 1,
    marginRight: 8,
  },
  switchTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  switchDesc: {
    color: '#8e8e93',
    fontSize: 9,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  actionBtnText: {
    color: '#7C9EFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sidebarFooter: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  footerVersion: {
    color: '#444446',
    fontSize: 7.5,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
