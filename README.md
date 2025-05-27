# Weather App

## 🌤️ Description

A simple and elegant Weather App built with React Native and Expo. It allows users to search for current weather conditions and a 5-day forecast for cities worldwide. The app features a dynamic theme (dark/light mode) and a clean, user-friendly interface.

## ✨ Features

*   **Current Weather:** Display real-time temperature, condition, feels like, wind speed, humidity, visibility, and pressure.
*   **5-Day Forecast:** Show daily high/low temperatures and weather conditions for the next 5 days.
*   **City Search:** Search for any city globally.
*   **Search History:** Keeps a list of recent searches for quick access, with options to remove individual items or clear all history.
*   **Dynamic Theming:** Switch between dark and light themes.
*   **Temperature Units:** Toggle between Celsius and Fahrenheit.
*   **Caching:** Caches API responses locally to reduce API calls and improve performance.
*   **User-Friendly Error Handling:** Provides clear messages for invalid searches or network issues.

## 🛠️ Tech Stack

*   **React Native:** For building cross-platform mobile applications.
*   **Expo:** To streamline React Native development with tools and services.
*   **TypeScript:** For static typing and improved code quality.
*   **OpenWeatherMap API:** For fetching weather and forecast data.
*   **React Navigation (via Expo Router):** For screen navigation.
*   **AsyncStorage:** For local data persistence (search history, cached data).

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js:** (LTS version recommended)
*   **npm** or **yarn** (npm is included with Node.js)
*   **Expo CLI:** `npm install -g expo-cli`
*   **Git**

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Set up OpenWeatherMap API Key:**
    This application requires an API key from [OpenWeatherMap](https://openweathermap.org/api) to fetch weather data.

    *   Sign up for a free account at [OpenWeatherMap](https://home.openweathermap.org/users/sign_up) and get your API key.
    *   Once you have your API key, open the following files:
        *   `api/weather.ts`
        *   `api/forecast.ts`
    *   In both files, locate the `API_KEY` constant:
        ```typescript
        const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
        ```
    *   Replace `'YOUR_API_KEY_HERE'` with your actual OpenWeatherMap API key.

## 🚀 Running the App

Once the setup is complete, you can run the app using Expo CLI:

1.  **Start the development server:**
    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```
    This will open the Expo Developer Tools in your web browser.

2.  **Run on an emulator or physical device:**
    *   **iOS Simulator:** Press `i` in the terminal where the Expo server is running.
    *   **Android Emulator:** Press `a` in the terminal.
    *   **Physical Device (iOS or Android):** Install the "Expo Go" app on your device. Scan the QR code displayed in the terminal or Expo Developer Tools with the Expo Go app.
    *   **Web Browser:** Press `w` in the terminal. Note that some native functionalities might not be fully supported or may look different in the web version.

## 📁 Project Structure

Here's a brief overview of the key directories and files:

```
.expo/
├── app/                  # Main application screens and navigation (Expo Router file-based routing)
│   ├── (tabs)/           # Tab-based navigation layout and screens
│   │   ├── _layout.tsx   # Layout for the tabs
│   │   ├── index.tsx     # Main weather display screen
│   │   └── search.tsx    # Search screen
│   ├── _layout.tsx       # Root layout for the app
│   └── modal.tsx         # Example modal screen (if used)
├── api/                  # API fetching logic
│   ├── weather.ts        # Fetches current weather data
│   └── forecast.ts       # Fetches 5-day forecast data
├── assets/               # Static assets like images and fonts
│   ├── fonts/
│   └── images/
├── components/           # Reusable UI components
│   ├── HapticTab.tsx
│   └── ui/
│       └── TabBarBackground.tsx
├── constants/            # Global constants (e.g., Colors, Layout)
├── context/              # React Context API for global state management
│   └── ThemeContext.tsx  # Manages dark/light theme
├── .gitignore
├── App.tsx               # Main entry point (managed by Expo)
├── babel.config.js
├── package.json
├── README.md             # This file
└── tsconfig.json
```


##🤝 Team izadist Weather App
