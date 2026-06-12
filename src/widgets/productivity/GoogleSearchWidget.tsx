import { Search, ArrowUpRight, Compass } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Search,
  ArrowUpRight,
  Compass,
};

interface GoogleSearchWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const GoogleSearchWidget: React.FC<GoogleSearchWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic } = useFeedback();

  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (!interactive || !query.trim()) return;
    triggerHaptic('selection');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
    Linking.openURL(searchUrl).catch(() => {});
    setQuery('');
  };

  const isLight = textStyle.color === '#000000';
  const inputBg = isLight ? '#efeff4' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Search size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>GOOGLE SEARCH</Text>
        </View>
        <LucideIcons.Compass size={11} color={subtextStyle.color} />
      </View>

      <View style={styles.main}>
        <View style={[styles.searchBar, { backgroundColor: inputBg, borderColor: isLight ? '#ccc' : '#333' }]}>
          <TextInput
            style={[styles.input, { color: textStyle.color }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search the web..."
            placeholderTextColor="#666"
            onSubmitEditing={handleSearch}
            editable={interactive}
          />
          {interactive && (
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
              <LucideIcons.ArrowUpRight size={13} color={accentColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.quickLinks}>
        {['Google Maps', 'Translate', 'GitHub'].map((service) => (
          <TouchableOpacity
            key={service}
            disabled={!interactive}
            onPress={() => {
              triggerHaptic('light');
              const url = service === 'GitHub'
                ? 'https://github.com'
                : `https://www.google.com/search?q=${service.toLowerCase()}`;
              Linking.openURL(url).catch(() => {});
            }}
            style={[styles.linkChip, { backgroundColor: inputBg }]}
          >
            <Text style={[styles.chipText, subtextStyle]}>{service.toUpperCase()}</Text>
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
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  main: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    paddingLeft: 8,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 9.5,
    padding: 0,
  },
  searchBtn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 4,
  },
  linkChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
