const express = require('express');
const router = express.Router();
const miniAppController = require('../controllers/miniAppController');
const { protect: auth } = require('../middleware/auth');
const axios = require('axios');
const weatherService = require('../services/weatherService');
const { isEnvKeyMissing } = require('../utils/apiKeyUtils');

// ============ Mini-App Data Endpoints ============

// GET /api/miniapps/weather?city=London
router.get('/weather', async (req, res) => {
  const city = (req.query.city || 'New York').trim();

  const cityCoords = {
    'New York':  { lat: 40.7128,  lon: -74.006  },
    'London':    { lat: 51.5074,  lon:  -0.1278  },
    'Tokyo':     { lat: 35.6762,  lon: 139.6503  },
    'Sydney':    { lat: -33.8688, lon: 151.2093  },
    'Paris':     { lat: 48.8566,  lon:   2.3522  },
    'Dubai':     { lat: 25.2048,  lon:  55.2708  },
    'Madrid':    { lat: 40.4168,  lon:  -3.7038  },
    'Mexico City':{ lat: 19.4326, lon: -99.1332  },
    'São Paulo': { lat: -23.5505, lon: -46.6333  },
    'Beijing':   { lat: 39.9042,  lon: 116.4074  },
  };

  const conditionIconMap = {
    clear:   { icon: '☀️',  label: 'Clear'        },
    cloudy:  { icon: '⛅',  label: 'Cloudy'       },
    rainy:   { icon: '🌧',  label: 'Rainy'        },
    stormy:  { icon: '⛈',  label: 'Stormy'       },
    snowy:   { icon: '❄️',  label: 'Snowy'        },
    foggy:   { icon: '🌫',  label: 'Foggy'        },
    dusty:   { icon: '🌪',  label: 'Dusty'        },
    windy:   { icon: '💨',  label: 'Windy'        },
  };

  // Mock data by city (used when no API key is set)
  const mockData = {
    'New York':   { temp: 72, condition: 'Partly Cloudy', icon: '⛅', humidity: 65, windSpeed: 12 },
    'London':     { temp: 59, condition: 'Rainy',         icon: '🌧', humidity: 80, windSpeed: 18 },
    'Tokyo':      { temp: 68, condition: 'Clear',         icon: '☀️', humidity: 50, windSpeed: 8  },
    'Sydney':     { temp: 77, condition: 'Sunny',         icon: '🌞', humidity: 40, windSpeed: 10 },
    'Paris':      { temp: 64, condition: 'Cloudy',        icon: '☁️', humidity: 70, windSpeed: 15 },
    'Dubai':      { temp: 104, condition: 'Hot & Sunny',  icon: '🔥', humidity: 25, windSpeed: 5  },
    'Madrid':     { temp: 75, condition: 'Clear',         icon: '☀️', humidity: 35, windSpeed: 9  },
    'Mexico City':{ temp: 70, condition: 'Partly Cloudy', icon: '⛅', humidity: 55, windSpeed: 7  },
    'São Paulo':  { temp: 82, condition: 'Cloudy',        icon: '☁️', humidity: 72, windSpeed: 11 },
    'Beijing':    { temp: 61, condition: 'Hazy',          icon: '🌫', humidity: 60, windSpeed: 14 },
  };

  try {
    const apiKeyMissing = isEnvKeyMissing(process.env.OPENWEATHER_API_KEY || '');

    if (apiKeyMissing) {
      const cityKey = Object.keys(mockData).find(
        k => k.toLowerCase() === city.toLowerCase()
      );

      if (cityKey) {
        const d = mockData[cityKey];
        return res.json({
          city: cityKey,
          temperature: d.temp,
          temperatureC: Math.round((d.temp - 32) * 5 / 9),
          description: d.condition,
          icon: d.icon,
          humidity: d.humidity,
          windSpeed: d.windSpeed,
          condition: d.condition,
          mock: true
        });
      }

      // Unknown city in mock mode — return generic mock
      return res.json({
        city,
        temperature: 70,
        temperatureC: 21,
        description: 'Partly Cloudy',
        icon: '⛅',
        humidity: 60,
        windSpeed: 10,
        condition: 'Partly Cloudy',
        mock: true
      });
    }

    // Real API call via weatherService (needs coordinates)
    const cityKey = Object.keys(cityCoords).find(
      k => k.toLowerCase() === city.toLowerCase()
    );

    let lat, lon;
    if (cityKey) {
      ({ lat, lon } = cityCoords[cityKey]);
    } else {
      // Geocode via OpenWeatherMap Geo API
      const geoResp = await axios.get(
        'http://api.openweathermap.org/geo/1.0/direct',
        { params: { q: city, limit: 1, appid: process.env.OPENWEATHER_API_KEY }, timeout: 5000 }
      );
      if (!geoResp.data || geoResp.data.length === 0) {
        return res.status(404).json({ error: 'City not found' });
      }
      lat = geoResp.data[0].lat;
      lon = geoResp.data[0].lon;
    }

    const data = await weatherService.getCurrentWeather(lat, lon);
    const mapEntry = conditionIconMap[data.condition] || { icon: '🌡', label: data.condition };
    const tempF = Math.round(data.temperature * 9 / 5 + 32);

    return res.json({
      city: cityKey || city,
      temperature: tempF,
      temperatureC: Math.round(data.temperature),
      description: data.description,
      icon: mapEntry.icon,
      humidity: data.humidity,
      windSpeed: Math.round(data.windSpeed * 2.237), // m/s → mph
      condition: mapEntry.label,
      mock: false
    });

  } catch (err) {
    console.error('Weather endpoint error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/miniapps/stocks?symbols=AAPL,GOOGL,TSLA
router.get('/stocks', async (req, res) => {
  const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA'];
  const symbolsParam = req.query.symbols;
  const symbols = symbolsParam
    ? symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    : DEFAULT_SYMBOLS;

  const COMPANY_NAMES = {
    AAPL:  'Apple Inc.',       GOOGL: 'Alphabet Inc.',
    MSFT:  'Microsoft Corp.',  AMZN:  'Amazon.com Inc.',
    TSLA:  'Tesla Inc.',       META:  'Meta Platforms',
    NFLX:  'Netflix Inc.',     NVDA:  'NVIDIA Corp.',
  };

  const SECTORS = {
    AAPL:  'Technology',  GOOGL: 'Technology',
    MSFT:  'Technology',  AMZN:  'Consumer',
    TSLA:  'Automotive',  META:  'Technology',
    NFLX:  'Entertainment', NVDA: 'Technology',
  };

  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
          const response = await axios.get(url, {
            timeout: 8000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          const result = response.data?.chart?.result?.[0];
          if (!result) throw new Error('No data');

          const meta = result.meta;
          const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
          const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
          const change = parseFloat((price - prevClose).toFixed(2));
          const changePercent = prevClose !== 0
            ? parseFloat(((change / prevClose) * 100).toFixed(2))
            : 0;
          const volume = meta.regularMarketVolume ?? 0;

          return {
            symbol,
            name: COMPANY_NAMES[symbol] || symbol,
            price: parseFloat(price.toFixed(2)),
            change,
            changePercent,
            volume,
            sector: SECTORS[symbol] || 'Unknown',
            mock: false
          };
        } catch (err) {
          console.warn(`Yahoo Finance error for ${symbol}:`, err.message);
          // Fallback mock for this symbol
          const MOCK_PRICES = {
            AAPL: 178.50, GOOGL: 125.30, MSFT: 380.75, AMZN: 175.85,
            TSLA: 245.30, META: 310.50, NFLX: 420.60, NVDA: 875.30,
          };
          const mockPrice = MOCK_PRICES[symbol] || 100.00;
          return {
            symbol,
            name: COMPANY_NAMES[symbol] || symbol,
            price: mockPrice,
            change: 0,
            changePercent: 0,
            volume: 0,
            sector: SECTORS[symbol] || 'Unknown',
            mock: true
          };
        }
      })
    );

    return res.json(results);
  } catch (err) {
    console.error('Stocks endpoint error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// ============ Public Routes ============

// Get all available mini-apps
router.get('/', miniAppController.getAllApps);

// Get mini-apps by category
router.get('/category/:category', miniAppController.getAppsByCategory);

// Get marketplace with pagination and filtering
router.get('/marketplace', miniAppController.getMarketplace);

// Get available categories
router.get('/categories', miniAppController.getCategories);

// Get specific app details
router.get('/app/:appId', miniAppController.getAppDetails);

// Get app statistics
router.get('/stats/:appId', miniAppController.getAppStats);

// Get app ratings/reviews
router.get('/ratings/:appId', miniAppController.getAppRatings);

// Search mini-apps
router.get('/search', miniAppController.searchApps);

// ============ Protected Routes (require authentication) ============

// Create new instance
router.post('/instance/create', auth, miniAppController.createInstance);

// Get user's active instances
router.get('/instances', auth, miniAppController.getUserInstances);

// Get user's instance history
router.get('/history', auth, miniAppController.getUserHistory);

// Get specific instance details
router.get('/instance/:instanceId', auth, miniAppController.getInstanceDetails);

// Update instance status
router.put('/instance/:instanceId/status', auth, miniAppController.updateInstanceStatus);

// Execute command in instance
router.post('/instance/:instanceId/execute', auth, miniAppController.executeCommand);

// Save user data in instance
router.post('/instance/:instanceId/save', auth, miniAppController.saveInstanceData);

// Close instance
router.post('/instance/:instanceId/close', auth, miniAppController.closeInstance);

// Rate/Review mini-app
router.post('/rate/:appId', auth, miniAppController.rateApp);

// ============ Admin Routes ============

// Create new mini-app (admin only)
router.post('/admin/create', auth, miniAppController.createApp);

// Update mini-app (admin only)
router.put('/admin/:appId', auth, miniAppController.updateApp);

// Delete mini-app (admin only)
router.delete('/admin/:appId', auth, miniAppController.deleteApp);

module.exports = router;
