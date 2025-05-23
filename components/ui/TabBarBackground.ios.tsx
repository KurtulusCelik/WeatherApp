import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export default function BlurTabBarBackground() {
  
  const getDynamicGradient = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      // Morning (6 AM - 12 PM): Warm sunrise colors with higher opacity
      return ['rgba(255, 154, 86, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(255, 107, 157, 0.7)'];
    } else if (hour >= 12 && hour < 18) {
      // Afternoon (12 PM - 6 PM): Bright sky colors with higher opacity
      return ['rgba(37, 99, 235, 0.7)', 'rgba(56, 189, 248, 0.7)', 'rgba(252, 211, 77, 0.7)'];
    } else if (hour >= 18 && hour < 21) {
      // Evening (6 PM - 9 PM): Sunset colors with higher opacity
      return ['rgba(250, 112, 154, 0.7)', 'rgba(254, 225, 64, 0.7)', 'rgba(250, 139, 255, 0.7)'];
    } else if (hour >= 21 || hour < 6) {
      // Night (9 PM - 6 AM): Deep blue to purple with higher opacity
      return ['rgba(30, 58, 138, 0.7)', 'rgba(49, 46, 129, 0.7)', 'rgba(88, 28, 135, 0.7)'];
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        tint="systemUltraThinMaterialDark"
        intensity={20}
        style={StyleSheet.absoluteFill}
      />
      
      <LinearGradient
        colors={getDynamicGradient() as any}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </View>
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
