import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { isDark } = useTheme();

  const activeColor = isDark ? '#FFFFFF' : '#000000';
  const inactiveColor = isDark ? '#FFFFFF' : '#555555';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        
        tabBarButton: HapticTab,
        
        tabBarBackground: TabBarBackground,
        
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',                    
            backgroundColor: 'rgba(74, 0, 224, 0.3)', 
            borderTopWidth: 0,                       
            elevation: 0,                            
            shadowOpacity: 0,                        
            height: 85,                              
            paddingBottom: 25,                       
            paddingTop: 10,                          
          },
          default: {
            backgroundColor: 'rgba(74, 0, 224, 0.3)', 
            borderTopWidth: 0,                       
            elevation: 0,                            
            height: 70,                              
            paddingBottom: 10,                       
            paddingTop: 10,                          
          },
        }),

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',    
          marginTop: 2,          
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Weather',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'cloud' : 'cloud-outline'} 
              size={24} 
              color={color}  
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
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
