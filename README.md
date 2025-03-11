# Market Analysis Tool

This tool analyzes news sentiment and stock price movements to predict future market trends. It combines data from multiple sources:
- Top 500 news stories from the last 48 hours (via NewsAPI)
- S&P 500 stock price data (via Yahoo Finance)
- Sentiment analysis of news articles
- Machine learning-based price predictions

## Features

- Fetches and analyzes top 500 financial news stories from the last 48 hours
- Tracks S&P 500 stock price movements
- Performs sentiment analysis on news articles
- Identifies correlations between news sentiment and price movements
- Predicts 24-hour price movements using machine learning
- Generates comprehensive JSON reports

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the project root and add your NewsAPI key:
```
NEWSAPI_KEY=your_newsapi_key_here
```

You can get a NewsAPI key from [https://newsapi.org/](https://newsapi.org/)

## Usage

Run the analysis:
```bash
python market_analyzer.py
```

The tool will:
1. Fetch recent news articles and stock data
2. Analyze sentiment and correlations
3. Generate price predictions
4. Save results to `market_analysis_report.json`

## Output

The analysis results are saved in `market_analysis_report.json` with the following structure:
```json
{
    "timestamp": "ISO timestamp",
    "analysis": {
        "news_articles_analyzed": number,
        "stocks_analyzed": number,
        "correlations": {
            "TICKER": [
                {
                    "sentiment": float,
                    "price_change": float,
                    "article_title": "string",
                    "published_at": "ISO timestamp"
                }
            ]
        },
        "predictions": {
            "TICKER": {
                "current_price": float,
                "predicted_price": float,
                "predicted_change_percent": float
            }
        }
    }
}
```

## Notes

- The tool uses hourly stock data for more accurate predictions
- Sentiment analysis is performed using TextBlob
- Price predictions use a Random Forest model with features including hour of day, returns, and volatility
- All errors and progress are logged for debugging
