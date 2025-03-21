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
            const date = news.publishedAt.split('T')[0]; // Extract date part
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(news);
            return acc;
        }, {});
        
        // Calculate sentiment scores by date using the numeric sentiment scores
        const sentimentByDate = {};
        for (const date in newsByDate) {
            const articles = newsByDate[date];
            let totalArticles = articles.length;
            
            // Count articles by sentiment category
            let positiveCount = 0;
            let negativeCount = 0;
            let neutralCount = 0;
            
            // Calculate average sentiment score
            let sumSentimentScore = 0;
            
            articles.forEach(article => {
                // Add to categorical counts
                if (article.sentiment === 'positive') positiveCount++;
                else if (article.sentiment === 'negative') negativeCount++;
                else neutralCount++;
                
                // Add to average sentiment score
                sumSentimentScore += article.sentimentScore || 0;
            });
            
            // Calculate average sentiment score for the day
            const avgSentimentScore = totalArticles > 0 ? sumSentimentScore / totalArticles : 0;
            
            // Store the results for this date, including the total number of articles
            sentimentByDate[date] = {
                positive: positiveCount / totalArticles,
                negative: negativeCount / totalArticles,
                neutral: neutralCount / totalArticles,
                scoreOld: (positiveCount - negativeCount) / totalArticles, // Keep for back-compatibility
                score: avgSentimentScore, // New granular score between -1 and 1
                articlesCount: totalArticles, // Store the total count of articles for this date
                positiveCount: positiveCount, // Store absolute count for debugging
                negativeCount: negativeCount, // Store absolute count for debugging
                neutralCount: neutralCount    // Store absolute count for debugging
            };
        }
        
        // Match market data with sentiment data
        const correlationData = marketData.map(market => {
            const date = market.date;
            const sentiment = sentimentByDate[date] || { 
                positive: 0, negative: 0, neutral: 0, 
                scoreOld: 0, score: 0, articlesCount: 0,
                positiveCount: 0, negativeCount: 0, neutralCount: 0
            };
            
            return {
                date,
                marketValue: market.value,
                marketChange: market.change,
                sentimentScore: sentiment.score,
                sentimentScoreOld: sentiment.scoreOld,
                positive: sentiment.positive,
                negative: sentiment.negative,
                neutral: sentiment.neutral,
                articlesCount: sentiment.articlesCount,
                positiveCount: sentiment.positiveCount,
                negativeCount: sentiment.negativeCount,
                neutralCount: sentiment.neutralCount
            };
        });
        
        // Calculate correlation between sentiment and market changes
        const correlations = {
            sentimentToMarketValue: Analysis.calculateCorrelation(
                correlationData.map(d => d.sentimentScore),
                correlationData.map(d => d.marketValue)
            ),
            sentimentToMarketChange: Analysis.calculateCorrelation(
                correlationData.map(d => d.sentimentScore),
                correlationData.map(d => d.marketChange)
            ),
            sentimentToNextDayMarket: Analysis.calculateCorrelation(
                correlationData.slice(0, -1).map(d => d.sentimentScore),
                correlationData.slice(1).map(d => d.marketChange)
            )
        };
        
        // Make predictions based on correlations
        const predictions = Analysis.makePredictions(correlationData, correlations, newsData);
        
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
     * Calculate correlation between two arrays
     * @param {Array} x First array of values
     * @param {Array} y Second array of values
     * @returns {number} Correlation coefficient
     */
    calculateCorrelation: (x, y) => {
        // Make sure arrays have the same length
        if (x.length !== y.length || x.length === 0) return 0;
        
        // Filter out any NaN or undefined values
        const validPairs = [];
        for (let i = 0; i < x.length; i++) {
            if (!isNaN(x[i]) && !isNaN(y[i]) && 
                x[i] !== undefined && y[i] !== undefined) {
                validPairs.push({ x: x[i], y: y[i] });
            }
        }
        
        if (validPairs.length < 2) return 0; // Need at least 2 pairs for correlation
        
        // Extract valid x and y arrays
        const validX = validPairs.map(pair => pair.x);
        const validY = validPairs.map(pair => pair.y);
        
        // Use correlation coefficient calculation
        return Analysis.calculateCorrelationCoefficient(validX, validY);
    },
    
    /**
     * Make predictions based on correlation data
     * @param {Array} data Combined market and sentiment data
     * @param {Object} correlations Correlation results
     * @returns {Array} Predictions
     */
    makePredictions: (data, correlations, newsData) => {
        // Get more recent sentiment data
        const recentData = [...data].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 7);
        
        // Calculate weighted average of recent sentiment (newer news has more weight)
        const totalWeight = recentData.reduce((sum, _, index) => sum + (7 - index), 0);
        const weightedSentiment = recentData.reduce((sum, d, index) => 
            sum + (d.sentimentScore * (7 - index)), 0) / totalWeight;
        
        // Calculate standard deviation of sentiment scores to measure consistency
        const sentimentValues = recentData.map(d => d.sentimentScore);
        const avgSentiment = sentimentValues.reduce((sum, val) => sum + val, 0) / sentimentValues.length;
        const sentimentVariance = sentimentValues.reduce((sum, val) => sum + Math.pow(val - avgSentiment, 2), 0) / sentimentValues.length;
        const sentimentStdDev = Math.sqrt(sentimentVariance);
        
        // Get sentiment trend (improving or worsening)
        const sentimentTrend = recentData.length > 1 ? 
            recentData[0].sentimentScore - recentData[recentData.length - 1].sentimentScore : 0;
        
        // Calculate article counts and sentiments for confidence
        // This processes ALL news articles (up to 50 per day) for the analysis
        let totalPositiveCount = 0;
        let totalNegativeCount = 0;
        let totalNeutralCount = 0;
        let totalArticleCount = 0;
        
        recentData.forEach(day => {
            // Using articlesCount property that contains actual count of articles for this day
            const articlesForDay = day.articlesCount || 0;
            totalArticleCount += articlesForDay;
            
            // Calculate estimated counts of sentiment categories
            totalPositiveCount += Math.round(day.positive * articlesForDay);
            totalNegativeCount += Math.round(day.negative * articlesForDay);
            totalNeutralCount += Math.round(day.neutral * articlesForDay);
        });
        
        // Make prediction based on correlation strength and sentiment
        const nextDayCorrelation = correlations.sentimentToNextDayMarket;
        
        // Enhanced prediction model using weighted sentiment and recent volatility
        const volatilityFactor = Math.min(sentimentStdDev * 3, 1); // Higher volatility = less certain prediction
        const trendFactor = Math.min(Math.abs(sentimentTrend) * 2, 1); // Stronger trend = stronger prediction
        
        // Calculate prediction strength with all factors
        const rawStrength = weightedSentiment * nextDayCorrelation;
        const adjustedStrength = rawStrength * (1 - volatilityFactor * 0.3) * (1 + trendFactor * 0.2);
        
        // Determine prediction direction
        let direction = "neutral";
        if (Math.abs(adjustedStrength) > 0.05) {
            direction = adjustedStrength > 0 ? "up" : "down";
        }
        
        // More nuanced confidence calculation
        const correlationConfidence = Math.abs(nextDayCorrelation) * 40; // Up to 40% from correlation
        const consistencyConfidence = (1 - Math.min(sentimentStdDev, 0.5) / 0.5) * 20; // Up to 20% from consistency
        const trendConfidence = Math.min(Math.abs(sentimentTrend) * 10, 15); // Up to 15% from trend
        const dataPointsConfidence = Math.min(recentData.length / 7 * 15, 15); // Up to 15% from amount of data
        const articleCountConfidence = Math.min(totalArticleCount / 50 * 10, 10); // Up to 10% from article count
        
        // Total confidence capped at 95%
        const totalConfidence = Math.min(
            correlationConfidence + 
            consistencyConfidence + 
            trendConfidence + 
            dataPointsConfidence + 
            articleCountConfidence, 
            95
        );
        
        // Generate detailed prediction text with article counts
        const predictions = [
            {
                timeframe: "Next Day",
                direction: direction,
                confidence: Math.round(totalConfidence),
                sentiment: weightedSentiment.toFixed(2),
                explanation: `Based on analysis of ${totalArticleCount} news articles (${totalPositiveCount} positive, ${totalNegativeCount} negative, ${totalNeutralCount} neutral) from ${recentData.length} days, the weighted sentiment score is ${weightedSentiment.toFixed(2)}. The sentiment trend is ${sentimentTrend > 0.05 ? "improving" : sentimentTrend < -0.05 ? "declining" : "stable"} (${sentimentTrend.toFixed(2)}) with a correlation of ${nextDayCorrelation.toFixed(2)}. Market ${direction === "neutral" ? "is expected to remain stable" : "is expected to move " + direction.toUpperCase()}.`
            }
        ];
        
        // Add a week prediction with adjusted confidence
        // Use more trend-focused factors for weekly prediction
        const weekDirection = sentimentTrend > 0.1 ? 
            "up" : sentimentTrend < -0.1 ? 
            "down" : direction; // Default to daily direction if trend is weak
            
        // Weekly prediction has lower confidence
        const weekConfidence = Math.round(totalConfidence * 0.75);
        
        predictions.push({
            timeframe: "Next Week",
            direction: weekDirection,
            confidence: weekConfidence,
            sentiment: (weightedSentiment + sentimentTrend).toFixed(2),
            explanation: `Extended prediction based on ${totalArticleCount} articles across ${recentData.length} days with sentiment trend of ${sentimentTrend.toFixed(2)}. The overall sentiment is ${avgSentiment > 0.1 ? "positive" : avgSentiment < -0.1 ? "negative" : "neutral"} (${avgSentiment.toFixed(2)}) with volatility of ${sentimentStdDev.toFixed(2)}.`
        });
        
        return predictions;
    },
    
    /**
     * Generate detailed explanation for a prediction
     */
    generatePredictionExplanation: (
        timeframe, 
        direction, 
        sentiment, 
        correlation, 
        confidence,
        positiveCount,
        negativeCount,
        neutralCount,
        totalCount,
        isImproving,
        isWorsening
    ) => {
        const sentimentStrength = Math.abs(sentiment) < 0.2 ? 'weak' : 
                               Math.abs(sentiment) < 0.5 ? 'moderate' : 'strong';
        const sentimentDirection = sentiment > 0 ? 'positive' : (sentiment < 0 ? 'negative' : 'neutral');
        
        const correlationStrength = Math.abs(correlation) < 0.2 ? 'weak' : 
                                   Math.abs(correlation) < 0.5 ? 'moderate' : 'strong';
        const correlationDirection = correlation > 0 ? 'positive' : (correlation < 0 ? 'negative' : 'inverse');
        
        let explanation = `Based on analysis of ${totalCount} recent news articles (${positiveCount} positive, ${negativeCount} negative, ${neutralCount} neutral), `;
        explanation += `we're seeing a ${sentimentStrength} ${sentimentDirection} sentiment trend `;
        
        if (isImproving) {
            explanation += `that is improving. `;
        } else if (isWorsening) {
            explanation += `that is declining. `;
        } else {
            explanation += `that is stable. `;
        }
        
        explanation += `Historical data shows a ${correlationStrength} ${correlationDirection} correlation between news sentiment and ${timeframe.toLowerCase()} market movement. `;
        
        if (direction === 'up') {
            explanation += `This suggests the market is likely to rise. `;
        } else if (direction === 'down') {
            explanation += `This suggests the market is likely to fall. `;
        } else {
            explanation += `This suggests minimal market movement. `;
        }
        
        explanation += `Confidence level: ${confidence}%.`;
        
        return explanation;
    }
}; 