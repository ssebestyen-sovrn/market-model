/**
 * API handling for Market News Analyzer
 * Handles fetching news and market data
 */

// Initialize Supabase client
const supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

const API = {
    /**
     * Fetch news data from Supabase
     * @param {number} limit - Number of news items to fetch (default: 10)
     * @returns {Promise} Promise object with news data
     */
    fetchNews: async (limit = 10) => {
        try {
            // Show loading state in a real app
            console.log('Fetching news data from Supabase...');
            
            // Fetch news from Supabase - adjust table name to match your Supabase setup
            const { data, error } = await supabaseClient
                .from('news_articles')
                .select('*')
                .order('publishedAt', { ascending: false })
                .limit(limit);
            
            if (error) {
                console.error('Error fetching news:', error);
                throw new Error(error.message);
            }
            
            // Transform data if necessary to match the expected format
            const transformedData = data.map(article => ({
                id: article.id,
                title: article.title,
                description: article.description,
                source: article.source,
                url: article.url || '#',
                publishedAt: article.publishedAt,
                sentiment: article.sentiment || 'neutral',
                relatedCompanies: article.relatedCompanies || []
            }));
            
            return transformedData;
        } catch (error) {
            console.error('Error in fetchNews:', error);
            
            // Fallback to mock data in case of error
            console.warn('Falling back to mock news data');
            return [
                {
                    id: 1,
                    title: "Tech Giants Report Strong Quarterly Earnings",
                    description: "Major technology companies exceeded analyst expectations with their latest quarterly results.",
                    source: "Financial Times",
                    url: "#",
                    publishedAt: "2023-07-28T14:30:00Z",
                    sentiment: "positive",
                    relatedCompanies: ["AAPL", "MSFT", "GOOGL"]
                },
                {
                    id: 2,
                    title: "Federal Reserve Signals Potential Rate Hike",
                    description: "The Federal Reserve indicated it may raise interest rates in response to persistent inflation concerns.",
                    source: "Wall Street Journal",
                    url: "#",
                    publishedAt: "2023-07-27T10:15:00Z",
                    sentiment: "negative",
                    relatedCompanies: ["JPM", "BAC", "GS"]
                },
                {
                    id: 3,
                    title: "Oil Prices Stabilize After Recent Volatility",
                    description: "Crude oil prices have stabilized following weeks of fluctuation due to supply chain disruptions.",
                    source: "Reuters",
                    url: "#",
                    publishedAt: "2023-07-26T16:45:00Z",
                    sentiment: "neutral",
                    relatedCompanies: ["XOM", "CVX", "BP"]
                },
                {
                    id: 4,
                    title: "Retail Sales Show Modest Growth in June",
                    description: "Consumer spending increased slightly in June, indicating resilience in the retail sector.",
                    source: "Bloomberg",
                    url: "#",
                    publishedAt: "2023-07-25T09:20:00Z",
                    sentiment: "positive",
                    relatedCompanies: ["WMT", "TGT", "AMZN"]
                },
                {
                    id: 5,
                    title: "Healthcare Stocks Decline on Policy Uncertainty",
                    description: "Shares of major healthcare companies fell as investors reacted to potential regulatory changes.",
                    source: "CNBC",
                    url: "#",
                    publishedAt: "2023-07-24T13:10:00Z",
                    sentiment: "negative",
                    relatedCompanies: ["JNJ", "PFE", "UNH"]
                },
                {
                    id: 6,
                    title: "New Infrastructure Bill Gains Bipartisan Support",
                    description: "A proposed infrastructure spending package has received backing from both political parties.",
                    source: "The New York Times",
                    url: "#",
                    publishedAt: "2023-07-23T11:30:00Z",
                    sentiment: "positive",
                    relatedCompanies: ["CAT", "DE", "URI"]
                }
            ];
        }
    },
    
    /**
     * Fetch market data for SP500
     * In production, this would connect to a financial data API
     * @returns {Promise} Promise object with market data
     */
    fetchMarketData: async () => {
        try {
            // Fetch market data from Supabase - adjust table name to match your Supabase setup
            const { data, error } = await supabaseClient
                .from('market_data')
                .select('*')
                .order('date', { ascending: true });
                
            if (error) {
                console.error('Error fetching market data:', error);
                throw new Error(error.message);
            }
            
            return data;
        } catch (error) {
            console.error('Error in fetchMarketData:', error);
            
            // Fallback to generated mock data
            console.warn('Falling back to mock market data');
            
            // Generate mock market data for the past 30 days
            const today = new Date();
            const marketData = [];
            let baseValue = 4200; // Starting S&P 500 value
            
            for (let i = 30; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                // Generate a somewhat realistic daily change
                const dailyChange = (Math.random() * 2 - 1) * 20; // Random value between -20 and +20
                baseValue += dailyChange;
                
                marketData.push({
                    date: date.toISOString().split('T')[0],
                    value: baseValue,
                    change: dailyChange,
                    percentChange: (dailyChange / (baseValue - dailyChange)) * 100
                });
            }
            
            return marketData;
        }
    },
    
    /**
     * Save analysis results to Supabase
     * @param {Object} analysisResults The results to save
     * @returns {Promise} Promise object representing the save operation
     */
    saveAnalysisResults: async (analysisResults) => {
        try {
            // Add timestamp
            const resultToSave = {
                ...analysisResults,
                created_at: new Date().toISOString()
            };
            
            // Save to Supabase
            const { data, error } = await supabaseClient
                .from('analysis_results')
                .insert([resultToSave]);
                
            if (error) {
                console.error('Error saving analysis results:', error);
                throw new Error(error.message);
            }
            
            console.log('Analysis results saved to Supabase:', data);
            return { success: true, id: data[0]?.id || 'unknown-id' };
        } catch (error) {
            console.error('Error in saveAnalysisResults:', error);
            return { success: false, error: error.message };
        }
    }
}; 