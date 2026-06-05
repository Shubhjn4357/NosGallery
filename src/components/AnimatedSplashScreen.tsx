import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationEnd: () => void;
}

export function AnimatedSplashScreen({ onAnimationEnd }: AnimatedSplashScreenProps) {
  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textSlide = useSharedValue(30);
  const screenOpacity = useSharedValue(1);
  const screenScale = useSharedValue(1);

  useEffect(() => {
    // 1. Background fades in
    bgOpacity.value = withTiming(1, { duration: 800 });

    // 2. Logo zooms and fades in with spring
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(
      300,
      withSpring(1, {
        damping: 12,
        stiffness: 90,
      })
    );
    logoRotate.value = withDelay(
      300,
      withSpring(1, {
        damping: 15,
        stiffness: 60,
      })
    );

    // 3. Text slides up and fades in
    textOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    textSlide.value = withDelay(800, withSpring(0, { damping: 12 }));

    // 4. Whole screen fades out and transitions after 2.5s
    const timeout = setTimeout(() => {
      screenScale.value = withTiming(0.96, { duration: 600 });
      screenOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationEnd)();
        }
      });
    }, 2400);

    return () => clearTimeout(timeout);
  }, []);

  const animatedBgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value * 360}deg` }
    ],
    opacity: logoOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textSlide.value }],
  }));

  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedScreenStyle]}>
      {/* Vibrant Full-screen Background */}
      <Animated.Image
        source={require('../../assets/images/splash_vibrant.png')}
        style={[styles.backgroundImage, animatedBgStyle]}
        resizeMode="cover"
      />
      
      {/* Dark overlay to make neon colors pop */}
      <View style={styles.overlay} />

      <View style={styles.content}>
        {/* Glowing Logo */}
        <View style={styles.logoContainer}>
          <Animated.Image
            source={require('../../assets/images/logo_vibrant.png')}
            style={[styles.logo, animatedLogoStyle]}
            resizeMode="contain"
          />
        </View>

        {/* Animated Brand Title */}
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={styles.brandTitle}>NOS GALLERY</Text>
          <Text style={styles.brandSubtitle}>AI-Native Widget Studio</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#080111',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 1, 17, 0.4)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff007f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 6,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  brandSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
});
