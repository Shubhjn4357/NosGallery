import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Filter, FeGaussianBlur } from 'react-native-svg';

export const LiquidGlassBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0B1C22" />
            <Stop offset="50%" stopColor="#050C0E" />
            <Stop offset="100%" stopColor="#020405" />
          </LinearGradient>
          <Filter id="blur-filter">
            <FeGaussianBlur stdDeviation="60" />
          </Filter>
        </Defs>
        {/* Base Gradient */}
        <Rect width="100%" height="100%" fill="url(#bg-grad)" />
        
        {/* Ambient Teal Fluid Blob 1 */}
        <Circle cx="10%" cy="30%" r="140" fill="#00c8ff" opacity={0.16} filter="url(#blur-filter)" />
        
        {/* Ambient Purple Fluid Blob 2 */}
        <Circle cx="90%" cy="70%" r="160" fill="#7d00ff" opacity={0.12} filter="url(#blur-filter)" />
        
        {/* Ambient Cyan Fluid Blob 3 */}
        <Circle cx="50%" cy="90%" r="130" fill="#00ffb7" opacity={0.14} filter="url(#blur-filter)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
    pointerEvents: 'none',
  },
});
