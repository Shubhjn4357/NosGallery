import { Sliders, Wifi, Bluetooth, Volume2, VolumeX, Moon } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore } from '../../store/widgetStore';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Sliders,
  Wifi,
  Bluetooth,
  Volume2,
  VolumeX,
  Moon,
};

interface QuickControlsWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const QuickControlsWidget: React.FC<QuickControlsWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { systemVolume, setSystemVolume } = useWidgetStore();
  const { triggerHaptic } = useFeedback();
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(true);
  const [dndOn, setDndOn] = useState(false);

  const handleToggleWifi = () => {
    if (!interactive) return;
    triggerHaptic('light');
    setWifiOn(!wifiOn);
  };

  const handleToggleBt = () => {
    if (!interactive) return;
    triggerHaptic('light');
    setBtOn(!btOn);
  };

  const handleToggleDnd = () => {
    if (!interactive) return;
    triggerHaptic('light');
    setDndOn(!dndOn);
  };

  const handleVolumeUp = () => {
    if (!interactive) return;
    triggerHaptic('selection');
    setSystemVolume(Math.min(100, systemVolume + 10));
  };

  const handleVolumeDown = () => {
    if (!interactive) return;
    triggerHaptic('selection');
    setSystemVolume(Math.max(0, systemVolume - 10));
  };

  const isLight = textStyle.color === '#000000';
  const activeBg = accentColor;
  const inactiveBg = isLight ? '#e5e5ea' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Sliders size={10} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>CONTROL CENTER</Text>
        </View>
        <Text style={[styles.ssidText, subtextStyle]}>
          {wifiOn ? 'NOS_STUDIO_5G' : 'DISCONNECTED'}
        </Text>
      </View>

      <View style={styles.mainGrid}>
        {/* Toggle columns */}
        <View style={styles.toggles}>
          <TouchableOpacity
            onPress={handleToggleWifi}
            disabled={!interactive}
            style={[styles.tileBtn, { backgroundColor: wifiOn ? activeBg : inactiveBg }]}
          >
            <LucideIcons.Wifi size={14} color={wifiOn ? '#000000' : textStyle.color} />
            <Text style={[styles.tileLabel, { color: wifiOn ? '#000000' : textStyle.color }]}>WIFI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleBt}
            disabled={!interactive}
            style={[styles.tileBtn, { backgroundColor: btOn ? activeBg : inactiveBg }]}
          >
            <LucideIcons.Bluetooth size={14} color={btOn ? '#000000' : textStyle.color} />
            <Text style={[styles.tileLabel, { color: btOn ? '#000000' : textStyle.color }]}>EAR (2)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleDnd}
            disabled={!interactive}
            style={[styles.tileBtn, { backgroundColor: dndOn ? activeBg : inactiveBg }]}
          >
            <LucideIcons.Moon size={14} color={dndOn ? '#000000' : textStyle.color} />
            <Text style={[styles.tileLabel, { color: dndOn ? '#000000' : textStyle.color }]}>DND</Text>
          </TouchableOpacity>
        </View>

        {/* Volume controller card */}
        <View style={[styles.volumeCard, { backgroundColor: inactiveBg }]}>
          <View style={styles.volumeHeader}>
            {systemVolume === 0 ? (
              <LucideIcons.VolumeX size={12} color={accentColor} />
            ) : (
              <LucideIcons.Volume2 size={12} color={accentColor} />
            )}
            <Text style={[styles.volumeLabel, textStyle]}>VOLUME {systemVolume}%</Text>
          </View>

          {/* Slider bar */}
          <View style={[styles.sliderTrack, { backgroundColor: isLight ? '#efeff4' : '#2c2c2e' }]}>
            <View style={[styles.sliderFill, { width: `${systemVolume}%`, backgroundColor: accentColor }]} />
          </View>

          {/* Volume buttons */}
          {interactive && (
            <View style={styles.volBtns}>
              <TouchableOpacity onPress={handleVolumeDown} style={[styles.adjustBtn, { backgroundColor: isLight ? '#d1d1d6' : '#2c2c2e' }]}>
                <Text style={[styles.btnTxt, textStyle]}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVolumeUp} style={[styles.adjustBtn, { backgroundColor: isLight ? '#d1d1d6' : '#2c2c2e' }]}>
                <Text style={[styles.btnTxt, textStyle]}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  ssidText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  mainGrid: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  toggles: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  tileBtn: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  tileLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  volumeCard: {
    flex: 1.2,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  volumeLabel: {
    fontSize: 8,
    fontWeight: '900',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  volBtns: {
    flexDirection: 'row',
    gap: 4,
  },
  adjustBtn: {
    flex: 1,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});
