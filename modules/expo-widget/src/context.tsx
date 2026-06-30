import React, { createContext, useContext, useEffect, useRef } from 'react';

export interface LayoutNode {
  type: string;
  style?: Record<string, string | number | undefined>;
  text?: string;
  clockFormat?: string;
  progressValue?: number;
  imageName?: string;
  action?: string;
  children?: LayoutNode[];
}

export interface WidgetLayoutContextType {
  addChild: (node: LayoutNode) => void;
}

export const WidgetLayoutContext = createContext<WidgetLayoutContextType | null>(null);

interface WidgetLayoutProviderProps {
  onLayoutCollected: (layout: LayoutNode) => void;
  children: React.ReactNode;
}

export const WidgetLayoutProvider: React.FC<WidgetLayoutProviderProps> = ({
  onLayoutCollected,
  children
}) => {
  const rootNodeRef = useRef<LayoutNode>({
    type: 'view',
    style: { width: '100%', height: '100%', flexDirection: 'column' },
    children: []
  });

  const contextValue = useRef<WidgetLayoutContextType>({
    addChild: (node: LayoutNode) => {
      const rootNode = rootNodeRef.current;
      rootNode.children = rootNode.children || [];
      rootNode.children.push(node);
    }
  });

  useEffect(() => {
    onLayoutCollected(rootNodeRef.current);
  });

  return (
    <WidgetLayoutContext.Provider value={contextValue.current}>
      {children}
    </WidgetLayoutContext.Provider>
  );
};
