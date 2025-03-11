# Deploying the Market Analysis Tool to Vercel

This guide will help you deploy the Market Analysis Tool to Vercel and fix any issues you might encounter.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [GitHub](https://github.com) account (recommended for easier deployment)
3. API keys for:
   - [NewsAPI](https://newsapi.org) (for news data)
   - [Alpha Vantage](https://www.alphavantage.co) (optional, for stock data)

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

5. Add Environment Variables:
   - `NEWS_API_KEY`: Your NewsAPI key
   - `ALPHA_VANTAGE_API_KEY`: Your Alpha Vantage API key (optional)

6. Click "Deploy"

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
   - For production, use relative paths like `/api/news` instead of absolute URLs

## Testing the Deployed Application

After deployment:

1. Open your Vercel deployment URL
2. Open browser developer tools (F12)
3. Go to the Network tab
4. Click "Start Market Analysis" and check the network requests
5. Look for any failed requests to `/api/news` or `/api/stocks`
6. Check the response content of these requests for errors

If you see HTML responses instead of JSON, it means Vercel is serving the index.html file instead of executing your API function. 