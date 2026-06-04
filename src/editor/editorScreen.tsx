import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useWidgetStore, ActiveWidget, WidgetCustomizations } from '../store/widgetStore';
import { widgetRegistry, WidgetTemplate, getTemplatesByCategory, WidgetCategory } from '../widgets/registry';
import { WidgetRenderer } from '../widgets/widgetRenderer';
import { themes, ThemeId } from '../themes/themes';
import { fonts, FontId } from '../fonts/fonts';
import { useFeedback } from '../hooks/useFeedback';
import * as LucideIcons from 'lucide-react-native';

const CATEGORIES: { id: WidgetCategory; name: string }[] = [
  { id: 'clock', name: 'Clocks' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'weather', name: 'Weather' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'health', name: 'Health' },
  { id: 'finance', name: 'Finance' },
  { id: 'developer', name: 'Dev' },
  { id: 'social', name: 'Social' },
  { id: 'smart_home', name: 'Home' },
  { id: 'ai', name: 'AI' },
];

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#007aff', '#39ff14', 
  '#ff2d55', '#dfba6b', '#1a0826', '#e0e0e0', '#f7ebec'
];

const BORDER_RADII = [0, 8, 12, 16, 20, 24, 32, 48];
const SHADOW_TYPES: WidgetCustomizations['shadowType'][] = ['none', 'soft', 'medium', 'hard', 'glow'];

