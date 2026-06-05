import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { fetchBitcoinPrice, LiveFinanceData } from '../../services/apiService';
import { ThemeId } from '../../themes/themes';

interface FinanceStockCryptoProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

const SPARK_DATA = [62, 68, 65, 72, 69, 75, 71, 78, 73, 80, 77, 84];

export const FinanceStockCrypto: React.FC<FinanceStockCryptoProps> = ({
  customizations,
  globalTheme,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);

  const [finance, setFinance] = useState<LiveFinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const flashAnim = useRef(new Animated.Value(1)).current;

  const title = customizations.titleText || 'BTC / USD';

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchBitcoinPrice();
      if (active) { setFinance(data); setLoading(false); }
    };
    load();
    const interval = setInterval(() => {
      if (active) {
        load();
        // Flash animation on update
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 0.4, duration: 120, useNativeDriver: true }),
          Animated.timing(flashAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
      }
    }, 5000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const getTickerData = () => {
    if (!finance) return { symbol: 'BTC', price: 67490, change: 0.8 };
    const symbol = title.trim().toUpperCase();
    const tickers: Record<string, { base: number; change: number }> = {
      BTC: { base: finance.btcPrice, change: finance.btcChange24h },
      ETH: { base: 3450.25, change: 2.85 },
      SOL: { base: 142.50, change: -1.42 },
      AAPL: { base: finance.aaplPrice, change: finance.aaplChange24h },
      TSLA: { base: 174.50, change: -2.31 },
      NVDA: { base: 875.12, change: 3.42 },
    };
    const s = Object.keys(tickers).find(k => symbol.includes(k)) || 'BTC';
    const secOffset = new Date().getSeconds();
    const drift = ((secOffset % 10) - 5) * (tickers[s].base * 0.0005);
    return { symbol: s, price: parseFloat((tickers[s].base + drift).toFixed(2)), change: parseFloat(tickers[s].change.toFixed(2)) };
  };

  const ticker = getTickerData();
  const isUp = ticker.change >= 0;
  const changeColor = isUp ? '#39ff14' : '#7C9EFF';

  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#000' : '#fff';
  const dimColor = isLight ? '#888' : '#666';
  const sparkBg = isLight ? '#efeff4' : '#1c1c1e';

  // Sparkline bars
  const maxVal = Math.max(...SPARK_DATA);
  const minVal = Math.min(...SPARK_DATA);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.TrendingUp size={10} color={accentColor} />
          <Text style={[styles.title, { color: dimColor }]}>{ticker.symbol}</Text>
        </View>
        <View style={[styles.changeBadge, { backgroundColor: changeColor + '22' }]}>
          <Text style={[styles.changeBadgeText, { color: changeColor }]}>
            {isUp ? '+' : ''}{ticker.change}%
          </Text>
        </View>
      </View>

      {/* Price display */}
      <Animated.View style={{ opacity: flashAnim }}>
        <Text style={[styles.price, { color: textColor }]}>
          ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </Animated.View>

      {/* Sparkline mini chart */}
      <View style={styles.sparkRow}>
        {SPARK_DATA.map((val, i) => {
          const normalized = (val - minVal) / (maxVal - minVal);
          const barH = 6 + normalized * 14;
          return (
            <View
              key={i}
              style={[
                styles.sparkBar,
                {
                  height: barH,
                  backgroundColor: i === SPARK_DATA.length - 1 ? accentColor : (isUp ? '#39ff1455' : '#7C9EFF55'),
                },
              ]}
            />
          );
        })}
      </View>

      {/* 24h label */}
      <View style={styles.footer}>
        <Text style={[styles.footerLabel, { color: dimColor }]}>24H CHANGE</Text>
        <Text style={[styles.footerValue, { color: changeColor }]}>
          {isUp ? '▲' : '▼'} {Math.abs(ticker.change)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  changeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  changeBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 22,
  },
  sparkBar: {
    flex: 1,
    borderRadius: 1.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerValue: {
    fontSize: 9,
    fontWeight: '900',
  },
});
