import React from 'react';
import widgetsJson from '../../../src/widgets/widgets.json';
import { WidgetLayoutProvider, WidgetLayoutContext, LayoutNode } from './context';

import { getWidgetComponent } from './widgetRegistry.gen';

interface WidgetData {
  id: string;
  templateId: string;
  w: number;
  h: number;
  customizations?: Record<string, string | number | boolean | undefined>;
}



// Build props for the widget based on template expectations
function buildWidgetProps(templateId: string, customizations: Record<string, string | number | boolean | undefined>, state: Record<string, any>): Record<string, unknown> {
  const commonProps = {
    currentTime: new Date(),
    customizations,
    globalTheme: state.activeTheme || 'nos',
    interactive: false
  };

  if (templateId.startsWith('clock_')) {
    if (templateId.includes('stopwatch')) {
      return {
        ...commonProps,
        swTime: state.stopwatchTime || 0,
        swActive: state.stopwatchRunning || false,
        handleStopwatch: () => {},
        handleStopwatchReset: () => {}
      };
    }
  }

  if (templateId.startsWith('developer_')) {
    if (templateId.includes('build') || templateId.includes('cicd')) {
      return {
        ...commonProps,
        buildStatus: 'success',
        buildProgress: 100,
        triggerCICDBuild: () => {}
      };
    }
  }

  if (templateId.startsWith('smart_home_')) {
    if (templateId === 'smart_home_controls') {
      return {
        ...commonProps,
        lightOn: state.lightOn !== undefined ? state.lightOn : true,
        toggleLight: () => {}
      };
    }
  }

  if (templateId.startsWith('ai_')) {
    if (templateId.includes('chat')) {
      return {
        ...commonProps,
        aiInput: '',
        aiResponse: '',
        aiThinking: false,
        setAiInput: () => {},
        triggerAIChat: () => {}
      };
    }
    if (templateId === 'ai_summary') {
      return {
        ...commonProps,
        valText: customizations.valueText || ''
      };
    }
  }

  return commonProps;
}

// Module level context stack to support nested context rendering
const contextStack: any[] = (globalThis as any).__CONTEXT_STACK__ || [];

// Recursively traverse and evaluate the React Element tree
function resolveElementTree(element: React.ReactNode): void {
  if (!element) return;
  if (Array.isArray(element)) {
    element.forEach(resolveElementTree);
    return;
  }

  const reactElement = element as React.ReactElement<any>;
  let isProvider = false;

  const type = reactElement.type;
  const isProviderNode = 
    type === WidgetLayoutContext.Provider || 
    type === WidgetLayoutContext ||
    (type && typeof type === 'object' && (
      (type as any).$$typeof === Symbol.for('react.provider') || 
      (type as any)._context === WidgetLayoutContext ||
      (type as any).type === WidgetLayoutContext.Provider
    ));

  if (isProviderNode) {
    isProvider = true;
    contextStack.push(reactElement.props.value);
  }

  if (typeof reactElement.type === 'function') {
    try {
      const Component = reactElement.type as any;
      if (Component.prototype && typeof Component.prototype.render === 'function') {
        const instance = new Component(reactElement.props);
        resolveElementTree(instance.render());
      } else {
        const rendered = Component(reactElement.props);
        resolveElementTree(rendered);
      }
    } catch (e: any) {
      console.error('[resolveElementTree] Error resolving component:', (reactElement.type as any)?.name || reactElement.type, e);
    }
  } else if (reactElement.props && reactElement.props.children) {
    const children = reactElement.props.children;
    if (Array.isArray(children)) {
      children.forEach(resolveElementTree);
    } else {
      resolveElementTree(children);
    }
  }

  if (isProvider) {
    contextStack.pop();
  }
}

// Dynamic JSX compiler pass (generates layoutJSON tree completely dynamically)
export function compileWidgetToLayout(widget: WidgetData, state: Record<string, any>): LayoutNode {
  const templateId = widget.templateId;
  const templateConfig = widgetsJson.find((w: any) => w.id === templateId);
  const defaults = (templateConfig?.customizations || {}) as Record<string, string | number | boolean | undefined>;
  const customizations = { ...defaults, ...(widget.customizations || {}) };

  const Component = getWidgetComponent(templateId);
  const props = buildWidgetProps(templateId, customizations, state);

  let compiledLayout: LayoutNode = {
    type: 'view',
    style: { width: '100%', height: '100%', flexDirection: 'column' },
    children: []
  };

  // Mock standard React Hooks and internal dispatcher temporarily to run functional component evaluation
  const ReactAny = React as any;
  const dispatcher = {
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => [
      typeof initialValue === 'function' ? (initialValue as Function)() : initialValue,
      () => {}
    ],
    useEffect: () => {},
    useRef: (initialValue: unknown) => ({ current: initialValue }),
    useCallback: (callback: unknown) => callback,
    useContext: (contextType: any) => {
      if (contextType === WidgetLayoutContext) {
        return contextStack[contextStack.length - 1] || null;
      }
      return null;
    },
    useLayoutEffect: () => {},
    useDebugValue: () => {},
    useTransition: () => [false, () => {}],
    useDeferredValue: (value: any) => value,
    useId: () => 'id',
    useImperativeHandle: () => {},
    useInsertionEffect: () => {},
    useSyncExternalStore: (subscribe: any, getSnapshot: any) => getSnapshot(),
  };

  const originalDispatcher = ReactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current;
  if (ReactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher) {
    ReactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = dispatcher;
  }

  const originalDispatcher19 = ReactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.H;
  if (ReactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
    ReactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H = dispatcher;
  }

  // Enable compilation flags globally
  const globalObj = globalThis as any;
  globalObj.__WIDGET_COMPILING__ = true;
  globalObj.__WIDGET_COMPILING_STATE__ = state;
  globalObj.__WIDGET_COMPILING_CUSTOMS__ = customizations;

  try {
    const layoutProvider = React.createElement(WidgetLayoutProvider, {
      onLayoutCollected: (layout: LayoutNode) => {
        compiledLayout = layout;
      },
      children: React.createElement(Component, props)
    });

    resolveElementTree(layoutProvider);
    
    if (globalObj.__WIDGET_COMPILED_ROOT__) {
      compiledLayout = globalObj.__WIDGET_COMPILED_ROOT__;
    }
  } catch (err) {
    console.error('[LayoutCompiler] Dynamic compilation failed for template:', templateId, err);
  } finally {
    // Restore React dispatcher
    if (ReactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher) {
      ReactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = originalDispatcher;
    }
    if (ReactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
      ReactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H = originalDispatcher19;
    }

    // Clear context stack and flags
    contextStack.length = 0;
    delete globalObj.__WIDGET_COMPILING__;
    delete globalObj.__WIDGET_COMPILING_STATE__;
    delete globalObj.__WIDGET_COMPILING_CUSTOMS__;
    delete globalObj.__WIDGET_COMPILED_ROOT__;
  }

  // Ensure children contains root wrappers if root collected children
  return compiledLayout;
}
