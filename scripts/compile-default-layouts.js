// Define global dev flag for Expo modules
globalThis.__DEV__ = true;
globalThis.__CONTEXT_STACK__ = [];

const Module = require('module');
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

// 1. Mock Node module resolution for react-native and native Expo/React Native modules
const mockReactNative = {
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => {
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.map(s => typeof s === 'object' ? s : {}));
      }
      return style || {};
    }
  },
  Platform: {
    OS: 'android',
    select: (obj) => obj.android || obj.default,
  },
  Animated: {
    Value: class {
      constructor(val) { this.val = val; }
      setValue(val) { this.val = val; }
      interpolate() { return this; }
    },
    timing: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
    parallel: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
    sequence: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
    loop: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
    spring: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
    decay: () => ({ start: (cb) => cb && cb({ finished: true }), stop: () => {} }),
    add: () => new mockReactNative.Animated.Value(0),
    multiply: () => new mockReactNative.Animated.Value(0),
    divide: () => new mockReactNative.Animated.Value(0),
    modulo: () => new mockReactNative.Animated.Value(0),
    diffClamp: () => new mockReactNative.Animated.Value(0),
    event: () => {},
    View: 'View',
    Text: 'Text',
    Image: 'Image',
  },
  ActivityIndicator: 'ActivityIndicator',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  ScrollView: 'ScrollView',
  Dimensions: {
    get: () => ({ width: 360, height: 640 }),
  },
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'react') {
    const originalReact = originalRequire.apply(this, arguments);
    const mockReact = {
      ...originalReact,
      useState: (initialValue) => [
        typeof initialValue === 'function' ? initialValue() : initialValue,
        () => {}
      ],
      useMemo: (factory) => factory(),
      useEffect: () => {},
      useLayoutEffect: () => {},
      useRef: (initialValue) => ({ current: initialValue }),
      useCallback: (callback) => callback,
      useContext: (contextType) => {
        const stack = globalThis.__CONTEXT_STACK__;
        return (stack && stack[stack.length - 1]) || null;
      },
      useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
      useTransition: () => [false, () => {}],
      useDeferredValue: (value) => value,
      useId: () => 'id',
      useImperativeHandle: () => {},
      useInsertionEffect: () => {},
      useDebugValue: () => {},
      __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
        ...originalReact.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
        ReactCurrentDispatcher: {
          current: {
            useMemo: (factory) => factory(),
            useState: (initialValue) => [
              typeof initialValue === 'function' ? initialValue() : initialValue,
              () => {}
            ],
            useEffect: () => {},
            useLayoutEffect: () => {},
            useRef: (initialValue) => ({ current: initialValue }),
            useCallback: (callback) => callback,
            useContext: (contextType) => {
              const stack = globalThis.__CONTEXT_STACK__;
              return (stack && stack[stack.length - 1]) || null;
            },
            useTransition: () => [false, () => {}],
            useDeferredValue: (value) => value,
            useId: () => 'id',
            useImperativeHandle: () => {},
            useInsertionEffect: () => {},
            useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
          }
        }
      },
      __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: {
        ...originalReact.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
        H: {
          useMemo: (factory) => factory(),
          useState: (initialValue) => [
            typeof initialValue === 'function' ? initialValue() : initialValue,
            () => {}
          ],
          useEffect: () => {},
          useLayoutEffect: () => {},
          useRef: (initialValue) => ({ current: initialValue }),
          useCallback: (callback) => callback,
          useContext: (contextType) => {
            const stack = globalThis.__CONTEXT_STACK__;
            return (stack && stack[stack.length - 1]) || null;
          },
          useTransition: () => [false, () => {}],
          useDeferredValue: (value) => value,
          useId: () => 'id',
          useImperativeHandle: () => {},
          useInsertionEffect: () => {},
          useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
        }
      }
    };
    return mockReact;
  }
  if (id === 'react-native') {
    return mockReactNative;
  }
  if (id === 'lucide-react-native') {
    return new Proxy({}, {
      get: (target, prop) => prop
    });
  }
  if (id.includes('async-storage')) {
    return {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }
  if (id === 'expo-symbols') {
    return new Proxy({}, {
      get: (target, prop) => prop
    });
  }
  if (id === 'expo-image') {
    return { Image: 'Image' };
  }
  if (id === 'expo') {
    return {
      NativeModule: class {},
      requireNativeModule: () => ({})
    };
  }
  if (id === 'expo-haptics') {
    return {
      notificationAsync: () => {},
      selectionAsync: () => {},
      impactAsync: () => {},
      NotificationFeedbackType: {},
      ImpactFeedbackStyle: {}
    };
  }
  if (id === 'expo-modules-core') {
    return {};
  }
  if (id === '@expo/ui') {
    return {};
  }
  if (id === 'expo-audio') {
    return {
      createAudioPlayer: () => ({
        play: () => {},
        release: () => {},
      }),
    };
  }
  if (id === 'expo-constants') {
    return {
      default: { expoConfig: {} },
      ExecutionEnvironment: {}
    };
  }
  if (id === 'react-native-reanimated') {
    return {
      default: {
        View: 'View',
        Text: 'Text',
        Image: 'Image',
      },
      useSharedValue: (val) => ({ value: val }),
      useAnimatedStyle: (cb) => cb() || {},
      withTiming: (val) => val,
      withSpring: (val) => val,
      withSequence: (...vals) => vals[0],
      withRepeat: (val) => val,
      withDelay: (delay, val) => val,
      runOnJS: (fn) => fn,
      runOnUI: (fn) => fn,
      interpolate: (val, input, output) => output[0],
      Extrapolation: { CLAMP: 'clamp' },
      cancelAnimation: () => {},
      Easing: {
        linear: (x) => x,
        ease: (x) => x,
        quad: (x) => x,
        cubic: (x) => x,
        bezier: () => ({ factory: () => (x) => x }),
        in: (f) => f,
        out: (f) => f,
        inOut: (f) => f,
      },
    };
  }
  if (id === 'react-native-svg') {
    const dummyComp = () => null;
    return new Proxy({}, {
      get: (target, prop) => {
        if (prop === 'default') return dummyComp;
        return dummyComp;
      }
    });
  }
  return originalRequire.apply(this, arguments);
};

