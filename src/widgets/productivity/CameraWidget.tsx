import { Camera, Image as ImageIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity, Image } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Camera,
  ImageIcon,
};

interface CameraWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const CameraWidget: React.FC<CameraWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic, triggerSound } = useFeedback();

  const [snapCount, setSnapCount] = useState(0);

  const handleCapture = () => {
    if (!interactive) return;
    triggerHaptic('heavy');
    triggerSound('click');
    setSnapCount((prev) => prev + 1);
  };

  const isLight = textStyle.color === '#000000';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Camera size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>LENS LINK</Text>
        </View>
        <Text style={[styles.modeText, { color: accentColor }]}>READY</Text>
      </View>

      {/* Simulated Viewfinder */}
      <View style={[styles.viewfinder, { backgroundColor: isLight ? '#efeff4' : '#0a0a0c' }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60' }}
          style={styles.previewImage}
        />
        <View style={styles.viewfinderGrid}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={styles.viewfinderOverlayText}>RAW 12MP</Text>
      </View>

      {/* Capture trigger */}
      <View style={styles.footerRow}>
        <Text style={[styles.captureCount, subtextStyle]}>
          CAPTURED: {snapCount}
        </Text>
        {interactive && (
          <TouchableOpacity
            onPress={handleCapture}
            style={[styles.shutterBtn, { borderColor: accentColor }]}
          >
            <View style={[styles.shutterInner, { backgroundColor: accentColor }]} />
          </TouchableOpacity>
        )}
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
  modeText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewfinder: {
    flex: 1,
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  viewfinderGrid: {
    ...StyleSheet.absoluteFill,
    padding: 6,
  },
  corner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderColor: '#ffffff',
  },
  topLeft: {
    top: 6,
    left: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  topRight: {
    top: 6,
    right: 6,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  bottomLeft: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  bottomRight: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  viewfinderOverlayText: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    color: '#ffffff',
    fontSize: 6.5,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  captureCount: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  shutterBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1.5,
  },
  shutterInner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
