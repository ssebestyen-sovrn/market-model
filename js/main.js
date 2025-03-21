/**
 * Main application script for Market News Analyzer
 * Initializes the application and handles user interactions
 */

// Global state
let state = {
    newsData: null,
    marketData: null,
    analysisResults: null,
    isLoading: false
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
        const [newsData, marketData] = await Promise.all([
            API.fetchNews(),
            API.fetchMarketData()
        ]);
        
        // Store data in state
        state.newsData = newsData;
        state.marketData = marketData;
        
        // Log article count information
        logNewsDataInfo(newsData);
        
        // Analyze data
        const analysisResults = Analysis.analyzeData(newsData, marketData);
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
    
    // Hide the introduction card
    const introCard = document.querySelector('.container > .row:first-child');
    if (introCard) {
        introCard.classList.add('d-none');
    }
    
    // Check if we're using sample market data and show a warning if we are
    const usingSampleData = state.marketData.some(data => data.isSampleData);
    const warningContainer = document.getElementById('dataWarningContainer');
    
    if (usingSampleData) {
        // Create a warning alert if it doesn't exist
        if (!warningContainer.querySelector('.alert')) {
            const warningAlert = document.createElement('div');
            warningAlert.className = 'alert alert-warning alert-dismissible fade show';
            warningAlert.innerHTML = `
                <strong>Notice:</strong> Using simulated S&P 500 data. 
                <div class="mt-2">
                    <p>This is likely happening because:</p>
                    <ul>
                        <li>The API key has reached its rate limit (free Alpha Vantage keys are limited to 25 calls per day)</li>
                        <li>The S&P 500 market may be closed today (weekends/holidays)</li>
                        <li>There might be a temporary connection issue with Alpha Vantage</li>
                    </ul>
                    <p>Check the browser console (F12 → Console) for more details. The key <code>NVFJQVHXIW3NWLVQ</code> is being used.</p>
                    <p>You can try again later or get a new API key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank">Alpha Vantage</a></p>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            warningContainer.appendChild(warningAlert);
        }
    } else {
        // Clear any existing warnings if we're using real data
        warningContainer.innerHTML = '';
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