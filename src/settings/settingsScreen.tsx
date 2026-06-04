import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useWidgetStore, SystemSettings } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import { themes, ThemeId } from '../themes/themes';
import * as LucideIcons from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    activeDevice,
    activeTheme,
    widgets,
    updateSettings,
    setActiveDevice,
    setActiveTheme,
    clearWidgets,
  } = useWidgetStore();

  const { triggerHaptic, triggerSound } = useFeedback();

  const handleToggle = (key: keyof SystemSettings, value: boolean) => {
    triggerHaptic('selection');
    updateSettings({ [key]: value });
  };

  const handleTestSound = (soundType: 'click' | 'apply' | 'success' | 'error') => {
    triggerHaptic('light');
    triggerSound(soundType);
  };

  // Battery estimation calculator
  const getBatteryEstimation = () => {
    let cost = 0.15; // base idle cost
    
    // Add cost per widget
    cost += widgets.length * 0.05;

    // Refresh intervals
    if (settings.refreshInterval === 'realtime') cost += 0.45;
    if (settings.refreshInterval === '1min') cost += 0.15;
    if (settings.refreshInterval === '5min') cost += 0.05;
    if (settings.refreshInterval === '15min') cost += 0.01;

    // Toggles
    if (!settings.autoRefresh) cost = 0.08; // static rendering
    if (settings.batterySaver) cost *= 0.5; // halving battery usage

    return cost.toFixed(2);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Device & Design System Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Studio Environment</Text>
        
        {/* Device Picker */}
        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Preview Device</Text>
            <Text style={styles.settingDesc}>Simulator viewport shell styling</Text>
          </View>
          <View style={styles.selectorGroup}>
            {(['ios', 'android', 'lockscreen'] as const).map((dev) => (
              <TouchableOpacity
                key={dev}
                style={[
                  styles.selectorBtn,
                  activeDevice === dev && styles.activeSelectorBtn,
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveDevice(dev);
                }}
              >
                <Text style={[styles.selectorBtnText, activeDevice === dev && styles.activeSelectorBtnText]}>
                  {dev.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Picker */}
        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Global Theme</Text>
            <Text style={styles.settingDesc}>Active skin for the gallery dashboard</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {Object.values(themes).map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeChip,
                  activeTheme === t.id && styles.activeThemeChip,
                ]}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveTheme(t.id);
                }}
              >
                <Text style={[styles.themeChipText, activeTheme === t.id && styles.activeThemeChipText]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Battery Optimization Settings */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Battery Optimizer</Text>
          <LucideIcons.Zap size={14} color="#39ff14" />
        </View>

        {/* Battery cost readout */}
        <View style={styles.batteryEstimationPanel}>
          <View style={styles.rowSpace}>
            <Text style={styles.estTitle}>ESTIMATED DRAIN COST</Text>
            <Text style={styles.estValue}>{getBatteryEstimation()}% / hour</Text>
          </View>
          <View style={styles.estBarBg}>
            <View
              style={[
                styles.estBarFill,
                {
                  width: `${Math.min(Number(getBatteryEstimation()) * 80, 100)}%`,
                  backgroundColor: Number(getBatteryEstimation()) > 0.6 ? '#ff3b30' : '#39ff14',
                },
              ]}
            />
          </View>
          <Text style={styles.estFootnote}>
            Target rate: &lt; 1% battery/hour. Current settings are highly optimized.
          </Text>
        </View>

        {/* Settings switches */}
        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Auto-Refresh Engine</Text>
            <Text style={styles.settingDesc}>Toggle background content updates</Text>
          </View>
          <Switch
            value={settings.autoRefresh}
            onValueChange={(val) => handleToggle('autoRefresh', val)}
            trackColor={{ false: '#333', true: '#007aff' }}
          />
        </View>

        {/* Throttling Interval */}
        {settings.autoRefresh && (
          <View style={styles.settingRow}>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>Batching Interval</Text>
              <Text style={styles.settingDesc}>Updates frequency threshold</Text>
            </View>
            <View style={styles.selectorGroup}>
              {(['realtime', '1min', '5min', '15min'] as const).map((interval) => (
                <TouchableOpacity
                  key={interval}
                  style={[
                    styles.selectorBtn,
                    settings.refreshInterval === interval && styles.activeSelectorBtn,
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    updateSettings({ refreshInterval: interval });
                  }}
                >
                  <Text style={[styles.selectorBtnText, settings.refreshInterval === interval && styles.activeSelectorBtnText]}>
                    {interval === 'realtime' ? 'LIVE' : interval}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Battery Saver Mode</Text>
            <Text style={styles.settingDesc}>Caps transitions rendering & background updates</Text>
          </View>
          <Switch
            value={settings.batterySaver}
            onValueChange={(val) => handleToggle('batterySaver', val)}
            trackColor={{ false: '#333', true: '#39ff14' }}
          />
        </View>
      </View>

      {/* Interactions Sandbox */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Tactile & Haptics Sandbox</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Haptic Feedback</Text>
            <Text style={styles.settingDesc}>Tactile vibration on interactions</Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(val) => handleToggle('hapticsEnabled', val)}
            trackColor={{ false: '#333', true: '#007aff' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Sound Effects</Text>
            <Text style={styles.settingDesc}>Minimal sound feedback clicks</Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(val) => handleToggle('soundEnabled', val)}
            trackColor={{ false: '#333', true: '#007aff' }}
          />
        </View>

        {/* Sound triggers */}
        {settings.soundEnabled && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.settingDesc}>Test Sound Effects:</Text>
            <View style={styles.soundTestGrid}>
              {(['click', 'apply', 'success', 'error'] as const).map((snd) => (
                <TouchableOpacity
                  key={snd}
                  style={styles.soundTestBtn}
                  onPress={() => handleTestSound(snd)}
                >
                  <LucideIcons.Volume2 size={12} color="#ffffff" />
                  <Text style={styles.soundTestBtnText}>{snd.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Database & Diagnostics */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Gallery Diagnostics</Text>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Active Screen Widgets</Text>
          <Text style={styles.diagValue}>{widgets.length}</Text>
        </View>
        <View style={styles.diagRow}>
          <Text style={styles.diagLabel}>Persistence Store</Text>
          <Text style={[styles.diagValue, { color: '#39ff14' }]}>MMKV CACHE ACTIVE</Text>
        </View>
        
        <TouchableOpacity
          style={styles.clearAllBtn}
          onPress={() => {
            triggerHaptic('heavy');
            triggerSound('error');
            clearWidgets();
            alert('Active widgets canvas cleared!');
          }}
        >
          <LucideIcons.Trash2 size={13} color="#ffffff" />
          <Text style={styles.clearAllText}>Clear Preview Canvas</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionFooter}>NOS Gallery Studio v1.0.0 • Google DeepMind Agentic Coding</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#000000',
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  settingDetails: {
    flex: 1,
    marginBottom: 6,
  },
  settingTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  settingDesc: {
    color: '#8e8e93',
    fontSize: 10,
    marginTop: 2,
  },
  selectorGroup: {
    flexDirection: 'row',
    backgroundColor: '#2c2c2e',
    borderRadius: 6,
    padding: 2,
    marginTop: 4,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 4,
  },
  activeSelectorBtn: {
    backgroundColor: '#007aff',
  },
  selectorBtnText: {
    color: '#8e8e93',
    fontSize: 9,
    fontWeight: 'bold',
  },
  activeSelectorBtnText: {
    color: '#ffffff',
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#2c2c2e',
    marginRight: 8,
  },
  activeThemeChip: {
    backgroundColor: '#007aff',
  },
  themeChipText: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeThemeChipText: {
    color: '#ffffff',
  },
  batteryEstimationPanel: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estTitle: {
    color: '#8e8e93',
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  estValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  estBarBg: {
    height: 6,
    backgroundColor: '#1c1c1e',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  estBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  estFootnote: {
    color: '#666666',
    fontSize: 8,
    marginTop: 6,
  },
  soundTestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  soundTestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#2c2c2e',
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
  },
  soundTestBtnText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  diagLabel: {
    color: '#8e8e93',
    fontSize: 11,
  },
  diagValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  clearAllText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  versionFooter: {
    color: '#444444',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 10,
  },
});
