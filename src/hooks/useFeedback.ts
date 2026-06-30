import { useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useWidgetStore } from '../store/widgetStore';

export const useFeedback = () => {
  const { settings } = useWidgetStore();

  // Keep a ref to the last created player so we can release it before creating a new one,
  // preventing memory buildup from rapid successive sounds.
  const activePlayerRef = useRef<AudioPlayer | null>(null);

  const triggerHaptic = useCallback(
    async (type: 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
      if (!settings.hapticsEnabled) return;
      try {
        switch (type) {
          case 'selection':
            await Haptics.selectionAsync();
            break;
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch {
        // Fallback for environments without haptics (web/simulators)
      }
    },
    [settings.hapticsEnabled]
  );

  const triggerSound = useCallback(
    async (soundType: 'click' | 'apply' | 'success' | 'error') => {
      if (!settings.soundEnabled) return;
      try {
        let soundUrl = '';
        switch (soundType) {
          case 'click':
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';
            break;
          case 'apply':
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav';
            break;
          case 'success':
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav';
            break;
          case 'error':
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2573/2573-84.wav';
            break;
        }

        if (soundUrl) {
          // Release the previous player before creating a new one
          if (activePlayerRef.current) {
            try {
              activePlayerRef.current.release();
            } catch (_) {}
            activePlayerRef.current = null;
          }

          const player = createAudioPlayer(soundUrl);
          activePlayerRef.current = player;
          player.play();

          // Schedule cleanup after the sound has had time to finish
          setTimeout(() => {
            try {
              if (activePlayerRef.current === player) {
                player.release();
                activePlayerRef.current = null;
              }
            } catch (_) {}
          }, 4000);
        }
      } catch (err) {
        console.log(`[Sound Fallback] ${soundType} playback failed:`, err);
      }
    },
    [settings.soundEnabled]
  );

  return { triggerHaptic, triggerSound };
};
export type FeedbackType = ReturnType<typeof useFeedback>;
