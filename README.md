# Market Analysis Tool

A web-based tool for analyzing market sentiment and predicting stock price movements based on news articles.

## Overview

This application analyzes news articles for mentions of stock tickers, performs sentiment analysis on the articles, and generates price predictions based on the sentiment and historical price data.

The application is designed to be deployed on Vercel, using serverless functions for the backend API and a static HTML/JavaScript frontend.

## Features

- News article analysis for stock ticker mentions
- Sentiment analysis of news articles
- Stock price prediction based on sentiment and historical data
- Interactive charts and visualizations
- Responsive design for desktop and mobile

## Demo Mode

By default, the application runs in demo mode using mock data for both news articles and stock prices. This allows you to deploy and test the application without needing API keys.

## Deployment

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

## Project Structure

- `index.html` - The main frontend application
- `api/news.js` - Serverless function for fetching news articles
- `api/stocks.js` - Serverless function for fetching stock data
- `vercel.json` - Configuration for Vercel deployment

## Using Real Data

To use real data instead of mock data:

1. Sign up for API keys from [NewsAPI](https://newsapi.org) and [Alpha Vantage](https://www.alphavantage.co)
2. Add these keys as environment variables in your Vercel project
3. Set the `USE_MOCK_DATA` environment variable to "false"

## Technologies Used

- HTML, CSS, JavaScript
- Bootstrap for UI components
- Chart.js for data visualization
- Vercel Serverless Functions for backend API
- NewsAPI for news data (optional)
- Alpha Vantage for stock data (optional)

## Limitations

This is a demonstration project with several limitations:

- The sentiment analysis is very basic and not suitable for real investment decisions
- The price prediction model is simplified and not based on rigorous financial models
- Mock data is used by default instead of real market data
- The application does not include user authentication or data persistence

## License

This project is open source and available under the MIT License.
