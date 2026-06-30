import { AlertOctagon, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useWidgetStore } from '../store/widgetStore';

const LucideIcons = {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
};

const TOAST_TIMEOUT = 3000;

export const Sonner: React.FC = () => {
  const { toastMessage, toastType, hideToast } = useWidgetStore();
  const [slideAnim] = useState(() => new Animated.Value(100));
  const [opacityAnim] = useState(() => new Animated.Value(0));
  const [progressAnim] = useState(() => new Animated.Value(1));
  // Keep visible during exit animation so it can slide out before unmounting
  const [mounted, setMounted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
      setMounted(false);
    });
  }, [slideAnim, opacityAnim, hideToast]);

  useEffect(() => {
    if (toastMessage) {
      setMounted(true);
      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Reset progress
      progressAnim.setValue(1);

      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: TOAST_TIMEOUT,
          useNativeDriver: false,
        }),
      ]).start();

      // Autohide
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, TOAST_TIMEOUT);
    } else if (mounted) {
      // toastMessage cleared externally — play exit animation
      dismissToast();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toastMessage, slideAnim, opacityAnim, progressAnim, dismissToast]);

  if (!mounted && !toastMessage) return null;

  // Type configuration
  let bgColor = '#1c1c1e';
  let borderColor = '#2c2c2e';
  let accentColor = '#ffffff';
  let IconComponent = LucideIcons.Info;

  if (toastType === 'success') {
    bgColor = '#0c1f12';
    borderColor = '#183a22';
    accentColor = '#34c759';
    IconComponent = LucideIcons.CheckCircle2;
  } else if (toastType === 'error') {
    bgColor = '#220f10';
    borderColor = '#441d20';
    accentColor = '#ff2d55';
    IconComponent = LucideIcons.AlertOctagon;
  } else if (toastType === 'warning') {
    bgColor = '#261b0c';
    borderColor = '#4c3518';
    accentColor = '#ff9500';
    IconComponent = LucideIcons.AlertTriangle;
  }

  // Width interpolator for shrinking progress line
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toastCard, { backgroundColor: bgColor, borderColor }]}>
        <View style={styles.toastContent}>
          <IconComponent size={16} color={accentColor} style={styles.icon} />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
          <TouchableOpacity onPress={dismissToast} style={styles.closeBtn}>
            <LucideIcons.X size={12} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>
        {/* Animated shrinking timeline progress bar */}
        <Animated.View style={[styles.progressBar, { backgroundColor: accentColor, width: progressWidth }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    bottom: 84, // Sit above the floating tab bar
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toastCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
    elevation: 6,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: 2,
    marginLeft: 6,
  },
  progressBar: {
    height: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
