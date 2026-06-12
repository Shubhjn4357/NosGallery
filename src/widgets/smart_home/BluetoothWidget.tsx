import { Bluetooth, BluetoothSearching, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Bluetooth,
  BluetoothSearching,
  Check,
};

interface BluetoothWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const BluetoothWidget: React.FC<BluetoothWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic } = useFeedback();

  const [connected, setConnected] = useState(true);
  const [scanning, setScanning] = useState(false);

  const handleToggle = () => {
    if (!interactive || scanning) return;
    triggerHaptic('light');

    if (connected) {
      setConnected(false);
    } else {
      setScanning(true);
      setTimeout(() => {
        setConnected(true);
        setScanning(false);
        triggerHaptic('success');
      }, 1500);
    }
  };

  const isLight = textStyle.color === '#000000';
  const indicatorColor = connected ? accentColor : subtextStyle.color;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Bluetooth size={11} color={indicatorColor} />
          <Text style={[styles.title, subtextStyle]}>BLUETOOTH</Text>
        </View>
        <Text style={[styles.statusTxt, { color: indicatorColor }]}>
          {connected ? 'CONNECTED' : scanning ? 'SCANNING' : 'OFF'}
        </Text>
      </View>

      <View style={styles.main}>
        {scanning ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={accentColor} />
            <Text style={[styles.deviceLabel, textStyle]}>Searching accessories...</Text>
          </View>
        ) : connected ? (
          <View style={styles.deviceInfo}>
            <Text style={[styles.deviceName, textStyle]}>Nothing Ear (2)</Text>
            <View style={styles.connectionRow}>
              <LucideIcons.Check size={8} color={accentColor} />
              <Text style={[styles.connectionDesc, subtextStyle]}>Active audio sink</Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.deviceLabel, subtextStyle]}>No accessories connected</Text>
        )}
      </View>

      {interactive && (
        <TouchableOpacity
          onPress={handleToggle}
          disabled={scanning}
          style={[styles.actionBtn, { backgroundColor: isLight ? '#e5e5ea' : '#1c1c1e', borderColor: accentColor }]}
        >
          <Text style={[styles.btnText, { color: accentColor }]}>
            {connected ? 'DISCONNECT' : 'SEARCH'}
          </Text>
        </TouchableOpacity>
      )}
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
  statusTxt: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceLabel: {
    fontSize: 9.5,
    opacity: 0.65,
  },
  deviceInfo: {
    gap: 2,
  },
  deviceName: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  connectionDesc: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  actionBtn: {
    height: 22,
    borderRadius: 6,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
