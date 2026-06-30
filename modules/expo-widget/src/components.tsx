import React, { useContext } from 'react';
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  Image as RNImage,
  StyleSheet,
  ViewProps,
  TextProps,
  PressableProps,
  ImageProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { WidgetLayoutContext, LayoutNode } from './context';

// Utility to flatten and filter layout styles
function extractStyles(style: StyleProp<any>): Record<string, string | number | undefined> {
  const flattened = StyleSheet.flatten(style) || {};
  const extracted: Record<string, string | number | undefined> = {};
  const allowedKeys = [
    'flexDirection', 'justifyContent', 'alignItems', 'flex', 'flexWrap',
    'backgroundColor', 'color', 'fontSize', 'fontWeight', 'fontStyle', 'fontFamily', 'letterSpacing',
    'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'paddingHorizontal', 'paddingVertical',
    'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'marginHorizontal', 'marginVertical',
    'width', 'height', 'borderRadius', 'borderWidth', 'borderColor', 'gap',
    'textAlign', 'opacity'
  ];

  for (const key of allowedKeys) {
    if (flattened[key] !== undefined && typeof flattened[key] !== 'object') {
      extracted[key] = flattened[key] as string | number;
    }
  }
  return extracted;
}

// Helper to flatten text of children recursively
function resolveTextChildren(children: React.ReactNode): string {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(resolveTextChildren).join('');
  }
  const reactElement = children as React.ReactElement<any>;
  if (reactElement && reactElement.props) {
    if (reactElement.props.children !== undefined) {
      return resolveTextChildren(reactElement.props.children);
    }
  }
  return '';
}

// 1. View Wrapper
interface CustomViewProps extends ViewProps {
  action?: string;
}

export const View: React.FC<CustomViewProps> = ({ children, style, action, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);
  
  const myNode: LayoutNode = {
    type: 'view',
    style: extractStyles(style),
    action: action,
    children: []
  };

  if (parentContext) {
    parentContext.addChild(myNode);
  }

  const childContextValue = {
    addChild: (node: LayoutNode) => {
      myNode.children = myNode.children || [];
      myNode.children.push(node);
    }
  };

  return (
    <WidgetLayoutContext.Provider value={childContextValue}>
      <RNView style={style} {...props}>
        {children}
      </RNView>
    </WidgetLayoutContext.Provider>
  );
};

// 2. Text Wrapper
export const Text: React.FC<TextProps> = ({ children, style, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);

  const textContent = resolveTextChildren(children);

  const myNode: LayoutNode = {
    type: 'text',
    style: extractStyles(style),
    text: textContent
  };

  if (parentContext) {
    parentContext.addChild(myNode);
  }

  return (
    <WidgetLayoutContext.Provider value={null}>
      <RNText style={style} {...props}>
        {children}
      </RNText>
    </WidgetLayoutContext.Provider>
  );
};

// 3. Pressable Wrapper
interface CustomPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  action?: string; // Serialized intent, route, or state action
  activeOpacity?: number;
  disabled?: boolean;
}

export const Pressable: React.FC<CustomPressableProps> = ({ children, style, action, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);

  const btnText = typeof children === 'function' ? '' : resolveTextChildren(children);

  // Dynamic action resolution during build-time compilation
  let resolvedAction = action;
  if (!resolvedAction && (globalThis as any).__WIDGET_COMPILING__) {
    const customs = (globalThis as any).__WIDGET_COMPILING_CUSTOMS__ || {};
    
    // 1. Check if the button has explicit text matching btnLeftText or btnRightText
    const cleanText = btnText.trim().toUpperCase();
    const leftText = (customs.btnLeftText || '').trim().toUpperCase();
    const rightText = (customs.btnRightText || '').trim().toUpperCase();
    
    if (cleanText && leftText && (cleanText === leftText || (leftText === 'START' && cleanText === 'PAUSE') || (leftText === 'PLAY' && cleanText === 'PAUSE') || (leftText === 'TOGGLE' && cleanText === 'ACTIVE'))) {
      resolvedAction = customs.btnLeftAction;
    } else if (cleanText && rightText && cleanText === rightText) {
      resolvedAction = customs.btnRightAction;
    }
    
    // 2. Check the onPress function signature name or string content as fallback
    if (!resolvedAction && props.onPress) {
      const fnStr = props.onPress.toString().toLowerCase();
      if (fnStr.includes('torch') || fnStr.includes('flashlight')) {
        resolvedAction = customs.btnLeftAction || customs.btnRightAction || 'toggle_torch';
      } else if (fnStr.includes('stopwatchreset') || fnStr.includes('resetstopwatch') || fnStr.includes('handlestopwatchreset')) {
        resolvedAction = 'reset_stopwatch';
      } else if (fnStr.includes('stopwatch') || fnStr.includes('handlestopwatch') || fnStr.includes('swactive')) {
        resolvedAction = 'toggle_stopwatch';
      } else if (fnStr.includes('reset_water') || fnStr.includes('resetwater') || fnStr.includes('handlereset')) {
        resolvedAction = 'reset_water';
      } else if (fnStr.includes('logwater') || fnStr.includes('addwater') || fnStr.includes('incrementwater')) {
        resolvedAction = 'add_water';
      } else if (fnStr.includes('cycletarget')) {
        resolvedAction = customs.btnRightAction || 'cycle_target';
      } else if (fnStr.includes('play') || fnStr.includes('pause')) {
        resolvedAction = customs.btnLeftAction || 'music_play';
      } else if (fnStr.includes('skip') || fnStr.includes('next')) {
        resolvedAction = customs.btnRightAction || 'music_skip';
      } else if (fnStr.includes('bluetooth') || fnStr.includes('togglebluetooth')) {
        resolvedAction = 'toggle_bluetooth';
      } else if (fnStr.includes('sound') || fnStr.includes('volume') || fnStr.includes('profile')) {
        resolvedAction = 'cycle_sound';
      } else if (fnStr.includes('pomodorostart') || fnStr.includes('pomodoropause') || fnStr.includes('pomodorotoggle') || fnStr.includes('toggletimer')) {
        resolvedAction = 'toggle_pomodoro';
      } else if (fnStr.includes('pomodoreset') || fnStr.includes('pomodororeset') || fnStr.includes('resettimer')) {
        resolvedAction = 'reset_pomodoro';
      }
    }
  }

  const myNode: LayoutNode = {
    type: 'button',
    style: extractStyles(style),
    action: resolvedAction || 'click',
    text: btnText
  };

  if (parentContext) {
    parentContext.addChild(myNode);
  }

  return (
    <WidgetLayoutContext.Provider value={null}>
      <RNPressable style={style} {...props}>
        {children}
      </RNPressable>
    </WidgetLayoutContext.Provider>
  );
};

