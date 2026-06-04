import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useWidgetStore, ActiveWidget, WidgetCustomizations } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';
import * as LucideIcons from 'lucide-react-native';
import { widgetRegistry, WidgetTemplate } from '../widgets/registry';


interface PresetPackItem {
  id: string;
  name: string;
  creator: string;
  downloads: string;
  price: string;
  category: string;
  rating: string;
  imageUrl: string;
}

const FEATURED_PACKS: PresetPackItem[] = [
  {
    id: 'pack_nothing_lite',
    name: 'Nothing Lite Collection',
    creator: 'Nothing Community',
    downloads: '14.2K',
    price: 'Free',
    category: 'Minimalist',
    rating: '4.9',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
  },
  {
    id: 'pack_cyber_glow',
    name: 'Cyber Neon HUD',
    creator: 'RetroByte Labs',
    downloads: '8.4K',
    price: 'Premium ($0.99)',
    category: 'Cyberpunk',
    rating: '4.8',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60',
  },
  {
    id: 'pack_liquid_lux',
    name: 'Liquid Glass Pro',
    creator: 'Apple Design Hub',
    downloads: '22.1K',
    price: 'Free',
    category: 'Glassmorphic',
    rating: '5.0',
    imageUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&auto=format&fit=crop&q=60',
  },
  {
    id: 'pack_luxury_gold',
    name: 'Gold & Ivory Slate',
    creator: 'Studio Aura',
    downloads: '3.1K',
    price: 'Premium ($1.49)',
    category: 'Luxury',
    rating: '4.7',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&auto=format&fit=crop&q=60',
  },
];

