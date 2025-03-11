// Vercel serverless function to fetch news articles
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
    // Check if we have the NewsAPI key
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'NewsAPI key not configured. Please set the NEWS_API_KEY environment variable.' 
      });
    }

    // Get current date and date from 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Format dates for NewsAPI
    const fromDate = sevenDaysAgo.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];

    // Construct the API URL
    const url = `https://newsapi.org/v2/everything?q=stock+market+finance&language=en&from=${fromDate}&to=${toDate}&sortBy=popularity&apiKey=${apiKey}`;

    // Fetch data from NewsAPI
    const response = await fetch(url);
    const data = await response.json();

    // Check if the API request was successful
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news data');
    }

    // Return the articles
    return res.status(200).json({
      articles: data.articles || [],
      totalResults: data.totalResults || 0,
      source: 'NewsAPI',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('News API error:', error);
    return res.status(500).json({ 
      error: `Failed to fetch news: ${error.message}` 
    });
  }
}; 