import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, PanResponderInstance, Platform } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

const THUMB_SIZE = 44;
const PADDING = 3;

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
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [pan] = useState(() => new Animated.Value(0));
  const [success, setSuccess] = useState(false);

  const range = layoutWidth ? (layoutWidth - THUMB_SIZE - (PADDING * 2)) : 0;
  const rangeRef = useRef(0);
  
  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  const successRef = useRef(success);
  useEffect(() => {
    successRef.current = success;
  }, [success]);

  const onSwipeSuccessRef = useRef(onSwipeSuccess);
  useEffect(() => {
    onSwipeSuccessRef.current = onSwipeSuccess;
  }, [onSwipeSuccess]);

  const [panResponder, setPanResponder] = useState<PanResponderInstance | null>(null);

  useEffect(() => {
    setPanResponder(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !successRef.current,
        onMoveShouldSetPanResponder: () => !successRef.current,
        onPanResponderMove: (e, gestureState) => {
          const currentRange = rangeRef.current;
          if (currentRange <= 0) return;
          let newX = gestureState.dx;
          if (newX < 0) newX = 0;
          if (newX > currentRange) newX = currentRange;
          pan.setValue(newX);
        },
        onPanResponderRelease: (e, gestureState) => {
          if (successRef.current) return;
          const currentRange = rangeRef.current;
          if (currentRange <= 0) {
            // Spring back
            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            return;
          }

          // Activation threshold at 80% of slide range
          if (gestureState.dx >= currentRange * 0.8) {
            setSuccess(true);
            Animated.spring(pan, {
              toValue: currentRange,
              useNativeDriver: true,
              friction: 7,
            }).start(() => {
              onSwipeSuccessRef.current();
              // Reset after delay to allow re-swipe later
              setTimeout(() => {
                Animated.timing(pan, {
                  toValue: 0,
                  duration: 250,
                  useNativeDriver: true,
                }).start(() => setSuccess(false));
              }, 1800);
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
    );
  }, [pan]);

  // Text fade opacity based on thumb position
  const textOpacity = pan.interpolate({
    inputRange: [0, Math.max(range * 0.6, 1)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Background glow line expansion
  const glowWidth = pan.interpolate({
    inputRange: [0, Math.max(range, 1)],
    outputRange: [THUMB_SIZE + PADDING * 2, layoutWidth || 100],
    extrapolate: 'clamp',
  });

  return (
    <View 
      style={styles.track}
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        setLayoutWidth(width);
      }}
    >
      {/* Background Track Fill Indicator */}
      <Animated.View
        style={[
          styles.trackGlow,
          {
            width: glowWidth,
            backgroundColor: success ? '#ff2d2d' : '#ffffff',
            opacity: success ? 0.95 : 0.12,
          },
        ]}
      />

      {/* Swipe Text Instruction */}
      <Animated.Text style={[styles.trackText, { opacity: textOpacity }]}>
        {success ? successTitle.toUpperCase() : title.toUpperCase()}
      </Animated.Text>

      {/* Sliding Thumb Handle */}
      <Animated.View
        {...(panResponder ? panResponder.panHandlers : {})}
        style={[
          styles.thumb,
          {
            transform: [{ translateX: pan }],
            backgroundColor: success ? '#ff2d2d' : '#ffffff',
          },
        ]}
      >
        {success ? (
          <LucideIcons.Check size={18} color="#ffffff" strokeWidth={3} />
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
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
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
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
    }),
  },
});
