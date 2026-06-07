import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer } from 'expo-audio';
import { useWidgetStore } from '../store/widgetStore';

export const useFeedback = () => {
  const { settings } = useWidgetStore();

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
        console.log(`[Haptic Fallback] ${type}`);
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
            // Fast sharp tap
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';
            break;
          case 'apply':
            // High slide chime
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav';
            break;
          case 'success':
            // Upward notes
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2018/2018-84.wav';
            break;
          case 'error':
            // Low buzz
            soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2573/2573-84.wav';
            break;
        }

        if (soundUrl) {
          const player = createAudioPlayer(soundUrl);
          player.play();
          setTimeout(() => {
            try {
              player.release();
            } catch (err) {
              console.log('[Audio release failed]:', err);
            }
          }, 3000);
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
