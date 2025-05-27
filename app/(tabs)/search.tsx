import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { fetchForecast } from '../../api/forecast';
import { fetchWeather } from '../../api/weather';
import { useTheme } from '../../context/ThemeContext';

interface SearchHistoryItem {
  id: string;
  cityName: string;
  country?: string;
  timestamp: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();

  const getThemeColors = () => {
    if (isDark) {
      return {
        background: ['#1a1a1a', '#2d2d2d'] as const,
        card: 'rgba(255,255,255,0.1)',
        text: 'white',
        textSecondary: 'rgba(255,255,255,0.7)',
        icon: 'rgba(255,255,255,0.7)'
      };
    }
    return {
      background: ['#f5f5f5', '#ffffff'] as const,
      card: 'rgba(0,0,0,0.05)',
      text: '#1a1a1a',
      textSecondary: 'rgba(0,0,0,0.7)',
      icon: 'rgba(0,0,0,0.7)'
    };
  };

  const theme = getThemeColors();

  const loadSearchHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('searchHistory');
      if (saved) {
        const parsed: SearchHistoryItem[] = JSON.parse(saved);
        setSearchHistory(parsed);
      } else {
        setSearchHistory([]);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      setSearchHistory([]);
    }
  };

  const saveSearchHistory = async (newHistory: SearchHistoryItem[]) => {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Adds a city to the search history with duplicate prevention, country support, and limit of 10 items
  const addToSearchHistory = async (cityName: string, country?: string) => {
    try {
      const saved = await AsyncStorage.getItem('searchHistory');
      const currentHistory: SearchHistoryItem[] = saved ? JSON.parse(saved) : [];

      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        cityName,
        country,
        timestamp: Date.now(),
      };

      const updatedHistory = [
        newItem,
        ...currentHistory.filter(item => item.cityName.toLowerCase() !== cityName.toLowerCase())
      ].slice(0, 10); // Keep only last 10 items

      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to add to search history:', error);
    }
  };

  // Removes a city from the search history by its ID
  const removeFromHistory = async (id: string) => {
    try {
      const saved = await AsyncStorage.getItem('searchHistory');
      const currentHistory: SearchHistoryItem[] = saved ? JSON.parse(saved) : [];
      const updatedHistory = currentHistory.filter(item => item.id !== id);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to remove from search history:', error);
    }
  };

  const clearSearchHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    saveSearchHistory([]);
    setShowClearConfirm(false);
  };

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setIsSearching(true);
    setError('');
    const trimmedQuery = query.trim();

    try {
      const {data} = await fetchWeather(trimmedQuery);
      const forecast = await fetchForecast(trimmedQuery);

      addToSearchHistory(trimmedQuery, data.country);
      setSearchQuery('');
      Keyboard.dismiss();

      router.push({
        pathname: '/',
        params: {
          weather: JSON.stringify(data),
          forecast: JSON.stringify(forecast),
        }
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryItemPress = (item: SearchHistoryItem) => {
    handleSearch(item.cityName);
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);


  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemPress(item)}
      activeOpacity={0.7}
    >
      <BlurView intensity={10} style={styles.historyItemBlur}>
        <View style={styles.historyItemContent}>
          <View style={styles.historyItemLeft}>
            <Ionicons name="location-outline" size={20} color="rgba(255,255,255,0.7)" />
            <View style={styles.historyItemText}>
              <Text style={styles.historyItemCity}>{item.cityName}</Text>
              {item.country && (
                <Text style={styles.historyItemCountry}>{item.country}</Text>
              )}
            </View>
          </View>
          <View style={styles.historyItemRight}>
            <Text style={styles.historyItemTime}>{formatTimestamp(item.timestamp)}</Text>
            <TouchableOpacity
              onPress={() => removeFromHistory(item.id)}
              style={styles.removeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <LinearGradient
        colors={theme.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Search Location</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <BlurView intensity={20} style={[styles.searchInputContainer, { backgroundColor: theme.card }]}>
            <View style={styles.searchInputOverlay}>
              <Ionicons name="search" size={20} color={theme.icon} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Enter city name..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (error) setError('');
                }}
                onSubmitEditing={() => handleSearch(searchQuery)}
                returnKeyType="search"
                autoCapitalize="words"
                autoCorrect={false}
              />
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <View style={[styles.loadingDot, { backgroundColor: theme.icon }]} />
                  <View style={[styles.loadingDot, { backgroundColor: theme.icon }]} />
                  <View style={[styles.loadingDot, { backgroundColor: theme.icon }]} />
                </View>
              ) : (
                searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSearch(searchQuery)}
                    style={styles.searchButton}
                  >
                    <Ionicons name="send" size={20} color={theme.icon} />
                  </TouchableOpacity>
                )
              )}
            </View>
          </BlurView>
        </View>

        {/* Error Message */}
        {error ? (
          <BlurView intensity={15} style={[styles.errorContainer, { backgroundColor: theme.card }]}>
            <View style={styles.errorOverlay}>
              <Ionicons name="warning" size={20} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </BlurView>
        ) : null}

        {/* Search History */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>Recent Searches</Text>
            {searchHistory.length > 0 && (
              <TouchableOpacity
                onPress={clearSearchHistory}
                style={[styles.clearButton, { backgroundColor: theme.card }]}
              >
                <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {searchHistory.length === 0 ? (
            <BlurView intensity={10} style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
              <View style={styles.emptyOverlay}>
                <Ionicons name="search" size={40} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No recent searches</Text>
                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Start searching for cities to see your history here</Text>
              </View>
            </BlurView>
          ) : (
            <FlatList
              data={searchHistory}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.historyItem}
                  onPress={() => handleHistoryItemPress(item)}
                  activeOpacity={0.7}
                >
                  <BlurView intensity={10} style={[styles.historyItemBlur, { backgroundColor: theme.card }]}>
                    <View style={styles.historyItemContent}>
                      <View style={styles.historyItemLeft}>
                        <Ionicons name="location-outline" size={20} color={theme.icon} />
                        <View style={styles.historyItemText}>
                          <Text style={[styles.historyItemCity, { color: theme.text }]}>{item.cityName}</Text>
                          {item.country && (
                            <Text style={[styles.historyItemCountry, { color: theme.textSecondary }]}>{item.country}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.historyItemRight}>
                        <Text style={[styles.historyItemTime, { color: theme.textSecondary }]}>{formatTimestamp(item.timestamp)}</Text>
                        <TouchableOpacity
                          onPress={() => removeFromHistory(item.id)}
                          style={styles.removeButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="close" size={16} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.historyList}
            />
          )}
        </View>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <View style={styles.modalOverlay}>
            <BlurView intensity={30} style={[styles.modalContainer, { backgroundColor: theme.card }]}>
              <View style={styles.modalContent}>
                <Ionicons name="trash" size={40} color="#FF6B6B" />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Clear Search History?</Text>
                <Text style={[styles.modalText, { color: theme.textSecondary }]}>
                  This will permanently delete all your recent searches.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.card }]}
                    onPress={() => setShowClearConfirm(false)}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmClearHistory}
                  >
                    <Text style={styles.confirmButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  searchInputOverlay: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
    marginRight: 10,
  },
  searchButton: {
    padding: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 2,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  errorOverlay: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  clearButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 50,
  },
  emptyOverlay: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  historyList: {
    paddingBottom: Platform.select({
      ios: 100,
      default: 20,
    }),
  },
  historyItem: {
    marginBottom: 10,
  },
  historyItemBlur: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  historyItemContent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyItemText: {
    marginLeft: 12,
    flex: 1,
  },
  historyItemCity: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  historyItemCountry: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  historyItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    marginHorizontal: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confirmButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});