import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

const { width, height } = Dimensions.get('window');

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

  // Animation values for floating circles and effects
  const pulse1 = useRef(new Animated.Value(0.8)).current;
  const pulse2 = useRef(new Animated.Value(0.6)).current;
  const pulse3 = useRef(new Animated.Value(0.9)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const searchInputScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sample search history data (this would come from AsyncStorage)
  const loadSearchHistory = () => {
    // Mock data - replace with AsyncStorage.getItem('searchHistory') in real implementation
    const mockHistory: SearchHistoryItem[] = [
      { id: '1', cityName: 'Istanbul', country: 'Turkey', timestamp: Date.now() - 3600000 },
      { id: '2', cityName: 'London', country: 'United Kingdom', timestamp: Date.now() - 7200000 },
      { id: '3', cityName: 'New York', country: 'United States', timestamp: Date.now() - 10800000 },
      { id: '4', cityName: 'Tokyo', country: 'Japan', timestamp: Date.now() - 14400000 },
      { id: '5', cityName: 'Paris', country: 'France', timestamp: Date.now() - 18000000 },
    ];
    setSearchHistory(mockHistory);
  };

  const saveSearchHistory = (newHistory: SearchHistoryItem[]) => {

    setSearchHistory(newHistory);
  };

  const addToSearchHistory = (cityName: string, country?: string) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      cityName,
      country,
      timestamp: Date.now()
    };

    const updatedHistory = [newItem, ...searchHistory.filter(item => 
      item.cityName.toLowerCase() !== cityName.toLowerCase()
    )].slice(0, 10); // Keep only last 10 searches

    saveSearchHistory(updatedHistory);
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    saveSearchHistory(updatedHistory);
  };

  const clearSearchHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmClearHistory = () => {
    saveSearchHistory([]);
    setShowClearConfirm(false);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 1500);
    });
  };

  const handleSearch = (query: string) => {
    if (query.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setIsSearching(true);
    setError('');

    // Animate search input
    Animated.sequence([
      Animated.timing(searchInputScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(searchInputScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate API call delay
    setTimeout(() => {
      const trimmedQuery = query.trim();
      
      // Mock validation - this would be API response
      const isValidCity = /^[a-zA-Z\s,.-]+$/.test(trimmedQuery);
      
      if (!isValidCity) {
        setError('Please enter a valid city name');
        setIsSearching(false);
        return;
      }

      // Add to search history
      addToSearchHistory(trimmedQuery, 'Country Name'); // Country would come from API
      
      setIsSearching(false);
      setSearchQuery('');
      Keyboard.dismiss();
      
      // Navigate to weather details or update main screen
      console.log('Searching for:', trimmedQuery);
    }, 1000);
  };

  const handleHistoryItemPress = (item: SearchHistoryItem) => {
    setSearchQuery(item.cityName);
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

    // Create continuous animations
    const createPulseAnimation = (animatedValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0.8,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const createFloatAnimation = (animatedValue: Animated.Value, distance: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: distance,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: -distance,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createPulseAnimation(pulse1, 3000).start();
    createPulseAnimation(pulse2, 4000).start();
    createPulseAnimation(pulse3, 5000).start();
    createFloatAnimation(float1, 20, 6000).start();
    createFloatAnimation(float2, 15, 8000).start();
  }, []);

  const getDynamicGradient = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      return ['rgba(255, 154, 86, 0.9)', 'rgba(255, 206, 86, 0.9)', 'rgba(255, 107, 157, 0.9)'];
    } else if (hour >= 12 && hour < 18) {
      return ['rgba(37, 99, 235, 0.9)', 'rgba(56, 189, 248, 0.9)', 'rgba(252, 211, 77, 0.9)'];
    } else if (hour >= 18 && hour < 21) {
      return ['rgba(250, 112, 154, 0.9)', 'rgba(254, 225, 64, 0.9)', 'rgba(250, 139, 255, 0.9)'];
    } else {
      return ['rgba(30, 58, 138, 0.9)', 'rgba(49, 46, 129, 0.9)', 'rgba(88, 28, 135, 0.9)'];
    }
  };

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={getDynamicGradient() as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated floating circles */}
        <View style={styles.backgroundContainer}>
          <Animated.View 
            style={[
              styles.floatingCircle1,
              {
                transform: [
                  { scale: pulse1 },
                  { translateY: float1 }
                ]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.floatingCircle2,
              {
                transform: [
                  { scale: pulse2 },
                  { translateX: float2 }
                ]
              }
            ]}
          />
          <Animated.View 
            style={[
              styles.floatingCircle3,
              {
                transform: [
                  { scale: pulse3 },
                  { translateY: float1 },
                  { translateX: float2 }
                ]
              }
            ]}
          />
        </View>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Search Location</Text>
        </View>

        {/* Search Input */}
        <Animated.View style={[styles.searchContainer, { transform: [{ scale: searchInputScale }] }]}>
          <BlurView intensity={20} style={styles.searchInputContainer}>
            <View style={styles.searchInputOverlay}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter city name..."
                placeholderTextColor="rgba(255,255,255,0.5)"
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
                  <View style={styles.loadingDot} />
                  <View style={[styles.loadingDot, { animationDelay: '0.2s' }]} />
                  <View style={[styles.loadingDot, { animationDelay: '0.4s' }]} />
                </View>
              ) : (
                searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSearch(searchQuery)}
                    style={styles.searchButton}
                  >
                    <Ionicons name="send" size={20} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                )
              )}
            </View>
          </BlurView>
        </Animated.View>

        {/* Error Message */}
        {error ? (
          <BlurView intensity={15} style={styles.errorContainer}>
            <View style={styles.errorOverlay}>
              <Ionicons name="warning" size={20} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </BlurView>
        ) : null}

        {/* Success Message */}
        <Animated.View 
          style={[
            styles.successContainer,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
          pointerEvents="none"
        >
          <BlurView intensity={15} style={styles.successBlur}>
            <View style={styles.successOverlay}>
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              <Text style={styles.successText}>Search history cleared!</Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* Search History */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            {searchHistory.length > 0 && (
              <TouchableOpacity
                onPress={clearSearchHistory}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {searchHistory.length === 0 ? (
            <BlurView intensity={10} style={styles.emptyContainer}>
              <View style={styles.emptyOverlay}>
                <Ionicons name="search" size={40} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>No recent searches</Text>
                <Text style={styles.emptySubtext}>Start searching for cities to see your history here</Text>
              </View>
            </BlurView>
          ) : (
            <FlatList
              data={searchHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.historyList}
            />
          )}
        </View>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <View style={styles.modalOverlay}>
            <BlurView intensity={30} style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Ionicons name="trash" size={40} color="#FF6B6B" />
                <Text style={styles.modalTitle}>Clear Search History?</Text>
                <Text style={styles.modalText}>
                  This will permanently delete all your recent searches.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowClearConfirm(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  floatingCircle1: {
    position: 'absolute',
    top: 100,
    left: 50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  floatingCircle2: {
    position: 'absolute',
    bottom: 200,
    right: 40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  floatingCircle3: {
    position: 'absolute',
    top: height * 0.6,
    left: width * 0.2,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  successContainer: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  successBlur: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  successOverlay: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  successText: {
    color: '#4ECDC4',
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