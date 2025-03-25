import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get news data from NewsAPI
    const newsApiKey = 'e713140ac78641bd91ad44b7ce192d76'; // NewsAPI key for testing
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=50&apiKey=${newsApiKey}`;
    
    console.log('Fetching news from:', url);
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('NewsAPI error:', data);
      throw new Error(data.message || 'Failed to fetch news data');
    }

    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('Invalid news data format:', data);
      throw new Error('Invalid news data format received from API');
    }

    // Process and return the data
    const processedArticles = data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      description: article.description || 'No description available',
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
      relatedCompanies: extractCompanyTickers(article.title + ' ' + (article.description || ''))
    }));

    // Filter articles from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentArticles = processedArticles.filter(article => {
      const publishDate = new Date(article.publishedAt);
      return publishDate >= sevenDaysAgo;
    });

    console.log(`Processed ${recentArticles.length} recent articles`);
    res.status(200).json({
      articles: recentArticles,
      isRealData: true
    });
  } catch (error) {
    console.error('Error in news API:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching news data',
      isRealData: false
    });
  }
}

// Helper functions
function analyzeSentiment(text) {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  
  // Lists of positive and negative keywords with weighted importance
  const positiveWords = {
    'soar': 1.5, 'soared': 1.5, 'soaring': 1.5, 'surge': 1.5, 'surged': 1.5, 
    'breakthrough': 1.5, 'boom': 1.5, 'bullish': 1.5,
    'gain': 1.0, 'gains': 1.0, 'rise': 1.0, 'rises': 1.0, 'rising': 1.0, 'rose': 1.0,
    'jump': 1.0, 'jumps': 1.0, 'jumped': 1.0, 'growth': 1.0, 'grow': 1.0, 'grew': 1.0,
    'increase': 1.0, 'increased': 1.0, 'higher': 1.0, 'strong': 1.0, 'strength': 1.0, 
    'positive': 1.0, 'profit': 1.0, 'profits': 1.0, 'boost': 1.0, 'boosted': 1.0,
    'success': 0.5, 'successful': 0.5, 'opportunity': 0.5, 'opportunities': 0.5, 
    'optimistic': 0.5, 'optimism': 0.5, 'recovery': 0.5, 'recover': 0.5, 'recovered': 0.5,
    'upbeat': 0.5, 'confident': 0.5, 'confidence': 0.5
  };
  
  const negativeWords = {
    'crash': 1.5, 'crisis': 1.5, 'bearish': 1.5, 'recession': 1.5,
    'collapse': 1.5, 'plummet': 1.5, 'plunged': 1.5,
    'drop': 1.0, 'drops': 1.0, 'dropped': 1.0, 'fall': 1.0, 'falls': 1.0, 'fell': 1.0, 
    'fallen': 1.0, 'decline': 1.0, 'declines': 1.0, 'declined': 1.0, 'decrease': 1.0, 
    'decreased': 1.0, 'lower': 1.0, 'slump': 1.0, 'slumped': 1.0, 'loss': 1.0, 'losses': 1.0,
    'weak': 1.0, 'weakness': 1.0, 'negative': 1.0, 'fail': 1.0, 'fails': 1.0, 'failed': 1.0, 
    'failure': 1.0,
    'fear': 0.5, 'fears': 0.5, 'concerned': 0.5, 'concern': 0.5, 'concerns': 0.5, 
    'warning': 0.5, 'warn': 0.5, 'warns': 0.5, 'warned': 0.5, 'worry': 0.5, 'worried': 0.5, 
    'worries': 0.5, 'risk': 0.5, 'risks': 0.5, 'risky': 0.5, 'volatile': 0.5, 
    'volatility': 0.5, 'downturn': 0.5, 'trouble': 0.5, 'troubled': 0.5, 'slowdown': 0.5
  };
  
  let positiveScore = 0;
  let negativeScore = 0;
  let wordCount = lowerText.split(/\s+/).length;
  
  for (const word in positiveWords) {
    const weight = positiveWords[word];
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) positiveScore += matches.length * weight;
  }
  
  for (const word in negativeWords) {
    const weight = negativeWords[word];
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) negativeScore += matches.length * weight;
  }
  
  const totalScore = (positiveScore - negativeScore) / wordCount;
  
  return {
    score: totalScore,
    category: totalScore > 0.1 ? 'positive' : totalScore < -0.1 ? 'negative' : 'neutral'
  };
}

function extractCompanyTickers(text) {
  if (!text) return [];
  
  const companyToTicker = {
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'amazon': 'AMZN',
    'google': 'GOOGL',
    'alphabet': 'GOOGL',
    'facebook': 'META',
    'meta': 'META',
    'tesla': 'TSLA',
    'nvidia': 'NVDA',
    'jpmorgan': 'JPM',
    'bank of america': 'BAC',
    'goldman sachs': 'GS',
    'exxon': 'XOM',
    'chevron': 'CVX',
    'bp': 'BP',
    'walmart': 'WMT',
    'target': 'TGT',
    'johnson & johnson': 'JNJ',
    'pfizer': 'PFE',
    'unitedhealth': 'UNH',
    'caterpillar': 'CAT',
    'deere': 'DE',
    'united rentals': 'URI',
    'netflix': 'NFLX',
    'disney': 'DIS',
    'coca-cola': 'KO',
    'pepsi': 'PEP',
    'pepsico': 'PEP',
    'mastercard': 'MA',
    'visa': 'V',
    'boeing': 'BA',
    'lockheed': 'LMT'
  };
  
  const lowerText = text.toLowerCase();
  const relatedTickers = [];
  
  for (const company in companyToTicker) {
    if (lowerText.includes(company)) {
      relatedTickers.push(companyToTicker[company]);
    }
  }
  
  return relatedTickers.length > 0 ? relatedTickers : ['SPY'];
} 