export const GalleryScreen: React.FC = () => {
  const { downloadedPresets, deleteWidgetPreset, loadPresetToGrid, setPendingWidget, setActiveTab, googleUser, setGoogleUser } = useWidgetStore();
  const { triggerHaptic, triggerSound } = useFeedback();
  const [activeSubTab, setActiveSubTab] = useState<'my_presets' | 'marketplace'>('my_presets');
  const [searchQuery, setSearchQuery] = useState('');

  const [promptTemplate, setPromptTemplate] = useState<WidgetTemplate | null>(null);
  const [promptInputVal, setPromptInputVal] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [simulatedPassword, setSimulatedPassword] = useState('');
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [pendingPresetToApply, setPendingPresetToApply] = useState<ActiveWidget | null>(null);

  const handleApplyPreset = (preset: ActiveWidget) => {
    triggerHaptic('selection');
    
    // Resolve the template
    const template = widgetRegistry[preset.templateId];
    if (!template) {
      commitApplyPreset(preset, {});
      return;
    }

    if (template.category === 'ai' && !googleUser) {
      setPromptTemplate(template);
      setPendingPresetToApply(preset);
      setSimulatedEmail('nothing.dev@gmail.com');
      setSimulatedPassword('••••••••');
      setShowGoogleModal(true);
      return;
    }

    const isWeather = template.category === 'weather';
    const isGithub = template.id.includes('github') || template.id.includes('git');
    const isFinance = template.category === 'finance';
    const isHealth = template.category === 'health';
    const isDevMonitor = template.category === 'developer' && 
                         (template.id.includes('cpu') || template.id.includes('ram') || template.id.includes('disk') || template.id.includes('server'));

    if (isWeather || isGithub || isFinance || isHealth || isDevMonitor) {
      setPromptTemplate(template);
      setPendingPresetToApply(preset);
      if (isWeather) {
        setPromptInputVal('London');
      } else if (isGithub) {
        setPromptInputVal('octocat');
      } else if (isFinance) {
        setPromptInputVal('BTC');
      } else if (isHealth) {
        if (template.id.includes('step')) {
          setPromptInputVal('8432');
        } else if (template.id.includes('cal')) {
          setPromptInputVal('482');
        } else if (template.id.includes('water') || template.id.includes('hydra')) {
          setPromptInputVal('5');
        } else if (template.id.includes('sleep')) {
          setPromptInputVal('7h 42m');
        } else if (template.id.includes('stress') || template.id.includes('mood')) {
          setPromptInputVal('38');
        } else {
          setPromptInputVal('100');
        }
      } else if (isDevMonitor) {
        setPromptInputVal('12');
      }
      return;
    }

    commitApplyPreset(preset, {});
  };

  const commitApplyPreset = (preset: ActiveWidget, customSettings: { titleText?: string; valueText?: string }) => {
    triggerHaptic('success');
    triggerSound('apply');
    setPendingWidget({
      ...preset,
      id: 'widget_pending',
      customizations: {
        ...preset.customizations,
        titleText: customSettings.titleText || preset.customizations.titleText,
        valueText: customSettings.valueText || preset.customizations.valueText,
      }
    });
    setActiveTab('editor');
  };

  const handleDeletePreset = (id: string) => {
    triggerHaptic('heavy');
    triggerSound('error');
    deleteWidgetPreset(id);
  };

  const handleInstallPack = (pack: PresetPackItem) => {
    triggerHaptic('selection');
    
    // Create a mock preset from the pack details
    let templateId = 'clock_digital';
    if (pack.id === 'pack_cyber_glow') {
      templateId = 'developer_github_activity';
    } else if (pack.id === 'pack_liquid_lux') {
      templateId = 'ai_ai_chat';
    } else if (pack.id === 'pack_luxury_gold') {
      templateId = 'weather_current_weather';
    }

    const template = widgetRegistry[templateId];
    if (!template) return;

    const mockPreset: ActiveWidget = {
      id: 'widget_pending',
      templateId: templateId,
      x: 0, y: 0, w: template.defaultWidth, h: template.defaultHeight,
      customizations: {
        fontId: 'outfit',
        fontSize: 16,
        backgroundType: 'gradient',
        borderRadius: 20,
        transparency: 10,
        blur: 15,
        shadowType: 'soft',
        titleText: template.defaultTitle,
        valueText: template.defaultValue,
        themeOverride: pack.category === 'Minimalist' ? 'nos' : pack.category === 'Cyberpunk' ? 'cyberpunk' : 'glassmorphism',
      }
    };

    if (template.category === 'ai' && !googleUser) {
      setPromptTemplate(template);
      setPendingPresetToApply(mockPreset);
      setSimulatedEmail('nothing.dev@gmail.com');
      setSimulatedPassword('••••••••');
      setShowGoogleModal(true);
      return;
    }

    const isWeather = template.category === 'weather';
    const isGithub = template.id.includes('github') || template.id.includes('git');
    const isFinance = template.category === 'finance';
    const isHealth = template.category === 'health';
    const isDevMonitor = template.category === 'developer' && 
                         (template.id.includes('cpu') || template.id.includes('ram') || template.id.includes('disk') || template.id.includes('server'));

    if (isWeather || isGithub || isFinance || isHealth || isDevMonitor) {
      setPromptTemplate(template);
      setPendingPresetToApply(mockPreset);
      if (isWeather) {
        setPromptInputVal('London');
      } else if (isGithub) {
        setPromptInputVal('octocat');
      } else if (isFinance) {
        setPromptInputVal('BTC');
      } else if (isHealth) {
        if (template.id.includes('step')) {
          setPromptInputVal('8432');
        } else if (template.id.includes('cal')) {
          setPromptInputVal('482');
        } else if (template.id.includes('water') || template.id.includes('hydra')) {
          setPromptInputVal('5');
        } else if (template.id.includes('sleep')) {
          setPromptInputVal('7h 42m');
        } else if (template.id.includes('stress') || template.id.includes('mood')) {
          setPromptInputVal('38');
        } else {
          setPromptInputVal('100');
        }
      } else if (isDevMonitor) {
        setPromptInputVal('12');
      }
      return;
    }

    commitApplyPreset(mockPreset, {});
  };

  const handleSettingsModalSubmit = () => {
    if (!promptTemplate || !pendingPresetToApply) return;
    triggerHaptic('success');
    triggerSound('apply');

    const isWeather = promptTemplate.category === 'weather';
    const isGithub = promptTemplate.id.includes('github') || promptTemplate.id.includes('git');
    const isFinance = promptTemplate.category === 'finance';
    const isHealth = promptTemplate.category === 'health';
    const isDevMonitor = promptTemplate.category === 'developer' && 
                         (promptTemplate.id.includes('cpu') || promptTemplate.id.includes('ram') || promptTemplate.id.includes('disk') || promptTemplate.id.includes('server'));

    const customSettings: { titleText?: string; valueText?: string } = {};

    if (isWeather) {
      customSettings.titleText = promptInputVal.toUpperCase();
      customSettings.valueText = `${promptInputVal} weather metrics`;
    } else if (isGithub) {
      customSettings.titleText = promptTemplate.defaultTitle;
      customSettings.valueText = promptInputVal;
    } else if (isFinance) {
      customSettings.titleText = promptInputVal.toUpperCase();
      customSettings.valueText = `$0.00`;
    } else if (isHealth) {
      customSettings.titleText = promptTemplate.defaultTitle;
      customSettings.valueText = promptInputVal;
    } else if (isDevMonitor) {
      customSettings.titleText = promptTemplate.defaultTitle;
      customSettings.valueText = `${promptInputVal}%`;
    }

    commitApplyPreset(pendingPresetToApply, customSettings);
    setPromptTemplate(null);
    setPendingPresetToApply(null);
    setPromptInputVal('');
  };

  const handleGoogleLoginSubmit = () => {
    if (!promptTemplate || !pendingPresetToApply) return;
    triggerHaptic('success');
    triggerSound('success');

    const user = {
      email: simulatedEmail || 'nothing.dev@gmail.com',
      name: 'Nothing Developer',
    };
    setGoogleUser(user);
    setShowGoogleModal(false);

    commitApplyPreset(pendingPresetToApply, {
      titleText: promptTemplate.defaultTitle,
      valueText: `Authenticated: ${user.email}`,
    });
    setPromptTemplate(null);
    setPendingPresetToApply(null);
  };

  const renderSettingsModal = () => {
    if (!promptTemplate || !pendingPresetToApply) return null;
    const isWeather = promptTemplate.category === 'weather';
    const isGithub = promptTemplate.id.includes('github') || promptTemplate.id.includes('git');
    const isFinance = promptTemplate.category === 'finance';
    const isHealth = promptTemplate.category === 'health';
    const isDevMonitor = promptTemplate.category === 'developer' && 
                         (promptTemplate.id.includes('cpu') || promptTemplate.id.includes('ram') || promptTemplate.id.includes('disk') || promptTemplate.id.includes('server'));

    if (promptTemplate.category === 'ai') return null;

    let promptLabel = 'Enter parameter details:';
    let placeholder = 'Value';

    if (isWeather) {
      promptLabel = 'Enter City Name (e.g. London, Tokyo, Paris):';
      placeholder = 'City Name';
    } else if (isGithub) {
      promptLabel = 'Enter GitHub Username (e.g. octocat, torvalds):';
      placeholder = 'Username';
    } else if (isFinance) {
      promptLabel = 'Enter Stock/Crypto Symbol (e.g. AAPL, BTC, ETH):';
      placeholder = 'Symbol';
    } else if (isHealth) {
      if (promptTemplate.id.includes('step')) {
        promptLabel = 'Enter steps count (e.g. 8432):';
        placeholder = 'Steps count';
      } else if (promptTemplate.id.includes('cal')) {
        promptLabel = 'Enter calorie count (kcal, e.g. 482):';
        placeholder = 'Calories';
      } else if (promptTemplate.id.includes('water') || promptTemplate.id.includes('hydra')) {
        promptLabel = 'Enter cups logged (0-8, e.g. 5):';
        placeholder = 'Cups';
      } else if (promptTemplate.id.includes('sleep')) {
        promptLabel = 'Enter sleep duration (e.g. 7h 42m):';
        placeholder = 'Sleep duration';
      } else if (promptTemplate.id.includes('stress') || promptTemplate.id.includes('mood')) {
        promptLabel = 'Enter stress value (0-100, e.g. 38):';
        placeholder = 'Stress value';
      } else {
        promptLabel = 'Enter starting health value:';
        placeholder = 'Value';
      }
    } else if (isDevMonitor) {
      promptLabel = `Enter initial ${promptTemplate.name.toUpperCase()} percentage (0-100):`;
      placeholder = 'Usage %';
    }

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>WIDGET CONFIGURATION</Text>
          <Text style={styles.modalLabel}>{promptLabel}</Text>
          <TextInput
            style={styles.modalInput}
            value={promptInputVal}
            onChangeText={setPromptInputVal}
            placeholder={placeholder}
            placeholderTextColor="#666"
            autoFocus
          />
          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalCancelBtn]}
              onPress={() => {
                triggerHaptic('light');
                setPromptTemplate(null);
                setPendingPresetToApply(null);
                setPromptInputVal('');
              }}
            >
              <Text style={styles.modalBtnTextCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalConfirmBtn]}
              onPress={handleSettingsModalSubmit}
            >
              <Text style={styles.modalBtnTextConfirm}>Apply Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderGoogleLoginModal = () => {
    if (!showGoogleModal || !promptTemplate || !pendingPresetToApply) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.googleLogoRow}>
            <LucideIcons.Sparkles size={20} color="#007aff" />
            <Text style={styles.modalTitle}>GOOGLE AUTHENTICATION</Text>
          </View>
          <Text style={styles.modalDesc}>
            NOS AI widgets require a Google Account connection to run personalized contextual workflows.
          </Text>

          <View style={styles.googleInputGroup}>
            <Text style={styles.googleInputLabel}>Google Account Email</Text>
            <TextInput
              style={styles.modalInput}
              value={simulatedEmail}
              onChangeText={setSimulatedEmail}
              placeholder="example@gmail.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.googleInputGroup}>
            <Text style={styles.googleInputLabel}>Password</Text>
            <TextInput
              style={styles.modalInput}
              value={simulatedPassword}
              onChangeText={setSimulatedPassword}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
            />
          </View>

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalCancelBtn]}
              onPress={() => {
                triggerHaptic('light');
                setShowGoogleModal(false);
                setPromptTemplate(null);
                setPendingPresetToApply(null);
              }}
            >
              <Text style={styles.modalBtnTextCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalGoogleBtn]}
              onPress={handleGoogleLoginSubmit}
            >
              <LucideIcons.LogIn size={12} color="#000" />
              <Text style={styles.modalBtnTextConfirmGoogle}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      {/* Sub Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeSubTab === 'my_presets' && styles.activeTabButton]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveSubTab('my_presets');
          }}
        >
          <Text style={[styles.tabText, activeSubTab === 'my_presets' && styles.activeTabText]}>
            My Presets ({downloadedPresets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeSubTab === 'marketplace' && styles.activeTabButton]}
          onPress={() => {
            triggerHaptic('selection');
            setActiveSubTab('marketplace');
          }}
        >
          <Text style={[styles.tabText, activeSubTab === 'marketplace' && styles.activeTabText]}>
            Marketplace Studio
          </Text>
        </TouchableOpacity>
      </View>

      {activeSubTab === 'my_presets' ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {downloadedPresets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LucideIcons.Sparkles size={48} color="#444" />
              <Text style={styles.emptyTitle}>No custom presets saved yet</Text>
              <Text style={styles.emptyDesc}>
                Open the Widget Studio editor, customize your widget details, and tap "Save Widget Preset" to store them here.
              </Text>
            </View>
          ) : (
            <View style={styles.presetsList}>
              {downloadedPresets.map((preset) => (
                <View key={preset.id} style={styles.presetItemCard}>
                  <View style={styles.presetItemInfo}>
                    <LucideIcons.LayoutGrid size={18} color="#007aff" />
                    <View style={styles.presetItemTexts}>
                      <Text style={styles.presetItemTitle}>
                        {preset.customizations.titleText || 'Custom Widget'}
                      </Text>
                      <Text style={styles.presetItemSub}>
                        Size: {preset.w}x{preset.h} • Font: {preset.customizations.fontId.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.presetItemActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#007aff' }]}
                      onPress={() => handleApplyPreset(preset)}
                    >
                      <LucideIcons.Plus size={14} color="#ffffff" />
                      <Text style={styles.actionBtnText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: 'rgba(255,59,48,0.1)' }]}
                      onPress={() => handleDeletePreset(preset.id)}
                    >
                      <LucideIcons.Trash2 size={13} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Marketplace Featured Packs */}
          <Text style={styles.sectionHeader}>Trending Creators</Text>
          <View style={styles.featuredGrid}>
            {FEATURED_PACKS.map((pack) => (
              <View key={pack.id} style={styles.packCard}>
                <Image source={{ uri: pack.imageUrl }} style={styles.packImage} />
                <View style={styles.packCardOverlay} />
                <View style={styles.packCardContent}>
                  <View style={styles.packTagRow}>
                    <Text style={styles.packCategoryTag}>{pack.category}</Text>
                    <View style={styles.packRatingRow}>
                      <LucideIcons.Star size={10} color="#dfba6b" fill="#dfba6b" />
                      <Text style={styles.packRatingText}>{pack.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.packNameText}>{pack.name}</Text>
                  <Text style={styles.packCreatorText}>by {pack.creator}</Text>
                  <View style={styles.packBottomRow}>
                    <Text style={styles.packDownloadsText}>⤓ {pack.downloads}</Text>
                    <TouchableOpacity style={styles.downloadBtn} onPress={() => handleInstallPack(pack)}>
                      <Text style={styles.downloadBtnText}>{pack.price === 'Free' ? 'GET' : 'BUY'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Guidelines info */}
          <View style={styles.creatorBanner}>
            <LucideIcons.Award size={20} color="#dfba6b" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.bannerTitle}>Publish Your Widget Pack</Text>
              <Text style={styles.bannerDesc}>
                Join the NOS Gallery Creator Club. Share customized templates with other Nothing OS and iOS users.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
      {/* Settings Modal Overlays */}
      {renderSettingsModal()}
      {renderGoogleLoginModal()}
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
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    margin: 16,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#2c2c2e',
  },
  tabText: {
    color: '#8e8e93',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyDesc: {
    color: '#8e8e93',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  presetsList: {
    gap: 10,
  },
  presetItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: 'bold',
  },
  presetItemSub: {
    color: '#666666',
    fontSize: 10,
    marginTop: 2,
  },
  presetItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  packCard: {
    width: '48%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1c1c1e',
  },
  packImage: {
    width: '100%',
    height: '100%',
  },
  packCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  packCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  packTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packCategoryTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  packRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  packRatingText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  packNameText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 'auto',
  },
  packCreatorText: {
    color: '#aaaaaa',
    fontSize: 9,
    marginBottom: 8,
  },
  packBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packDownloadsText: {
    color: '#8e8e93',
    fontSize: 9,
  },
  downloadBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  downloadBtnText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  creatorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(223, 186, 107, 0.2)',
  },
  bannerTitle: {
    color: '#dfba6b',
    fontSize: 13,
    fontWeight: 'bold',
  },
  bannerDesc: {
    color: '#8e8e93',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    padding: 24,
    width: '85%',
    gap: 12,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  modalLabel: {
    color: '#8e8e93',
    fontSize: 11,
    marginTop: 8,
  },
  modalDesc: {
    color: '#8e8e93',
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    color: '#ffffff',
    padding: 12,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#2c2c2e',
  },
  modalConfirmBtn: {
    backgroundColor: '#007aff',
  },
  modalGoogleBtn: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    gap: 6,
  },
  modalBtnTextCancel: {
    color: '#ff3b30',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  modalBtnTextConfirm: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  modalBtnTextConfirmGoogle: {
    color: '#000000',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  googleLogoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  googleInputGroup: {
    gap: 4,
  },
  googleInputLabel: {
    color: '#8e8e93',
    fontSize: 9.5,
  },
});
