import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface TodoWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
}

export const TodoWidget: React.FC<TodoWidgetProps> = ({
  customizations,
  globalTheme,
  interactive,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'MY TASKS';
  const lowercaseTitle = title.toLowerCase();

  // Load custom tasks based on category (Kanban, eisenhower, etc.)
  const getDefaultTasks = () => {
    if (lowercaseTitle.includes('kanban') || lowercaseTitle.includes('project')) {
      return [
        { id: 1, text: '📋 Backlog: API Tests', completed: false },
        { id: 2, text: '🚀 In Progress: Dark Mode', completed: true },
        { id: 3, text: '✅ Done: Store Hooks', completed: true },
      ];
    }
    if (lowercaseTitle.includes('eisenhower') || lowercaseTitle.includes('priorities')) {
      return [
        { id: 1, text: '🔴 Urgent: Vercel Crash', completed: false },
        { id: 2, text: '🟡 Important: Refactor Dials', completed: false },
        { id: 3, text: '🟢 Later: Asset cleanups', completed: true },
      ];
    }
    // Default todo checklist
    return [
      { id: 1, text: 'Deploy Vercel branch', completed: false },
      { id: 2, text: 'Design dark matrix UI', completed: true },
      { id: 3, text: 'Hydrate (8 cups water)', completed: false },
    ];
  };

  const [todoList, setTodoList] = useState(getDefaultTasks());

  const handleToggle = (id: number) => {
    if (!interactive) return;
    setTodoList(list => list.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const renderIcon = (name: string, size = 12, color?: string) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
    const resolvedColor = color || (typeof textStyle.color === 'string' ? textStyle.color : undefined);
    return IconComponent ? <IconComponent size={size} color={resolvedColor} /> : <LucideIcons.HelpCircle size={size} color={resolvedColor} />;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, subtextStyle]}>{title}</Text>
      <View style={styles.list}>
        {todoList.map((todo) => (
          <TouchableOpacity
            key={todo.id}
            disabled={!interactive}
            style={styles.itemRow}
            onPress={() => handleToggle(todo.id)}
          >
            {todo.completed ? renderIcon('CheckSquare', 12, accentColor) : renderIcon('Square', 12)}
            <Text style={[styles.todoText, textStyle, todo.completed && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
              {todo.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  list: {
    gap: 4,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todoText: {
    fontSize: 10.5,
  },
});
