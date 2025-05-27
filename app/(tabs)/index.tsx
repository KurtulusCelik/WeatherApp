import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Main screen to display weather information
export default function HomeScreen() {
  // State for temperature unit (Celsius or Fahrenheit)
  const [isCelsius, setIsCelsius] = useState(true);
  // Access theme context for dark mode and toggling
  const { isDark, toggleTheme } = useTheme();

  // Define the structure for current weather data
  type WeatherData = {
    city: string;
    country: string;
    temperature: number;
    condition: string;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    visibility: number;
    pressure: number;
  };

  // Get weather data passed as a route parameter
  const { weather } = useLocalSearchParams();
  // State to hold the parsed weather data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Define the structure for a single forecast item
  type ForecastItem = {
    date: string;
    min: number;
    max: number;
    condition: string;
    icon: string; // Note: Icon was in type but not used in original forecast data processing for display
  };

  // State to hold the parsed forecast data
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);

  // Get forecast data passed as a route parameter
  const { forecast } = useLocalSearchParams();

  // Effect to parse forecast data when it changes
  useEffect(() => {
    if (forecast) {
      try {
        // Parse forecast data (can be string or already an object)
        const parsed = typeof forecast === 'string' ? JSON.parse(forecast) : forecast;
        setForecastData(parsed);
      } catch (e) {
        console.error('Invalid forecast format', e);
      }
    }
  }, [forecast]);

  // Effect to parse current weather data when it changes
  useEffect(() => {
    if (weather) {
      try {
        // Parse weather data (can be string or already an object)
        const parsed = typeof weather === 'string' ? JSON.parse(weather) : weather;
        setWeatherData(parsed);
      } catch (e) {
        console.error('Invalid weather data format', e);
      }
    }
  }, [weather]);

  // Converts Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius: number): number => {
    return Math.round((celsius * 9/5) + 32);
  };

  // Formats temperature display based on the selected unit (C or F)
  const formatTemperature = (celsiusValue: number): string => {
    if (!isCelsius) {
      return `${celsiusToFahrenheit(celsiusValue)}°`;
    }
    return `${(celsiusValue)}°`;
  };

  // Toggles the temperature unit between Celsius and Fahrenheit
  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  // Gets theme-specific colors for UI elements
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

  const theme = getThemeColors(); // Apply theme colors
  
  // Get current time and date for display
  const currentTime = new Date();
  
  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  // Use forecastData directly for the weekly display
  const weeklyData = forecastData;

  // Returns an Ionicons component based on the weather condition string
  const getWeatherIcon = (condition: string | undefined, size: number = 24) => {
    const iconColor = theme.icon;
    // Use a default condition like 'clear' if the provided condition is undefined or empty
    const currentCondition = condition?.toLowerCase() || 'clear'; 
    switch (currentCondition) {
      case 'clear':
        return <Ionicons name="sunny" size={size} color={iconColor} />;
      case 'clouds':
        return <Ionicons name="cloud" size={size} color={iconColor} />;
      case 'rain':
      case 'drizzle':
        return <Ionicons name="rainy" size={size} color={iconColor} />;
      case 'thunderstorm':
        return <Ionicons name="thunderstorm" size={size} color={iconColor} />;
      case 'snow':
        return <Ionicons name="snow" size={size} color={iconColor} />;
      case 'mist':
      case 'fog':
        return <Ionicons name="partly-sunny" size={size} color={iconColor} />;
      default:
        // Default icon if condition is unknown or not handled
        return <Ionicons name="sunny" size={size} color={iconColor} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background[0] }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={theme.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={[styles.title, { color: theme.text }]}>izadist Weather App</Text>
              <TouchableOpacity 
                style={styles.themeToggle}
                onPress={toggleTheme}
              >
                <Ionicons 
                  name={isDark ? "sunny" : "moon"} 
                  size={24} 
                  color={theme.text} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.dateTimeContainer}>
              <Text style={[styles.dateTime, { color: theme.textSecondary }]}>{dateString}</Text>
              <Text style={[styles.time, { color: theme.textSecondary }]}>{timeString}</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={30} color={theme.icon} />
            <Text style={[styles.location, { color: theme.text }]}>
              {weatherData?.city}, {weatherData?.country}
            </Text>
          </View>

          <BlurView intensity={20} style={[styles.mainWeatherCard, { backgroundColor: theme.card }]}>
            <View style={styles.cardOverlay}>
              <TouchableOpacity 
                style={styles.temperatureToggle}
                onPress={toggleTemperatureUnit}
                activeOpacity={0.7}
              >
                <BlurView intensity={15} style={[styles.toggleBlur, { backgroundColor: theme.card }]}>
                  <Text style={[styles.toggleText, !isCelsius && styles.activeToggle, { color: theme.text }]}>°F</Text>
                  <Text style={[styles.toggleSeparator, { color: theme.textSecondary }]}>|</Text>
                  <Text style={[styles.toggleText, isCelsius && styles.activeToggle, { color: theme.text }]}>°C</Text>
                </BlurView>
              </TouchableOpacity>

              <View style={styles.temperatureContainer}>
                <Text style={[styles.temperature, { color: theme.text }]}>
                  {formatTemperature(weatherData?.temperature ?? 0)}
                </Text>
                <View style={styles.weatherIcon}>
                  {getWeatherIcon(weatherData?.condition, 80)}
                </View>
              </View>
              
              <Text style={[styles.condition, { color: theme.text }]}>{weatherData?.condition}</Text>
              <Text style={[styles.feelsLike, { color: theme.textSecondary }]}>
                Feels like {formatTemperature(weatherData?.feelsLike ?? 0)}
              </Text>

              <View style={styles.detailsGrid}>
                <BlurView intensity={10} style={[styles.detailItem, { backgroundColor: theme.card }]}>
                  <View style={styles.detailContent}>
                    <Ionicons name="flag" size={20} color={theme.icon} />
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>WIND</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{weatherData?.windSpeed ?? 0} m/s</Text>
                  </View>
                </BlurView>
                <BlurView intensity={10} style={[styles.detailItem, { backgroundColor: theme.card }]}>
                  <View style={styles.detailContent}>
                    <Ionicons name="water" size={20} color={theme.icon} />
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>HUMIDITY</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{weatherData?.humidity ?? 0}%</Text>
                  </View>
                </BlurView>
                <BlurView intensity={10} style={[styles.detailItem, { backgroundColor: theme.card }]}>
                  <View style={styles.detailContent}>
                    <Ionicons name="eye" size={20} color={theme.icon} />
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>VISIBILITY</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{weatherData?.visibility ?? 0} m</Text>
                  </View>
                </BlurView>
                <BlurView intensity={10} style={[styles.detailItem, { backgroundColor: theme.card }]}>
                  <View style={styles.detailContent}>
                    <Ionicons name="speedometer" size={20} color={theme.icon} />
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>PRESSURE</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{weatherData?.pressure ?? 0} hPa</Text>
                  </View>
                </BlurView>
              </View>
            </View>
          </BlurView>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>5-Day Forecast</Text>
              <View style={styles.tempLabels}>
                <Text style={[styles.tempLabel, { color: theme.textSecondary }]}>High</Text>
                <Text style={[styles.tempLabel, { color: theme.textSecondary }]}>Low</Text>
              </View>
            </View>
            <BlurView intensity={20} style={[styles.weeklyContainer, { backgroundColor: theme.card }]}>
              <View style={styles.weeklyOverlay}>
                {weeklyData.map((day, index) => (
                  <View key={index} style={[styles.weeklyItem, { borderBottomColor: theme.textSecondary }]}>
                    <Text style={[styles.weeklyDay, { color: theme.text }]}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                    {getWeatherIcon(day.condition, 24)}
                    <Text style={[styles.weeklyCondition, { color: theme.textSecondary }]}>{day.condition}</Text>
                    <View style={styles.weeklyTemps}>
                      <Text style={[styles.weeklyHigh, { color: theme.text }]}>{formatTemperature(day.max)}</Text>
                      <Text style={[styles.weeklyLow, { color: theme.textSecondary }]}>{formatTemperature(day.min)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: Platform.select({
      ios: 70,
      default: 0,
    }),
  },
  header: {
    marginTop: 60,
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'PoetsenOne-Regular',
  },
  dateTimeContainer: {
    position: 'absolute',
    top: 60,
    right: 0,
  },
  temperatureToggle: {
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  toggleBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeToggle: {
    opacity: 1,
  },
  toggleSeparator: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  dateTime: {
    fontSize: 16,
  },
  time: {
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  location: {
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 5,
  },
  mainWeatherCard: {
    borderRadius: 20,
    marginBottom: 30,
    overflow: 'hidden',
  },
  cardOverlay: {
    padding: 20,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '200',
  },
  weatherIcon: {
    alignItems: 'center',
  },
  condition: {
    fontSize: 24,
    marginBottom: 5,
  },
  feelsLike: {
    fontSize: 16,
    marginBottom: 30,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  detailContent: {
    padding: 15,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tempLabels: {
    flexDirection: 'row',
    gap: 10,
    marginRight: 17,
    marginTop: 10,
  },
  tempLabel: {
    fontSize: 14,
  },
  weeklyContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  weeklyOverlay: {
    padding: 5,
  },
  weeklyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    minHeight: 50,
  },
  weeklyDay: {
    width: 50,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 15,
  },
  weeklyCondition: {
    flex: 1,
    fontSize: 14,
    marginLeft: 15,
  },
  weeklyTemps: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  weeklyHigh: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  weeklyLow: {
    fontSize: 16,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
  },
});
