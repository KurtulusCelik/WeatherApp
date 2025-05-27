import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '../../context/ThemeContext';

// Layout component for the main tabs navigation
export default function TabLayout() {
  // Get current theme (dark/light) to set tab colors
  const { isDark } = useTheme();

  // Define active and inactive tab icon/label colors based on the current theme
  const activeColor = isDark ? '#FFFFFF' : '#000000';
  const inactiveColor = isDark ? '#FFFFFF' : '#555555'; // A slightly dimmer color for inactive tabs in light mode

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,    // Color for the active tab's icon and label
        tabBarInactiveTintColor: inactiveColor,  // Color for inactive tabs' icons and labels
        headerShown: false,                    // Hide the default header for all screens in this tab navigator
        
        tabBarButton: HapticTab, // Use a custom component for tab buttons to add haptic feedback
        
        tabBarBackground: TabBarBackground, // Use a custom component for the tab bar background (e.g., with blur)
        
        // Platform-specific styling for the tab bar
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute', // Makes the tab bar float over content on iOS
            backgroundColor: 'rgba(74, 0, 224, 0.3)', // Semi-transparent background color
            borderTopWidth: 0, // Remove the default top border
            elevation: 0, // Remove shadow on Android (though this is in iOS block)
            shadowOpacity: 0, // Remove shadow on iOS
            height: 85, // Custom height for the tab bar
            paddingBottom: 25, // Padding at the bottom, often for iPhone X-style home indicators
            paddingTop: 10, // Padding at the top
          },
          default: { // Styles for Android and other platforms
            backgroundColor: 'rgba(74, 0, 224, 0.3)', // Semi-transparent background
            borderTopWidth: 0, // Remove default top border
            elevation: 0, // Remove shadow on Android
            height: 70, // Custom height
            paddingBottom: 10, // Bottom padding
            paddingTop: 10, // Top padding
          },
        }),

        // Styling for the tab labels
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',    
          marginTop: 2, // Space between icon and label
        },
      }}>

      {/* Configuration for the 'Weather' tab (maps to index.tsx) */}
      <Tabs.Screen
        name="index" // This is the route name, corresponds to 'index.tsx' file
        options={{
          title: 'Weather', // Title shown in the tab bar (and header if it were visible)
          tabBarIcon: ({ color, focused }) => (
            // Function to render the tab icon
            // 'color' is provided by Tabs based on active/inactive state
            // 'focused' is true if the tab is currently active
            <Ionicons 
              name={focused ? 'cloud' : 'cloud-outline'} // Different icon for focused state
              size={24} 
              color={color}  
            />
          ),
        }}
      />
      
      {/* Configuration for the 'Search' tab (maps to search.tsx) */}
      <Tabs.Screen
        name="search" // This is the route name, corresponds to 'search.tsx' file
        options={{
          title: 'Search', // Title shown in the tab bar
          tabBarIcon: ({ color, focused }) => (
            // Icon for the search tab
            // Here, 'focused' isn't used to change the icon, but 'color' will still apply
            <Ionicons 
              name={'search'} 
              size={24} 
              color={color}  
            />
          ),
        }}
      />
    </Tabs>
  );
}
