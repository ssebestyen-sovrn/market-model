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
            // Use our proxy API endpoint
            const url = `/api/news?dateRange=${dateRange}`;
            
            console.log('Fetching news data from proxy API...');
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to fetch news data');
            }
            
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
        console.warn(`Using fallback sample news data for ${dateRange} days - This means the real news API could not be reached`);
        
        // Create sample news articles for the specified number of days
        const sampleNews = [];

        // Base templates that can appear on any day
        const baseNewsTemplates = [
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
                title: "Retail Sales Show Modest Growth",
                description: "Consumer spending increased slightly, indicating resilience in the retail sector.",
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
            }
        ];
        
        // Day-specific templates to create more variance
        const daySpecificTemplates = {
            0: [ // Sunday - Weekend summary, week ahead previews
                {
                    title: "Market Week Ahead: Focus on Tech Earnings",
                    description: "Investors prepare for a busy week of tech earnings reports that could set the tone for markets.",
                    source: "CNBC",
                    sentiment: "neutral",
                    sentimentScore: 0.15,
                    relatedCompanies: ["AAPL", "MSFT", "AMZN", "META"]
                },
                {
                    title: "Weekend Analysis: Economic Indicators Point to Slowdown",
                    description: "Economists warn that recent data suggests a potential economic slowdown in the coming months.",
                    source: "Bloomberg",
                    sentiment: "negative",
                    sentimentScore: -0.55,
                    relatedCompanies: ["SPY", "DIA", "QQQ"]
                }
            ],
            1: [ // Monday - Market outlook, weekend developments
                {
                    title: "Markets Open Higher After Weekend Developments",
                    description: "Stocks started the week on a positive note following weekend news on trade negotiations.",
                    source: "Wall Street Journal",
                    sentiment: "positive",
                    sentimentScore: 0.60,
                    relatedCompanies: ["SPY", "DIA", "QQQ"]
                },
                {
                    title: "Monday Morning Briefing: Key Events This Week",
                    description: "Investors prepare for a busy economic calendar including inflation data and central bank meetings.",
                    source: "Reuters",
                    sentiment: "neutral",
                    sentimentScore: 0.10,
                    relatedCompanies: ["JPM", "GS", "MS"]
                }
            ],
            2: [ // Tuesday - Economic data, early week earnings
                {
                    title: "Consumer Confidence Data Surprises to the Upside",
                    description: "The latest consumer confidence figures came in well above analyst expectations, suggesting continued economic strength.",
                    source: "Bloomberg",
                    sentiment: "positive",
                    sentimentScore: 0.68,
                    relatedCompanies: ["WMT", "TGT", "AMZN"]
                },
                {
                    title: "Tech Sector Leads Tuesday Losses",
                    description: "Technology stocks pulled back on Tuesday as investors reassessed valuations amid rising interest rates.",
                    source: "MarketWatch",
                    sentiment: "negative",
                    sentimentScore: -0.62,
                    relatedCompanies: ["AAPL", "MSFT", "GOOGL", "AMZN"]
                }
            ],
            3: [ // Wednesday - Fed announcements, mid-week data
                {
                    title: "Federal Reserve Holds Rates Steady in Wednesday Announcement",
                    description: "The central bank maintained current interest rates but signaled potential future adjustments based on economic data.",
                    source: "CNBC",
                    sentiment: "neutral",
                    sentimentScore: 0.25,
                    relatedCompanies: ["JPM", "BAC", "GS", "WFC"]
                },
                {
                    title: "Oil Inventories Show Surprise Build",
                    description: "Crude oil prices dropped after Wednesday's inventory report showed higher than expected supplies.",
                    source: "Reuters",
                    sentiment: "negative",
                    sentimentScore: -0.48,
                    relatedCompanies: ["XOM", "CVX", "BP", "COP"]
                }
            ],
            4: [ // Thursday - Earnings heavy day
                {
                    title: "Major Banks Beat Earnings Expectations",
                    description: "Leading financial institutions reported better than anticipated quarterly results on Thursday, boosting the sector.",
                    source: "Financial Times",
                    sentiment: "positive",
                    sentimentScore: 0.72,
                    relatedCompanies: ["JPM", "BAC", "C", "WFC"]
                },
                {
                    title: "Tech Earnings Disappoint Investors",
                    description: "Several technology companies reported earnings that fell short of analyst expectations, leading to sector-wide pressure.",
                    source: "Wall Street Journal",
                    sentiment: "negative",
                    sentimentScore: -0.68,
                    relatedCompanies: ["MSFT", "INTC", "IBM"]
                }
            ],
            5: [ // Friday - Weekly wrap-up, economic data
                {
                    title: "Friday Jobs Report Exceeds Expectations",
                    description: "The monthly employment report showed stronger than expected job growth and moderate wage increases.",
                    source: "Bloomberg",
                    sentiment: "positive",
                    sentimentScore: 0.75,
                    relatedCompanies: ["SPY", "DIA", "QQQ", "IWM"]
                },
                {
                    title: "Markets End Week on Down Note",
                    description: "Stocks closed lower on Friday as investors digested mixed economic signals and positioned for the weekend.",
                    source: "CNBC",
                    sentiment: "negative",
                    sentimentScore: -0.50,
                    relatedCompanies: ["SPY", "QQQ", "DIA"]
                }
            ],
            6: [ // Saturday - Weekend analysis, weekly summary
                {
                    title: "Week in Review: Markets Navigate Volatile Trading",
                    description: "A look back at the week's market action shows investors grappling with mixed signals from earnings and economic data.",
                    source: "Barron's",
                    sentiment: "neutral",
                    sentimentScore: -0.05,
                    relatedCompanies: ["SPY", "QQQ", "DIA"]
                },
                {
                    title: "Saturday Analysis: Small Caps Outperform for the Week",
                    description: "Smaller companies showed relative strength this week, potentially signaling a shift in market leadership.",
                    source: "Investor's Business Daily",
                    sentiment: "positive",
                    sentimentScore: 0.58,
                    relatedCompanies: ["IWM", "IJR", "VB"]
                }
            ]
        };
        
        // Trending topics that evolve over time (each lasts about 5-7 days)
        const trendingTopics = [
            {
                topic: "Inflation Concerns",
                stories: [
                    {
                        title: "Inflation Data Raises Concerns",
                        description: "The latest CPI figures came in higher than expected, fueling worries about persistent inflation.",
                        sentiment: "negative",
                        sentimentScore: -0.65
                    },
                    {
                        title: "Fed Officials Comment on Inflation Outlook",
                        description: "Central bank representatives suggest inflation may remain elevated longer than previously anticipated.",
                        sentiment: "negative",
                        sentimentScore: -0.40
                    },
                    {
                        title: "Markets React to Inflation Worries",
                        description: "Stocks and bonds declined as investors reassessed the impact of higher inflation on corporate profits.",
                        sentiment: "negative",
                        sentimentScore: -0.55
                    },
                    {
                        title: "Analysts Debate Transitory vs. Persistent Inflation",
                        description: "Economic experts remain divided on whether current inflation pressures will ease in the coming months.",
                        sentiment: "neutral",
                        sentimentScore: -0.15
                    },
                    {
                        title: "Inflation Concerns Begin to Ease",
                        description: "New data suggests inflation pressures may be moderating, offering relief to markets.",
                        sentiment: "positive",
                        sentimentScore: 0.48
                    }
                ]
            },
            {
                topic: "Tech Sector Earnings",
                stories: [
                    {
                        title: "Tech Earnings Season Begins",
                        description: "Investors prepare for a busy week of technology sector financial reports.",
                        sentiment: "neutral",
                        sentimentScore: 0.15
                    },
                    {
                        title: "First Tech Giants Report Mixed Results",
                        description: "Early tech earnings showed both winners and losers, with cloud services growth a key factor.",
                        sentiment: "neutral",
                        sentimentScore: 0.05
                    },
                    {
                        title: "Apple Crushes Earnings Expectations",
                        description: "The iPhone maker reported blockbuster results, driving the stock higher in after-hours trading.",
                        sentiment: "positive",
                        sentimentScore: 0.85
                    },
                    {
                        title: "Microsoft and Google Parent Show Strong Cloud Growth",
                        description: "Major tech companies reported robust growth in their cloud computing divisions, offsetting weakness elsewhere.",
                        sentiment: "positive",
                        sentimentScore: 0.70
                    },
                    {
                        title: "Tech Earnings Recap: Sector Shows Resilience",
                        description: "Despite economic headwinds, technology companies demonstrated continued strength in quarterly reports.",
                        sentiment: "positive",
                        sentimentScore: 0.65
                    }
                ]
            },
            {
                topic: "Energy Crisis",
                stories: [
                    {
                        title: "Energy Prices Surge Amid Supply Constraints",
                        description: "Oil and natural gas prices jumped as supply failed to keep pace with recovering demand.",
                        sentiment: "negative",
                        sentimentScore: -0.50
                    },
                    {
                        title: "Energy Sector Stocks Rally on Higher Prices",
                        description: "Shares of energy producers and service companies climbed as commodity prices reached multi-year highs.",
                        sentiment: "positive",
                        sentimentScore: 0.62
                    },
                    {
                        title: "Governments Consider Strategic Reserves Release",
                        description: "Officials discuss tapping emergency fuel reserves to combat rising energy prices.",
                        sentiment: "neutral",
                        sentimentScore: 0.20
                    },
                    {
                        title: "Energy Crisis Impacts Global Supply Chains",
                        description: "Manufacturing and transportation sectors face increasing costs due to higher energy prices.",
                        sentiment: "negative",
                        sentimentScore: -0.58
                    },
                    {
                        title: "Energy Markets Begin to Stabilize",
                        description: "After weeks of volatility, oil and gas prices showed signs of moderating as supply responses emerge.",
                        sentiment: "positive",
                        sentimentScore: 0.45
                    }
                ]
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
        
        // News sources
        const sources = [
            "Wall Street Journal", "Bloomberg", "Reuters", "CNBC", "Financial Times",
            "MarketWatch", "Barron's", "The Economist", "Forbes", "Business Insider",
            "Yahoo Finance", "Investor's Business Daily", "The Street", "Seeking Alpha",
            "Morningstar", "Kiplinger", "The Motley Fool"
        ];
        
        // Generate articles for the specified number of days
        for (let day = 0; day < dateRange; day++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            const dateStr = date.toISOString().split('T')[0]; // Get just the date part
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            
            // Determine how many articles to generate for this day (fewer on weekends)
            const articlesForThisDay = [];
            const targetArticles = (dayOfWeek === 0 || dayOfWeek === 6) ? 30 : 50;
            
            // Create a daily sentiment bias that shifts the overall sentiment for this particular day
            // This will add more variance between days to make the model appear more dynamic
            const dailySentimentBias = (Math.random() * 0.5) - 0.25; // Range from -0.25 to +0.25
            console.log(`Daily sentiment bias for ${dateStr}: ${dailySentimentBias.toFixed(2)}`);
            
            // Start with day-specific templates (if available)
            if (daySpecificTemplates[dayOfWeek]) {
                daySpecificTemplates[dayOfWeek].forEach(template => {
                    // Add some variation to the template plus the daily bias
                    const sentimentVariation = (Math.random() * 0.2) - 0.1;
                    const adjustedSentiment = Math.max(-1, Math.min(1, template.sentimentScore + sentimentVariation + dailySentimentBias));
                    
                    // Determine sentiment category
                    let sentimentCategory;
                    if (adjustedSentiment > 0.1) {
                        sentimentCategory = 'positive';
                    } else if (adjustedSentiment < -0.1) {
                        sentimentCategory = 'negative';
                    } else {
                        sentimentCategory = 'neutral';
                    }
                    
                    // Add the article
                    articlesForThisDay.push({
                        id: `${dateStr}-${articlesForThisDay.length + 1}`,
                        title: template.title,
                        description: template.description,
                        source: template.source,
                        url: "#",
                        publishedAt: `${dateStr}T${8 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}:00Z`,
                        sentiment: sentimentCategory,
                        sentimentScore: adjustedSentiment,
                        relatedCompanies: template.relatedCompanies,
                        isSampleData: true
                    });
                });
            }
            
            // Add trending topic stories (each topic lasts about 5-7 days)
            trendingTopics.forEach((topic, topicIndex) => {
                // Each trending topic appears in a different time period
                const topicStartDay = (topicIndex * 7) % dateRange;
                const topicEndDay = Math.min(topicStartDay + 6, dateRange - 1);
                
                // Check if this day is within the topic's active period
                if (day >= topicStartDay && day <= topicEndDay) {
                    // Calculate which story in the sequence to use
                    const storyIndex = Math.min(day - topicStartDay, topic.stories.length - 1);
                    const story = topic.stories[storyIndex];
                    
                    // Create a unique headline related to the trending topic
                    let headline = story.title;
                    if (Math.random() > 0.5) {
                        const suffix = descriptiveSuffixes[Math.floor(Math.random() * descriptiveSuffixes.length)];
                        headline = `${headline}: ${suffix}`;
                    }
                    
                    // Randomly select related companies based on the topic
                    let relatedCompanies;
                    if (topic.topic === "Inflation Concerns") {
                        relatedCompanies = ["SPY", "TLT", "GLD", "JPM", "WMT"].slice(0, 2 + Math.floor(Math.random() * 3));
                    } else if (topic.topic === "Tech Sector Earnings") {
                        relatedCompanies = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA"].slice(0, 2 + Math.floor(Math.random() * 3));
                    } else if (topic.topic === "Energy Crisis") {
                        relatedCompanies = ["XOM", "CVX", "BP", "SLB", "COP", "USO"].slice(0, 2 + Math.floor(Math.random() * 3));
                    } else {
                        relatedCompanies = ["SPY"];
                    }
                    
                    // Add sentiment variation with daily bias
                    const sentimentVariation = (Math.random() * 0.25) - 0.125; // Increased range from previous 0.2
                    const adjustedSentiment = Math.max(-1, Math.min(1, story.sentimentScore + sentimentVariation + dailySentimentBias));
                    
                    // Determine sentiment category
                    let sentimentCategory;
                    if (adjustedSentiment > 0.1) {
                        sentimentCategory = 'positive';
                    } else if (adjustedSentiment < -0.1) {
                        sentimentCategory = 'negative';
                    } else {
                        sentimentCategory = 'neutral';
                    }
                    
                    // Add the trending topic article
                    articlesForThisDay.push({
                        id: `${dateStr}-trending-${topicIndex}-${storyIndex}`,
                        title: headline,
                        description: story.description,
                        source: sources[Math.floor(Math.random() * sources.length)],
                        url: "#",
                        publishedAt: `${dateStr}T${8 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}:00Z`,
                        sentiment: sentimentCategory,
                        sentimentScore: adjustedSentiment,
                        relatedCompanies: relatedCompanies,
                        isSampleData: true
                    });
                }
            });
            
            // Fill the rest with templates from the base collection
            while (articlesForThisDay.length < targetArticles) {
                const allTemplates = [...baseNewsTemplates];
                
                // Shuffle the templates to randomize the order
                for (let i = allTemplates.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allTemplates[i], allTemplates[j]] = [allTemplates[j], allTemplates[i]];
                }
                
                // Use each template once with variations
                for (let i = 0; i < allTemplates.length && articlesForThisDay.length < targetArticles; i++) {
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
                    
                    // Create sentiment variation with daily bias
                    const sentimentVariation = (Math.random() * 0.4) - 0.2; // Increased from 0.3
                    const adjustedSentiment = Math.max(-1, Math.min(1, template.sentimentScore + sentimentVariation + dailySentimentBias));
                    
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
                        id: `${dateStr}-base-${articlesForThisDay.length}`,
                        title: uniqueTitle,
                        description: template.description,
                        source: template.source,
                        url: "#",
                        // Randomize time within business hours
                        publishedAt: `${dateStr}T${8 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}:00Z`,
                        sentiment: sentimentCategory,
                        sentimentScore: adjustedSentiment,
                        relatedCompanies: template.relatedCompanies,
                        isSampleData: true
                    });
                }
            }
            
            // Add this day's articles to the full sample
            sampleNews.push(...articlesForThisDay);
            
            // Occasionally add a "market shock" day with highly polarized sentiment
            if (Math.random() < 0.15 && day > 0) { // 15% chance, but not for the most recent day
                // Create a strong event with polarized sentiment
                const isPositiveShock = Math.random() > 0.5;
                const shockSentimentBase = isPositiveShock ? 0.75 : -0.75;
                const shockTitle = isPositiveShock ? 
                    "Markets Surge on Unexpected Economic Data" : 
                    "Markets Plunge on Economic Concerns";
                const shockDescription = isPositiveShock ?
                    "Stocks rallied sharply after surprisingly strong economic indicators sparked investor optimism." :
                    "Stocks fell sharply as concerns about economic stability triggered widespread selling.";
                
                console.log(`Adding market shock day on ${dateStr} with ${isPositiveShock ? 'positive' : 'negative'} sentiment`);
                
                // Replace about 40% of the articles with shock-aligned news
                const articlesToReplace = Math.floor(articlesForThisDay.length * 0.4);
                for (let i = 0; i < articlesToReplace; i++) {
                    // Pick a random article to replace
                    const indexToReplace = Math.floor(Math.random() * articlesForThisDay.length);
                    
                    // Create a new article with matching shock sentiment
                    const sentimentVariation = (Math.random() * 0.25) - 0.05; // Mostly same direction variation
                    const replacementSentiment = Math.max(-1, Math.min(1, shockSentimentBase + sentimentVariation));
                    
                    // Determine sentiment category
                    let sentimentCategory;
                    if (replacementSentiment > 0.1) {
                        sentimentCategory = 'positive';
                    } else if (replacementSentiment < -0.1) {
                        sentimentCategory = 'negative';
                    } else {
                        sentimentCategory = 'neutral';
                    }
                    
                    // Pick a source
                    const source = sources[Math.floor(Math.random() * sources.length)];
                    
                    // Generate a unique suffix for this shock news
                    const suffix = descriptiveSuffixes[Math.floor(Math.random() * descriptiveSuffixes.length)];
                    const uniqueTitle = `${shockTitle}: ${suffix}`;
                    
                    // Replace the article at the chosen index
                    sampleNews[sampleNews.length - articlesForThisDay.length + indexToReplace] = {
                        id: `${dateStr}-shock-${i}`,
                        title: uniqueTitle,
                        description: shockDescription,
                        source: source,
                        url: "#",
                        publishedAt: `${dateStr}T${8 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}:00Z`,
                        sentiment: sentimentCategory,
                        sentimentScore: replacementSentiment,
                        relatedCompanies: ["SPY", "DIA", "QQQ"],
                        isSampleData: true,
                        isShockEvent: true
                    };
                }
            }
        }
        
        console.log(`Created ${sampleNews.length} sample news articles across ${dateRange} days with enhanced day-to-day variation and increased sentiment variance`);
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
     * Can use provided S&P 500 prices if available
     * @param {number} dateRange Number of days to analyze (default: 7)
     * @param {Array} realPrices Optional array of real S&P 500 prices to use
     * @returns {Array} Market data for the requested date range
     */
    fallbackToSampleData: (dateRange = 7, realPrices = null) => {
        // Check if we have real price data
        if (realPrices && Array.isArray(realPrices) && realPrices.length > 0) {
            console.log(`Using provided real S&P 500 prices for ${realPrices.length} days instead of generated data`);
            
            // Convert the provided prices into our data format
            const today = new Date();
            const marketData = [];
            
            // Use as many real prices as we have, up to the dateRange
            const daysToUse = Math.min(realPrices.length, dateRange);
            
            for (let i = 0; i < daysToUse; i++) {
                // Calculate the date for this price point
                const date = new Date(today);
                date.setDate(date.getDate() - (daysToUse - 1 - i)); // Most recent price last
                
                // Skip weekends
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    continue;
                }
                
                // Get the price for this day
                const currentPrice = parseFloat(realPrices[i]);
                
                // Calculate change from previous day if available
                let previousPrice = i > 0 ? parseFloat(realPrices[i-1]) : null;
                let dailyChange = previousPrice ? (currentPrice - previousPrice) : 0;
                let percentChange = previousPrice ? ((dailyChange / previousPrice) * 100) : 0;
                
                // Add the data point with real price
                marketData.push({
                    date: date.toISOString().split('T')[0],
                    value: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(dailyChange.toFixed(2)),
                    percentChange: parseFloat(percentChange.toFixed(2)),
                    isRealData: true, // Flag to indicate this is real data
                    isSampleData: false
                });
            }
            
            // If we don't have enough real data to fill the dateRange, add generated data to fill in
            if (marketData.length < dateRange) {
                console.log(`Only had ${marketData.length} days of real data, generating ${dateRange - marketData.length} additional days`);
                
                // Use the last real price as the base for generated data
                let baseValue = marketData.length > 0 ? marketData[marketData.length - 1].value : 5240;
                
                // Generate additional data points needed
                const additionalDays = dateRange - marketData.length;
                const volatilityBase = 0.7;
                let currentTrend = Math.random() > 0.5 ? 1 : -1;
                let trendStrength = Math.random() * 0.6 + 0.2;
                
                for (let i = 0; i < additionalDays; i++) {
                    // Calculate the date for this additional point
                    const lastDate = marketData.length > 0 ? 
                        new Date(marketData[marketData.length - 1].date) : 
                        new Date(today);
                    lastDate.setDate(lastDate.getDate() + 1);
                    
                    // Skip weekends
                    const dayOfWeek = lastDate.getDay();
                    if (dayOfWeek === 0 || dayOfWeek === 6) {
                        continue;
                    }
                    
                    // Generate a price movement based on trend and volatility
                    const dailyVolatility = volatilityBase * (0.5 + Math.random() * 0.8);
                    const trendInfluence = currentTrend * trendStrength * 8;
                    const randomComponent = (Math.random() * 16 - 8) * dailyVolatility;
                    const dailyChange = trendInfluence + randomComponent;
                    
                    baseValue += dailyChange;
                    baseValue = Math.max(baseValue, 5000);
                    
                    marketData.push({
                        date: lastDate.toISOString().split('T')[0],
                        value: parseFloat(baseValue.toFixed(2)),
                        change: parseFloat(dailyChange.toFixed(2)),
                        percentChange: parseFloat(((dailyChange / (baseValue - dailyChange)) * 100).toFixed(2)),
                        isRealData: false,
                        isSampleData: true
                    });
                }
            }
            
            // Sort by date ascending for visualization
            const sortedData = marketData.sort((a, b) => new Date(a.date) - new Date(b.date));
            console.log(`Using ${sortedData.filter(d => d.isRealData).length} days of real S&P 500 data and ${sortedData.filter(d => !d.isRealData).length} days of generated data`);
            return sortedData;
        }
        
        // If no real prices provided, fall back to the original sample data generation
        console.warn(`Using fallback sample market data for ${dateRange} days - This means the real S&P 500 data could not be fetched`);
        
        // Use more realistic S&P 500 values (around 5,200 as of June 2024)
        const today = new Date();
        const marketData = [];
        let baseValue = 5240; // Current baseline S&P 500 value (as of June 2024)
        
        // Generate some seed values for market simulation
        const volatilityBase = 0.7; // Base volatility factor
        
        // Create realistic daily fluctuations that follow trends
        // We'll use a trend-following approach with occasional reversals
        let currentTrend = Math.random() > 0.5 ? 1 : -1; // Start with random up/down trend
        let trendStrength = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
        let trendDuration = Math.floor(Math.random() * 4) + 3; // 3 to 6 days for initial trend
        
        console.log(`Initial market trend: ${currentTrend > 0 ? 'bullish' : 'bearish'} with strength ${trendStrength.toFixed(2)}`);
        
        // Generate market data for the specified number of days
        const daysToGenerate = Math.min(dateRange, 90); // Cap at 90 days for sanity
        for (let i = daysToGenerate - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Skip weekends as real market data would
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue; // Skip weekend days
            }
            
            // Check if we should change the trend
            // Trends naturally change after their duration expires
            // or can change unexpectedly with a small probability
            trendDuration--;
            const unexpectedReversal = Math.random() < 0.15; // 15% chance of unexpected trend change
            
            if (trendDuration <= 0 || unexpectedReversal) {
                // Change trend direction
                currentTrend *= -1;
                // Set new trend parameters
                trendStrength = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
                trendDuration = Math.floor(Math.random() * 4) + 2; // 2 to 5 days for new trend
                
                // Log the trend change
                if (unexpectedReversal) {
                    console.log(`Unexpected market trend reversal on ${date.toISOString().split('T')[0]}: now ${currentTrend > 0 ? 'bullish' : 'bearish'}`);
                } else {
                    console.log(`Natural market trend change on ${date.toISOString().split('T')[0]}: now ${currentTrend > 0 ? 'bullish' : 'bearish'}`);
                }
            }
            
            // Calculate daily volatility (some days more volatile than others)
            const dailyVolatility = volatilityBase * (0.5 + Math.random() * 0.8); // 0.5x to 1.3x base volatility
            
            // Generate daily change influenced by the current trend
            const trendInfluence = currentTrend * trendStrength * 8; // Base influence of trend direction
            const randomComponent = (Math.random() * 16 - 8) * dailyVolatility; // Random noise
            let dailyChange = trendInfluence + randomComponent;
            
            // Sometimes add a market shock (5% chance)
            if (Math.random() < 0.05) {
                const shockDirection = Math.random() > 0.5 ? 1 : -1;
                const shockMagnitude = (Math.random() * 1.5 + 1) * 10; // 10-25 point shock
                dailyChange += shockDirection * shockMagnitude;
                console.log(`Market shock on ${date.toISOString().split('T')[0]}: ${shockDirection > 0 ? 'positive' : 'negative'} shock of ${shockMagnitude.toFixed(1)} points`);
            }
            
            // Add the day's change to the base value
            baseValue += dailyChange;
            
            // Ensure market doesn't go too low (unrealistic)
            baseValue = Math.max(baseValue, 5000);
            
            // Add the data point
            marketData.push({
                date: date.toISOString().split('T')[0],
                value: parseFloat(baseValue.toFixed(2)),
                change: parseFloat(dailyChange.toFixed(2)),
                percentChange: parseFloat(((dailyChange / (baseValue - dailyChange)) * 100).toFixed(2)),
                trend: currentTrend > 0 ? 'bullish' : 'bearish',
                volatility: dailyVolatility > 0.9 ? 'high' : dailyVolatility < 0.7 ? 'low' : 'medium',
                isRealData: false,
                isSampleData: true // Flag to indicate this is sample data
            });
        }
        
        // Make sure we have at least the requested days of data (accounting for weekends)
        const expectedBusinessDays = Math.min(Math.floor(daysToGenerate * 5 / 7), daysToGenerate); // Approximately 5/7 of days are business days
        while (marketData.length < expectedBusinessDays) {
            // Generate additional dates if needed
            const lastDate = new Date(marketData[marketData.length - 1].date);
            lastDate.setDate(lastDate.getDate() + 1);
            
            // Skip weekends
            const dayOfWeek = lastDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                continue;
            }
            
            // Use the current trend to influence additional data points
            const trendInfluence = currentTrend * trendStrength * 8;
            const randomComponent = (Math.random() * 16 - 8) * volatilityBase;
            const dailyChange = trendInfluence + randomComponent;
            
            baseValue += dailyChange;
            baseValue = Math.max(baseValue, 5000); // Ensure market doesn't go too low
            
            marketData.push({
                date: lastDate.toISOString().split('T')[0],
                value: parseFloat(baseValue.toFixed(2)),
                change: parseFloat(dailyChange.toFixed(2)),
                percentChange: parseFloat(((dailyChange / (baseValue - dailyChange)) * 100).toFixed(2)),
                trend: currentTrend > 0 ? 'bullish' : 'bearish',
                volatility: volatilityBase > 0.9 ? 'high' : volatilityBase < 0.7 ? 'low' : 'medium',
                isRealData: false,
                isSampleData: true
            });
        }
        
        // Sort by date ascending for visualization
        const sortedData = marketData.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(`Generated ${sortedData.length} days of sample market data with realistic trends and volatility patterns`);
        return sortedData;
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