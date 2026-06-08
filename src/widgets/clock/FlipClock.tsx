import { Check } from 'lucide-react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LucideIcons = {
  Check,
};

interface FlipClockProps {
  currentTime: Date;
  customizations: WidgetCustomizations;
  globalTheme: string;
}

export const FlipClock: React.FC<FlipClockProps> = ({
  currentTime,
  customizations,
  globalTheme,
}) => {
  const title = customizations.titleText || 'THU 08 BOOKINGS';
  const lowercaseTitle = title.toLowerCase();

  const isLight = customizations.backgroundColor === '#ffffff';
  const themeTextColor = isLight ? '#000000' : '#ffffff';
  const themeSubtextColor = isLight ? '#888888' : '#777777';
  const boxBg = isLight ? '#f2f2f7' : '#1c1c1e';
  const boxBorderColor = isLight ? '#e5e5ea' : '#2a2a2c';

  // Handle countdown view (Image 2 bottom card)
  const isCountdownView = lowercaseTitle.includes('nov') || lowercaseTitle.includes('day') || lowercaseTitle.includes('count') || lowercaseTitle.includes('time');

  if (isCountdownView) {
    return (
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.countdownHeaderRow}>
          <View>
            <Text style={[styles.mainDateText, { color: themeTextColor }]}>{title}</Text>
            <Text style={[styles.dateSubText, { color: themeSubtextColor }]}>First bookable day</Text>
          </View>
          
          {/* Flip countdown panels */}
          <View style={styles.countdownGrid}>
            {[
              { val: '12', label: 'days' },
              { val: '21', label: 'hrs' },
              { val: '32', label: 'mins' },
              { val: '45', label: 'secs' },
            ].map((item, idx) => (
              <View key={idx} style={styles.countdownCol}>
                <View style={[styles.miniFlipCard, { backgroundColor: boxBg, borderColor: boxBorderColor }]}>
                  <Text style={[styles.miniFlipText, { color: themeTextColor }]}>{item.val}</Text>
                  <View style={styles.flipDivider} />
                </View>
                <Text style={[styles.miniFlipLabel, { color: themeSubtextColor }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Timeline progress checkpoints */}
        <View style={styles.timelineContainer}>
          <View style={[styles.timelineLineBg, { backgroundColor: isLight ? '#e5e5ea' : '#222' }]} />
          <View style={[styles.timelineLineFill, { width: '80%', backgroundColor: '#34c759' }]} />
          
          <View style={styles.checkpointsRow}>
            {[0, 1, 2, 3].map((step) => (
              <View key={step} style={[styles.checkpointCircle, { backgroundColor: '#34c759' }]}>
                <LucideIcons.Check size={8} color="#ffffff" strokeWidth={4} />
              </View>
            ))}
            <View style={[styles.checkpointCircle, { backgroundColor: '#1c1c1e', borderColor: '#ffd60a', borderWidth: 1 }]}>
              <View style={[styles.checkpointInnerCircle, { backgroundColor: '#ffd60a' }]} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Otherwise, render Scheduler/Therapists stats (Image 2 top card)
  return (
    <View style={styles.container}>
      <View style={styles.schedulerHeader}>
        {/* Left metrics */}
        <View>
          <Text style={[styles.scheduleSubTitle, { color: themeSubtextColor }]}>4 Therapists</Text>
          <View style={styles.avatarRow}>
            {['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=60'
            ].map((uri, idx) => (
              <View key={idx} style={[styles.avatarBorder, { marginLeft: idx > 0 ? -6 : 0 }]}>
                <Text style={{ fontSize: 9, color: themeTextColor }}>👤</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Center THU 08 Flip Card */}
        <View style={styles.flipClockWrapper}>
          <View style={[styles.mediumFlipCard, { backgroundColor: boxBg, borderColor: boxBorderColor }]}>
            <Text style={[styles.mediumFlipText, { color: themeTextColor }]}>THU</Text>
            <View style={styles.flipDivider} />
          </View>
          <View style={[styles.mediumFlipCard, { backgroundColor: boxBg, borderColor: boxBorderColor }]}>
            <Text style={[styles.mediumFlipText, { color: themeTextColor }]}>08</Text>
            <View style={styles.flipDivider} />
          </View>
        </View>

        {/* Right metrics */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.scheduleSubTitle, { color: themeSubtextColor }]}>8 Bookings</Text>
          <Text style={[styles.scheduleTimeText, { color: themeTextColor }]}>4hrs 30min</Text>
        </View>
      </View>

      {/* Earnings slider display */}
      <View style={styles.sliderPanel}>
        <View style={[styles.sliderTrack, { backgroundColor: isLight ? '#e5e5ea' : '#1c1c1e' }]}>
          <View style={[styles.sliderFill, { width: '22%', backgroundColor: '#34c759' }]} />
          <View style={styles.sliderReadoutRow}>
            <Text style={styles.sliderReadoutVal}>£201.00</Text>
            <Text style={[styles.sliderReadoutGoal, { color: themeSubtextColor }]}>£1,250.00</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  // Countdown styles (Image 2 bottom card)
  countdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  mainDateText: {
    fontSize: 13,
    fontWeight: '800',
  },
  dateSubText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    marginTop: 1,
  },
  countdownGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  countdownCol: {
    alignItems: 'center',
  },
  miniFlipCard: {
    width: 25,
    height: 25,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  miniFlipText: {
    fontSize: 11,
    fontWeight: '900',
  },
  miniFlipLabel: {
    fontSize: 6.5,
    fontWeight: 'bold',
    marginTop: 2,
  },
  flipDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    top: '48%',
  },
  timelineContainer: {
    height: 16,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 12,
  },
  timelineLineBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  timelineLineFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  checkpointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  checkpointCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkpointInnerCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Scheduler styles (Image 2 top card)
  schedulerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  scheduleSubTitle: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  avatarRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  avatarBorder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  flipClockWrapper: {
    flexDirection: 'row',
    gap: 3,
  },
  mediumFlipCard: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mediumFlipText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scheduleTimeText: {
    fontSize: 10.5,
    fontWeight: '900',
    marginTop: 4,
  },
  sliderPanel: {
    marginTop: 10,
  },
  sliderTrack: {
    height: 24,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  sliderReadoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  sliderReadoutVal: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  sliderReadoutGoal: {
    fontSize: 9,
    fontWeight: '900',
  },
});
