/**
 * API handling for Market News Analyzer
 * Handles fetching news and market data
 */

const API = {
    // In a production environment, you would use actual API endpoints
    // For demo purposes, we'll use mock data
    
    /**
     * Fetch news data from NewsAPI.org
     * @returns {Promise} Promise object with news data
     */
    fetchNews: async () => {
        try {
            // NewsAPI.org endpoint for top business headlines
            const apiKey = 'e713140ac78641bd91ad44b7ce192d76';
            const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=20&apiKey=${apiKey}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch news data');
            }
            
            const data = await response.json();
            
            // Check if we have valid data
            if (!data.articles || data.articles.length === 0) {
                console.warn('NewsAPI returned invalid data or rate limit exceeded:', data);
                return API.fallbackToSampleNews();
            }
            
            // Process articles to include sentiment and other required properties
            const processedArticles = data.articles.map((article, index) => {
                // Analyze sentiment based on title and description
                const sentiment = API.analyzeSentiment(article.title + ' ' + (article.description || ''));
                
                // Extract potential company tickers from content
                const relatedCompanies = API.extractCompanyTickers(article.title + ' ' + (article.description || ''));
                
                return {
                    id: index + 1,
                    title: article.title,
                    description: article.description || 'No description available',
                    source: article.source.name,
                    url: article.url,
                    publishedAt: article.publishedAt,
                    sentiment: sentiment,
                    relatedCompanies: relatedCompanies
                };
            });
            
            // Filter out articles more than 7 days old
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const recentArticles = processedArticles.filter(article => {
                const publishDate = new Date(article.publishedAt);
                return publishDate >= sevenDaysAgo;
            });
            
            return recentArticles.length > 0 ? recentArticles : API.fallbackToSampleNews();
            
        } catch (error) {
            console.error('Error fetching news data:', error);
            // Fall back to sample data if API call fails
            return API.fallbackToSampleNews();
        }
    },
    
    /**
     * Simple sentiment analysis based on positive/negative keywords
     * In a production environment, you would use a more sophisticated NLP service
     * @param {string} text - The text to analyze
     * @returns {string} - 'positive', 'negative', or 'neutral'
     */
    analyzeSentiment: (text) => {
        if (!text) return 'neutral';
        
        const lowerText = text.toLowerCase();
        
        // Lists of positive and negative keywords
        const positiveWords = [
            'gain', 'gains', 'rise', 'rises', 'rising', 'rose', 'jump', 'jumps', 'jumped',
            'growth', 'grow', 'grew', 'increase', 'increased', 'higher', 'surge', 'surged',
            'strong', 'strength', 'positive', 'profit', 'profits', 'boost', 'boosted',
            'success', 'successful', 'opportunity', 'opportunities', 'optimistic', 'optimism',
            'recovery', 'recover', 'recovered', 'upbeat', 'confident', 'confidence',
            'bullish', 'boom', 'breakthrough', 'soar', 'soared', 'soaring'
        ];
        
        const negativeWords = [
            'drop', 'drops', 'dropped', 'fall', 'falls', 'fell', 'fallen', 'decline', 'declines',
            'declined', 'decrease', 'decreased', 'lower', 'slump', 'slumped', 'loss', 'losses',
            'weak', 'weakness', 'negative', 'fail', 'fails', 'failed', 'failure', 'fear', 'fears',
            'concerned', 'concern', 'concerns', 'warning', 'warn', 'warns', 'warned', 'worry',
            'worried', 'worries', 'risk', 'risks', 'risky', 'volatile', 'volatility', 'bearish',
            'crash', 'crisis', 'downturn', 'trouble', 'troubled', 'recession', 'slowdown'
        ];
        
        // Count positive and negative word occurrences
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = lowerText.match(regex);
            if (matches) positiveCount += matches.length;
        });
        
        negativeWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = lowerText.match(regex);
            if (matches) negativeCount += matches.length;
        });
        
        // Determine sentiment based on word counts
        if (positiveCount > negativeCount) {
            return 'positive';
        } else if (negativeCount > positiveCount) {
            return 'negative';
        } else {
            return 'neutral';
        }
    },
    
    /**
     * Extract potential company ticker symbols from text
     * This is a simplified approach - in production you'd use a more sophisticated method
     * @param {string} text - The text to analyze
     * @returns {array} - Array of potential ticker symbols
     */
    extractCompanyTickers: (text) => {
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
    },
    
    /**
     * Fallback function to provide sample news data when API calls fail
     * @returns {Array} Sample news data
     */
    fallbackToSampleNews: () => {
        console.warn('Using fallback sample news data');
        return [
            {
                id: 1,
                title: "Tech Giants Report Strong Quarterly Earnings",
                description: "Major technology companies exceeded analyst expectations with their latest quarterly results.",
                source: "Financial Times",
                url: "#",
                publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                sentiment: "positive",
                relatedCompanies: ["AAPL", "MSFT", "GOOGL"]
            },
            {
                id: 2,
                title: "Federal Reserve Signals Potential Rate Hike",
                description: "The Federal Reserve indicated it may raise interest rates in response to persistent inflation concerns.",
                source: "Wall Street Journal",
                url: "#",
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                sentiment: "negative",
                relatedCompanies: ["JPM", "BAC", "GS"]
            },
            {
                id: 3,
                title: "Oil Prices Stabilize After Recent Volatility",
                description: "Crude oil prices have stabilized following weeks of fluctuation due to supply chain disruptions.",
                source: "Reuters",
                url: "#",
                publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                sentiment: "neutral",
                relatedCompanies: ["XOM", "CVX", "BP"]
            },
            {
                id: 4,
                title: "Retail Sales Show Modest Growth in June",
                description: "Consumer spending increased slightly in June, indicating resilience in the retail sector.",
                source: "Bloomberg",
                url: "#",
                publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                sentiment: "positive",
                relatedCompanies: ["WMT", "TGT", "AMZN"]
            },
            {
                id: 5,
                title: "Healthcare Stocks Decline on Policy Uncertainty",
                description: "Shares of major healthcare companies fell as investors reacted to potential regulatory changes.",
                source: "CNBC",
                url: "#",
                publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                sentiment: "negative",
                relatedCompanies: ["JNJ", "PFE", "UNH"]
            },
            {
                id: 6,
                title: "New Infrastructure Bill Gains Bipartisan Support",
                description: "A proposed infrastructure spending package has received backing from both political parties.",
                source: "The New York Times",
                url: "#",
                publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                sentiment: "positive",
                relatedCompanies: ["CAT", "DE", "URI"]
            }
        ];
    },
    
    /**
     * Fetch real market data for S&P 500 index for the past 7 days
     * Uses Alpha Vantage API to get actual market data
     * @returns {Promise} Promise object with market data
     */
    fetchMarketData: async () => {
        try {
            // Alpha Vantage API endpoint for S&P 500 (^GSPC)
            // Note: Replace 'demo' with your actual API key in a production environment
            // You can get a free API key from https://www.alphavantage.co/support/#api-key
            const apiKey = 'demo';
            const symbol = '%5EGSPC'; // S&P 500 index (URL encoded ^GSPC)
            const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=compact`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            
            const data = await response.json();
            
            // Check if we have valid data
            if (!data['Time Series (Daily)']) {
                console.warn('Alpha Vantage API returned invalid data or rate limit exceeded:', data);
                return API.fallbackToSampleData();
            }
            
            // Process data into our format
            const timeSeriesData = data['Time Series (Daily)'];
            const marketData = [];
            
            // Get dates in descending order (most recent first)
            const dates = Object.keys(timeSeriesData).sort((a, b) => new Date(b) - new Date(a));
            
            // Get only the last 7 days of data
            const last7Days = dates.slice(0, 7);
            
            // Initialize with the value of the day before our 7-day period (for calculating first day's change)
            let previousDayValue = parseFloat(timeSeriesData[dates[7]]?.['4. close']) || 0;
            
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
            
            // Sort by date ascending for visualization
            return marketData.reverse();
            
        } catch (error) {
            console.error('Error fetching market data:', error);
            // Fall back to sample data if API call fails
            return API.fallbackToSampleData();
        }
    },
    
    /**
     * Fallback function to provide sample market data when API calls fail
     * @returns {Array} Sample market data for the past 7 days
     */
    fallbackToSampleData: () => {
        console.warn('Using fallback sample market data');
        const today = new Date();
        const marketData = [];
        let baseValue = 4200; // Starting S&P 500 value
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Generate a somewhat realistic daily change
            const dailyChange = (Math.random() * 2 - 1) * 20; // Random value between -20 and +20
            baseValue += dailyChange;
            
            marketData.push({
                date: date.toISOString().split('T')[0],
                value: parseFloat(baseValue.toFixed(2)),
                change: parseFloat(dailyChange.toFixed(2)),
                percentChange: parseFloat(((dailyChange / (baseValue - dailyChange)) * 100).toFixed(2))
            });
        }
        
        return marketData;
    },
    
    /**
     * In a real application, this would save analysis results to Supabase
     * @param {Object} analysisResults The results to save
     * @returns {Promise} Promise object representing the save operation
     */
    saveAnalysisResults: async (analysisResults) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        console.log("Analysis results would be saved to Supabase:", analysisResults);
        
        // In a real application, this would use the Supabase client
        // Example:
        // const { data, error } = await supabase
        //   .from('analysis_results')
        //   .insert([analysisResults]);
        
        return { success: true, id: "mock-id-" + Date.now() };
    }
}; 