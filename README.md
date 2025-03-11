# Market News Analyzer

A web application that analyzes news stories and stock price movements to identify correlations and make predictions.

## Overview

This tool uses the NewsAPI to fetch recent news stories about S&P 500 companies and analyzes them alongside stock price movements to identify potential correlations. It then makes predictions about future price movements based on these correlations.

## Features

- Fetches news stories published in the last 48 hours using NewsAPI
- Analyzes stock price movements for S&P 500 companies
- Identifies correlations between news sentiment and price changes
- Makes predictions for future price movements
- Presents data in an intuitive, visually appealing interface

## How It Works

1. When the user clicks the "Analyze Market Data" button, the application fetches recent news stories about S&P 500 companies.
2. It performs a simple sentiment analysis on the news titles to determine if they are positive, negative, or neutral.
3. The application then analyzes stock price movements and calculates correlation scores between news sentiment and price changes.
4. Based on these correlations, it makes predictions about future price movements.
5. The results are displayed in charts and cards, making it easy for users to understand the relationships between news and stock prices.

## Technologies Used

- HTML, CSS, JavaScript
- Bootstrap 5 for UI components
- Chart.js for data visualization
- NewsAPI for fetching news stories
- Vercel for hosting

## Deployment

This project is configured for easy deployment on Vercel.

### Steps to Deploy

1. Push this repository to GitHub
2. Connect to Vercel
3. Import the repository
4. Deploy

## Limitations

- The free tier of NewsAPI only allows requests from localhost in development
- For production use, you would need a paid NewsAPI subscription
- The stock data in this demo is simulated; in a production environment, you would connect to a financial data API

## License

This project is open source and available under the MIT License.
