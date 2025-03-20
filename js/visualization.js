/**
 * Visualization module for Market News Analyzer
 * Handles rendering charts and data visualizations
 */

const Visualization = {
    /**
     * Initialize charts with empty data
     */
    initCharts: () => {
        // Create correlation chart
        const correlationCtx = document.getElementById('correlationChart').getContext('2d');
        window.correlationChart = new Chart(correlationCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Sentiment vs. Market Change',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    pointRadius: 6,
                    pointHoverRadius: 6
                }]
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
                            text: 'News Sentiment Score'
                        },
                        ticks: {
                            beginAtZero: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Market Change'
                        },
                        ticks: {
                            beginAtZero: false
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = context.raw;
                                return `Date: ${point.date}, Sentiment: ${point.x.toFixed(2)}, Change: ${point.y.toFixed(2)}`;
                            }
                        },
                        animation: {
                            duration: 0
                        }
                    },
                    legend: {
                        position: 'top',
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
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1,
                        fill: true,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)'
                    },
                    {
                        label: 'News Sentiment',
                        data: [],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0)',
                        borderDash: [5, 5],
                        tension: 0.1,
                        yAxisID: 'y1',
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)'
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
                        min: -1,
                        max: 1,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        animation: {
                            duration: 0 // Disable tooltip animations
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
     */
    updateCharts: (results, newsData, marketData) => {
        // Update correlation chart
        const correlationData = results.correlationData.map(d => ({
            x: d.sentimentScore,
            y: d.marketChange,
            date: d.date
        })).filter(d => d.x !== 0); // Filter out days with no sentiment data
        
        window.correlationChart.data.datasets[0].data = correlationData;
        window.correlationChart.update();
        
        // Update market trend chart
        const sortedData = [...results.correlationData].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        // Limit the number of data points to prevent overcrowding
        const maxDataPoints = 15;
        const step = sortedData.length > maxDataPoints ? Math.floor(sortedData.length / maxDataPoints) : 1;
        const filteredData = sortedData.filter((_, index) => index % step === 0);
        
        const labels = filteredData.map(d => d.date);
        const marketValues = filteredData.map(d => d.marketValue);
        const sentimentScores = filteredData.map(d => d.sentimentScore);
        
        window.marketTrendChart.data.labels = labels;
        window.marketTrendChart.data.datasets[0].data = marketValues;
        window.marketTrendChart.data.datasets[1].data = sentimentScores;
        window.marketTrendChart.update();
    },
    
    /**
     * Render news cards
     * @param {Array} newsData News data
     */
    renderNewsCards: (newsData) => {
        const newsContainer = document.getElementById('newsContainer');
        newsContainer.innerHTML = '';
        
        // Sort news by date (newest first)
        const sortedNews = [...newsData].sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        
        // Display the 6 most recent news items
        sortedNews.slice(0, 6).forEach(news => {
            const date = new Date(news.publishedAt).toLocaleDateString();
            const sentimentClass = `sentiment-${news.sentiment}`;
            const sentimentIcon = news.sentiment === 'positive' ? '↑' : 
                                 (news.sentiment === 'negative' ? '↓' : '→');
            
            const newsCard = document.createElement('div');
            newsCard.className = 'col-md-4 mb-4';
            newsCard.innerHTML = `
                <div class="card news-card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${news.title}</h5>
                        <p class="card-text">${news.description}</p>
                        <p class="card-text">
                            <small class="text-muted">Source: ${news.source}</small>
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <small class="text-muted">${date}</small>
                        <span class="${sentimentClass}">
                            ${sentimentIcon} ${news.sentiment.charAt(0).toUpperCase() + news.sentiment.slice(1)}
                        </span>
                    </div>
                </div>
            `;
            
            newsContainer.appendChild(newsCard);
        });
    },
    
    /**
     * Render prediction cards
     * @param {Array} predictions Prediction data
     */
    renderPredictions: (predictions) => {
        const predictionsContainer = document.getElementById('predictionsContainer');
        predictionsContainer.innerHTML = '';
        
        predictions.forEach(prediction => {
            const directionClass = `prediction-${prediction.direction}`;
            const directionIcon = prediction.direction === 'up' ? '↑' : 
                                 (prediction.direction === 'down' ? '↓' : '→');
            
            const predictionCard = document.createElement('div');
            predictionCard.className = `card prediction-card ${directionClass} mb-3`;
            predictionCard.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="card-title mb-0">${prediction.timeframe} Prediction</h5>
                        <span class="badge bg-${prediction.direction === 'up' ? 'success' : 
                                              (prediction.direction === 'down' ? 'danger' : 'secondary')}">
                            ${directionIcon} ${prediction.direction.toUpperCase()}
                        </span>
                    </div>
                    <p class="card-text">${prediction.explanation}</p>
                    <div class="progress">
                        <div class="progress-bar bg-${prediction.direction === 'up' ? 'success' : 
                                                    (prediction.direction === 'down' ? 'danger' : 'secondary')}" 
                             role="progressbar" 
                             style="width: ${prediction.confidence}%" 
                             aria-valuenow="${prediction.confidence}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${prediction.confidence.toFixed(1)}% Confidence
                        </div>
                    </div>
                </div>
            `;
            
            predictionsContainer.appendChild(predictionCard);
        });
    }
}; 