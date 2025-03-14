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
