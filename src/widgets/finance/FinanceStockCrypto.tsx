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
    const interval = setInterval(loadPrices, 5000);
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

  // Choose content based on token name (AAPL stock vs BTC crypto)
  const isAapl = title.toLowerCase().includes('aapl') || title.toLowerCase().includes('stock') || title.toLowerCase().includes('apple');
  const price = isAapl ? finance.aaplPrice : finance.btcPrice;
  const change = isAapl ? finance.aaplChange24h : finance.btcChange24h;
  const isUp = change >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Coins size={12} color={accentColor} />
      </View>
      <Text style={[styles.price, textStyle]}>
        ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </Text>
      <Text style={[styles.trend, textStyle, { color: isUp ? '#39ff14' : '#ff3b30' }]}>
        {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{change}% (24h)
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
