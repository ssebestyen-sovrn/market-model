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
                scoreOld: (positiveCount - negativeCount) / totalArticles,
                score: avgSentimentScore,
                articlesCount: totalArticles,
                positiveCount: positiveCount,
                negativeCount: negativeCount,
                neutralCount: neutralCount,
                relatedCompanies: Array.from(new Set(articles.flatMap(a => a.relatedCompanies))),
                news: articles // Add the news articles to the date's data
            };
        }
        
        // Match market data with sentiment data and sort by date
        const correlationData = marketData
            .map(market => {
                const date = market.date;
                const sentiment = sentimentByDate[date] || { 
                    positive: 0, negative: 0, neutral: 0, 
                    scoreOld: 0, score: 0, articlesCount: 0,
                    positiveCount: 0, negativeCount: 0, neutralCount: 0,
                    relatedCompanies: [],
                    news: [] // Add empty news array for dates without news
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
                    neutralCount: sentiment.neutralCount,
                    relatedCompanies: sentiment.relatedCompanies,
                    news: sentiment.news // Include news articles in the correlation data
                };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending
        
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
    makePredictions: (data, correlations) => {
        // Get the last 7 days of data for next day prediction
        const recentData = data.slice(-7);
        // Get the last 14 days of data for next week prediction
        const extendedData = data.slice(-14);
        
        console.log('Recent data dates:', recentData.map(d => d.date));
        console.log('Extended data dates:', extendedData.map(d => d.date));
        
        // Calculate weighted sentiment scores for recent data
        const recentSentiment = recentData.reduce((acc, day) => {
            return acc + (day.sentimentScore * day.articlesCount);
        }, 0) / recentData.reduce((acc, day) => acc + day.articlesCount, 0);
        
        // Calculate weighted sentiment scores for extended data
        const extendedSentiment = extendedData.reduce((acc, day) => {
            return acc + (day.sentimentScore * day.articlesCount);
        }, 0) / extendedData.reduce((acc, day) => acc + day.articlesCount, 0);
        
        // Find most influential stories for recent data (last 7 days)
        const recentNews = recentData.flatMap(day => day.news || [])
            .sort((a, b) => Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore))
            .slice(0, 5);
            
        // Find most influential stories for extended data (last 14 days)
        const extendedNews = extendedData.flatMap(day => day.news || [])
            .sort((a, b) => Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore))
            .slice(0, 5);
            
        console.log('Recent news selected:', recentNews);
        console.log('Extended news selected:', extendedNews);
        
        // Track keyword frequencies separately for each timeframe
        const dayKeywordFrequency = {};
        const weekKeywordFrequency = {};
        
        // Process keywords for recent data
        recentNews.forEach(article => {
            const words = (article.title + ' ' + article.description).toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3) { // Only count words longer than 3 characters
                    dayKeywordFrequency[word] = (dayKeywordFrequency[word] || 0) + 1;
                }
            });
        });
        
        // Process keywords for extended data
        extendedNews.forEach(article => {
            const words = (article.title + ' ' + article.description).toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3) { // Only count words longer than 3 characters
                    weekKeywordFrequency[word] = (weekKeywordFrequency[word] || 0) + 1;
                }
            });
        });
        
        // Get top keywords for each timeframe
        const dayKeywords = Object.entries(dayKeywordFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4)
            .map(([word]) => word);
            
        const weekKeywords = Object.entries(weekKeywordFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4)
            .map(([word]) => word);
        
        // Calculate market volatility
        const volatility = recentData.reduce((acc, day) => {
            return acc + Math.abs(day.marketChange);
        }, 0) / recentData.length;
        
        // Calculate sentiment trend
        const sentimentTrend = recentData.slice(-3).reduce((acc, day) => {
            return acc + day.sentimentScore;
        }, 0) / 3;
        
        // Enhanced prediction model
        const nextDayPrediction = {
            timeframe: "Next Day",
            direction: recentSentiment > 0.1 ? 'UP' : recentSentiment < -0.1 ? 'DOWN' : 'NEUTRAL',
            confidence: Math.min(Math.abs(recentSentiment * 100), 100),
            sentiment: recentSentiment,
            explanation: `Market sentiment is ${recentSentiment > 0.1 ? 'positive' : recentSentiment < -0.1 ? 'negative' : 'neutral'} and ${sentimentTrend > 0.1 ? 'improving' : sentimentTrend < -0.1 ? 'declining' : 'stable'}.\n\nKey stories:\n• ${recentNews.slice(0, 2).map(n => n.title).join('\n• ')}\n\nTrending topics:\n${dayKeywords.join(', ')}`
        };
        
        const nextWeekPrediction = {
            timeframe: "Next Week",
            direction: extendedSentiment > 0.1 ? 'UP' : extendedSentiment < -0.1 ? 'DOWN' : 'NEUTRAL',
            confidence: Math.min(Math.abs(extendedSentiment * 100), 100),
            sentiment: extendedSentiment,
            explanation: `Market sentiment is ${extendedSentiment > 0.1 ? 'positive' : extendedSentiment < -0.1 ? 'negative' : 'neutral'} with ${volatility > 5 ? 'high' : volatility > 2 ? 'moderate' : 'low'} volatility.\n\nKey stories:\n• ${extendedNews.slice(0, 2).map(n => n.title).join('\n• ')}\n\nTrending topics:\n${weekKeywords.join(', ')}`
        };
        
        return [nextDayPrediction, nextWeekPrediction];
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