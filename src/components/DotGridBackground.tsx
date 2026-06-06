import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';

export const DotGridBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="dot-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <Circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.08)" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dot-grid)" />
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
