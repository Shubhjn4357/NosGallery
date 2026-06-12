import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore } from '../../store/widgetStore';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
};

interface MusicWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

const TRACKS = [
  { title: 'Nothing Beat', artist: 'London Studio', duration: 152, cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60' },
  { title: 'Antigravity Chill', artist: 'DeepMind', duration: 184, cover: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=60' },
  { title: 'Glyph Ambient', artist: 'Nothing OS', duration: 210, cover: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=120&auto=format&fit=crop&q=60' },
];

export const MusicWidget: React.FC<MusicWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { musicPlaying, setMusicPlaying, currentTrackIndex, setCurrentTrackIndex } = useWidgetStore();
  const { triggerHaptic } = useFeedback();
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const [elapsed, setElapsed] = useState(38);
  const track = TRACKS[currentTrackIndex] || TRACKS[0];

  useEffect(() => {
    if (!musicPlaying || !interactive) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= track.duration) {
          // Loop or skip
          handleSkipForward();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [musicPlaying, currentTrackIndex, interactive]);

  const handlePlayPause = () => {
    if (!interactive) return;
    triggerHaptic('light');
    setMusicPlaying(!musicPlaying);
  };

  const handleSkipForward = () => {
    if (!interactive) return;
    triggerHaptic('selection');
    setElapsed(0);
    setCurrentTrackIndex((currentTrackIndex + 1) % TRACKS.length);
  };

  const handleSkipBack = () => {
    if (!interactive) return;
    triggerHaptic('selection');
    setElapsed(0);
    setCurrentTrackIndex(currentTrackIndex === 0 ? TRACKS.length - 1 : currentTrackIndex - 1);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLight = textStyle.color === '#000000';
  const trackBg = isLight ? '#efeff4' : '#1c1c1e';
  const progressPct = (elapsed / track.duration) * 100;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Music size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>NOW PLAYING</Text>
        </View>
        <Text style={[styles.codec, subtextStyle]}>LDAC 990KBPS</Text>
      </View>

      {/* Media Details Row */}
      <View style={styles.mediaRow}>
        <Image source={{ uri: track.cover }} style={styles.cover} />
        <View style={styles.trackDetails}>
          <Text style={[styles.trackName, textStyle]} numberOfLines={1}>
            {track.title.toUpperCase()}
          </Text>
          <Text style={[styles.artist, subtextStyle]} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>
      </View>

      {/* Progress Slider */}
      <View style={styles.progressSection}>
        <View style={[styles.sliderTrack, { backgroundColor: trackBg }]}>
          <View style={[styles.sliderFill, { width: `${progressPct}%`, backgroundColor: accentColor }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={[styles.timeTxt, subtextStyle]}>{formatTime(elapsed)}</Text>
          <Text style={[styles.timeTxt, subtextStyle]}>{formatTime(track.duration)}</Text>
        </View>
      </View>

      {/* Interactive Controls */}
      {interactive && (
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={handleSkipBack} style={styles.btn}>
            <LucideIcons.SkipBack size={14} color={textStyle.color} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={[styles.playBtn, { backgroundColor: accentColor }]}
          >
            {musicPlaying ? (
              <LucideIcons.Pause size={14} color="#000000" />
            ) : (
              <LucideIcons.Play size={14} color="#000000" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkipForward} style={styles.btn}>
            <LucideIcons.SkipForward size={14} color={textStyle.color} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  codec: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  cover: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  trackDetails: {
    flex: 1,
    gap: 1,
  },
  trackName: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
  artist: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  progressSection: {
    marginVertical: 2,
  },
  sliderTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  timeTxt: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120, 120, 120, 0.06)',
  },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
