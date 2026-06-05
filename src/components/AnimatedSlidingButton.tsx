import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

const BUTTON_WIDTH = Dimensions.get('window').width - 40; // Full drawer width padding (20px each side)
const THUMB_SIZE = 44;
const PADDING = 3;
const SLIDE_RANGE = BUTTON_WIDTH - THUMB_SIZE - (PADDING * 2);

interface AnimatedSlidingButtonProps {
  onSwipeSuccess: () => void;
  title?: string;
  successTitle?: string;
  accentColor?: string;
}

export const AnimatedSlidingButton: React.FC<AnimatedSlidingButtonProps> = ({
  onSwipeSuccess,
  title = 'Slide to Pin Widget',
  successTitle = 'Added to Home Screen',
  accentColor = '#7C9EFF',
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [success, setSuccess] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !success,
      onMoveShouldSetPanResponder: () => !success,
      onPanResponderMove: (e, gestureState) => {
        // Constrain movement between 0 and maximum slide range
        let newX = gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > SLIDE_RANGE) newX = SLIDE_RANGE;
        pan.setValue(newX);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (success) return;

        // Activation threshold at 85% of slide range
        if (gestureState.dx >= SLIDE_RANGE * 0.85) {
          // Success state
          setSuccess(true);
          Animated.spring(pan, {
            toValue: SLIDE_RANGE,
            useNativeDriver: true,
            friction: 7,
          }).start(() => {
            onSwipeSuccess();
            // Reset after delay to allow re-swipe later
            setTimeout(() => {
              Animated.timing(pan, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }).start(() => setSuccess(false));
            }, 1500);
          });
        } else {
          // Spring back to start
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  // Text fade opacity based on thumb position
  const textOpacity = pan.interpolate({
    inputRange: [0, SLIDE_RANGE * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Green/accent glow line expansion
  const glowWidth = pan.interpolate({
    inputRange: [0, SLIDE_RANGE],
    outputRange: [THUMB_SIZE, BUTTON_WIDTH],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.track}>
      {/* Background Track Fill Indicator */}
      <Animated.View
        style={[
          styles.trackGlow,
          {
            width: glowWidth,
            backgroundColor: success ? '#34c759' : accentColor,
            opacity: success ? 0.9 : 0.25,
          },
        ]}
      />

      {/* Swipe Text Instruction */}
      <Animated.Text style={[styles.trackText, { opacity: textOpacity }]}>
        {success ? successTitle.toUpperCase() : title.toUpperCase()}
      </Animated.Text>

      {/* Sliding Thumb Handle */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            transform: [{ translateX: pan }],
            backgroundColor: success ? '#34c759' : '#ffffff',
          },
        ]}
      >
        {success ? (
          <LucideIcons.Check size={18} color="#000000" strokeWidth={3} />
        ) : (
          <LucideIcons.ArrowRight size={18} color="#000000" strokeWidth={3} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: THUMB_SIZE + PADDING * 2,
    backgroundColor: '#161618',
    borderRadius: (THUMB_SIZE + PADDING * 2) / 2,
    borderWidth: 1.5,
    borderColor: '#242426',
    position: 'relative',
    justifyContent: 'center',
    padding: PADDING,
    overflow: 'hidden',
  },
  trackGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: (THUMB_SIZE + PADDING * 2) / 2,
  },
  trackText: {
    alignSelf: 'center',
    color: '#8e8e93',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1.5,
    zIndex: 10,
    pointerEvents: 'none',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
});
