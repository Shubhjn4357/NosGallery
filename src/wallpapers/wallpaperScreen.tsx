import { CheckCircle, Layers } from 'lucide-react-native';

const LucideIcons = {
  CheckCircle,
  Layers,
};
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useWidgetStore, WallpaperConfig } from '../store/widgetStore';
import { useFeedback } from '../hooks/useFeedback';

const CATEGORIES: ('ALL' | 'AMOLED' | 'Nothing' | 'Gradient' | 'Abstract' | 'Minimal')[] = [
  'ALL', 'AMOLED', 'Nothing', 'Gradient', 'Abstract', 'Minimal'
];

export const WallpaperScreen: React.FC = () => {
  const { wallpapers, selectedWallpaper, selectWallpaper } = useWidgetStore();
  const { triggerHaptic, triggerSound } = useFeedback();
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'AMOLED' | 'Nothing' | 'Gradient' | 'Abstract' | 'Minimal'>('ALL');

  const handleSelectWallpaper = (wp: WallpaperConfig) => {
    triggerHaptic('success');
    triggerSound('click');
    selectWallpaper(wp.id);
  };

  const filteredWallpapers = activeCategory === 'ALL'
    ? wallpapers
    : wallpapers.filter((w) => w.category === activeCategory);

  return (
    <View style={styles.container}>
      {/* Category Selection Filter */}
      <View style={{ height: 42, marginVertical: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => {
                triggerHaptic('selection');
                setActiveCategory(cat);
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.gridScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wallpaperGrid}>
          {filteredWallpapers.map((wp) => {
            const isSelected = selectedWallpaper.id === wp.id;
            return (
              <TouchableOpacity
                key={wp.id}
                style={[
                  styles.wallpaperCard,
                  isSelected && styles.selectedWallpaperCard,
                ]}
                onPress={() => handleSelectWallpaper(wp)}
              >
                <Image source={{ uri: wp.thumbnailUri }} style={styles.wallpaperImg} />
                <View style={styles.cardInfo}>
                  <Text style={styles.wallpaperName} numberOfLines={1}>{wp.name}</Text>
                  <Text style={styles.wallpaperCategory}>{wp.category}</Text>
                </View>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <LucideIcons.CheckCircle size={16} color="#ffffff" fill="#007aff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.dynamicThemeBanner}>
          <LucideIcons.Layers size={20} color="#39ff14" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Material You Dynamics</Text>
            <Text style={styles.bannerDesc}>
              Applying a new wallpaper will automatically re-extract color hues to update widgets configured with the &quot;Material You&quot; theme.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCategoryChip: {
    backgroundColor: '#007aff',
  },
  categoryChipText: {
    color: '#8e8e93',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeCategoryChipText: {
    color: '#ffffff',
  },
  gridScroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  wallpaperCard: {
    width: '48%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#222',
  },
  selectedWallpaperCard: {
    borderColor: '#007aff',
    borderWidth: 2,
  },
  wallpaperImg: {
    width: '100%',
    height: 140,
  },
  cardInfo: {
    padding: 8,
  },
  wallpaperName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  wallpaperCategory: {
    color: '#666666',
    fontSize: 9,
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  dynamicThemeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.15)',
  },
  bannerTitle: {
    color: '#39ff14',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerDesc: {
    color: '#8e8e93',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },
});
