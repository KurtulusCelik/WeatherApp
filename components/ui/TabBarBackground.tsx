import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabBarBackground() {
  const { isDark } = useTheme();
  
  const getBackgroundColor = (): string => {
    if (isDark) {
      return '#1a1a1a'; 
    }
    return '#ffffff'; 
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: getBackgroundColor() },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
