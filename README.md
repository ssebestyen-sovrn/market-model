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
- Mock data for demonstration (can be replaced with real APIs)
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
│   ├── config.js
│   ├── visualization.js
│   └── main.js
├── data/
│   └── sample-data.json
├── index.html
├── supabase-schema.sql
└── README.md
```

## Local Development

To run this project locally:

1. Clone the repository
2. Open the project folder
3. Open `index.html` in your browser

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

This project is now integrated with Supabase for real data storage and retrieval. Follow these steps to set up:

1. Create a Supabase account at [Supabase](https://supabase.com)
2. Create a new project
3. Get your API URL and public anon key
4. Create the required tables using the SQL in `supabase-schema.sql`
5. Update the `js/config.js` file with your Supabase credentials:

```javascript
const CONFIG = {
    // Supabase configuration
    supabase: {
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY',
    },
    // Other config...
};
```

### Supabase Schema

The project uses three main tables in Supabase:

1. `news_articles` - Stores news stories with sentiment analysis
2. `market_data` - Stores historical market data (S&P 500)
3. `analysis_results` - Stores the results of correlation analyses

The schema includes example data for testing. See `supabase-schema.sql` for details.

### Adding Real News Data

To add real news data to your Supabase database:

1. Access your Supabase project
2. Go to the SQL Editor
3. Insert news data using SQL commands similar to:

```sql
INSERT INTO news_articles (title, description, source, url, publishedAt, sentiment, relatedCompanies)
VALUES 
('Your News Title', 'Description of the news', 'Source Name', 'https://newsurl.com', NOW(), 'positive', '["TICKER1", "TICKER2"]');
```

Alternatively, you can use the Supabase UI to insert data manually or set up a data collection pipeline.

## Future Enhancements

- Connect to real news APIs (like NewsAPI)
- Integrate with financial data APIs for real-time market data
- Implement more sophisticated sentiment analysis
- Add user authentication
- Add historical analysis comparison
- Implement email notifications for significant predictions

## Limitations

- Currently uses mock data; in a production environment, you would connect to real APIs
- The sentiment analysis is simplified; a more sophisticated NLP approach would improve accuracy
- Predictions are based on simple correlations; more advanced machine learning models could be implemented

## License

This project is open source and available under the MIT License.
