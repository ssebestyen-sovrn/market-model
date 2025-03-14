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
 * Update UI with analysis results
 */
function updateUI() {
    // Show results section
    document.getElementById('resultsSection').classList.remove('d-none');
    
    // Update charts
    Visualization.updateCharts(state.analysisResults, state.newsData, state.marketData);
    
    // Render news cards
    Visualization.renderNewsCards(state.newsData);
    
    // Render predictions
    Visualization.renderPredictions(state.analysisResults.predictions);
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
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