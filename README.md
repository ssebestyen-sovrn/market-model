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

1. When the user clicks the "Analyze Market Data" button, the application fetches news stories and market data.
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
- Supabase (prepared for integration)

## Project Structure

```
market-model/
├── css/
│   └── styles.css
├── js/
│   ├── api.js
│   ├── analysis.js
│   ├── visualization.js
│   └── main.js
├── data/
│   └── sample-data.json
├── index.html
└── README.md
```

## Local Development

To run this project locally:

1. Clone the repository
2. Open the project folder
3. Open `index.html` in your browser

## API Integration

This project uses real-time data from multiple APIs:

### Alpha Vantage
Used to fetch real S&P 500 market data for the past 7 days. The application will fall back to sample data if the API rate limit is exceeded or if there's an error with the API request.

To use your own Alpha Vantage API key:
1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Replace the 'demo' key in js/api.js with your actual API key

### NewsAPI.org
Used to fetch the latest business news from the US with sentiment analysis. The application performs basic sentiment analysis on the news content and extracts potential company tickers.

To use your own NewsAPI key:
1. Get an API key from [NewsAPI.org](https://newsapi.org/)
2. Replace the existing key in js/api.js with your actual API key

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
6. Click "Deploy"

## Supabase Integration

The project is prepared for Supabase integration. To connect to Supabase:

1. Create a Supabase account at [Supabase](https://supabase.com)
2. Create a new project
3. Get your API URL and public API key
4. Create a table called `analysis_results` with appropriate columns
5. Update the `api.js` file to use the Supabase client:

```javascript
// Add to the top of api.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Then update the saveAnalysisResults function
saveAnalysisResults: async (analysisResults) => {
    const { data, error } = await supabase
        .from('analysis_results')
        .insert([analysisResults]);
    
    if (error) throw error;
    return data;
}
```

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
