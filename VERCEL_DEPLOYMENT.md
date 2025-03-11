# Deploying the Market Analysis Tool to Vercel

This guide will help you deploy the Market Analysis Tool to Vercel and fix any issues you might encounter.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [GitHub](https://github.com) account (recommended for easier deployment)
3. API keys for:
   - [NewsAPI](https://newsapi.org) (optional, mock data is used by default)
   - [Alpha Vantage](https://www.alphavantage.co) (optional, mock data is used by default)

## Deployment Steps

### 1. Prepare Your Repository

1. Make sure your code is in a Git repository
2. Push your repository to GitHub (recommended) or use Vercel's direct upload option

### 2. Deploy to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your GitHub repository or upload your files directly
4. Configure the project:
   - **Framework Preset**: Select "Other"
   - **Build Command**: Leave empty or use `echo 'No build step required'`
   - **Output Directory**: `.` (root directory)
   - **Install Command**: Leave empty

5. Add Environment Variables (optional):
   - `NEWS_API_KEY`: Your NewsAPI key (if you want to use real data)
   - `ALPHA_VANTAGE_API_KEY`: Your Alpha Vantage API key (if you want to use real data)
   - `USE_MOCK_DATA`: Set to "false" if you want to use real API data (requires valid API keys)

6. Click "Deploy"

## Understanding the Mock Data Approach

By default, this application uses mock data for both news articles and stock prices. This approach has several benefits:

1. **No API Keys Required**: You can deploy and test the application without signing up for external APIs.
2. **No CORS Issues**: The NewsAPI free tier doesn't allow browser-based requests, but our serverless functions can handle this.
3. **Consistent Demo Experience**: The mock data ensures that users always see meaningful results.

To use real data instead of mock data:

1. Sign up for API keys from NewsAPI and Alpha Vantage
2. Add these keys as environment variables in your Vercel project
3. Set the `USE_MOCK_DATA` environment variable to "false"

## Fixing Common Issues

### "Unexpected token 'T', 'The page c'... is not valid JSON" Error

This error occurs when the API endpoint is returning HTML instead of JSON, typically because:

1. **The API route doesn't exist**: Make sure your API files are in the correct location (`/api/news.js` and `/api/stocks.js`)

2. **Vercel isn't recognizing the API routes**: Check your `vercel.json` configuration:

```json
{
  "version": 2,
  "functions": {
    "api/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

3. **API structure issues**: Make sure your API files follow Vercel's serverless function format:

```javascript
// Example structure for api/news.js
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // ... rest of your code
};
```

### Testing API Endpoints Locally

To test your API endpoints locally before deploying:

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel dev` in your project directory
3. Test your endpoints at `http://localhost:3000/api/news` and `http://localhost:3000/api/stocks?tickers=AAPL,MSFT`

## Troubleshooting Deployment

If you're still having issues after deployment:

1. Check Vercel's Function Logs:
   - Go to your Vercel project dashboard
   - Click on "Functions" tab
   - Look for any errors in the logs for your API endpoints

2. Verify API Response Format:
   - Add console logs in your API functions to debug
   - Make sure all responses use `res.status(200).json(data)` format
   - Check that error handling returns proper JSON responses

3. Update API URLs in Frontend:
   - Make sure your frontend is using the correct API URLs
   - For production, use the full URL with `window.location.origin` as shown in the code

## Testing the Deployed Application

After deployment:

1. Open your Vercel deployment URL
2. Open browser developer tools (F12)
3. Go to the Network tab
4. Click "Start Market Analysis" and check the network requests
5. Look for any failed requests to `/api/news` or `/api/stocks`
6. Check the response content of these requests for errors

## Using the Application with Real Data

If you want to use real data instead of mock data:

1. Sign up for API keys:
   - [NewsAPI](https://newsapi.org/register) - Free tier available
   - [Alpha Vantage](https://www.alphavantage.co/support/#api-key) - Free tier available

2. Add these keys to your Vercel project:
   - Go to your project settings
   - Navigate to the "Environment Variables" section
   - Add `NEWS_API_KEY` and `ALPHA_VANTAGE_API_KEY` with your API keys
   - Add `USE_MOCK_DATA` with value "false"

3. Redeploy your application

Note that the free tier of NewsAPI doesn't allow browser-based requests, but our serverless functions can make server-side requests to the API. 