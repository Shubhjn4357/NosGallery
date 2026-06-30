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

// 1. View Wrapper
export const View: React.FC<ViewProps> = ({ children, style, ...props }) => {
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

// 2. Text Wrapper
export const Text: React.FC<TextProps> = ({ children, style, ...props }) => {
  const parentContext = useContext(WidgetLayoutContext);

  const textContent = typeof children === 'string' || typeof children === 'number'
    ? String(children)
    : '';

  const myNode: LayoutNode = {
    type: 'text',
    style: extractStyles(style),
    text: textContent
  };

  if (parentContext) {
    parentContext.addChild(myNode);
  }

  return (
    <RNText style={style} {...props}>
      {children}
    </RNText>
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

  const myNode: LayoutNode = {
    type: 'button',
    style: extractStyles(style),
    action: action || 'click',
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
