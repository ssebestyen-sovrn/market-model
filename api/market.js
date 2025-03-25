import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get market data from Alpha Vantage
    const alphaVantageKey = 'NVFJQVHXIW3NWLVQ'; // Alpha Vantage API key for testing
    const symbol = '%5EGSPC'; // S&P 500 index (URL encoded ^GSPC)
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${alphaVantageKey}&outputsize=compact`;
    
    console.log('Fetching market data from:', url);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Alpha Vantage API error:', data);
      throw new Error('Failed to fetch market data');
    }

    // Check for API errors or rate limits
    if (data['Error Message']) {
      console.error('Alpha Vantage error message:', data['Error Message']);
      throw new Error(`Alpha Vantage API error: ${data['Error Message']}`);
    }

    if (data['Note']) {
      console.warn('Alpha Vantage API limit message:', data['Note']);
      if (!data['Time Series (Daily)']) {
        throw new Error('API rate limit exceeded: ' + data['Note']);
      }
    }

    // Check if we have valid data
    if (!data['Time Series (Daily)'] || Object.keys(data['Time Series (Daily)']).length === 0) {
      console.error('Invalid market data format:', data);
      throw new Error('Invalid or empty data returned from API');
    }

    // Process data into our format
    const timeSeriesData = data['Time Series (Daily)'];
    const marketData = [];
    
    // Get dates in descending order (most recent first)
    const dates = Object.keys(timeSeriesData).sort((a, b) => new Date(b) - new Date(a));
    
    // Get only the last 7 days of data
    const last7Days = dates.slice(0, Math.min(7, dates.length));
    
    // Initialize with the value of the day before our 7-day period
    let previousDayValue = parseFloat(timeSeriesData[dates[Math.min(7, dates.length)]]?.['4. close']) || 0;
    if (dates.length <= 7) {
      previousDayValue = parseFloat(timeSeriesData[dates[dates.length - 1]]?.['4. close']) || 0;
    }
    
    // Process each day
    for (const date of last7Days) {
      const dayData = timeSeriesData[date];
      const value = parseFloat(dayData['4. close']);
      const change = value - previousDayValue;
      const percentChange = previousDayValue ? (change / previousDayValue) * 100 : 0;
      
      marketData.push({
        date: date,
        value: value,
        change: parseFloat(change.toFixed(2)),
        percentChange: parseFloat(percentChange.toFixed(2))
      });
      
      previousDayValue = value;
    }

    console.log(`Processed ${marketData.length} days of market data`);
    // Sort by date ascending for visualization
    res.status(200).json({
      data: marketData.reverse(),
      isRealData: true
    });
  } catch (error) {
    console.error('Error in market API:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching market data',
      isRealData: false
    });
  }
} 