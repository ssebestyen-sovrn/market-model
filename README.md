# Market News Analyzer

A web application that analyzes news stories and stock price movements to identify correlations and make predictions.

## Overview

This tool uses news data to analyze correlations with S&P 500 market movements and makes predictions about future price movements based on these correlations. It presents the data in an intuitive, visually appealing interface.

## Features

- Analyzes news content and sentiment
- Correlates news sentiment with S&P 500 market movements
- Makes predictions for future price movements based on historical correlations
- Presents data in interactive charts and cards
- Designed for easy deployment to Vercel
- Prepared for Supabase integration for data persistence

## How It Works

1. When the user clicks the "Analyze Market Data" button, the application fetches news stories and market data through server-side API routes.
2. It analyzes the sentiment of the news and correlates it with market movements.
3. Based on these correlations, it makes predictions about future price movements.
4. The results are displayed in charts and cards, making it easy for users to understand the relationships between news and stock prices.

## Technologies Used

- HTML, CSS, JavaScript
- Bootstrap 5 for UI components
- Chart.js for data visualization
- Alpha Vantage API for real S&P 500 market data
- NewsAPI.org for real-time business news data
- Basic sentiment analysis for news articles
- Vercel for hosting
- Supabase for data persistence and caching

## Project Structure

```
market-model/
├── api/
│   ├── news.js
│   └── market.js
├── css/
│   └── styles.css
├── js/
│   ├── api.js
│   ├── analysis.js
│   ├── visualization.js
│   └── main.js
├── data/
│   └── sample-data.json
├── .env.example
├── index.html
└── README.md
```

## Local Development

To run this project locally:

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```
3. Get API keys from:
   - [NewsAPI.org](https://newsapi.org/)
   - [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - [Supabase](https://supabase.com)
4. Set up your Supabase database with the following tables:
   - `news_articles` (for caching news data)
   - `market_data` (for caching market data)
5. Open the project folder
6. Open `index.html` in your browser

## API Integration

This project uses real-time data from multiple APIs through server-side routes:

### NewsAPI.org
Used to fetch the latest business news from the US. The application performs basic sentiment analysis on the news content and extracts potential company tickers.

### Alpha Vantage
Used to fetch real S&P 500 market data for the past 7 days.

### Supabase
Used for data persistence and caching to improve performance and reduce API calls.

## Deployment to Vercel

This project is configured for easy deployment on Vercel:

1. Push this repository to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Other
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: Leave empty
6. Add your environment variables in the Vercel project settings:
   - `NEWS_API_KEY`
   - `ALPHA_VANTAGE_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Click "Deploy"

## Future Enhancements

- Implement more sophisticated sentiment analysis using machine learning or NLP APIs
- Add user authentication
- Add historical analysis comparison
- Implement email notifications for significant predictions
- Extend market data history beyond 7 days
- Add more granular company-specific news filtering
- Enable user customization of news sources and categories

## Limitations

- The sentiment analysis is simplified; a more sophisticated NLP approach would improve accuracy
- Both Alpha Vantage and NewsAPI have rate limits with their free tiers
- Company ticker extraction is based on a simple keyword match; a more sophisticated approach would improve accuracy
- Predictions are based on simple correlations; more advanced machine learning models could be implemented

## License

This project is open source and available under the MIT License.
