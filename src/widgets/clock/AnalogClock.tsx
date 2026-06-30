import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface AnalogClockProps {
  currentTime: Date;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  currentTime,
  customizations,
  globalTheme,
}) => {
  const { themeConfig, accentColor } = useWidgetStyle(customizations, globalTheme);

  const angleHr = ((currentTime.getHours() % 12) * 30) + (currentTime.getMinutes() * 0.5);
  const angleMin = currentTime.getMinutes() * 6;
  const angleSec = currentTime.getSeconds() * 6;

  const isLuxury = customizations.titleText?.toLowerCase().includes('luxury') || customizations.titleText?.toLowerCase().includes('gold');
  const isSwiss = customizations.titleText?.toLowerCase().includes('swiss') || customizations.titleText?.toLowerCase().includes('classic');

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.clockFace, 
          { 
            borderColor: isLuxury ? '#dfba6b' : accentColor,
            backgroundColor: isLuxury ? '#0a0a0a' : 'transparent',
            borderWidth: isSwiss ? 2.5 : 1.5
          }
        ]}
      >
        {/*瑞士刻度 Swiss markers */}
        {isSwiss && (
          <View style={styles.swissMarkers}>
            <View style={[styles.marker, { transform: [{ rotate: '0deg' }] }]} />
            <View style={[styles.marker, { transform: [{ rotate: '90deg' }] }]} />
          </View>
        )}

        {/* Hands */}
        <View style={[styles.handContainer, { height: 28, transform: [{ rotate: `${angleHr}deg` }] }]}>
          <View style={[styles.handVisible, { height: 14, width: 3, backgroundColor: isLuxury ? '#dfba6b' : themeConfig.textColor }]} />
        </View>
        <View style={[styles.handContainer, { height: 40, transform: [{ rotate: `${angleMin}deg` }] }]}>
          <View style={[styles.handVisible, { height: 20, width: 2, backgroundColor: isLuxury ? '#dfba6b' : themeConfig.textColor }]} />
        </View>
        <View style={[styles.handContainer, { height: 46, transform: [{ rotate: `${angleSec}deg` }] }]}>
          <View style={[styles.handVisible, { height: 23, width: 1, backgroundColor: isLuxury ? '#dfba6b' : accentColor }]} />
        </View>
        <View style={[styles.centerPoint, { backgroundColor: isLuxury ? '#dfba6b' : accentColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockFace: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swissMarkers: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  marker: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#fff',
  },
  handContainer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  handVisible: {
    borderRadius: 1,
  },
  centerPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
});