// 4. Image Wrapper
interface CustomImageProps extends Omit<ImageProps, 'source'> {
  source?: any;
  imageName?: string;
}

export const Image: React.FC<CustomImageProps> = ({ style, imageName, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);

  if (parentContext) {
    parentContext.addChild({
      type: 'image',
      style: extractStyles(style),
      imageName: imageName || 'layout'
    });
  }

  // Fallback rendering in app
  return <RNImage style={style} {...props} />;
};

// 5. ProgressBar Wrapper
interface ProgressBarProps {
  style?: StyleProp<ViewStyle>;
  progress: number;
  max?: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ style, progress, max = 100, color }) => {
  const parentContext = useContext(WidgetLayoutContext);
  const flattenedStyle = extractStyles(style);

  if (parentContext) {
    parentContext.addChild({
      type: 'progress',
      style: { ...flattenedStyle, color },
      progressValue: progress,
      children: []
    });
  }

  // App representation
  const activeColor = color || '#ffffff';
  const progressPercent = Math.min(100, Math.max(0, (progress / max) * 100));

  return (
    <RNView style={[{ height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }, style]}>
      <RNView style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: activeColor }} />
    </RNView>
  );
};

// 6. TextClock Component
interface TextClockProps {
  style?: StyleProp<TextStyle>;
  format?: string;
}

export const TextClock: React.FC<TextClockProps> = ({ style, format = 'h:mm a' }) => {
  const parentContext = useContext(WidgetLayoutContext);
  const [time, setTime] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (parentContext) {
    parentContext.addChild({
      type: 'clock',
      style: extractStyles(style),
      clockFormat: format
    });
  }

  // Pad helper
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Basic formatter for React representation
  let hours = time.getHours();
  const mins = pad(time.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  if (!format.includes('H') && !format.includes('k')) {
    hours = hours % 12 || 12;
  }

  const timeString = format.includes('a') 
    ? `${hours}:${mins} ${ampm}` 
    : `${pad(hours)}:${mins}`;

  return <RNText style={style}>{timeString}</RNText>;
};

// 7. Chronometer Component
interface ChronometerProps {
  style?: StyleProp<TextStyle>;
}

export const Chronometer: React.FC<ChronometerProps> = ({ style }) => {
  const parentContext = useContext(WidgetLayoutContext);

  if (parentContext) {
    parentContext.addChild({
      type: 'chronometer',
      style: extractStyles(style)
    });
  }

  return <RNText style={style}>00:00.0</RNText>;
};

export const TouchableOpacity = Pressable;
export const TouchableWithoutFeedback = Pressable;
export const TouchableHighlight = Pressable;

import { ScrollViewProps } from 'react-native';
export const ScrollView: React.FC<ScrollViewProps> = ({ children, style, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);

  const myNode: LayoutNode = {
    type: 'view',
    style: extractStyles(style),
    children: []
  };

  if (parentContext) {
    parentContext.addChild(myNode);
  }

  const childContextValue = {
    addChild: (node: LayoutNode) => {
      myNode.children = myNode.children || [];
      myNode.children.push(node);
    }
  };

  return (
    <WidgetLayoutContext.Provider value={childContextValue}>
      <RNView style={style} {...props}>
        {children}
      </RNView>
    </WidgetLayoutContext.Provider>
  );
};

export const SafeAreaView = View;

import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native';
export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ style, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);

  if (parentContext) {
    parentContext.addChild({
      type: 'text',
      style: extractStyles(style),
      text: '...'
    });
  }

  return <RNActivityIndicator style={style} {...props} />;
};

import { TextInput as RNTextInput, TextInputProps } from 'react-native';
export const TextInput: React.FC<TextInputProps> = ({ style, placeholder, value, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);

  if (parentContext) {
    parentContext.addChild({
      type: 'text',
      style: extractStyles(style),
      text: value || placeholder || 'Type...'
    });
  }

  return <RNTextInput style={style} value={value} placeholder={placeholder} {...props} />;
};

import { Animated as RNAnimated } from 'react-native';
export const Animated = {
  ...RNAnimated,
  View: View,
  Text: Text,
  Image: Image
};

export namespace Animated {
  export type Value = RNAnimated.Value;
  export type CompositeAnimation = RNAnimated.CompositeAnimation;
}
