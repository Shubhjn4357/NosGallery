import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { fetchBitcoinPrice, LiveFinanceData } from '../../services/apiService';
import { ThemeId } from '../../themes/themes';

interface FinanceStockCryptoProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const FinanceStockCrypto: React.FC<FinanceStockCryptoProps> = ({
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const [finance, setFinance] = useState<LiveFinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const title = customizations.titleText || 'FINANCIALS';

  useEffect(() => {
    let active = true;
    const loadPrices = async () => {
      const data = await fetchBitcoinPrice();
      if (active) {
        setFinance(data);
        setLoading(false);
      }
    };
    loadPrices();
    
    // Ticker updates every 5 seconds
    const interval = setInterval(() => {
      if (active) loadPrices();
    }, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading || !finance) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  }

  // Dynamic tickers map
  const getTickerData = () => {
    const symbol = title.trim().toUpperCase();
    
    const tickers: Record<string, { base: number; isCrypto: boolean; change: number }> = {
      BTC: { base: finance.btcPrice, isCrypto: true, change: finance.btcChange24h },
      ETH: { base: 3450.25, isCrypto: true, change: 2.85 },
      SOL: { base: 142.50, isCrypto: true, change: -1.42 },
      DOGE: { base: 0.1352, isCrypto: true, change: 5.67 },
      AAPL: { base: finance.aaplPrice, isCrypto: false, change: finance.aaplChange24h },
      TSLA: { base: 174.50, isCrypto: false, change: -2.31 },
      MSFT: { base: 415.80, isCrypto: false, change: 0.94 },
      GOOG: { base: 172.30, isCrypto: false, change: 1.15 },
      NVDA: { base: 875.12, isCrypto: false, change: 3.42 },
      NFLX: { base: 610.50, isCrypto: false, change: -0.22 },
    };

    const s = Object.keys(tickers).find(key => symbol.includes(key)) || 'BTC';
    const config = tickers[s];
    
    // Pseudo-random shift based on current second to simulate tickers tick
    const secOffset = new Date().getSeconds();
    const drift = ((secOffset % 10) - 5) * (config.base * 0.0005);
    const price = config.base + drift;
    const finalPrice = price < 1 ? parseFloat(price.toFixed(4)) : parseFloat(price.toFixed(2));
    const finalChange = parseFloat((config.change + ((secOffset % 5) - 2) * 0.1).toFixed(2));
    
    return {
      symbol: s,
      price: finalPrice,
      change: finalChange,
    };
  };

  const ticker = getTickerData();
  const isUp = ticker.change >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Coins size={12} color={accentColor} />
      </View>
      <Text style={[styles.price, textStyle]}>
        ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: ticker.price < 1 ? 4 : 2 })}
      </Text>
      <Text style={[styles.trend, textStyle, { color: isUp ? '#39ff14' : '#ff3b30' }]}>
        {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{ticker.change}% (24h)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trend: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
});
