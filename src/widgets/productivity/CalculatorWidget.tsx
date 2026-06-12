import { Calculator } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Calculator,
};

const evaluateSafe = (eq: string): number => {
  const tokens: (string | number)[] = [];
  let currentNum = '';
  for (let i = 0; i < eq.length; i++) {
    const char = eq[i];
    if (/[0-9.]/.test(char)) {
      currentNum += char;
    } else if (['+', '-', '*', '/'].includes(char)) {
      if (currentNum) {
        tokens.push(parseFloat(currentNum));
        currentNum = '';
      }
      tokens.push(char);
    }
  }
  if (currentNum) {
    tokens.push(parseFloat(currentNum));
  }

  const pass1: (string | number)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '*' || token === '/') {
      const prev = pass1.pop() as number;
      const next = tokens[++i] as number;
      if (token === '*') {
        pass1.push(prev * next);
      } else {
        pass1.push(next !== 0 ? prev / next : 0);
      }
    } else {
      pass1.push(token);
    }
  }

  let result = pass1[0] as number;
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i] as string;
    const val = pass1[i + 1] as number;
    if (op === '+') {
      result += val;
    } else if (op === '-') {
      result -= val;
    }
  }

  return result || 0;
};

interface CalculatorWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const CalculatorWidget: React.FC<CalculatorWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic } = useFeedback();

  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handlePress = (char: string) => {
    if (!interactive) return;
    triggerHaptic('light');

    if (char === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }

    if (char === '=') {
      try {
        const cleanEq = equation.replace(/[^0-9+\-*/.]/g, '');
        // Safe mathematical evaluation without eval
        const result = evaluateSafe(cleanEq);
        const resStr = String(result);
        setDisplay(resStr.substring(0, 8));
        setEquation(resStr);
      } catch {
        setDisplay('Error');
      }
      return;
    }

    if (['+', '-', '*', '/'].includes(char)) {
      setDisplay(char);
      setEquation((prev) => prev + char);
      return;
    }

    // Number or dot
    setEquation((prev) => (prev === '0' ? char : prev + char));
    setDisplay((prev) => (prev === '0' || ['+', '-', '*', '/'].includes(prev) ? char : prev + char));
  };

  const rows = [
    ['C', '/', '*'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='],
  ];

  const isLight = textStyle.color === '#000000';
  const buttonBg = isLight ? '#e5e5ea' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Calculator size={10} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>CALCULATOR</Text>
        </View>
        <Text style={[styles.displayVal, textStyle]} numberOfLines={1}>
          {display}
        </Text>
      </View>

      <View style={styles.grid}>
        {rows.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((char) => {
              const isOperator = ['/', '*', '-', '+', '='].includes(char);
              const isClear = char === 'C';
              const btnStyle = [
                styles.btn,
                { backgroundColor: isClear ? '#ff3b30' : buttonBg },
                char === '=' && { backgroundColor: accentColor },
              ];
              const labelColor = isClear
                ? '#ffffff'
                : char === '='
                ? '#000000'
                : isOperator
                ? accentColor
                : textStyle.color;

              return (
                <TouchableOpacity
                  key={char}
                  onPress={() => handlePress(char)}
                  disabled={!interactive}
                  style={btnStyle}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.btnText, { color: labelColor }]}>{char}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  displayVal: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  grid: {
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
});
