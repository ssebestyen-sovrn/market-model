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
        const apiKey = process.env.NEWS_API_KEY || 'e713140ac78641bd91ad44b7ce192d76';
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=50&apiKey=${apiKey}`;
        
        console.log('Fetching news from NewsAPI...');
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('NewsAPI error response:', errorText);
            throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check if we have valid data
        if (!data.articles || data.articles.length === 0) {
            console.warn('No articles returned from NewsAPI');
            throw new Error('No articles returned from NewsAPI');
        }
        
        console.log(`Retrieved ${data.articles.length} articles from NewsAPI`);
        
        // Process articles to include sentiment and other required properties
        const processedArticles = data.articles.map((article, index) => {
            // Analyze sentiment based on title and description
            const sentimentAnalysis = analyzeSentiment(article.title + ' ' + (article.description || ''));
            
            // Extract potential company tickers from content
            const relatedCompanies = extractCompanyTickers(article.title + ' ' + (article.description || ''));
            
            return {
                id: index + 1,
                title: article.title,
                description: article.description || 'No description available',
                source: article.source.name,
                url: article.url,
                publishedAt: article.publishedAt,
                sentiment: sentimentAnalysis.category,
                sentimentScore: sentimentAnalysis.score,
                relatedCompanies: relatedCompanies
            };
        });
        
        // Filter out articles older than the specified date range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dateRange);
        
        const recentArticles = processedArticles.filter(article => {
            const publishDate = new Date(article.publishedAt);
            return publishDate >= cutoffDate;
        });
        
        // De-duplicate articles by title to ensure we have distinct stories
        const uniqueArticleMap = new Map();
        recentArticles.forEach(article => {
            if (!uniqueArticleMap.has(article.title)) {
                uniqueArticleMap.set(article.title, article);
            }
        });
        
        const uniqueArticles = Array.from(uniqueArticleMap.values());
        console.log(`Returning ${uniqueArticles.length} unique recent articles`);
        
        res.status(200).json(uniqueArticles);
    } catch (error) {
        console.error('Error fetching news data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch news data',
            details: error.message
        });
    }
}

// Helper function to analyze sentiment
function analyzeSentiment(text) {
    if (!text) return { score: 0, category: 'neutral' };
    
    const lowerText = text.toLowerCase();
    
    // Lists of positive and negative keywords with weighted importance
    const positiveWords = {
        // Strong positive signals (weight 1.5)
        'soar': 1.5, 'soared': 1.5, 'soaring': 1.5, 'surge': 1.5, 'surged': 1.5, 
        'breakthrough': 1.5, 'boom': 1.5, 'bullish': 1.5,
        
        // Medium positive signals (weight 1.0)
        'gain': 1.0, 'gains': 1.0, 'rise': 1.0, 'rises': 1.0, 'rising': 1.0, 'rose': 1.0,
        'jump': 1.0, 'jumps': 1.0, 'jumped': 1.0, 'growth': 1.0, 'grow': 1.0, 'grew': 1.0,
        'increase': 1.0, 'increased': 1.0, 'higher': 1.0, 'strong': 1.0, 'strength': 1.0, 
        'positive': 1.0, 'profit': 1.0, 'profits': 1.0, 'boost': 1.0, 'boosted': 1.0,
        
        // Mild positive signals (weight 0.5)
        'success': 0.5, 'successful': 0.5, 'opportunity': 0.5, 'opportunities': 0.5, 
        'optimistic': 0.5, 'optimism': 0.5, 'recovery': 0.5, 'recover': 0.5, 'recovered': 0.5,
        'upbeat': 0.5, 'confident': 0.5, 'confidence': 0.5
    };
    
    const negativeWords = {
        // Strong negative signals (weight 1.5)
        'crash': 1.5, 'crisis': 1.5, 'bearish': 1.5, 'recession': 1.5,
        'collapse': 1.5, 'plummet': 1.5, 'plunged': 1.5,
        
        // Medium negative signals (weight 1.0)
        'drop': 1.0, 'drops': 1.0, 'dropped': 1.0, 'fall': 1.0, 'falls': 1.0, 'fell': 1.0, 
        'fallen': 1.0, 'decline': 1.0, 'declines': 1.0, 'declined': 1.0, 'decrease': 1.0, 
        'decreased': 1.0, 'lower': 1.0, 'slump': 1.0, 'slumped': 1.0, 'loss': 1.0, 'losses': 1.0,
        'weak': 1.0, 'weakness': 1.0, 'negative': 1.0, 'fail': 1.0, 'fails': 1.0, 'failed': 1.0, 
        'failure': 1.0,
        
        // Mild negative signals (weight 0.5)
        'fear': 0.5, 'fears': 0.5, 'concerned': 0.5, 'concern': 0.5, 'concerns': 0.5, 
        'warning': 0.5, 'warn': 0.5, 'warns': 0.5, 'warned': 0.5, 'worry': 0.5, 'worried': 0.5, 
        'worries': 0.5, 'risk': 0.5, 'risks': 0.5, 'risky': 0.5, 'volatile': 0.5, 
        'volatility': 0.5, 'downturn': 0.5, 'trouble': 0.5, 'troubled': 0.5, 'slowdown': 0.5
    };
    
    // Count weighted positive and negative word occurrences
    let positiveScore = 0;
    let negativeScore = 0;
    let wordCount = lowerText.split(/\s+/).length;
    
    // Process positive words
    for (const word in positiveWords) {
        const weight = positiveWords[word];
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) positiveScore += matches.length * weight;
    }
    
    // Process negative words
    for (const word in negativeWords) {
        const weight = negativeWords[word];
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) negativeScore += matches.length * weight;
    }
    
    // Calculate normalized sentiment score between -1 and 1
    const totalScore = positiveScore - negativeScore;
    const normalizer = Math.max(wordCount / 20, 1);
    let normalizedScore = totalScore / normalizer;
    
    // Clamp the score between -1 and 1
    normalizedScore = Math.max(Math.min(normalizedScore, 1), -1);
    
    // Determine categorical sentiment
    let category;
    if (normalizedScore > 0.1) {
        category = 'positive';
    } else if (normalizedScore < -0.1) {
        category = 'negative';
    } else {
        category = 'neutral';
    }
    
    return {
        score: normalizedScore,
        category: category
    };
}

// Helper function to extract company tickers
function extractCompanyTickers(text) {
    if (!text) return [];
    
    // Common company names and their tickers
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
    
    // Look for company names in the text
    for (const company in companyToTicker) {
        if (lowerText.includes(company)) {
            relatedTickers.push(companyToTicker[company]);
        }
    }
    
    // If no companies found, return a default set of tickers
    return relatedTickers.length > 0 ? relatedTickers : ['SPY'];
} 