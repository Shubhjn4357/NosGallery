import { Sliders, Trash2, Volume2, Zap, Heart, Key } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import { useWidgetStore, SystemSettings } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import { themes } from '../themes/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GithubIcon as Github } from '../components/BrandIcons';

const LucideIcons = {
  Sliders,
  Trash2,
  Volume2,
  Zap,
  Github,
  Heart,
  Key,
};

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    activeTheme,
    widgets,
    updateSettings,
    setActiveTheme,
    clearWidgets,
    showToast,
    githubUsername,
    setGithubUsername,
    googleHealthConnected,
    setGoogleHealthConnected,
    geminiApiKey,
    setGeminiApiKey,
  } = useWidgetStore();

  const { triggerHaptic, triggerSound } = useFeedback();
  const insets = useSafeAreaInsets();

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
    <ScrollView 
      contentContainerStyle={[
        styles.container, 
        { 
          paddingTop: insets.top + 16, 
          paddingBottom: insets.bottom + 120 
        }
      ]} 
      showsVerticalScrollIndicator={false}
    >
      {/* ── PAGE HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <LucideIcons.Sliders size={18} color="#ff2d2d" style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>STUDIO SETTINGS</Text>
        </View>
        <Text style={styles.headerSubtitle}>Configure the dashboard widgets engine and theme settings</Text>
        <View style={styles.headerDivider} />
      </View>
      
      {/* Device & Design System Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Studio Environment</Text>

        {/* Theme Picker */}
        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Global Theme</Text>
            <Text style={styles.settingDesc}>Active skin for the gallery dashboard</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
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
                  {t.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Developer Accounts & APIs Settings */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Developer & Accounts</Text>
          <LucideIcons.Github size={13} color="#7C9EFF" />
        </View>

        {/* GitHub Username Input */}
        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>GitHub Username</Text>
            <Text style={styles.settingDesc}>Specify username to fetch contributions and stats</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={githubUsername}
            onChangeText={(text) => {
              setGithubUsername(text);
            }}
            placeholder="e.g. octocat"
            placeholderTextColor="#666"
            autoCapitalize="none"
          />
        </View>

        {/* Gemini API Key Input */}
        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Gemini API Key</Text>
            <Text style={styles.settingDesc}>API Key for Google Generative AI integration</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={geminiApiKey}
            onChangeText={(text) => {
              setGeminiApiKey(text);
            }}
            secureTextEntry
            placeholder="AIzaSy..."
            placeholderTextColor="#666"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Google Health Sync Settings */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Health Sync Integration</Text>
          <LucideIcons.Heart size={13} color="#ff2d2d" />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingDetails}>
            <Text style={styles.settingTitle}>Google Health Sync</Text>
            <Text style={styles.settingDesc}>Sync steps and health metrics with Google Fit / Health Connect</Text>
          </View>
          <Switch
            value={googleHealthConnected}
            onValueChange={(val) => {
              triggerHaptic('selection');
              setGoogleHealthConnected(val);
              if (val) {
                showToast('Google Health synchronized successfully!', 'success');
              }
            }}
            trackColor={{ false: '#222224', true: '#ff2d2d' }}
            thumbColor={googleHealthConnected ? '#ffffff' : '#8e8e93'}
          />
        </View>
      </View>

      {/* Battery Optimization Settings */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Battery Optimizer</Text>
          <LucideIcons.Zap size={13} color="#ff2d2d" />
        </View>

        {/* Battery cost readout */}
        <View style={styles.batteryEstimationPanel}>
          <View style={styles.rowSpace}>
            <Text style={styles.estTitle}>ESTIMATED DRAIN COST</Text>
            <Text style={styles.estValue}>{getBatteryEstimation()}% / HR</Text>
          </View>
          <View style={styles.estBarBg}>
            <View
              style={[
                styles.estBarFill,
                {
                  width: `${Math.min(Number(getBatteryEstimation()) * 80, 100)}%`,
                  backgroundColor: Number(getBatteryEstimation()) > 0.4 ? '#ff2d2d' : '#ffffff',
                },
              ]}
            />
          </View>
          <Text style={styles.estFootnote}>
            Target rate: &lt; 1% battery/hour. The widgets engine operates under throttled background cycles.
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
            trackColor={{ false: '#222224', true: '#ffffff' }}
            thumbColor={settings.autoRefresh ? '#000000' : '#8e8e93'}
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
                    {interval === 'realtime' ? 'LIVE' : interval.toUpperCase()}
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
            trackColor={{ false: '#222224', true: '#ffffff' }}
            thumbColor={settings.batterySaver ? '#000000' : '#8e8e93'}
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
            trackColor={{ false: '#222224', true: '#ffffff' }}
            thumbColor={settings.hapticsEnabled ? '#000000' : '#8e8e93'}
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
            trackColor={{ false: '#222224', true: '#ffffff' }}
            thumbColor={settings.soundEnabled ? '#000000' : '#8e8e93'}
          />
        </View>

        {/* Sound triggers */}
        {settings.soundEnabled && (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.settingDesc}>TEST SOUND EFFECTS:</Text>
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
          <Text style={[styles.diagValue, { color: '#ff2d2d' }]}>MMKV CACHE ACTIVE</Text>
        </View>
        
        <TouchableOpacity
          style={styles.clearAllBtn}
          onPress={() => {
            triggerHaptic('heavy');
            triggerSound('error');
            clearWidgets();
            showToast('Active widgets canvas cleared!', 'info');
          }}
        >
          <LucideIcons.Trash2 size={13} color="#ff2d2d" />
          <Text style={styles.clearAllText}>CLEAR PREVIEW CANVAS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionFooter}>NOS GALLERY STUDIO v1.0.0 • GOOGLE DEEPMIND ANTIGRAVITY</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000000',
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#8e8e93',
    fontSize: 11,
    lineHeight: 15,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#1f1f22',
    marginTop: 12,
  },
  sectionCard: {
    backgroundColor: '#0b0b0c',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f22',
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 1.5,
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
    borderBottomColor: '#1a1a1c',
  },
  settingDetails: {
    flex: 1,
    marginBottom: 8,
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
    backgroundColor: '#161618',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242426',
    padding: 2,
    marginTop: 6,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeSelectorBtn: {
    backgroundColor: '#ffffff',
  },
  selectorBtnText: {
    color: '#8e8e93',
    fontSize: 9.5,
    fontWeight: '900',
  },
  activeSelectorBtnText: {
    color: '#000000',
  },
  themeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#242426',
    marginRight: 8,
  },
  activeThemeChip: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  themeChipText: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '900',
  },
  activeThemeChipText: {
    color: '#000000',
  },
  batteryEstimationPanel: {
    backgroundColor: '#161618',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#242426',
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
    fontSize: 8.5,
    letterSpacing: 1.5,
    fontWeight: '900',
  },
  estValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  estBarBg: {
    height: 8,
    backgroundColor: '#0a0a0c',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#242426',
  },
  estBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  estFootnote: {
    color: '#666666',
    fontSize: 8.5,
    marginTop: 6,
    lineHeight: 11,
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
    gap: 6,
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#242426',
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
  },
  soundTestBtnText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '900',
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1c',
  },
  diagLabel: {
    color: '#8e8e93',
    fontSize: 11.5,
  },
  diagValue: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#ff2d2d',
    borderRadius: 24,
    paddingVertical: 12,
    marginTop: 14,
  },
  clearAllText: {
    color: '#ff2d2d',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  versionFooter: {
    color: '#444444',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: '#161618',
    borderColor: '#242426',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 12,
    marginTop: 8,
  },
});
