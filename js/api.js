/**
 * API handling for Market News Analyzer
 * Handles fetching news and market data
 */

const API = {
    // In a production environment, you would use actual API endpoints
    // For demo purposes, we'll use mock data
    
    /**
     * Fetch news data from NewsAPI.org
     * @param {number} dateRange Number of days to analyze (default: 7)
     * @returns {Promise} Promise object with news data
     */
    fetchNews: async (dateRange = 7) => {
        try {
            // Use our proxy API endpoint with explicit HTTPS
            const baseUrl = window.location.hostname === 'localhost' ? '' : 'https://market-model.vercel.app';
            const url = `${baseUrl}/api/news?dateRange=${dateRange}`;
            
            console.log('Fetching news data from:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('News API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    details: errorData
                });
                throw new Error(errorData.details || `NewsAPI error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Check if we have valid data
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('No articles returned from API');
                return API.fallbackToSampleNews(dateRange);
            }
            
            console.log(`Retrieved ${data.length} articles`);
            return data;
            
        } catch (error) {
            console.error('Error fetching news data:', error);
            // Fall back to sample data if API call fails
            return API.fallbackToSampleNews(dateRange);
        }
    },
    
    /**
     * Enhanced sentiment analysis that returns a numeric score between -1 and 1
     * More granular than just positive/negative/neutral categories
     * @param {string} text - The text to analyze
     * @returns {Object} - Contains both numeric score (-1 to 1) and category
     */
    analyzeSentiment: (text) => {
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
        let wordCount = lowerText.split(/\s+/).length; // Count total words for normalization
        
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
        const normalizer = Math.max(wordCount / 20, 1); // Normalize based on text length
        let normalizedScore = totalScore / normalizer;
        
        // Clamp the score between -1 and 1
        normalizedScore = Math.max(Math.min(normalizedScore, 1), -1);
        
        // Determine categorical sentiment for compatibility
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
     * @param {number} dateRange Number of days to analyze (default: 7)
     * @returns {Array} Sample news data
     */
    fallbackToSampleNews: (dateRange = 7) => {
        console.warn('Using fallback sample news data');
        
        // Create 50 news articles per day for the specified number of days
        const sampleNews = [];
        const newsTemplates = [
            // Original templates
            {
                title: "Tech Giants Report Strong Quarterly Earnings",
                description: "Major technology companies exceeded analyst expectations with their latest quarterly results.",
                source: "Financial Times",
                sentiment: "positive",
                sentimentScore: 0.75,
                relatedCompanies: ["AAPL", "MSFT", "GOOGL"]
            },
            {
                title: "Federal Reserve Signals Potential Rate Hike",
                description: "The Federal Reserve indicated it may raise interest rates in response to persistent inflation concerns.",
                source: "Wall Street Journal",
                sentiment: "negative",
                sentimentScore: -0.65,
                relatedCompanies: ["JPM", "BAC", "GS"]
            },
            {
                title: "Oil Prices Stabilize After Recent Volatility",
                description: "Crude oil prices have stabilized following weeks of fluctuation due to supply chain disruptions.",
                source: "Reuters",
                sentiment: "neutral",
                sentimentScore: 0.05,
                relatedCompanies: ["XOM", "CVX", "BP"]
            },
            {
                title: "Retail Sales Show Modest Growth in June",
                description: "Consumer spending increased slightly in June, indicating resilience in the retail sector.",
                source: "Bloomberg",
                sentiment: "positive",
                sentimentScore: 0.45,
                relatedCompanies: ["WMT", "TGT", "AMZN"]
            },
            {
                title: "Healthcare Stocks Decline on Policy Uncertainty",
                description: "Shares of major healthcare companies fell as investors reacted to potential regulatory changes.",
                source: "CNBC",
                sentiment: "negative",
                sentimentScore: -0.55,
                relatedCompanies: ["JNJ", "PFE", "UNH"]
            },
            {
                title: "New Infrastructure Bill Gains Bipartisan Support",
                description: "A proposed infrastructure spending package has received backing from both political parties.",
                source: "The New York Times",
                sentiment: "positive",
                sentimentScore: 0.60,
                relatedCompanies: ["CAT", "DE", "URI"]
            },
            {
                title: "Tech Company Announces Major Acquisition",
                description: "A leading technology company has acquired a competitor in a deal worth billions.",
                source: "TechCrunch",
                sentiment: "positive",
                sentimentScore: 0.70,
                relatedCompanies: ["MSFT", "CRM", "ORCL"]
            },
            {
                title: "Consumer Confidence Index Falls Unexpectedly",
                description: "The latest consumer confidence readings show an unexpected decline, raising economic concerns.",
                source: "MarketWatch",
                sentiment: "negative",
                sentimentScore: -0.50,
                relatedCompanies: ["KO", "PG", "MCD"]
            },
            {
                title: "Global Supply Chain Issues Continue to Impact Manufacturing",
                description: "Manufacturers report ongoing challenges due to supply chain disruptions and shipping delays.",
                source: "Industry Week",
                sentiment: "negative",
                sentimentScore: -0.45,
                relatedCompanies: ["F", "GM", "TSLA"]
            },
            {
                title: "Cryptocurrency Markets Show Signs of Recovery",
                description: "After weeks of decline, cryptocurrency prices are beginning to stabilize and show upward momentum.",
                source: "CoinDesk",
                sentiment: "positive",
                sentimentScore: 0.55,
                relatedCompanies: ["COIN", "SQ", "PYPL"]
            },
            // Additional templates to create more variety
            {
                title: "Amazon Announces Record Prime Day Sales",
                description: "The e-commerce giant reported its biggest Prime Day event ever, with sales surpassing previous records.",
                source: "CNBC",
                sentiment: "positive",
                sentimentScore: 0.80,
                relatedCompanies: ["AMZN"]
            },
            {
                title: "Apple Unveils Next Generation iPhone",
                description: "Apple's latest iPhone features significant upgrades to camera technology and processing power.",
                source: "The Verge",
                sentiment: "positive",
                sentimentScore: 0.65,
                relatedCompanies: ["AAPL"]
            },
            {
                title: "Tesla Misses Delivery Targets",
                description: "The electric vehicle manufacturer fell short of analyst expectations for vehicle deliveries this quarter.",
                source: "Bloomberg",
                sentiment: "negative",
                sentimentScore: -0.60,
                relatedCompanies: ["TSLA"]
            },
            {
                title: "Google Faces New Antitrust Investigation",
                description: "Regulators have launched a new probe into Google's advertising business practices.",
                source: "Wall Street Journal",
                sentiment: "negative",
                sentimentScore: -0.70,
                relatedCompanies: ["GOOGL"]
            },
            {
                title: "Bank of America Reports Higher Than Expected Profits",
                description: "The bank's quarterly earnings exceeded analyst estimates, driven by strong performance in investment banking.",
                source: "Reuters",
                sentiment: "positive",
                sentimentScore: 0.72,
                relatedCompanies: ["BAC"]
            },
            {
                title: "Disney+ Subscriber Growth Slows",
                description: "The streaming service added fewer subscribers than expected in the latest quarter.",
                source: "Variety",
                sentiment: "negative",
                sentimentScore: -0.48,
                relatedCompanies: ["DIS"]
            },
            {
                title: "Microsoft Cloud Revenue Soars",
                description: "Azure cloud services continue to drive growth for the tech giant, exceeding market expectations.",
                source: "Forbes",
                sentiment: "positive",
                sentimentScore: 0.78,
                relatedCompanies: ["MSFT"]
            },
            {
                title: "Walmart Expands Same-Day Delivery Service",
                description: "The retail giant is rolling out expanded delivery options to compete with online rivals.",
                source: "Retail Dive",
                sentiment: "positive",
                sentimentScore: 0.52,
                relatedCompanies: ["WMT"]
            },
            {
                title: "Pfizer Announces Breakthrough in Cancer Treatment",
                description: "The pharmaceutical company reported promising results from clinical trials of a new cancer therapy.",
                source: "Medical News Today",
                sentiment: "positive",
                sentimentScore: 0.85,
                relatedCompanies: ["PFE"]
            },
            {
                title: "Meta Platforms Faces User Privacy Concerns",
                description: "New reports highlight data privacy issues across Meta's social media applications.",
                source: "The Guardian",
                sentiment: "negative",
                sentimentScore: -0.62,
                relatedCompanies: ["META"]
            },
            {
                title: "Airlines Report Significant Increase in Summer Bookings",
                description: "Major carriers see strong demand for summer travel, signaling recovery in the travel industry.",
                source: "Travel Weekly",
                sentiment: "positive",
                sentimentScore: 0.68,
                relatedCompanies: ["AAL", "DAL", "UAL"]
            },
            {
                title: "Housing Market Shows Signs of Cooling",
                description: "Home sales have decreased as mortgage rates continue to rise, according to new data.",
                source: "Redfin",
                sentiment: "negative",
                sentimentScore: -0.40,
                relatedCompanies: ["Z", "RDFN"]
            },
            {
                title: "Chipmakers Warn of Continued Semiconductor Shortages",
                description: "Industry leaders predict supply constraints will persist through next year.",
                source: "Semiconductor Engineering",
                sentiment: "negative",
                sentimentScore: -0.55,
                relatedCompanies: ["INTC", "AMD", "NVDA"]
            },
            {
                title: "Starbucks Launches New Sustainability Initiative",
                description: "The coffee chain announced plans to reduce waste and carbon emissions across its global operations.",
                source: "GreenBiz",
                sentiment: "positive",
                sentimentScore: 0.50,
                relatedCompanies: ["SBUX"]
            },
            {
                title: "Uber Eats Partners with Major Grocery Chains",
                description: "The food delivery service is expanding into grocery delivery through new retail partnerships.",
                source: "TechCrunch",
                sentiment: "positive",
                sentimentScore: 0.58,
                relatedCompanies: ["UBER"]
            }
        ];
        
        // Create descriptive suffixes for article titles to make them more unique
        const descriptiveSuffixes = [
            "Analysts React",
            "Market Implications",
            "Investor Perspective",
            "Financial Impact",
            "Industry Analysis",
            "Expert Commentary",
            "Economic Outlook",
            "Future Prospects",
            "Competitive Response",
            "Strategic Shift"
        ];
        
        // Generate articles for the specified number of days
        for (let day = 0; day < dateRange; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            const dateStr = date.toISOString().split('T')[0]; // Get just the date part
            
            // Create articles for this day, ensuring they are all distinct
            const articlesForThisDay = [];
            
            // Fill the rest with templates from the main collection
            while (articlesForThisDay.length < 50) {
                const allTemplates = [...newsTemplates];
                
                // Shuffle the templates to randomize the order
                for (let i = allTemplates.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allTemplates[i], allTemplates[j]] = [allTemplates[j], allTemplates[i]];
                }
                
                // Use each template once with variations
                for (let i = 0; i < allTemplates.length && articlesForThisDay.length < 50; i++) {
                    const template = allTemplates[i];
                    
                    // Create a unique title using suffixes or date-specific context
                    let uniqueTitle;
                    if (Math.random() > 0.5) {
                        // Add a descriptive suffix
                        const suffix = descriptiveSuffixes[Math.floor(Math.random() * descriptiveSuffixes.length)];
                        uniqueTitle = `${template.title}: ${suffix}`;
                    } else {
                        // Add date context
                        uniqueTitle = `${template.title} (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
                    }
                    
                    // Create sentiment variation
                    const sentimentVariation = (Math.random() * 0.3) - 0.15;
                    const adjustedSentiment = Math.max(-1, Math.min(1, template.sentimentScore + sentimentVariation));
                    
                    // Determine sentiment category
                    let sentimentCategory;
                    if (adjustedSentiment > 0.1) {
                        sentimentCategory = 'positive';
                    } else if (adjustedSentiment < -0.1) {
                        sentimentCategory = 'negative';
                    } else {
                        sentimentCategory = 'neutral';
                    }
                    
                    // Add the article with the correct date
                    articlesForThisDay.push({
                        id: day * 50 + articlesForThisDay.length + 1,
                        title: uniqueTitle,
                        description: template.description,
                        source: template.source,
                        url: "#",
                        publishedAt: `${dateStr}T00:00:00Z`, // Use the correct date for this day
                        sentiment: sentimentCategory,
                        sentimentScore: adjustedSentiment,
                        relatedCompanies: template.relatedCompanies,
                        isSampleData: true
                    });
                }
            }
            
            // Add this day's articles to the full sample
            sampleNews.push(...articlesForThisDay);
        }
        
        console.log(`Created ${sampleNews.length} sample news articles`);
        return sampleNews;
    },
    
    /**
     * Fetch real market data for S&P 500 index
     * Uses our proxy API endpoint to get Yahoo Finance data
     * @param {number} dateRange Number of days to analyze (default: 7)
     * @returns {Promise} Promise object with market data
     */
    fetchMarketData: async (dateRange = 7) => {
        try {
            // Use our proxy API endpoint
            const url = `/api/market-data?dateRange=${dateRange}`;
            
            console.log('Fetching S&P 500 data from proxy API...');
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const marketData = await response.json();
            
            if (!Array.isArray(marketData) || marketData.length === 0) {
                throw new Error('Invalid data returned from API');
            }
            
            console.log(`Retrieved ${marketData.length} days of market data`);
            return marketData;
            
        } catch (error) {
            console.error('Error fetching market data:', error);
            return API.fallbackToSampleData(dateRange);
        }
    },
    
    /**
     * Fallback function to provide sample market data when API calls fail
     * @param {number} dateRange Number of days to analyze (default: 7)
     * @returns {Array} Sample market data for the past 7 days
     */
    fallbackToSampleData: (dateRange = 7) => {
        console.warn('Using fallback sample market data - This means the real S&P 500 data could not be fetched');
        
        // Use more realistic S&P 500 values (around 5,200 as of June 2024)
        const today = new Date();
        const marketData = [];
        let baseValue = 5240; // Current baseline S&P 500 value (as of June 2024)
        
        // Create a realistic pattern similar to recent S&P 500 movements
        // Small daily changes with a slight upward bias
        const changes = [
            -8.2,  // Day 1 - small drop
            12.5,  // Day 2 - recovery
            -3.7,  // Day 3 - small decline
            6.8,   // Day 4 - modest gain
            -5.2,  // Day 5 - small drop
            9.4,   // Day 6 - moderate gain
            2.3    // Day 7 - small gain
        ];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Skip weekends as real market data would
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue; // Skip weekend days
            }
            
            // Use predefined changes or small random changes as fallback
            const dailyChange = changes[6-i] || ((Math.random() * 0.5 - 0.2) * 10); // Smaller random changes if we need more days
            baseValue += dailyChange;
            
            marketData.push({
                date: date.toISOString().split('T')[0],
                value: parseFloat(baseValue.toFixed(2)),
                change: parseFloat(dailyChange.toFixed(2)),
                percentChange: parseFloat(((dailyChange / (baseValue - dailyChange)) * 100).toFixed(2)),
                isSampleData: true // Flag to indicate this is sample data
            });
        }
        
        // Make sure we have 7 days of data by filling in if needed
        while (marketData.length < 7) {
            // If we didn't get 7 days due to weekend skipping, add some fictional days
            const lastDate = marketData.length > 0 
                ? new Date(marketData[marketData.length - 1].date)
                : new Date(today);
                
            lastDate.setDate(lastDate.getDate() + 1);
            const dailyChange = (Math.random() * 0.4 - 0.1) * 10; // Small random change
            baseValue += dailyChange;
            
            marketData.push({
                date: lastDate.toISOString().split('T')[0],
                value: parseFloat(baseValue.toFixed(2)),
                change: parseFloat(dailyChange.toFixed(2)),
                percentChange: parseFloat(((dailyChange / (baseValue - dailyChange)) * 100).toFixed(2)),
                isSampleData: true
            });
        }
        
        // Sort by date ascending for visualization
        return marketData.sort((a, b) => new Date(a.date) - new Date(b.date));
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