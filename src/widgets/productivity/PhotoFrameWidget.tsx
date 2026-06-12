import { Image as ImageIcon, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  ImageIcon,
  RefreshCw,
};

interface PhotoFrameWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

const IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
];

export const PhotoFrameWidget: React.FC<PhotoFrameWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic } = useFeedback();

  const [index, setIndex] = useState(0);
  const [fadeAnim] = React.useState(() => new Animated.Value(1));

  const handleNext = React.useCallback(() => {
    if (!interactive) return;
    triggerHaptic('light');

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.1, duration: 200, useNativeDriver: true }),
      Animated.delay(50),
    ]).start(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  }, [interactive, triggerHaptic, fadeAnim]);

  useEffect(() => {
    if (!interactive) return;

    const interval = setInterval(() => {
      handleNext();
    }, 15000); // Cycle every 15s

    return () => clearInterval(interval);
  }, [interactive, index, handleNext]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.ImageIcon size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>PHOTO FRAME</Text>
        </View>
        {interactive && (
          <TouchableOpacity onPress={handleNext}>
            <LucideIcons.RefreshCw size={10} color={accentColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.frame}>
        <Animated.Image
          source={{ uri: IMAGES[index] }}
          style={[styles.image, { opacity: fadeAnim }]}
          resizeMode="cover"
        />
        <View style={styles.frameBorder} />
      </View>

      <Text style={[styles.footer, subtextStyle]}>
        SLIDESHOW CYCLING • FRAME {index + 1}/{IMAGES.length}
      </Text>
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
    marginBottom: 4,
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
  frame: {
    flex: 1,
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0a0a0c',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  frameBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  footer: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
