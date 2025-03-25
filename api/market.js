const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get market data from Alpha Vantage
    const alphaVantageKey = 'demo'; // Alpha Vantage key for testing
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=${alphaVantageKey}`;
    
    console.log('Fetching market data from:', url);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Alpha Vantage error:', data);
      throw new Error(data.message || 'Failed to fetch market data');
    }

    if (!data['Time Series (Daily)']) {
      console.error('Invalid market data format:', data);
      throw new Error('Invalid market data format received from API');
    }

    // Process the data
    const timeSeriesData = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeriesData).sort().reverse();
    const last7Days = dates.slice(0, 7);

    const processedData = last7Days.map(date => {
      const dayData = timeSeriesData[date];
      const prevDate = dates[dates.indexOf(date) + 1];
      const prevData = prevDate ? timeSeriesData[prevDate] : null;

      return {
        date,
        open: parseFloat(dayData['1. open']),
        high: parseFloat(dayData['2. high']),
        low: parseFloat(dayData['3. low']),
        close: parseFloat(dayData['4. close']),
        volume: parseInt(dayData['5. volume']),
        change: prevData ? parseFloat(dayData['4. close']) - parseFloat(prevData['4. close']) : 0,
        changePercent: prevData ? 
          ((parseFloat(dayData['4. close']) - parseFloat(prevData['4. close'])) / parseFloat(prevData['4. close'])) * 100 : 0
      };
    });

    console.log(`Processed ${processedData.length} days of market data`);
    res.status(200).json({
      data: processedData,
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