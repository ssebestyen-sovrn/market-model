/**
 * Analysis module for Market News Analyzer
 * Processes news and market data to find correlations and make predictions
 */

const Analysis = {
    /**
     * Analyze news sentiment and market data to find correlations
     * @param {Array} newsData Array of news articles
     * @param {Array} marketData Array of market data points
     * @returns {Object} Analysis results
     */
    analyzeData: (newsData, marketData) => {
        // Group news by date
        const newsByDate = newsData.reduce((acc, news) => {
            const date = news.publishedAt.split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(news);
            return acc;
        }, {});
        
        // Calculate sentiment scores by date
        const sentimentByDate = {};
        for (const date in newsByDate) {
            const articles = newsByDate[date];
            let positiveCount = 0;
            let negativeCount = 0;
            let neutralCount = 0;
            
            articles.forEach(article => {
                if (article.sentiment === 'positive') positiveCount++;
                else if (article.sentiment === 'negative') negativeCount++;
                else neutralCount++;
            });
            
            const totalArticles = articles.length;
            sentimentByDate[date] = {
                positive: positiveCount / totalArticles,
                negative: negativeCount / totalArticles,
                neutral: neutralCount / totalArticles,
                score: (positiveCount - negativeCount) / totalArticles // Simple sentiment score
            };
        }
        
        // Match market data with sentiment data
        const correlationData = marketData.map(market => {
            const date = market.date;
            const sentiment = sentimentByDate[date] || { 
                positive: 0, negative: 0, neutral: 0, score: 0 
            };
            
            return {
                date,
                marketValue: market.value,
                marketChange: market.change,
                sentimentScore: sentiment.score,
                positive: sentiment.positive,
                negative: sentiment.negative,
                neutral: sentiment.neutral
            };
        });
        
        // Calculate correlation between sentiment and market changes
        // For simplicity, we'll use a basic approach
        const correlations = Analysis.calculateCorrelations(correlationData);
        
        // Make predictions based on correlations
        const predictions = Analysis.makePredictions(correlationData, correlations);
        
        return {
            correlationData,
            correlations,
            predictions,
            timestamp: new Date().toISOString()
        };
    },
    
    /**
     * Calculate correlations between sentiment and market data
     * @param {Array} data Combined market and sentiment data
     * @returns {Object} Correlation results
     */
    calculateCorrelations: (data) => {
        // Filter out data points with no sentiment
        const validData = data.filter(d => d.sentimentScore !== 0);
        
        if (validData.length < 2) {
            return {
                sentimentToMarket: 0,
                sentimentToNextDayMarket: 0
            };
        }
        
        // Calculate correlation between sentiment and same-day market change
        const sameDayCorrelation = Analysis.calculateCorrelationCoefficient(
            validData.map(d => d.sentimentScore),
            validData.map(d => d.marketChange)
        );
        
        // Calculate correlation between sentiment and next-day market change
        const nextDayData = [];
        for (let i = 0; i < validData.length - 1; i++) {
            nextDayData.push({
                sentimentScore: validData[i].sentimentScore,
                marketChange: validData[i + 1].marketChange
            });
        }
        
        const nextDayCorrelation = Analysis.calculateCorrelationCoefficient(
            nextDayData.map(d => d.sentimentScore),
            nextDayData.map(d => d.marketChange)
        );
        
        return {
            sentimentToMarket: sameDayCorrelation,
            sentimentToNextDayMarket: nextDayCorrelation
        };
    },
    
    /**
     * Calculate Pearson correlation coefficient between two arrays
     * @param {Array} x First array of values
     * @param {Array} y Second array of values
     * @returns {number} Correlation coefficient
     */
    calculateCorrelationCoefficient: (x, y) => {
        const n = x.length;
        
        // Calculate means
        const xMean = x.reduce((sum, val) => sum + val, 0) / n;
        const yMean = y.reduce((sum, val) => sum + val, 0) / n;
        
        // Calculate covariance and standard deviations
        let covariance = 0;
        let xVariance = 0;
        let yVariance = 0;
        
        for (let i = 0; i < n; i++) {
            const xDiff = x[i] - xMean;
            const yDiff = y[i] - yMean;
            covariance += xDiff * yDiff;
            xVariance += xDiff * xDiff;
            yVariance += yDiff * yDiff;
        }
        
        // Avoid division by zero
        if (xVariance === 0 || yVariance === 0) return 0;
        
        return covariance / (Math.sqrt(xVariance) * Math.sqrt(yVariance));
    },
    
    /**
     * Make predictions based on correlation data
     * @param {Array} data Combined market and sentiment data
     * @param {Object} correlations Correlation results
     * @returns {Array} Predictions
     */
    makePredictions: (data, correlations) => {
        // Get the most recent sentiment data
        const recentData = [...data].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 5);
        
        // Calculate average recent sentiment
        const avgSentiment = recentData.reduce((sum, d) => 
            sum + d.sentimentScore, 0) / recentData.length;
        
        // Make prediction based on correlation strength
        const nextDayCorrelation = correlations.sentimentToNextDayMarket;
        const predictionStrength = Math.abs(nextDayCorrelation) * avgSentiment;
        
        // Determine prediction direction
        let direction = "neutral";
        if (predictionStrength > 0.1) {
            direction = nextDayCorrelation > 0 ? 
                (avgSentiment > 0 ? "up" : "down") : 
                (avgSentiment > 0 ? "down" : "up");
        }
        
        // Generate prediction text
        const predictions = [
            {
                timeframe: "Next Day",
                direction: direction,
                confidence: Math.min(Math.abs(predictionStrength) * 100, 90),
                explanation: `Based on recent news sentiment (${avgSentiment.toFixed(2)}) and historical correlation (${nextDayCorrelation.toFixed(2)}), the market is predicted to move ${direction.toUpperCase()}.`
            }
        ];
        
        // Add a week prediction (less confident)
        predictions.push({
            timeframe: "Next Week",
            direction: direction,
            confidence: Math.min(Math.abs(predictionStrength) * 70, 75),
            explanation: "Extended prediction based on current sentiment trends and historical patterns."
        });
        
        return predictions;
    }
}; 