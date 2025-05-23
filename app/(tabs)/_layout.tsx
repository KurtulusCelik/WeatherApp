import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{

        tabBarActiveTintColor: '#FFFFFF',
        
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        
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
        name="explore"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={24} 
              color={color}  
            />
          ),
        }}
      />
    </Tabs>
  );
}
