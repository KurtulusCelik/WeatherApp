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

// Interface for search history items
interface SearchHistoryItem {
  id: string; // Unique ID for each history item
  cityName: string;
  country?: string; // Country is optional
  timestamp: number; // Timestamp of when the search was made
}

// Search screen component
export default function SearchScreen() {
  // State for the current search query input by the user
  const [searchQuery, setSearchQuery] = useState('');
  // State to store the list of recent search history items
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  // State to indicate if a search is currently in progress (e.g., fetching API data)
  const [isSearching, setIsSearching] = useState(false);
  // State to hold any error messages to be displayed to the user
  const [error, setError] = useState('');
  // State to control the visibility of the clear history confirmation dialog
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // Expo router instance for navigation
  const router = useRouter();
  // Theme context for dark mode
  const { isDark } = useTheme();

  // Function to get theme-specific colors
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

  const theme = getThemeColors(); // Apply current theme colors

  // Loads search history from AsyncStorage when the component mounts
  const loadSearchHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('searchHistory');
      if (saved) {
        const parsed: SearchHistoryItem[] = JSON.parse(saved);
        setSearchHistory(parsed);
      } else {
        setSearchHistory([]); // Initialize with empty array if no history saved
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      setSearchHistory([]); // Default to empty array on error
    }
  };

  // Saves the current search history to AsyncStorage
  const saveSearchHistory = async (newHistory: SearchHistoryItem[]) => {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory); // Update state after saving
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Adds a city to the search history
  // Prevents duplicates (case-insensitive), includes country, and limits to 10 items
  const addToSearchHistory = async (cityName: string, country?: string) => {
    try {
      const saved = await AsyncStorage.getItem('searchHistory');
      const currentHistory: SearchHistoryItem[] = saved ? JSON.parse(saved) : [];

      const newItem: SearchHistoryItem = {
        id: Date.now().toString(), // Use timestamp as a simple unique ID
        cityName,
        country,
        timestamp: Date.now(),
      };

      // Add new item, filter out any existing item with the same city name (case-insensitive)
      const updatedHistory = [
        newItem,
        ...currentHistory.filter(item => item.cityName.toLowerCase() !== cityName.toLowerCase())
      ].slice(0, 10); // Keep only the last 10 search items

      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory); // Update state
    } catch (error) {
      console.error('Failed to add to search history:', error);
    }
  };

  // Removes a specific item from the search history by its ID
  const removeFromHistory = async (id: string) => {
    try {
      const saved = await AsyncStorage.getItem('searchHistory');
      const currentHistory: SearchHistoryItem[] = saved ? JSON.parse(saved) : [];
      const updatedHistory = currentHistory.filter(item => item.id !== id);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory); // Update state
    } catch (error) {
      console.error('Failed to remove from search history:', error);
    }
  };

  // Sets state to show the clear history confirmation dialog
  const clearSearchHistory = () => {
    setShowClearConfirm(true);
  };

  // Clears all items from the search history and hides the confirmation dialog
  const confirmClearHistory = () => {
    saveSearchHistory([]); // Save an empty array to clear history
    setShowClearConfirm(false);
  };

  // Handles the search action when user submits a query
  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();

    // Client-side validation for numbers in city name
    if (/[0-9]/.test(trimmedQuery)) {
      setError('City name cannot contain numbers.\nPlease Try Again.');
      return;
    }

    // Client-side validation for disallowed special characters (allows letters, spaces, hyphens)
    if (/[^a-zA-Z\s-]/.test(trimmedQuery)) {
      setError('City name cannot contain special characters.\nPlease Try Again.');
      return;
    }

    // Validate minimum query length
    if (trimmedQuery.length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setIsSearching(true); // Indicate search is in progress
    setError(''); // Clear any previous errors

    try {
      // Fetch current weather and forecast data
      const {data} = await fetchWeather(trimmedQuery);
      const forecast = await fetchForecast(trimmedQuery);

      // Add successful search to history
      addToSearchHistory(trimmedQuery, data.country);
      setSearchQuery(''); // Clear the search input field
      Keyboard.dismiss(); // Dismiss the keyboard

      // Navigate to the home screen with weather and forecast data as params
      router.push({
        pathname: '/', // Navigate to home screen (index.tsx)
        params: {
          weather: JSON.stringify(data), // Pass weather data
          forecast: JSON.stringify(forecast), // Pass forecast data
        }
      });
    } catch (err: any) {
      // Error handling logic for API calls or other issues
      let message = 'An error occurred. Please try again.'; // Default user-friendly message

      if (err.response && err.response.data && typeof err.response.data.message === 'string' && err.response.data.message.trim()) {
        // Use message from API response data if available and not empty
        message = err.response.data.message.trim();
      } else if (err.response && err.response.status === 404) {
        // If it's a 404, it's likely 'not found' type error, e.g. city not found
        message = 'The requested city could not be found. Please check the name and try again.';
      } else if (typeof err.message === 'string' && err.message.trim()) {
        const trimmedErrorMessage = err.message.trim();
        // Check for common, less user-friendly network error messages
        if (trimmedErrorMessage.toLowerCase().includes('network request failed') || 
            trimmedErrorMessage.toLowerCase().includes('network error')) {
          message = 'Network connection issue. Please check your internet and try again.';
        } else {
          // Use the error's message property if other specific conditions aren't met
          message = trimmedErrorMessage;
        }
      }
      
      // Fallback to the default if somehow message ended up empty
      if (!message.trim()) {
        message = 'An error occurred. Please try again.';
      }

      // Capitalize the first letter of the error message
      if (message.length > 0) {
        message = message.charAt(0).toUpperCase() + message.slice(1);
      }
      
      // Ensure our custom friendly messages end with a period if they don't have other punctuation.
      const customMessages = [
          'An error occurred. Please try again', // Check without period for startsWith
          'Network connection issue. Please check your internet and try again',
          'The requested city could not be found. Please check the name and try again'
      ];

      if (customMessages.some(cm => message.startsWith(cm))) {
          if (!message.endsWith('.') && !message.endsWith('!') && !message.endsWith('?')) {
            message += '.';
          }
      }

      setError(message); // Set the error message to be displayed
    } finally {
      setIsSearching(false); // Indicate search has finished
    }
  };

  // Handles pressing a search history item, initiating a new search with its city name
  const handleHistoryItemPress = (item: SearchHistoryItem) => {
    handleSearch(item.cityName);
  };

  // Formats a timestamp into a human-readable relative time string (e.g., "2h ago", "1d ago")
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now'; // For very recent items
  };

  // Load search history when the component mounts
  useEffect(() => {
    loadSearchHistory();
  }, []); // Empty dependency array means this runs once on mount

  // JSX for rendering a single item in the search history list
  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemPress(item)} // Search again when history item is pressed
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
            {/* Display formatted timestamp for the search */}
            <Text style={styles.historyItemTime}>{formatTimestamp(item.timestamp)}</Text>
            {/* Button to remove this item from history */}
            <TouchableOpacity
              onPress={() => removeFromHistory(item.id)} // Action to remove item
              style={styles.removeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increases touchable area
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
      {/* Set status bar style based on theme */}
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={theme.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header section */}
        <View style={styles.header}>
          {/* Back button (functionality can be added if needed) */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : null}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Search Location</Text>
        </View>

        {/* Search input section */}
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
                  if (error) setError(''); // Clear error when user starts typing again
                }}
                onSubmitEditing={() => handleSearch(searchQuery)} // Handle search on keyboard submit
                returnKeyType="search" // Set keyboard return key to "search"
                autoCapitalize="words" // Capitalize words automatically
                autoCorrect={false} // Disable auto-correct
              />
              {/* Show loading indicator or search button */}
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  {/* Simple dot loading animation */}
                  <View style={[styles.loadingDot, { backgroundColor: theme.icon }]} />
                  <View style={[styles.loadingDot, { backgroundColor: theme.icon }]} />
                  <View style={[styles.loadingDot, { backgroundColor: theme.icon }]} />
                </View>
              ) : (
                searchQuery.length > 0 && (
                  // Search button (send icon)
                  <TouchableOpacity
                    onPress={() => handleSearch(searchQuery)} // Handle search on button press
                    style={styles.searchButton}
                  >
                    <Ionicons name="send" size={20} color={theme.icon} />
                  </TouchableOpacity>
                )
              )}
            </View>
          </BlurView>
        </View>

        {/* Display error message if any */}
        {error ? (
          <BlurView intensity={15} style={[styles.errorContainer, { backgroundColor: theme.card }]}>
            <View style={styles.errorOverlay}>
              <Ionicons name="warning" size={20} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </BlurView>
        ) : null}

        {/* Search History section */}
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>Recent Searches</Text>
            {/* Show "Clear All" button only if there's history */}
            {searchHistory.length > 0 && (
              <TouchableOpacity
                onPress={clearSearchHistory} // Action to initiate clearing history
                style={[styles.clearButton, { backgroundColor: theme.card }]}
              >
                <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Display message if no search history, otherwise list history items */}
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
              data={searchHistory} // Data source for the list
              renderItem={({ item }) => (
                // Using the previously defined renderHistoryItem function for each item
                // Note: The original renderHistoryItem was defined outside but this structure is common
                // For simplicity here, directly embedding the logic or calling the standalone function
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
              keyExtractor={(item) => item.id} // Unique key for each list item
              showsVerticalScrollIndicator={false} // Hide scrollbar
              contentContainerStyle={styles.historyList}
            />
          )}
        </View>

        {/* Clear Confirmation Modal (shown when showClearConfirm is true) */}
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
                  {/* Cancel button for the confirmation dialog */}
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.card }]}
                    onPress={() => setShowClearConfirm(false)} // Hide dialog on cancel
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  {/* Confirm button for the confirmation dialog */}
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmClearHistory} // Action to confirm clearing history
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