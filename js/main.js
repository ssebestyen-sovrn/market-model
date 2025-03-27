/**
 * Main application script for Market News Analyzer
 * Initializes the application and handles user interactions
 */

// Global state
let state = {
    newsData: null,
    marketData: null,
    analysisResults: null,
    isLoading: false,
    dateRange: 7,
    tickerGroup: 'all',
    tickerGroups: {
        all: ['SPY'],
        tech: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
        finance: ['JPM', 'BAC', 'GS', 'V', 'MA'],
        retail: ['AMZN', 'WMT', 'TGT', 'KO', 'PEP'],
        health: ['JNJ', 'PFE', 'UNH']
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    Visualization.initCharts();
    
    // Set up event listeners
    document.getElementById('analyzeBtn').addEventListener('click', handleAnalyzeClick);
    
    // Handle date range radio changes
    document.querySelectorAll('input[name="dateRange"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.dateRange = parseInt(e.target.value);
        });
    });
    
    // Handle ticker group radio changes
    document.querySelectorAll('input[name="tickerGroup"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.tickerGroup = e.target.value;
        });
    });
});

/**
 * Handle analyze button click
 */
async function handleAnalyzeClick() {
    if (state.isLoading) return;
    
    try {
        // Update UI to show loading state
        setLoadingState(true);
        
        // Fetch data with selected date range
        const [newsData, marketData] = await Promise.all([
            API.fetchNews(state.dateRange),
            API.fetchMarketData(state.dateRange)
        ]);
        
        // Filter news data based on selected ticker group
        const filteredNewsData = state.tickerGroup === 'all' 
            ? newsData 
            : newsData.filter(article => {
                const tickers = state.tickerGroups[state.tickerGroup];
                return article.relatedCompanies.some(ticker => tickers.includes(ticker));
            });
        
        // Store data in state
        state.newsData = filteredNewsData;
        state.marketData = marketData;
        
        // Log article count information
        logNewsDataInfo(filteredNewsData);
        
        // Analyze data
        const analysisResults = Analysis.analyzeData(filteredNewsData, marketData);
        state.analysisResults = analysisResults;
        
        // Save results to database (in a real app, this would use Supabase)
        await API.saveAnalysisResults(analysisResults);
        
        // Update UI with results
        updateUI();
        
    } catch (error) {
        console.error('Error analyzing data:', error);
        alert('An error occurred while analyzing data. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Log information about the news data being processed
 * @param {Array} newsData The news data to analyze
 */
function logNewsDataInfo(newsData) {
    console.log(`%cMARKET NEWS ANALYZER - DEBUG INFO`, 'font-weight: bold; font-size: 14px; color: blue;');
    console.log(`%cTotal news articles in dataset: ${newsData.length}`, 'font-weight: bold;');
    
    // Group news by date to count articles per day
    const newsByDate = {};
    newsData.forEach(news => {
        const date = news.publishedAt.split('T')[0];
        if (!newsByDate[date]) {
            newsByDate[date] = [];
        }
        newsByDate[date].push(news);
    });
    
    // Log articles per day
    console.log('%cArticles per day:', 'font-weight: bold;');
    const dates = Object.keys(newsByDate).sort(); // Sort dates chronologically
    for (const date of dates) {
        console.log(`  ${date}: ${newsByDate[date].length} articles`);
    }
    
    // Count sentiment categories
    const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0
    };
    
    newsData.forEach(news => {
        sentimentCounts[news.sentiment]++;
    });
    
    console.log('%cOverall sentiment distribution:', 'font-weight: bold;');
    console.log(`  Positive: ${sentimentCounts.positive} (${(sentimentCounts.positive / newsData.length * 100).toFixed(1)}%)`);
    console.log(`  Negative: ${sentimentCounts.negative} (${(sentimentCounts.negative / newsData.length * 100).toFixed(1)}%)`);
    console.log(`  Neutral: ${sentimentCounts.neutral} (${(sentimentCounts.neutral / newsData.length * 100).toFixed(1)}%)`);
}

/**
 * Log information about the analysis results
 * @param {Object} analysisResults The results of the analysis
 */
function logAnalysisResults(analysisResults) {
    console.log('%cANALYSIS RESULTS - DEBUG INFO', 'font-weight: bold; font-size: 14px; color: green;');
    
    // Log correlation data
    console.log('%cCorrelation Data (by date):', 'font-weight: bold;');
    const sortedData = [...analysisResults.correlationData].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    sortedData.forEach(day => {
        console.log(`  ${day.date}: ${day.articlesCount} articles, Sentiment: ${day.sentimentScore.toFixed(2)}, Market Change: ${day.marketChange.toFixed(2)}`);
        console.log(`    Positive: ${day.positiveCount}, Negative: ${day.negativeCount}, Neutral: ${day.neutralCount}`);
    });
    
    // Log correlation values
    console.log('%cCorrelation Coefficients:', 'font-weight: bold;');
    for (const key in analysisResults.correlations) {
        console.log(`  ${key}: ${analysisResults.correlations[key].toFixed(3)}`);
    }
    
    // Log prediction details
    console.log('%cPredictions:', 'font-weight: bold;');
    analysisResults.predictions.forEach(prediction => {
        console.log(`  ${prediction.timeframe}: ${prediction.direction.toUpperCase()} (Confidence: ${prediction.confidence}%, Sentiment: ${prediction.sentiment})`);
    });
}

/**
 * Update UI with analysis results
 */
function updateUI() {
    // Show results section
    document.getElementById('resultsSection').classList.remove('d-none');
    
    // Update data source badge
    const usingSampleMarketData = state.marketData.some(data => data.isSampleData);
    const usingSampleNewsData = state.newsData.some(data => data.isSampleData);
    const dataSourceBadge = document.getElementById('dataSourceBadge');
    
    if (usingSampleMarketData && usingSampleNewsData) {
        dataSourceBadge.textContent = 'Sample Data (All)';
        dataSourceBadge.className = 'badge rounded-pill ms-2 bg-warning text-dark';
        dataSourceBadge.title = 'Using simulated market and news data';
    } else if (usingSampleMarketData) {
        dataSourceBadge.textContent = 'Sample Data (Market)';
        dataSourceBadge.className = 'badge rounded-pill ms-2 bg-warning text-dark';
        dataSourceBadge.title = 'Using real news but simulated market data';
    } else if (usingSampleNewsData) {
        dataSourceBadge.textContent = 'Sample Data (News)';
        dataSourceBadge.className = 'badge rounded-pill ms-2 bg-warning text-dark';
        dataSourceBadge.title = 'Using real market but simulated news data';
    } else {
        dataSourceBadge.textContent = 'Live Data';
        dataSourceBadge.className = 'badge rounded-pill ms-2 bg-success text-white';
        dataSourceBadge.title = 'Using real-time market and news data';
    }
    
    // Update analysis summary metrics
    updateAnalysisSummary(state.analysisResults, state.newsData);
    
    // Update charts
    Visualization.updateCharts(state.analysisResults, state.newsData, state.marketData);
    
    // Render news cards
    Visualization.renderNewsCards(state.newsData);
    
    // Render predictions
    Visualization.renderPredictions(state.analysisResults.predictions);
    
    // Log detailed analysis results
    logAnalysisResults(state.analysisResults);
}

/**
 * Update the Analysis Summary section with key metrics
 * @param {Object} analysisResults The results of the analysis
 * @param {Array} newsData The news data
 */
function updateAnalysisSummary(analysisResults, newsData) {
    // Calculate total articles
    const totalArticles = newsData.length;
    document.getElementById('totalArticlesCount').textContent = totalArticles;
    
    // Calculate total days
    const uniqueDays = new Set();
    newsData.forEach(news => {
        const date = news.publishedAt.split('T')[0];
        uniqueDays.add(date);
    });
    document.getElementById('totalDaysCount').textContent = uniqueDays.size;
    
    // Update correlation value
    const correlation = analysisResults.correlations.sentimentToNextDayMarket;
    const correlationElement = document.getElementById('correlationValue');
    correlationElement.textContent = correlation.toFixed(2);
    
    // Add class based on correlation direction
    correlationElement.className = '';
    if (correlation > 0.1) {
        correlationElement.classList.add('positive');
    } else if (correlation < -0.1) {
        correlationElement.classList.add('negative');
    } else {
        correlationElement.classList.add('neutral');
    }
    
    // Update stock group focus
    const stockGroupElement = document.getElementById('stockGroupValue');
    const groupLabels = {
        all: 'All Stocks',
        tech: 'Technology',
        finance: 'Financial',
        retail: 'Retail & Consumer',
        health: 'Healthcare'
    };
    stockGroupElement.textContent = groupLabels[state.tickerGroup];
    
    // Calculate and update average sentiment score
    const avgSentiment = newsData.reduce((sum, article) => sum + article.sentimentScore, 0) / totalArticles;
    const avgSentimentElement = document.getElementById('avgSentimentValue');
    avgSentimentElement.textContent = avgSentiment.toFixed(2);
    avgSentimentElement.className = '';
    if (avgSentiment > 0.1) {
        avgSentimentElement.classList.add('positive');
    } else if (avgSentiment < -0.1) {
        avgSentimentElement.classList.add('negative');
    } else {
        avgSentimentElement.classList.add('neutral');
    }
    
    // Calculate and update market volatility
    const marketValues = analysisResults.correlationData.map(d => d.marketValue);
    const marketChanges = analysisResults.correlationData.map(d => d.marketChange);
    const volatility = Math.sqrt(marketChanges.reduce((sum, change) => sum + Math.pow(change, 2), 0) / marketChanges.length);
    const volatilityPercent = (volatility / marketValues[0]) * 100;
    document.getElementById('marketVolatilityValue').textContent = `${volatilityPercent.toFixed(1)}%`;
}

/**
 * Set loading state
 * @param {boolean} isLoading Whether the app is in loading state
 */
function setLoadingState(isLoading) {
    state.isLoading = isLoading;
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (isLoading) {
        loadingIndicator.classList.remove('d-none');
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = 'Analyzing...';
    } else {
        loadingIndicator.classList.add('d-none');
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = 'Analyze Market Data';
    }
} 