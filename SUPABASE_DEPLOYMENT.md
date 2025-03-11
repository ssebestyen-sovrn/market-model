# Deploying the Market Analysis Tool with Supabase

This guide explains how to deploy the Market Analysis Tool using Supabase as the backend.

## Architecture Overview

The application is split into two parts:
1. **Frontend**: Static HTML/CSS/JS files deployed on Vercel
2. **Backend**: Supabase project with Edge Functions and PostgreSQL database

## Step 1: Set Up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key (you'll need these later)

## Step 2: Set Up the Database

1. In your Supabase project, go to the SQL Editor
2. Create a new query and paste the contents of `supabase/migrations/20230601000000_create_analyses_table.sql`
3. Run the query to create the necessary tables and policies

## Step 3: Deploy Edge Functions

1. Install the Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy the Edge Functions:
```bash
supabase functions deploy health
supabase functions deploy run-analysis
supabase functions deploy get-analysis
```

5. Set environment variables:
```bash
supabase secrets set NEWSAPI_KEY=your_newsapi_key_here
```

## Step 4: Deploy the Frontend to Vercel

1. Push your code to a GitHub repository
2. Connect your Vercel account to GitHub
3. Import the repository in Vercel
4. Deploy the project

## Step 5: Connect Frontend to Supabase

1. Open your deployed frontend application
2. Enter your Supabase URL with the anon key as a query parameter:
```
https://your-project.supabase.co?key=your-anon-key
```
3. Click "Test Connection" to verify the connection
4. If successful, you can now use the application

## Authentication Setup (Optional)

To enable user authentication:

1. In your Supabase project, go to Authentication → Settings
2. Configure your preferred auth providers (Email, Google, GitHub, etc.)
3. Update the frontend code to include sign-in/sign-up functionality

## Limitations and Considerations

1. **Edge Function Timeouts**: Supabase Edge Functions have a 50-second timeout, which may not be sufficient for complex analyses. For longer-running tasks, consider:
   - Breaking the analysis into smaller chunks
   - Using a separate service for the heavy computation
   - Implementing a background worker pattern

2. **Database Storage**: The current implementation stores analysis results in the database. For large datasets, consider:
   - Using Supabase Storage for large result sets
   - Implementing pagination for results
   - Optimizing the data structure

3. **Real-time Updates**: For a better user experience, consider:
   - Using Supabase Realtime to subscribe to changes in the analyses table
   - Implementing a WebSocket connection for real-time updates

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Verify that your Edge Functions include the proper CORS headers
2. Check that your frontend is using the correct Supabase URL
3. Ensure that your browser allows cross-origin requests

### Function Deployment Issues

If you have trouble deploying functions:

1. Check that you're logged in to the correct Supabase account
2. Verify that your project reference is correct
3. Ensure that your functions follow the Supabase Edge Function format

### Authentication Issues

If users can't authenticate:

1. Check that your auth providers are properly configured
2. Verify that your frontend is correctly handling authentication
3. Check the browser console for any errors 