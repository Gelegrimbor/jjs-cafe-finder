# ☕ Cafe Finder

A web application that helps you find nearby cafes using Google Maps API and geolocation.

## 🚀 Features

- 📍 Find cafes near your current location
- 🗺️ Interactive Google Maps interface
- ⭐ View cafe ratings and addresses
- 🔍 Smart filtering to show only actual cafes
- 📱 Responsive design

## 🛠️ Technologies

- HTML5, CSS3, JavaScript
- Google Maps JavaScript API
- Google Places API

## 📦 Setup

1. Clone this repository:
```bash
git clone https://github.com/Gelegrimbor/cafe-finder.git
cd cafe-finder
```

2. Copy the config example:
```bash
cp config.example.js config.js
```

3. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)

4. Add your key to `config.js`:
```javascript
const CONFIG = {
    GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE'
};
```

5. Open `index.html` in a browser or run a local server

## 👨‍💻 Author

Joshua James Scott
- GitHub: [@Gelegrimbor](https://github.com/Gelegrimbor)
