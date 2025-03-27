import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { dateRange = 7 } = req.query;
        const symbol = '^GSPC';
        const period1 = Math.floor(Date.now() / 1000) - (dateRange * 24 * 60 * 60);
        const period2 = Math.floor(Date.now() / 1000);
        
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1d`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            throw new Error('Invalid data returned from Yahoo Finance API');
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        // Process the data into our required format
        const marketData = timestamps.map((timestamp, index) => {
            const date = new Date(timestamp * 1000).toISOString().split('T')[0];
            const value = quotes.close[index];
            const prevValue = index > 0 ? quotes.close[index - 1] : value;
            const change = value - prevValue;
            const percentChange = prevValue ? (change / prevValue) * 100 : 0;
            
            return {
                date: date,
                value: parseFloat(value.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                percentChange: parseFloat(percentChange.toFixed(2))
            };
        });

        res.status(200).json(marketData);
    } catch (error) {
        console.error('Error fetching market data:', error);
        res.status(500).json({ error: 'Failed to fetch market data' });
    }
} 