// 2. Register Babel on-the-fly transpiler for .ts and .tsx files
require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const compiled = babel.transformSync(content, {
    filename,
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }]
    ]
  });
  module._compile(compiled.code, filename);
};

require.extensions['.tsx'] = require.extensions['.ts'];

// 3. Load compiler logic and compile the default layouts
const widgetsJson = require('../src/widgets/widgets.json');
const { compileWidgetToLayout } = require('../modules/expo-widget/src/layoutCompiler');

const projectRoot = path.resolve(__dirname, '..');
const targetAssetsDir = path.resolve(__dirname, '../modules/expo-widget/android/src/main/assets');

if (!fs.existsSync(targetAssetsDir)) {
  fs.mkdirSync(targetAssetsDir, { recursive: true });
}

// Complete mock state representing default values for all widgets
const mockState = {
  steps: 5420,
  calories: 280,
  distance: 3.8,
  waterIntake: 1200,
  waterGoal: 2000,
  torchEnabled: false,
  cpuUsage: 12,
  ramUsage: 45,
  batteryLevel: 85,
  pomodoroTime: '25:00',
  pomodoroState: 'idle',
  stopwatchTime: 0,
  stopwatchRunning: false,
  todoList: [
    { id: '1', text: 'Clean room', completed: false },
    { id: '2', text: 'Buy milk', completed: true }
  ],
  calendarEvents: [],
  weatherTemp: 24,
  weatherCondition: 'Sunny',
  weatherHigh: 28,
  weatherLow: 18,
  aqiValue: 42,
  aqiLabel: 'Good'
};

function generateDefaultWidgetsList() {
  const widgets = [];
  const registeredIds = new Set();

  widgetsJson.forEach((tw) => {
    if (registeredIds.has(tw.id)) return;
    registeredIds.add(tw.id);

    const w = tw.w;
    const h = tw.h;

    const customizations = Object.assign({
      fontId: 'inter',
      fontSize: w === 4 ? 20 : 14,
      backgroundType: 'solid',
      backgroundColor: '#0c0c0c',
      borderRadius: 16,
      transparency: 10,
      blur: 10,
      shadowType: 'soft',
      titleText: tw.defaultTitle || tw.name.toUpperCase(),
      valueText: tw.defaultValue || '--',
      subValueText: 'TAP TO OPEN',
      footerText: `NOS • ${tw.category.toUpperCase().replace('_', ' ')}`,
      accentColor: '#7C9EFF',
      themeOverride: 'none',
      showProgressBar: false,
      progressBarValue: 0,
      progressBarMax: 100,
      showActionButtons: false,
      btnLeftText: '',
      btnLeftAction: '',
      btnRightText: '',
      btnRightAction: '',
    }, tw.customizations || {});

    const widgetEntry = {
      id: tw.id,
      templateId: tw.id,
      x: 0,
      y: 0,
      w: w,
      h: h,
      preview: tw.preview,
      customizations: customizations,
    };

    if (tw.clickHandlers) {
      widgetEntry.clickHandlers = tw.clickHandlers;
    }

    // Pre-compile the JSX layout using the dynamic compiler
    try {
      console.log(`[Layout Compiler] Pre-compiling layout for: ${tw.id}`);
      const layout = compileWidgetToLayout(widgetEntry, mockState);
      widgetEntry.layoutJSON = JSON.stringify(layout);
    } catch (err) {
      console.error(`[Layout Compiler] Error pre-compiling layout for ${tw.id}:`, err);
    }

    widgets.push(widgetEntry);
  });

  // Alias for developer_cicd
  if (!registeredIds.has('developer_cicd')) {
    const entry = {
      id: 'developer_cicd',
      templateId: 'developer_build',
      x: 0, y: 0, w: 4, h: 2,
      customizations: {
        fontId: 'inter',
        fontSize: 20,
        backgroundType: 'solid',
        backgroundColor: '#0c0c0c',
        borderRadius: 16,
        transparency: 10,
        blur: 10,
        shadowType: 'soft',
        titleText: 'CI/CD STATUS',
        valueText: 'Deploying',
        subValueText: 'CI/CD PIPELINE • STAGE 3 / 5',
        footerText: 'NOS • CI/CD',
        accentColor: '#7C9EFF',
        themeOverride: 'none',
        showProgressBar: true,
        progressBarValue: 60,
        progressBarMax: 100,
        showActionButtons: false,
        btnLeftText: '',
        btnLeftAction: '',
        btnRightText: '',
        btnRightAction: '',
      }
    };
    try {
      const layout = compileWidgetToLayout(entry, mockState);
      entry.layoutJSON = JSON.stringify(layout);
    } catch (err) {}
    widgets.push(entry);
  }

  return widgets;
}

const defaultWidgets = generateDefaultWidgetsList();
const outputPath = path.join(targetAssetsDir, 'default_widgets.json');
fs.writeFileSync(outputPath, JSON.stringify(defaultWidgets, null, 2), 'utf8');
console.log(`[Layout Compiler] Pre-compiled defaults written successfully to ${outputPath}`);
