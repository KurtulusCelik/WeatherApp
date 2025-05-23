import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {

  const [isCelsius, setIsCelsius] = useState(false);
  
  // Animation values for floating circles and pulse effects
  const pulse1 = useRef(new Animated.Value(0.8)).current; 
  const pulse2 = useRef(new Animated.Value(0.6)).current; 
  const pulse3 = useRef(new Animated.Value(0.9)).current; 
  const float1 = useRef(new Animated.Value(0)).current;  
  const float2 = useRef(new Animated.Value(0)).current;  

  // Temperature conversion and formatting functions
  const fahrenheitToCelsius = (fahrenheit: number): number => {
    return Math.round((fahrenheit - 32) * 5/9);
  };

  const formatTemperature = (fahrenheitValue: number): string => {
    if (isCelsius) {
      return `${fahrenheitToCelsius(fahrenheitValue)}°`;
    }
    return `${fahrenheitValue}°`;
  };

  const getTemperatureUnit = (): string => {
    return isCelsius ? 'C' : 'F';
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };
  
  useEffect(() => {
    // Create continuous pulse animation for background elements
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

    // Create floating animation for background elements
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
    // Returns different gradient colors based on time of day
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
  
  const weeklyData = [
    { day: 'Today', icon: 'cloud', condition: 'Partly Cloudy', precipitation: '10%', highF: 75, lowF: 58 },
    { day: 'Tue', icon: 'sunny', condition: 'Sunny', precipitation: '0%', highF: 78, lowF: 62 },
    { day: 'Wed', icon: 'rainy', condition: 'Rainy', precipitation: '80%', highF: 73, lowF: 59 },
    { day: 'Thu', icon: 'cloud', condition: 'Cloudy', precipitation: '20%', highF: 71, lowF: 57 },
    { day: 'Fri', icon: 'sunny', condition: 'Sunny', precipitation: '5%', highF: 76, lowF: 61 },
  ];

  const getWeatherIcon = (iconType: string, size: number = 24) => {
    // Maps weather conditions to Ionicons
    const iconColor = "rgba(255,255,255,0.9)"; 
    
    switch (iconType) {
      case 'sunny':
        return <Ionicons name="sunny" size={size} color={iconColor} />;
      case 'cloud':
        return <Ionicons name="cloud" size={size} color={iconColor} />;
      case 'rainy':
        return <Ionicons name="rainy" size={size} color={iconColor} />;
      default:
        return <Ionicons name="sunny" size={size} color={iconColor} />;
    }
  };

  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Dynamic gradient background that changes with time of day */}
      <LinearGradient
        colors={getDynamicGradient() as any}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated floating circles in the background */}
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

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>izadist Weather App</Text>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTime}>{dateString}</Text>
              <Text style={styles.time}>{timeString}</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={30} color="rgba(255,255,255,0.8)" />
            <Text style={styles.location}>Izmir, Turkey</Text>
          </View>

          {/* Main weather information card with blur effect */}
          <BlurView intensity={20} style={styles.mainWeatherCard}>
            <View style={styles.cardOverlay}>
              <TouchableOpacity 
                style={styles.temperatureToggle}
                onPress={toggleTemperatureUnit}
                activeOpacity={0.7}
              >
                <BlurView intensity={15} style={styles.toggleBlur}>
                  <Text style={[styles.toggleText, !isCelsius && styles.activeToggle]}>°F</Text>
                  <Text style={styles.toggleSeparator}>|</Text>
                  <Text style={[styles.toggleText, isCelsius && styles.activeToggle]}>°C</Text>
                </BlurView>
              </TouchableOpacity>

              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>{formatTemperature(72)}</Text>
                <View style={styles.weatherIcon}>
                  <Ionicons name="cloud" size={80} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
              
              <Text style={styles.condition}>Partly Cloudy</Text>
              <Text style={styles.feelsLike}>Feels like {formatTemperature(75)}</Text>

              {/* Weather details grid showing wind, humidity, etc. */}
              <View style={styles.detailsGrid}>
                <BlurView intensity={10} style={styles.detailItem}>
                  <View style={styles.detailContent}>
                    <Ionicons name="flag" size={20} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.detailLabel}>WIND</Text>
                    <Text style={styles.detailValue}>12 mph</Text>
                  </View>
                </BlurView>
                <BlurView intensity={10} style={styles.detailItem}>
                  <View style={styles.detailContent}>
                    <Ionicons name="water" size={20} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.detailLabel}>HUMIDITY</Text>
                    <Text style={styles.detailValue}>65%</Text>
                  </View>
                </BlurView>
                <BlurView intensity={10} style={styles.detailItem}>
                  <View style={styles.detailContent}>
                    <Ionicons name="eye" size={20} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.detailLabel}>VISIBILITY</Text>
                    <Text style={styles.detailValue}>10 mi</Text>
                  </View>
                </BlurView>
                <BlurView intensity={10} style={styles.detailItem}>
                  <View style={styles.detailContent}>
                    <Ionicons name="sunny" size={20} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.detailLabel}>UV INDEX</Text>
                    <Text style={styles.detailValue}>6</Text>
                  </View>
                </BlurView>
              </View>
            </View>
          </BlurView>

          {/* 5-day weather forecast section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>5-Day Forecast</Text>
            <BlurView intensity={20} style={styles.weeklyContainer}>
              <View style={styles.weeklyOverlay}>
                {weeklyData.map((day, index) => (
                  <View key={index} style={styles.weeklyItem}>
                    <Text style={styles.weeklyDay}>{day.day}</Text>
                    {getWeatherIcon(day.icon, 24)}
                    <Text style={styles.weeklyCondition}>{day.condition}</Text>
                    <Text style={styles.weeklyPrecipitation}>{day.precipitation}</Text>
                    <View style={styles.weeklyTemps}>
                      <Text style={styles.weeklyHigh}>{formatTemperature(day.highF)}</Text>
                      <Text style={styles.weeklyLow}>{formatTemperature(day.lowF)}</Text>
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
    top: 80,
    left: 40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  floatingCircle2: {
    position: 'absolute',
    bottom: 150,
    right: 60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  floatingCircle3: {
    position: 'absolute',
    top: height * 0.5,
    left: width * 0.3,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 10,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
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
    backgroundColor: 'rgba(255,255,255)',
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  activeToggle: {
    color: 'rgba(255,255,255,1)',
  },
  toggleSeparator: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 8,
  },
  dateTime: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  time: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  location: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 5,
  },
  mainWeatherCard: {
    borderRadius: 20,
    marginBottom: 30,
    overflow: 'hidden',
  },
  cardOverlay: {
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: 'white',
  },
  weatherIcon: {
    alignItems: 'center',
  },
  condition: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  feelsLike: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  weeklyContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  weeklyOverlay: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 5,
  },
  weeklyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    minHeight: 50,
  },
  weeklyDay: {
    width: 50,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  weeklyCondition: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 15,
  },
  weeklyPrecipitation: {
    width: 40,
    fontSize: 14,
    color: '#87CEEB',
    textAlign: 'center',
  },
  weeklyTemps: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  weeklyHigh: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginRight: 10,
  },
  weeklyLow: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
});
