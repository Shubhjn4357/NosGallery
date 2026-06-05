import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface CicdPipelineProps {
  buildStatus: 'idle' | 'building' | 'testing' | 'success' | 'failed';
  buildProgress: number;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
  triggerCICDBuild: () => void;
}

export const CicdPipeline: React.FC<CicdPipelineProps> = ({
  buildStatus,
  buildProgress,
  customizations,
  globalTheme,
  interactive,
  triggerCICDBuild,
}) => {
  const { textStyle, subtextStyle, accentColor, successColor, errorColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'FLIGHT TRACKER';
  const isLight = customizations.backgroundColor === '#ffffff';
  
  const startCity = "San Francisco";
  const startCode = "SFO";
  const destCity = "Edmonton";
  const destCode = "YEG";

  // Map buildStatus to flight labels
  let flightStatusText = 'Scheduled';
  let statusColor = accentColor;
  let progressPct = buildProgress;

  if (buildStatus === 'building') {
    flightStatusText = `In flight • ${progressPct}%`;
    statusColor = '#00f0ff'; // Cyan
  } else if (buildStatus === 'testing') {
    flightStatusText = `Arriving shortly • ${progressPct}%`;
    statusColor = '#ffd60a'; // Yellow
  } else if (buildStatus === 'success') {
    flightStatusText = 'Arrived';
    statusColor = successColor;
    progressPct = 100;
  } else if (buildStatus === 'failed') {
    flightStatusText = 'Delayed / Cancelled';
    statusColor = errorColor;
    progressPct = 0;
  } else {
    progressPct = 0;
  }

  return (
    <View style={styles.container}>
      {/* Top Labels Row */}
      <View style={styles.labelsRow}>
        <Text style={[styles.cityText, subtextStyle]}>{startCity}</Text>
        <Text style={[styles.cityText, subtextStyle, { textAlign: 'right' }]}>{destCity}</Text>
      </View>

      {/* Airport Codes and Plane Timeline */}
      <View style={styles.flightProgressRow}>
        <Text style={[styles.airportCode, textStyle]}>{startCode}</Text>
        
        <View style={styles.timelineTrack}>
          {/* Background Track Line */}
          <View style={[styles.trackBg, { backgroundColor: isLight ? '#e5e5ea' : '#222' }]} />
          {/* Filled Flight Progress */}
          <View style={[styles.trackFill, { width: `${progressPct}%`, backgroundColor: statusColor }]} />
          
          {/* Flying Plane Icon */}
          <View style={[styles.planeWrapper, { left: `${Math.min(92, Math.max(0, progressPct - 4))}%` }]}>
            <View style={{ transform: [{ rotate: '90deg' }] }}>
              <LucideIcons.Plane size={14} color={statusColor} fill={statusColor} />
            </View>
          </View>
        </View>

        <Text style={[styles.airportCode, textStyle, { textAlign: 'right' }]}>{destCode}</Text>
      </View>

      {/* Bottom Status / ETA and Times */}
      <View style={styles.bottomStatusRow}>
        <Text style={[styles.timeLabel, subtextStyle]}>9:59 PM</Text>
        
        <TouchableOpacity 
          activeOpacity={0.8}
          disabled={!interactive || buildStatus === 'building' || buildStatus === 'testing'}
          onPress={triggerCICDBuild}
          style={[styles.statusBadge, { backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)' }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>{flightStatusText}</Text>
        </TouchableOpacity>

        <Text style={[styles.timeLabel, subtextStyle, { textAlign: 'right' }]}>12:59 AM</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.6,
  },
  flightProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  airportCode: {
    fontSize: 18,
    fontWeight: '900',
    width: 50,
  },
  timelineTrack: {
    flex: 1,
    height: 16,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 8,
  },
  trackBg: {
    height: 2.5,
    borderRadius: 1.5,
    width: '100%',
  },
  trackFill: {
    height: 2.5,
    borderRadius: 1.5,
    position: 'absolute',
    left: 0,
  },
  planeWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: -2.5, // Center plane over line
  },
  bottomStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
    opacity: 0.7,
    width: 60,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