export const EditorScreen: React.FC = () => {
  const {
    widgets,
    selectedWidgetId,
    activeTheme,
    updateWidgetCustomizations,
    addWidget,
    saveWidgetPreset,
    pendingWidget,
    setPendingWidget,
    applyPendingToGrid,
    googleUser,
    setGoogleUser,
  } = useWidgetStore();

  const { triggerHaptic, triggerSound } = useFeedback();

  const [activeCategory, setActiveCategory] = useState<WidgetCategory>('clock');
  const [editorTab, setEditorTab] = useState<'add' | 'style' | 'text'>('add');

  const [promptTemplate, setPromptTemplate] = useState<WidgetTemplate | null>(null);
  const [promptInputVal, setPromptInputVal] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [simulatedPassword, setSimulatedPassword] = useState('');
  const [simulatedEmail, setSimulatedEmail] = useState('');

  useEffect(() => {
    if (pendingWidget && pendingWidget.templateId.startsWith('ai_') && !googleUser && !showGoogleModal) {
      const template = widgetRegistry[pendingWidget.templateId];
      if (template) {
        setPromptTemplate(template);
        setSimulatedEmail('nothing.dev@gmail.com');
        setSimulatedPassword('••••••••');
        setShowGoogleModal(true);
      }
    }
  }, [pendingWidget, googleUser]);

  const activeEditWidget = pendingWidget || widgets.find(w => w.id === selectedWidgetId);

  const handleUpdate = (updates: Partial<WidgetCustomizations>) => {
    if (!activeEditWidget) return;
    updateWidgetCustomizations(activeEditWidget.id, updates);
    triggerHaptic('light');
  };

  const handleAddWidget = (template: WidgetTemplate) => {
    triggerHaptic('selection');
    triggerSound('click');

    if (template.category === 'ai' && !googleUser) {
      setPromptTemplate(template);
      setSimulatedEmail('nothing.dev@gmail.com');
      setSimulatedPassword('••••••••');
      setShowGoogleModal(true);
      return;
    }

    const isWeather = template.category === 'weather';
    const isGithub = template.id.includes('github') || template.id.includes('git');
    const isFinance = template.category === 'finance';

    if (isWeather || isGithub || isFinance) {
      setPromptTemplate(template);
      setPromptInputVal(
        isWeather ? 'London' : isGithub ? 'octocat' : isFinance ? 'BTC' : ''
      );
      return;
    }

    commitAddWidget(template, {});
  };

  const commitAddWidget = (template: WidgetTemplate, customSettings: { titleText?: string; valueText?: string }) => {
    const newWidget: ActiveWidget = {
      id: 'widget_pending',
      templateId: template.id,
      x: 0,
      y: 0,
      w: template.defaultWidth,
      h: template.defaultHeight,
      customizations: {
        fontId: 'inter',
        fontSize: 14,
        backgroundType: 'solid',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        transparency: 10,
        blur: 10,
        shadowType: 'soft',
        titleText: customSettings.titleText || template.defaultTitle,
        valueText: customSettings.valueText || template.defaultValue,
        themeOverride: 'none',
      },
    };
    setPendingWidget(newWidget);
    setEditorTab('style');
  };

  const handleSettingsModalSubmit = () => {
    if (!promptTemplate) return;
    triggerHaptic('success');
    triggerSound('apply');

    const isWeather = promptTemplate.category === 'weather';
    const isGithub = promptTemplate.id.includes('github') || promptTemplate.id.includes('git');
    const isFinance = promptTemplate.category === 'finance';

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
    }

    commitAddWidget(promptTemplate, customSettings);
    setPromptTemplate(null);
    setPromptInputVal('');
  };

  const handleGoogleLoginSubmit = () => {
    if (!promptTemplate) return;
    triggerHaptic('success');
    triggerSound('success');

    const user = {
      email: simulatedEmail || 'nothing.dev@gmail.com',
      name: 'Nothing Developer',
    };
    setGoogleUser(user);
    setShowGoogleModal(false);

    commitAddWidget(promptTemplate, {
      titleText: promptTemplate.defaultTitle,
      valueText: `Authenticated: ${user.email}`,
    });
    setPromptTemplate(null);
  };

  const renderSettingsModal = () => {
    if (!promptTemplate) return null;
    const isWeather = promptTemplate.category === 'weather';
    const isGithub = promptTemplate.id.includes('github') || promptTemplate.id.includes('git');
    const isFinance = promptTemplate.category === 'finance';

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
    if (!showGoogleModal || !promptTemplate) return null;

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

  const handleSavePreset = () => {
    if (!activeEditWidget) return;
    triggerHaptic('success');
    triggerSound('success');
    saveWidgetPreset(activeEditWidget);
    alert('Widget configuration saved to your presets library!');
  };

  const renderAddTab = () => {
    const templates = getTemplatesByCategory(activeCategory);
    return (
      <View style={styles.tabContent}>
        {/* Categories Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.activeCategoryChip,
              ]}
              onPress={() => {
                triggerHaptic('selection');
                setActiveCategory(cat.id);
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat.id && styles.activeCategoryChipText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Templates Grid */}
        <ScrollView contentContainerStyle={styles.templatesGrid} showsVerticalScrollIndicator={false}>
          {templates.map((tpl) => (
            <TouchableOpacity
              key={tpl.id}
              style={styles.templateCard}
              onPress={() => handleAddWidget(tpl)}
            >
              <View style={styles.templateIconBox}>
                <Text style={styles.templateIconText}>{tpl.name[0]}</Text>
              </View>
              <View style={styles.templateDetails}>
                <Text style={styles.templateName}>{tpl.name}</Text>
                <Text style={styles.templateSize}>
                  Grid: {tpl.defaultWidth}x{tpl.defaultHeight}
                </Text>
                <Text style={styles.templateDesc} numberOfLines={1}>
                  {tpl.description}
                </Text>
              </View>
              <LucideIcons.PlusCircle size={20} color="#007aff" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStyleTab = () => {
    if (!activeEditWidget) {
      return (
        <View style={styles.noSelection}>
          <LucideIcons.Sliders size={32} color="#444" />
          <Text style={styles.noSelectionText}>Select a widget on the device preview or add a new one to customize its styles.</Text>
        </View>
      );
    }

    const { customizations } = activeEditWidget;

    return (
      <ScrollView contentContainerStyle={styles.stylesScroll} showsVerticalScrollIndicator={false}>
        {pendingWidget && (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Studio Live Preview</Text>
            <View style={{ transform: [{ scale: 0.95 }], marginVertical: 8, alignItems: 'center', justifyContent: 'center' }}>
              <WidgetRenderer
                widget={pendingWidget}
                globalTheme={activeTheme}
                interactive={true}
              />
            </View>
            <TouchableOpacity
              style={styles.addToHomeScreenBtn}
              onPress={() => {
                triggerHaptic('success');
                triggerSound('apply');
                applyPendingToGrid();
              }}
            >
              <LucideIcons.PlusCircle size={14} color="#ffffff" />
              <Text style={styles.addToHomeScreenBtnText}>Add to Home Screen</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Theme Override */}
        <Text style={styles.sectionTitle}>Theme Skin</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          <TouchableOpacity
            style={[
              styles.choiceChip,
              (!customizations.themeOverride || customizations.themeOverride === 'none') && styles.activeChoiceChip,
            ]}
            onPress={() => handleUpdate({ themeOverride: 'none' })}
          >
            <Text style={styles.choiceChipText}>Global Default</Text>
          </TouchableOpacity>
          {Object.values(themes).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.choiceChip,
                customizations.themeOverride === t.id && styles.activeChoiceChip,
              ]}
              onPress={() => handleUpdate({ themeOverride: t.id })}
            >
              <Text style={styles.choiceChipText}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Background Type */}
        <Text style={styles.sectionTitle}>Background Style</Text>
        <View style={styles.segmentedControl}>
          {(['solid', 'gradient', 'glass', 'none'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.segmentBtn,
                customizations.backgroundType === type && styles.activeSegmentBtn,
              ]}
              onPress={() => handleUpdate({ backgroundType: type })}
            >
              <Text style={[styles.segmentBtnText, customizations.backgroundType === type && styles.activeSegmentBtnText]}>
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Colors Palette (only if solid background) */}
        {customizations.backgroundType === 'solid' && (
          <>
            <Text style={styles.sectionTitle}>Background Color</Text>
            <View style={styles.colorPalette}>
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    customizations.backgroundColor === c && { borderWidth: 2, borderColor: '#007aff' },
                  ]}
                  onPress={() => handleUpdate({ backgroundColor: c })}
                />
              ))}
            </View>
          </>
        )}

        {/* Font Families */}
        <Text style={styles.sectionTitle}>Typography Font</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {Object.values(fonts).map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.choiceChip,
                customizations.fontId === f.id && styles.activeChoiceChip,
              ]}
              onPress={() => handleUpdate({ fontId: f.id })}
            >
              <Text style={styles.choiceChipText}>{f.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Corner Radius */}
        <Text style={styles.sectionTitle}>Border Radius</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {BORDER_RADII.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.choiceChip,
                customizations.borderRadius === r && styles.activeChoiceChip,
              ]}
              onPress={() => handleUpdate({ borderRadius: r })}
            >
              <Text style={styles.choiceChipText}>{r}px</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shadows */}
        <Text style={styles.sectionTitle}>Outer Shadow / Glow</Text>
        <View style={styles.segmentedControl}>
          {SHADOW_TYPES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.segmentBtn,
                customizations.shadowType === s && styles.activeSegmentBtn,
              ]}
              onPress={() => handleUpdate({ shadowType: s })}
            >
              <Text style={[styles.segmentBtnText, customizations.shadowType === s && styles.activeSegmentBtnText]}>
                {s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sliders mock/interactive */}
        <Text style={styles.sectionTitle}>Transparency & Contrast</Text>
        <View style={styles.settingItemRow}>
          <Text style={styles.settingLabel}>Translucent Blend: {customizations.transparency}%</Text>
          <View style={styles.customSliderContainer}>
            <TouchableOpacity style={styles.sliderPart} onPress={() => handleUpdate({ transparency: 0 })}><Text style={styles.sliderLabel}>0</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sliderPart} onPress={() => handleUpdate({ transparency: 25 })}><Text style={styles.sliderLabel}>25</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sliderPart} onPress={() => handleUpdate({ transparency: 50 })}><Text style={styles.sliderLabel}>50</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sliderPart} onPress={() => handleUpdate({ transparency: 75 })}><Text style={styles.sliderLabel}>75</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sliderPart} onPress={() => handleUpdate({ transparency: 95 })}><Text style={styles.sliderLabel}>95</Text></TouchableOpacity>
          </View>
        </View>

        {/* Presets Export */}
        <TouchableOpacity style={styles.savePresetBtn} onPress={handleSavePreset}>
          <LucideIcons.Download size={14} color="#ffffff" />
          <Text style={styles.savePresetBtnText}>Save Widget Preset</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderTextTab = () => {
    if (!activeEditWidget) {
      return (
        <View style={styles.noSelection}>
          <LucideIcons.Edit3 size={32} color="#444" />
          <Text style={styles.noSelectionText}>Select a widget to edit its typography contents.</Text>
        </View>
      );
    }

    const { customizations } = activeEditWidget;

    return (
      <ScrollView contentContainerStyle={styles.stylesScroll} showsVerticalScrollIndicator={false}>
        {pendingWidget && (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Studio Live Preview</Text>
            <View style={{ transform: [{ scale: 0.95 }], marginVertical: 8, alignItems: 'center', justifyContent: 'center' }}>
              <WidgetRenderer
                widget={pendingWidget}
                globalTheme={activeTheme}
                interactive={true}
              />
            </View>
            <TouchableOpacity
              style={styles.addToHomeScreenBtn}
              onPress={() => {
                triggerHaptic('success');
                triggerSound('apply');
                applyPendingToGrid();
              }}
            >
              <LucideIcons.PlusCircle size={14} color="#ffffff" />
              <Text style={styles.addToHomeScreenBtnText}>Add to Home Screen</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.sectionTitle}>Customize Widget Texts</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Widget Header / Title</Text>
          <TextInput
            style={styles.textInput}
            value={customizations.titleText || ''}
            onChangeText={(txt) => handleUpdate({ titleText: txt })}
            placeholder="Header Label"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Widget Text Value / Description</Text>
          <TextInput
            style={[styles.textInput, { height: 80 }]}
            multiline
            numberOfLines={4}
            value={customizations.valueText || ''}
            onChangeText={(txt) => handleUpdate({ valueText: txt })}
            placeholder="Value or custom description lines"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Text Font Size: {customizations.fontSize || 14}px</Text>
          <View style={styles.customSliderContainer}>
            {[10, 12, 14, 16, 20, 24, 28, 32].map((sz) => (
              <TouchableOpacity
                key={sz}
                style={[styles.sliderPart, customizations.fontSize === sz && { backgroundColor: '#007aff' }]}
                onPress={() => handleUpdate({ fontSize: sz })}
              >
                <Text style={[styles.sliderLabel, customizations.fontSize === sz && { color: '#ffffff' }]}>{sz}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Editor Main Tabs */}
      <View style={styles.tabsHeader}>
        <TouchableOpacity
          style={[styles.tabButton, editorTab === 'add' && styles.activeTabButton]}
          onPress={() => {
            triggerHaptic('selection');
            setEditorTab('add');
          }}
        >
          <LucideIcons.PlusCircle size={15} color={editorTab === 'add' ? '#007aff' : '#8e8e93'} />
          <Text style={[styles.tabButtonText, editorTab === 'add' && styles.activeTabButtonText]}>Add Widget</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, editorTab === 'style' && styles.activeTabButton]}
          onPress={() => {
            triggerHaptic('selection');
            setEditorTab('style');
          }}
        >
          <LucideIcons.Sliders size={15} color={editorTab === 'style' ? '#007aff' : '#8e8e93'} />
          <Text style={[styles.tabButtonText, editorTab === 'style' && styles.activeTabButtonText]}>Design</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, editorTab === 'text' && styles.activeTabButton]}
          onPress={() => {
            triggerHaptic('selection');
            setEditorTab('text');
          }}
        >
          <LucideIcons.Edit3 size={15} color={editorTab === 'text' ? '#007aff' : '#8e8e93'} />
          <Text style={[styles.tabButtonText, editorTab === 'text' && styles.activeTabButtonText]}>Text Content</Text>
        </TouchableOpacity>
      </View>

      {/* Editor Body */}
      <View style={styles.editorBody}>
        {editorTab === 'add' && renderAddTab()}
        {editorTab === 'style' && renderStyleTab()}
        {editorTab === 'text' && renderTextTab()}
      </View>

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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  tabsHeader: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#007aff',
  },
  tabButtonText: {
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabButtonText: {
    color: '#007aff',
  },
  editorBody: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  categoriesBar: {
    maxHeight: 38,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1c1c1e',
    marginRight: 8,
    height: 28,
  },
  activeCategoryChip: {
    backgroundColor: '#007aff',
  },
  categoryChipText: {
    color: '#8e8e93',
    fontSize: 11,
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: '#ffffff',
  },
  templatesGrid: {
    paddingBottom: 20,
    gap: 10,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 10,
  },
  templateIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  templateDetails: {
    flex: 1,
    marginLeft: 12,
  },
  templateName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  templateSize: {
    color: '#8e8e93',
    fontSize: 10,
    marginTop: 1,
  },
  templateDesc: {
    color: '#666666',
    fontSize: 9,
    marginTop: 2,
  },
  noSelection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  noSelectionText: {
    color: '#8e8e93',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  stylesScroll: {
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipsRow: {
    marginBottom: 8,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1c1c1e',
    marginRight: 8,
  },
  activeChoiceChip: {
    backgroundColor: '#007aff',
  },
  choiceChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    padding: 2,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSegmentBtn: {
    backgroundColor: '#007aff',
  },
  segmentBtnText: {
    color: '#8e8e93',
    fontSize: 9,
    fontWeight: 'bold',
  },
  activeSegmentBtnText: {
    color: '#ffffff',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingItemRow: {
    marginBottom: 12,
  },
  settingLabel: {
    color: '#8e8e93',
    fontSize: 11,
    marginBottom: 6,
  },
  customSliderContainer: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sliderPart: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#222',
  },
  sliderLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  savePresetBtn: {
    flexDirection: 'row',
    backgroundColor: '#34c759',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  savePresetBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#8e8e93',
    fontSize: 11,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    color: '#ffffff',
    padding: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#333',
  },
  previewBox: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  previewLabel: {
    color: '#8e8e93',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  addToHomeScreenBtn: {
    flexDirection: 'row',
    backgroundColor: '#007aff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    width: '100%',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addToHomeScreenBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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
