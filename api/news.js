// Vercel serverless function to fetch news articles
import fetch from 'node-fetch';

export default async function handler(req, res) {
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
    
    // If no API key or we're in development mode, return mock data
    if (!apiKey || process.env.USE_MOCK_DATA === 'true') {
      console.log('Using mock news data');
      return res.status(200).json(generateMockNewsData());
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

    try {
      // Fetch data from NewsAPI
      const response = await fetch(url);
      const data = await response.json();

      // Check if the API request was successful
      if (data.status !== 'ok') {
        console.error('NewsAPI error:', data);
        throw new Error(data.message || 'Failed to fetch news data');
      }

      // Return the articles
      return res.status(200).json({
        articles: data.articles || [],
        totalResults: data.totalResults || 0,
        source: 'NewsAPI',
        timestamp: new Date().toISOString()
      });
    } catch (fetchError) {
      console.error('NewsAPI fetch error:', fetchError);
      console.log('Falling back to mock data due to API error');
      return res.status(200).json(generateMockNewsData());
    }
  } catch (error) {
    console.error('News API error:', error);
    // Return mock data on error to ensure the frontend still works
    return res.status(200).json(generateMockNewsData());
  }
}

// Function to generate mock news data
function generateMockNewsData() {
  const mockArticles = [
    {
      title: "AAPL Stock Surges on Strong Quarterly Earnings",
      description: "Apple Inc. reported better-than-expected earnings, driving the stock up in after-hours trading.",
      url: "https://example.com/apple-earnings",
      urlToImage: "https://example.com/apple-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      source: { name: "Financial News" }
    },
    {
      title: "MSFT Announces New Cloud Computing Initiative",
      description: "Microsoft is expanding its Azure platform with new AI capabilities and enterprise solutions.",
      url: "https://example.com/microsoft-cloud",
      urlToImage: "https://example.com/microsoft-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      source: { name: "Tech Today" }
    },
    {
      title: "AMZN Expands Retail Footprint with New Stores",
      description: "Amazon continues its push into physical retail with plans for new store locations.",
      url: "https://example.com/amazon-retail",
      urlToImage: "https://example.com/amazon-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      source: { name: "Business Insider" }
    },
    {
      title: "GOOGL Faces New Regulatory Challenges in Europe",
      description: "Google parent Alphabet is dealing with increased scrutiny from European regulators over data practices.",
      url: "https://example.com/google-regulation",
      urlToImage: "https://example.com/google-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      source: { name: "EU News" }
    },
    {
      title: "TSLA Unveils New Electric Vehicle Model",
      description: "Tesla's latest vehicle promises extended range and new self-driving capabilities.",
      url: "https://example.com/tesla-new-model",
      urlToImage: "https://example.com/tesla-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      source: { name: "Auto News" }
    },
    {
      title: "META Metaverse Platform Gains Traction with Developers",
      description: "Meta's virtual reality ecosystem is seeing increased adoption among software developers.",
      url: "https://example.com/meta-developers",
      urlToImage: "https://example.com/meta-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      source: { name: "VR World" }
    },
    {
      title: "NVDA Reports Record GPU Sales for AI Applications",
      description: "NVIDIA's data center revenue has surged as demand for AI processing capabilities grows.",
      url: "https://example.com/nvidia-sales",
      urlToImage: "https://example.com/nvidia-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
      source: { name: "Tech Insights" }
    },
    {
      title: "JPM Launches New Digital Banking Platform",
      description: "JPMorgan Chase introduces a revamped online banking experience with enhanced features.",
      url: "https://example.com/jpmorgan-digital",
      urlToImage: "https://example.com/jpmorgan-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
      source: { name: "Banking News" }
    },
    {
      title: "WMT Expands Online Grocery Delivery Service",
      description: "Walmart is rolling out same-day delivery to more markets across the United States.",
      url: "https://example.com/walmart-delivery",
      urlToImage: "https://example.com/walmart-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
      source: { name: "Retail Dive" }
    },
    {
      title: "COST Membership Fee Increase Drives Revenue Growth",
      description: "Costco reports strong financial results following its recent membership price adjustment.",
      url: "https://example.com/costco-membership",
      urlToImage: "https://example.com/costco-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 216).toISOString(),
      source: { name: "Consumer Reports" }
    }
  ];

  // Add some random articles with negative sentiment
  const negativeArticles = [
    {
      title: "AAPL Faces Supply Chain Disruptions",
      description: "Apple's production targets may be affected by ongoing component shortages.",
      url: "https://example.com/apple-supply-issues",
      urlToImage: "https://example.com/apple-factory-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      source: { name: "Supply Chain Weekly" }
    },
    {
      title: "MSFT Cloud Services Experience Global Outage",
      description: "Microsoft Azure customers reported widespread service disruptions lasting several hours.",
      url: "https://example.com/microsoft-outage",
      urlToImage: "https://example.com/microsoft-servers-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      source: { name: "Tech Outages" }
    },
    {
      title: "TSLA Recalls Vehicles Over Safety Concerns",
      description: "Tesla has issued a voluntary recall affecting thousands of vehicles due to a potential safety issue.",
      url: "https://example.com/tesla-recall",
      urlToImage: "https://example.com/tesla-service-image.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      source: { name: "Auto Safety News" }
    }
  ];

  // Combine all articles
  const allArticles = [...mockArticles, ...negativeArticles];
  
  return {
    articles: allArticles,
    totalResults: allArticles.length,
    source: 'Mock Data',
    timestamp: new Date().toISOString()
  };
} 