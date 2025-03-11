// Follow this setup guide to create your Supabase Edge Function
// https://supabase.com/docs/guides/functions

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the NewsAPI key from environment variables
    const newsApiKey = Deno.env.get('NEWSAPI_KEY')
    if (!newsApiKey) {
      return new Response(
        JSON.stringify({ error: 'NewsAPI key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a unique ID for this analysis
    const analysisId = crypto.randomUUID()

    // Insert a record for this analysis
    const { error: insertError } = await supabaseClient
      .from('analyses')
      .insert({
        id: analysisId,
        user_id: user.id,
        status: 'pending',
        progress: 0,
      })

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start the analysis in the background
    // Note: Edge Functions have a 50s timeout, so we'll need to use a different approach
    // for the actual analysis. Here we're just starting the process.
    startAnalysisInBackground(analysisId, newsApiKey, supabaseClient)

    return new Response(
      JSON.stringify({ 
        analysis_id: analysisId,
        status: 'started',
        message: 'Analysis started. Check status endpoint for updates.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// This function would need to be implemented differently in a production environment
// since Edge Functions have a 50s timeout
async function startAnalysisInBackground(analysisId: string, apiKey: string, supabase: any) {
  try {
    // Update status to "processing"
    await supabase
      .from('analyses')
      .update({ status: 'processing', progress: 10 })
      .eq('id', analysisId)

    // Fetch news (simplified)
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 2)
    
    const newsUrl = `https://newsapi.org/v2/everything?q=stock OR market OR finance OR economy&language=en&sortBy=publishedAt&pageSize=50&from=${startDate.toISOString()}&to=${endDate.toISOFormat()}&apiKey=${apiKey}`
    
    const newsResponse = await fetch(newsUrl)
    const newsData = await newsResponse.json()
    
    // Update progress
    await supabase
      .from('analyses')
      .update({ progress: 40 })
      .eq('id', analysisId)
    
    // Process news data (simplified)
    const processedData = {
      timestamp: new Date().toISOString(),
      analysis: {
        news_articles_analyzed: newsData.articles?.length || 0,
        stocks_analyzed: 0,
        correlations: {},
        predictions: {}
      }
    }
    
    // Store results
    await supabase
      .from('analyses')
      .update({ 
        status: 'completed', 
        progress: 100,
        results: processedData
      })
      .eq('id', analysisId)
    
  } catch (error) {
    // Update status to "error"
    await supabase
      .from('analyses')
      .update({ 
        status: 'error', 
        progress: 100,
        error_message: error.message
      })
      .eq('id', analysisId)
  }
} 