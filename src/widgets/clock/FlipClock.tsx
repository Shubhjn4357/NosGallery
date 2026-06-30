// @widget clock_flip
import React, { useState } from 'react';
import { StyleSheet, ColorValue } from 'react-native';
import { View, Text } from '../../../modules/expo-widget/src';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface FlipClockProps {
  currentTime: Date;
  globalTheme: ThemeId;
  customizations?: any;
}

// ── 3D FLIP DIGIT COMPONENT ──
const FlipDigit: React.FC<{ value: string; isLight: boolean; accentColor: ColorValue; textColor: ColorValue }> = ({
  value,
  isLight,
  accentColor,
  textColor,
}) => {
  const [prevVal, setPrevVal] = useState(value);
  const [currentVal, setCurrentVal] = useState(value);
  const rotation = useSharedValue(0);

  const cardBg = isLight ? '#e5e5ea' : '#1c1c1e';
  const dividerColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  if (value !== currentVal) {
    setPrevVal(currentVal);
    setCurrentVal(value);
    rotation.value = 0;
    rotation.value = withTiming(180, { duration: 400 });
  }

  const topAnimatedStyle = useAnimatedStyle(() => {
    const rotate = rotation.value;
    return {
      transform: [
        { perspective: 400 },
        { rotateX: `${rotate <= 90 ? 0 : -rotate + 180}deg` },
      ],
      zIndex: rotate <= 90 ? 3 : 1,
    };
  });

  const bottomAnimatedStyle = useAnimatedStyle(() => {
    const rotate = rotation.value;
    return {
      transform: [
        { perspective: 400 },
        { rotateX: `${rotate <= 90 ? rotate : 0}deg` },
      ],
      zIndex: rotate <= 90 ? 1 : 3,
    };
  });

  return (
    <View style={[styles.digitContainer, { backgroundColor: cardBg }]}>
      {/* Background Static Cards */}
      <View style={styles.staticHalf}>
        <Text style={[styles.digitText, { color: textColor }]}>{currentVal}</Text>
      </View>

      {/* Flipping Top Card (Flaps Down) */}
      <Animated.View style={[styles.flapHalf, topAnimatedStyle, { backgroundColor: cardBg, borderBottomWidth: 0.5, borderBottomColor: dividerColor }]}>
        <Text style={[styles.digitText, { color: textColor }]}>{prevVal}</Text>
      </Animated.View>

      {/* Flipping Bottom Card (Reveals New Value) */}
      <Animated.View style={[styles.flapHalf, styles.bottomFlap, bottomAnimatedStyle, { backgroundColor: cardBg, borderTopWidth: 0.5, borderTopColor: dividerColor }]}>
        <Text style={[styles.digitText, { color: textColor }]}>{currentVal}</Text>
      </Animated.View>

      {/* Middle horizontal split line */}
      <View style={[styles.splitLine, { backgroundColor: dividerColor }]} />
    </View>
  );
};

export const FlipClock: React.FC<FlipClockProps> = ({
  currentTime,
  globalTheme,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  const isLight = textStyle.color === '#000000';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>SPLIT FLAP CLOCK</Text>
        <Text style={[styles.timeSecTxt, { color: accentColor }]}>:{seconds}</Text>
      </View>

      {/* Flip digit panels side by side */}
      <View style={styles.clockRow}>
        <FlipDigit value={hours[0]} isLight={isLight} accentColor={accentColor} textColor={textStyle.color || '#fff'} />
        <FlipDigit value={hours[1]} isLight={isLight} accentColor={accentColor} textColor={textStyle.color || '#fff'} />
        
        <View style={styles.colon}>
          <Text style={[styles.colonText, { color: accentColor }]}>:</Text>
        </View>

        <FlipDigit value={minutes[0]} isLight={isLight} accentColor={accentColor} textColor={textStyle.color || '#fff'} />
        <FlipDigit value={minutes[1]} isLight={isLight} accentColor={accentColor} textColor={textStyle.color || '#fff'} />
      </View>

      <Text style={[styles.footer, subtextStyle]}>
        NOS • REALTIME ENGINE
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
  title: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  timeSecTxt: {
    fontSize: 8.5,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginVertical: 4,
  },
  digitContainer: {
    width: 38,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
  },
  staticHalf: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flapHalf: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '50%',
    overflow: 'hidden',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  bottomFlap: {
    bottom: 0,
    justifyContent: 'flex-end',
  },
  digitText: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 48,
    fontFamily: 'monospace',
  },
  splitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '49%',
    height: 1.5,
    zIndex: 5,
  },
  colon: {
    width: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colonText: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  footer: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
