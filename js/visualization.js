/**
 * Visualization module for Market News Analyzer
 * Handles rendering charts and data visualizations
 */

const Visualization = {
    /**
     * Initialize charts with empty data
     */
    initCharts: () => {
        // Create enhanced correlation chart (replacing scatter plot with dual-axis bar+line chart)
        const correlationCtx = document.getElementById('correlationChart').getContext('2d');
        window.correlationChart = new Chart(correlationCtx, {
            type: 'bar',
            data: {
                labels: [], // Will be filled with dates
                datasets: [
                    {
                        label: 'Sentiment Score',
                        data: [],
                        backgroundColor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value >= 0 ? 'rgba(78, 188, 135, 0.6)' : 'rgba(239, 71, 111, 0.6)';
                        },
                        borderColor: function(context) {
                            const value = context.dataset.data[context.dataIndex];
                            return value >= 0 ? 'rgba(78, 188, 135, 1)' : 'rgba(239, 71, 111, 1)';
                        },
                        borderWidth: 1,
                        yAxisID: 'y1',
                        order: 2
                    },
                    {
                        label: 'Market Change',
                        data: [],
                        type: 'line',
                        borderColor: '#4cc9f0',
                        backgroundColor: 'rgba(76, 201, 240, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#4cc9f0',
                        fill: false,
                        yAxisID: 'y',
                        order: 1
                    },
                    {
                        label: 'Correlation Trend',
                        data: [],
                        type: 'line',
                        borderColor: 'rgba(67, 97, 238, 0.8)',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1',
                        order: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 0
                },
                hover: {
                    animationDuration: 0
                },
                responsiveAnimationDuration: 0,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Market Change'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        }
                    },
                    y1: {
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Sentiment Score'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        min: -1,
                        max: 1,
                        ticks: {
                            precision: 2,  // Show 2 decimal places
                            count: 5       // Display approximately 5 tick marks
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                return `Date: ${context[0].label}`;
                            },
                            label: (context) => {
                                const label = context.dataset.label;
                                const value = context.raw;
                                if (label === 'Sentiment Score') {
                                    return `${label}: ${value.toFixed(2)}`;
                                } else if (label === 'Market Change') {
                                    return `${label}: $${value.toFixed(2)}`;
                                } else if (label === 'Correlation Trend') {
                                    return `${label}: ${value.toFixed(2)}`;
                                } else {
                                    return `${label}: ${value.toFixed(2)}`;
                                }
                            }
                        },
                        animation: {
                            duration: 0
                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#2b2d42',
                        bodyColor: '#495057',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        titleFont: {
                            family: "'Inter', sans-serif",
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Sentiment Impact on Market Performance',
                        font: {
                            size: 16,
                            weight: 'bold',
                            family: "'Inter', sans-serif"
                        },
                        color: '#2b2d42',
                        padding: {
                            bottom: 15
                        }
                    }
                }
            }
        });
        
        // Create market trend chart
        const trendCtx = document.getElementById('marketTrendChart').getContext('2d');
        window.marketTrendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'S&P 500 Value',
                        data: [],
                        borderColor: '#4cc9f0', // Using our secondary color
                        backgroundColor: 'rgba(76, 201, 240, 0.2)',
                        tension: 0.1,
                        fill: true,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: '#4cc9f0'
                    },
                    {
                        label: 'News Sentiment',
                        data: [],
                        borderColor: '#4361ee', // Using our primary color
                        backgroundColor: 'rgba(67, 97, 238, 0)',
                        borderDash: [5, 5],
                        tension: 0.1,
                        yAxisID: 'y1',
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: '#4361ee'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 0
                },
                hover: {
                    animationDuration: 0
                },
                responsiveAnimationDuration: 0,
                plugins: {
                    title: {
                        display: true,
                        text: 'Market Value vs News Sentiment Over Time',
                        font: {
                            size: 16,
                            weight: 'bold',
                            family: "'Inter', sans-serif"
                        },
                        color: '#2b2d42',
                        padding: {
                            bottom: 15
                        }
                    },
                    subtitle: {
                        display: false,
                        text: 'Shows how market prices and news sentiment trend together over the analyzed time period',
                        position: 'bottom',
                        font: {
                            style: 'italic',
                            size: 12
                        },
                        padding: {
                            bottom: 10
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        animation: {
                            duration: 0 // Disable tooltip animations
                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#2b2d42',
                        bodyColor: '#495057',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        titleFont: {
                            family: "'Inter', sans-serif",
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'S&P 500 Value'
                        },
                        position: 'left'
                    },
                    y1: {
                        title: {
                            display: true,
                            text: 'Sentiment Score'
                        },
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            precision: 2,  // Show 2 decimal places for better readability
                            count: 5       // Display approximately 5 tick marks
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Update charts with analysis results
     * @param {Object} results Analysis results
     * @param {Array} newsData News data
     * @param {Array} marketData Market data
     * @param {number} selectedDateRange The user-selected date range (7, 14, or 30 days)
     */
    updateCharts: (results, newsData, marketData, selectedDateRange = 7) => {
        // Check if we're using sample data
        const usingSampleMarketData = marketData.some(data => data.isSampleData);
        const usingSampleNewsData = newsData.some(data => data.isSampleData);
        
        // Sort data by date for the correlation chart
        const sortedCorrelationData = [...results.correlationData]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .filter(d => d.sentimentScore !== 0); // Remove entries with no sentiment
        
        // For date formatting on charts
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        
        // Prepare data for correlation chart - ensure we respect the selected date range
        // Limit the number of data points shown based on the selected date range
        const determineDataPoints = (data, dateRange) => {
            if (data.length <= dateRange) {
                return data; // Return all data if we have less than or equal to the date range
            }
            return data.slice(-dateRange); // Return the last X days based on date range
        };
        
        // Get data for the selected date range
        const rangeFilteredData = determineDataPoints(sortedCorrelationData, selectedDateRange);
        
        const labels = rangeFilteredData.map(d => formatDate(d.date));
        const sentimentData = rangeFilteredData.map(d => d.sentimentScore);
        const marketChangeData = rangeFilteredData.map(d => d.marketChange);
        
        // Calculate correlation trend line using moving average
        const calculateCorrelationTrend = (sentimentData, marketChangeData, window = 3) => {
            if (sentimentData.length < window) {
                return sentimentData.map(() => null);
            }
            
            const getMovingAverage = (data, window) => {
                const result = [];
                for (let i = 0; i < data.length; i++) {
                    if (i < window - 1) {
                        result.push(null); // Not enough data for the window
                        continue;
                    }
                    
                    let sum = 0;
                    for (let j = 0; j < window; j++) {
                        sum += data[i - j];
                    }
                    result.push(sum / window);
                }
                return result;
            };
            
            // Get moving averages for both series
            const sentimentMA = getMovingAverage(sentimentData, window);
            const marketMA = getMovingAverage(marketChangeData, window);
            
            // Use moving averages to calculate trend influence
            const trendLine = sentimentMA.map((sentiment, i) => {
                if (sentiment === null) return null;
                
                // Simple adjustment to show direction and strength of correlation
                const correlation = results.correlations.sentimentToNextDayMarket;
                const scaledSentiment = sentiment * (Math.abs(correlation) * 0.8); // Scale by correlation strength
                
                return scaledSentiment;
            });
            
            return trendLine;
        };
        
        const correlationTrend = calculateCorrelationTrend(sentimentData, marketChangeData);
        
        // Update correlation chart
        window.correlationChart.data.labels = labels;
        window.correlationChart.data.datasets[0].data = sentimentData;
        window.correlationChart.data.datasets[1].data = marketChangeData;
        window.correlationChart.data.datasets[2].data = correlationTrend;
        
        // Adjust x-axis tick display based on date range to prevent overcrowding
        if (selectedDateRange > 14) {
            window.correlationChart.options.scales.x.ticks = {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 10 // Show fewer ticks for longer date ranges
            };
        } else {
            window.correlationChart.options.scales.x.ticks = {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false
            };
        }
        
        // Add correlation coefficient to chart title
        const correlationCoefficient = results.correlations.sentimentToNextDayMarket;
        const correlationText = Math.abs(correlationCoefficient) < 0.2 ? 'Weak' :
                               Math.abs(correlationCoefficient) < 0.5 ? 'Moderate' : 'Strong';
        const correlationDirection = correlationCoefficient > 0 ? 'Positive' : 
                                    correlationCoefficient < 0 ? 'Negative' : 'Neutral';
        
        window.correlationChart.options.plugins.title = {
            display: true,
            text: `${correlationDirection} ${correlationText} Correlation (${correlationCoefficient.toFixed(2)})`,
            font: {
                size: 14
            }
        };
        
        window.correlationChart.update();
        
        // Update market trend chart with existing code
        const sortedData = [...results.correlationData].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        // Get the appropriate data for the selected date range
        const trendFilteredData = determineDataPoints(sortedData, selectedDateRange);
        
        // Limit the number of data points to prevent overcrowding
        const maxDataPoints = selectedDateRange > 14 ? 20 : 15;
        const step = trendFilteredData.length > maxDataPoints ? Math.floor(trendFilteredData.length / maxDataPoints) : 1;
        const filteredData = step > 1 
            ? trendFilteredData.filter((_, index) => index % step === 0) 
            : trendFilteredData;
        
        const trendLabels = filteredData.map(d => formatDate(d.date));
        const marketValues = filteredData.map(d => d.marketValue);
        const sentimentScores = filteredData.map(d => d.sentimentScore);
        
        // Use fixed range for sentiment score axis (-1 to 1)
        const minSentiment = -1;
        const maxSentiment = 1;
        
        window.marketTrendChart.data.labels = trendLabels;
        window.marketTrendChart.data.datasets[0].data = marketValues;
        window.marketTrendChart.data.datasets[1].data = sentimentScores;
        
        // Update the y1 axis (sentiment score) to use the fixed range
        window.marketTrendChart.options.scales.y1.min = minSentiment;
        window.marketTrendChart.options.scales.y1.max = maxSentiment;
        
        // Add more tick marks for better readability
        window.marketTrendChart.options.scales.y1.ticks = {
            count: 5,
            precision: 2
        };
        
        // Adjust x-axis tick display based on date range
        if (selectedDateRange > 14) {
            window.marketTrendChart.options.scales.x.ticks = {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 10 // Show fewer ticks for longer date ranges
            };
        } else {
            window.marketTrendChart.options.scales.x.ticks = {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false
            };
        }
        
        // Show the fixed sentiment range in the axis title
        window.marketTrendChart.options.scales.y1.title = {
            display: true,
            text: 'Sentiment Score',
            font: {
                weight: 'bold'
            }
        };
        
        // Update chart title to show the date range
        let periodText = selectedDateRange === 7 ? 'Week' : 
                        selectedDateRange === 14 ? '2 Weeks' : 
                        selectedDateRange === 30 ? 'Month' : 
                        `${selectedDateRange} Days`;
        
        // If we're using sample data, add visual indicators
        if (usingSampleMarketData || usingSampleNewsData) {
            // Add a note to the chart title
            let titleText = `Market Trend (Last ${periodText})`;
            if (usingSampleMarketData && usingSampleNewsData) {
                titleText += ' - Simulated Data';
            } else if (usingSampleMarketData) {
                titleText += ' - Simulated Market Data';
            } else {
                titleText += ' - Simulated News Data';
            }
            
            window.marketTrendChart.options.plugins.title = {
                display: true,
                text: titleText,
                font: {
                    size: 14,
                    style: 'italic'
                },
                color: '#d35400' // Orange-red color to indicate simulated data
            };
            
            // Keep subtitle hidden
            window.marketTrendChart.options.plugins.subtitle.display = false;
            
            // Change the market value line style to show it's simulated
            if (usingSampleMarketData) {
                window.marketTrendChart.data.datasets[0].borderDash = [5, 5]; // Dotted line
                window.marketTrendChart.data.datasets[0].borderColor = 'rgba(75, 192, 192, 0.8)'; // More transparent
                window.marketTrendChart.data.datasets[0].pointStyle = 'rectRot'; // Different point style
            }
            
            // Change the sentiment line style to show it's simulated
            if (usingSampleNewsData) {
                window.marketTrendChart.data.datasets[1].borderDash = [5, 5]; // Dotted line
                window.marketTrendChart.data.datasets[1].borderColor = 'rgba(67, 97, 238, 0.6)'; // More transparent
                window.marketTrendChart.data.datasets[1].pointStyle = 'rectRot'; // Different point style
            }
        } else {
            // Reset to normal style for real data
            window.marketTrendChart.options.plugins.title = {
                display: true,
                text: `Market Value vs News Sentiment (Last ${periodText})`,
                font: {
                    size: 14
                }
            };
            
            // Keep subtitle hidden
            window.marketTrendChart.options.plugins.subtitle.display = false;
            
            // Reset market line style
            window.marketTrendChart.data.datasets[0].borderDash = []; // Solid line
            window.marketTrendChart.data.datasets[0].borderColor = 'rgba(75, 192, 192, 1)'; // Normal opacity
            window.marketTrendChart.data.datasets[0].pointStyle = 'circle'; // Normal points
            
            // Reset sentiment line style
            window.marketTrendChart.data.datasets[1].borderDash = []; // Solid line
            window.marketTrendChart.data.datasets[1].borderColor = 'rgba(67, 97, 238, 1)'; // Normal opacity
            window.marketTrendChart.data.datasets[1].pointStyle = 'circle'; // Normal points
        }
        
        window.marketTrendChart.update();
    },
    
    /**
     * Render news in an accordion layout grouped by day
     * @param {Array} newsData News data
     */
    renderNewsCards: (newsData) => {
        const newsContainer = document.getElementById('newsContainer');
        newsContainer.innerHTML = '';
        
        // Group news by date
        const newsByDate = {};
        newsData.forEach(news => {
            const date = news.publishedAt.split('T')[0]; // Extract date part
            if (!newsByDate[date]) {
                newsByDate[date] = [];
            }
            newsByDate[date].push(news);
        });
        
        // Sort dates (newest first)
        const sortedDates = Object.keys(newsByDate).sort((a, b) => 
            new Date(b) - new Date(a)
        );
        
        // Create accordion
        const accordionId = 'newsAccordion';
        const accordion = document.createElement('div');
        accordion.className = 'accordion accordion-flush w-100';
        accordion.id = accordionId;
        
        // Add accordion items for each date
        sortedDates.forEach((date, index) => {
            const formattedDate = new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Sort news by sentiment impact (absolute value of sentiment score)
            const sortedNews = [...newsByDate[date]].sort((a, b) => 
                Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore)
            );
            
            // Calculate average sentiment for the day
            const avgSentiment = sortedNews.reduce((sum, news) => sum + news.sentimentScore, 0) / sortedNews.length;
            const avgSentimentFormatted = avgSentiment >= 0 ? 
                                       `+${avgSentiment.toFixed(2)}` : 
                                       avgSentiment.toFixed(2);
            const sentimentClass = avgSentiment > 0.1 ? 'sentiment-positive' : 
                                  avgSentiment < -0.1 ? 'sentiment-negative' : 
                                  'sentiment-neutral';
            
            // Create accordion item for this date
            const accordionItemId = `accordion-item-${date.replace(/[-]/g, '')}`;
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            
            // Create header with date and summary of articles
            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="heading-${accordionItemId}">
                    <button class="accordion-button collapsed" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#collapse-${accordionItemId}" 
                            aria-expanded="false" aria-controls="collapse-${accordionItemId}">
                        <div class="d-flex justify-content-between w-100 me-3">
                            <span><strong>${formattedDate}</strong> (${sortedNews.length} articles)</span>
                            <span class="ms-3 ${sentimentClass}">Average Sentiment: ${avgSentimentFormatted}</span>
                        </div>
                    </button>
                </h2>
                <div id="collapse-${accordionItemId}" class="accordion-collapse collapse" 
                     aria-labelledby="heading-${accordionItemId}" data-bs-parent="#${accordionId}">
                    <div class="accordion-body p-0">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th scope="col" style="width: 10%">Impact</th>
                                    <th scope="col" style="width: 60%">Headline</th>
                                    <th scope="col" style="width: 15%">Source</th>
                                    <th scope="col" style="width: 15%">Sentiment</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedNews.map((news, newsIndex) => {
                                    const sentimentClass = news.sentimentScore > 0.1 ? 'sentiment-positive' : 
                                                         news.sentimentScore < -0.1 ? 'sentiment-negative' : 
                                                         'sentiment-neutral';
                                    const sentimentIcon = news.sentimentScore > 0.1 ? '↑' : 
                                                        news.sentimentScore < -0.1 ? '↓' : '→';
                                    const formattedScore = news.sentimentScore >= 0 ? 
                                                        `+${news.sentimentScore.toFixed(2)}` : 
                                                        news.sentimentScore.toFixed(2);
                                    const impactLevel = Math.abs(news.sentimentScore);
                                    const impactClass = impactLevel > 0.6 ? 'bg-danger text-white' : 
                                                      impactLevel > 0.4 ? 'bg-warning' : 
                                                      impactLevel > 0.2 ? 'bg-info text-dark' : 
                                                      'bg-light text-muted';
                                    
                                    return `
                                        <tr>
                                            <td>
                                                <span class="badge ${impactClass}">${(impactLevel * 100).toFixed(0)}%</span>
                                            </td>
                                            <td>
                                                <a href="${news.url}" target="_blank" class="text-decoration-none text-dark">
                                                    ${news.title}
                                                </a>
                                            </td>
                                            <td>${news.source}</td>
                                            <td class="${sentimentClass}">
                                                ${sentimentIcon} ${formattedScore}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            accordion.appendChild(accordionItem);
        });
        
        newsContainer.appendChild(accordion);
    },
    
    /**
     * Render prediction cards
     * @param {Array} predictions Prediction data
     */
    renderPredictions: (predictions) => {
        const predictionsContainer = document.getElementById('predictionsContainer');
        predictionsContainer.innerHTML = '';
        
        // Determine column size based on number of predictions
        const colSize = predictions.length === 3 ? 'col-md-4' : 'col-md-6';
        
        predictions.forEach(prediction => {
            const directionClass = `prediction-${prediction.direction.toLowerCase()}`;
            const directionIcon = prediction.direction === 'UP' ? '↑' : 
                                 (prediction.direction === 'DOWN' ? '↓' : '→');
            
            const sentimentValue = parseFloat(prediction.sentiment || 0).toFixed(2);
            const formattedSentiment = sentimentValue >= 0 ? `+${sentimentValue}` : sentimentValue;
            
            const predictionCard = document.createElement('div');
            predictionCard.className = `${colSize}`;
            predictionCard.innerHTML = `
                <div class="card prediction-card ${directionClass} h-100">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${prediction.timeframe} Prediction: 
                            <span class="prediction-${prediction.direction.toLowerCase()}">
                                ${directionIcon} ${prediction.direction}
                            </span>
                        </h5>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <strong>Confidence:</strong> ${prediction.confidence.toFixed(0)}%
                            </div>
                            <div>
                                <strong>Sentiment:</strong> 
                                <span class="sentiment-${prediction.sentiment > 0 ? 'positive' : (prediction.sentiment < 0 ? 'negative' : 'neutral')}">
                                    ${formattedSentiment}
                                </span>
                            </div>
                        </div>
                        <p class="card-text" style="white-space: pre-line">${prediction.explanation}</p>
                    </div>
                </div>
            `;
            
            predictionsContainer.appendChild(predictionCard);
        });
    }
}; 