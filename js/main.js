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
    isUsingRealData: true
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    Visualization.initCharts();
    
    // Set up event listeners
    document.getElementById('analyzeBtn').addEventListener('click', handleAnalyzeClick);
});

/**
 * Handle analyze button click
 */
async function handleAnalyzeClick() {
    if (state.isLoading) return;
    
    try {
        // Update UI to show loading state
        setLoadingState(true);
        
        // Fetch data
        const [newsResponse, marketResponse] = await Promise.all([
            API.fetchNews(),
            API.fetchMarketData()
        ]);
        
        // Store data in state
        state.newsData = newsResponse.articles;
        state.marketData = marketResponse.data;
        state.isUsingRealData = newsResponse.isRealData && marketResponse.isRealData;
        
        // Log article count information
        logNewsDataInfo(newsResponse.articles);
        
        // Analyze data
        const analysisResults = Analysis.analyzeData(newsResponse.articles, marketResponse.data);
        state.analysisResults = analysisResults;
        
        // Save results to database (in a real app, this would use Supabase)
        await API.saveAnalysisResults(analysisResults);
        
        // Update UI with results
        updateUI();
        
    } catch (error) {
        console.error('Detailed error information:', {
            message: error.message,
            stack: error.stack,
            newsData: state.newsData,
            marketData: state.marketData
        });
        alert(`An error occurred while analyzing data: ${error.message}\n\nPlease check the browser console (F12) for more details.`);
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
    
    // Hide the introduction card
    const introCard = document.querySelector('.container > .row:first-child');
    if (introCard) {
        introCard.classList.add('d-none');
    }
    
    // Add data source indicator
    const dataSourceIndicator = document.createElement('div');
    dataSourceIndicator.className = `alert ${state.isUsingRealData ? 'alert-success' : 'alert-warning'} mb-3`;
    dataSourceIndicator.innerHTML = `
        <i class="fas ${state.isUsingRealData ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        ${state.isUsingRealData ? 'Using real-time market data' : 'Using sample data (API limits reached or error occurred)'}
    `;
    
    // Insert the indicator at the top of the results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.insertBefore(dataSourceIndicator, resultsSection.firstChild);
    
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