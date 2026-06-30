// Native module bridge
export { default as ExpoWidget } from './ExpoWidget';

// Types
export type {
  WidgetConfig,
  WidgetCustomizations,
  ClickHandler,
  WidgetSize,
} from './ExpoWidget.types';

// Helpers
export {
  getWidgetProviderName,
  buildWidgetConfig,
} from './helpers';

// Compiler
export {
  compileWidgetToLayout,
} from './layoutCompiler';

// Context & Providers
export {
  WidgetLayoutContext,
  WidgetLayoutProvider,
} from './context';
export type {
  LayoutNode,
  WidgetLayoutContextType
} from './context';

// Dynamic Components
export {
  View,
  Text,
  Pressable,
  Image,
  ProgressBar,
  TextClock,
  Chronometer,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TouchableHighlight,
  ScrollView,
  SafeAreaView
} from './components';

// SDK Hooks
export {
  useWidgetState,
  useWidgetConfig
} from './hooks';
export type {
  WidgetCustomizations as SDKWidgetCustomizations,
  WidgetConfig as SDKWidgetConfig
} from './hooks';
