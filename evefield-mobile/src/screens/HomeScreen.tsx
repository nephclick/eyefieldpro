import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { Search, LogOut, RefreshCw, Star, Tag, ShoppingCart } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48 - 12) / 2;

export default function HomeScreen() {
  const { user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Services'];

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Fetch promotions
      const { data: promosData } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true);
      
      if (promosData) {
        setPromos(promosData);
      }

      // Fetch products
      let query = supabase.from('products').select('*');
      
      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory);
      }
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data: productsData, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      if (productsData) {
        setProducts(productsData);
      }
    } catch (e) {
      console.error('Error fetching marketplace data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const defaultImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
    return (
      <View style={styles.productCard}>
        <Image
          source={{ uri: item.image_url || defaultImage }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {item.category?.toUpperCase() || 'GENERAL'}
          </Text>
          <Text style={styles.productTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              ${(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Star size={10} color="#ffb300" fill="#ffb300" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.minOrderText}>{item.min_order || '1 piece'}</Text>
            <TouchableOpacity style={styles.addToCartBtn}>
              <ShoppingCart size={12} color="#000080" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeSub}>Welcome back,</Text>
            <Text style={styles.welcomeTitle}>{user?.name || 'Eyefield Guest'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.heroTitle}>Cascadea</Text>
          <Text style={styles.heroSubtitle}>
            Discover the best deals and latest products in our marketplace.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>

        {/* Category List */}
        <ScrollViewHorizontal />

        {/* Promo Slider */}
        {promos.length > 0 && (
          <View style={styles.promoSection}>
            <Text style={styles.sectionTitle}>Featured Deals</Text>
            <FlatList
              horizontal
              data={promos}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={width - 48}
              decelerationRate="fast"
              renderItem={({ item }) => (
                <View style={styles.promoCard}>
                  <Image
                    source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80' }}
                    style={styles.promoImage}
                    resizeMode="cover"
                  />
                  <View style={styles.promoOverlay}>
                    <Text style={styles.promoBadge}>PROMO</Text>
                    <Text style={styles.promoTitle}>{item.title}</Text>
                    <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{ gap: 12 }}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Products Feed</Text>
      </View>
    );
  };

  const ScrollViewHorizontal = () => {
    return (
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => {
          const isActive = activeCategory === item;
          return (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
            >
              <Text style={[styles.categoryBtnText, isActive && styles.categoryBtnTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000080" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Tag size={32} color="#aaa" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters or search terms.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000080" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#000',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    height: '100%',
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
  },
  categoryBtnActive: {
    backgroundColor: '#000080',
  },
  categoryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666',
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  promoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginBottom: 12,
  },
  promoCard: {
    width: width - 48,
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 128, 0.4)', // Soft navy tint overlay
  },
  promoBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    backgroundColor: '#ff3b30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
    letterSpacing: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  promoSubtitle: {
    fontSize: 11,
    color: '#eee',
    fontWeight: '500',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: COLUMN_WIDTH - 20,
    backgroundColor: '#f9f9f9',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 8,
    fontWeight: '900',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000080',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffb300',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
    paddingTop: 8,
  },
  minOrderText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  addToCartBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#666',
  },
});
