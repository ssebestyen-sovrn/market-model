// Vercel serverless function to fetch stock data
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get tickers from query parameter
    const { tickers } = req.query;
    
    if (!tickers) {
      return res.status(400).json({ 
        error: 'Missing required parameter: tickers' 
      });
    }

    // Split the tickers string into an array
    const tickerList = tickers.split(',').map(t => t.trim()).filter(Boolean);
    
    if (tickerList.length === 0) {
      return res.status(400).json({ 
        error: 'No valid tickers provided' 
      });
    }

    // Check if we have the Alpha Vantage API key
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      // If no API key, return mock data for demo purposes
      return res.status(200).json(generateMockStockData(tickerList));
    }

    // Fetch data for each ticker
    // Note: Alpha Vantage has rate limits, so in a production app
    // you would need to handle this more carefully
    const stockData = {};
    
    // For simplicity and to avoid rate limits, we'll use mock data
    // In a real app, you would fetch from Alpha Vantage API
    for (const ticker of tickerList) {
      stockData[ticker] = await getMockStockData(ticker);
    }

    return res.status(200).json(stockData);

  } catch (error) {
    console.error('Stock API error:', error);
    return res.status(500).json({ 
      error: `Failed to fetch stock data: ${error.message}` 
    });
  }
};

// Function to generate mock stock data
function generateMockStockData(tickers) {
  const result = {};
  
  tickers.forEach(ticker => {
    result[ticker] = getMockStockData(ticker);
  });
  
  return result;
}

// Function to get mock data for a single ticker
function getMockStockData(ticker) {
  // Generate a base price between $10 and $500
  const basePrice = Math.random() * 490 + 10;
  
  // Generate 30 days of price data with some randomness
  const prices = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < 30; i++) {
    // Add some random movement (-3% to +3%)
    const change = currentPrice * (Math.random() * 0.06 - 0.03);
    currentPrice += change;
    prices.push(parseFloat(currentPrice.toFixed(2)));
  }
  
  // Generate some mock volume data
  const volumes = Array(30).fill(0).map(() => 
    Math.floor(Math.random() * 10000000) + 100000
  );
  
  return {
    ticker,
    prices,
    volumes,
    lastUpdated: new Date().toISOString()
  };
} 