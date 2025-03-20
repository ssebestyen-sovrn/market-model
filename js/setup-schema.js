/**
 * Database Schema Setup Helper
 * 
 * This script helps set up the required database schema in Supabase
 * It can be used to create the tables and insert sample data
 */

// Only run this when explicitly called
const SETUP_SCHEMA = {
  /**
   * Create all required tables in Supabase
   */
  createTables: async () => {
    try {
      // 1. Create news_articles table
      const { error: newsError } = await supabaseClient.rpc('create_news_articles_table');
      
      if (newsError && !newsError.message.includes('already exists') && 
          !newsError.message.includes('function') && !newsError.message.includes('does not exist')) {
        console.error('Error creating news_articles table:', newsError);
        return { success: false, error: newsError };
      }
      
      // If the function doesn't exist, try direct SQL
      if (newsError && (newsError.message.includes('function') || newsError.message.includes('does not exist'))) {
        const createNewsTable = `
          CREATE TABLE IF NOT EXISTS news_articles (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            source TEXT,
            url TEXT,
            publishedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
            relatedCompanies JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS news_articles_publishedat_idx ON news_articles (publishedAt DESC);
        `;
        
        const { error: directNewsError } = await supabaseClient.rpc('exec_sql', { sql: createNewsTable });
        
        if (directNewsError) {
          console.error('Error creating news_articles table with direct SQL:', directNewsError);
          return { 
            success: false, 
            error: directNewsError,
            message: 'Could not create news_articles table. Please make sure the exec_sql function exists.'
          };
        }
      }
      
      // 2. Create market_data table - similar approach as above
      const { error: marketError } = await supabaseClient.rpc('create_market_data_table');
      
      if (marketError && !marketError.message.includes('already exists') && 
          !marketError.message.includes('function') && !marketError.message.includes('does not exist')) {
        console.error('Error creating market_data table:', marketError);
        return { success: false, error: marketError };
      }
      
      // Try direct SQL if needed
      if (marketError && (marketError.message.includes('function') || marketError.message.includes('does not exist'))) {
        const createMarketTable = `
          CREATE TABLE IF NOT EXISTS market_data (
            id SERIAL PRIMARY KEY,
            date DATE UNIQUE NOT NULL,
            value DECIMAL(10, 2) NOT NULL,
            change DECIMAL(10, 2),
            percentChange DECIMAL(10, 4),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS market_data_date_idx ON market_data (date DESC);
        `;
        
        const { error: directMarketError } = await supabaseClient.rpc('exec_sql', { sql: createMarketTable });
        
        if (directMarketError) {
          console.error('Error creating market_data table with direct SQL:', directMarketError);
          return { 
            success: false, 
            error: directMarketError,
            message: 'Could not create market_data table.'
          };
        }
      }
      
      // 3. Create analysis_results table - similar approach
      const { error: analysisError } = await supabaseClient.rpc('create_analysis_results_table');
      
      if (analysisError && !analysisError.message.includes('already exists') && 
          !analysisError.message.includes('function') && !analysisError.message.includes('does not exist')) {
        console.error('Error creating analysis_results table:', analysisError);
        return { success: false, error: analysisError };
      }
      
      // Try direct SQL if needed
      if (analysisError && (analysisError.message.includes('function') || analysisError.message.includes('does not exist'))) {
        const createAnalysisTable = `
          CREATE TABLE IF NOT EXISTS analysis_results (
            id SERIAL PRIMARY KEY,
            correlation_scores JSONB,
            sentiment_summary JSONB,
            predictions JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS analysis_results_created_at_idx ON analysis_results (created_at DESC);
        `;
        
        const { error: directAnalysisError } = await supabaseClient.rpc('exec_sql', { sql: createAnalysisTable });
        
        if (directAnalysisError) {
          console.error('Error creating analysis_results table with direct SQL:', directAnalysisError);
          return { 
            success: false, 
            error: directAnalysisError,
            message: 'Could not create analysis_results table.'
          };
        }
      }
      
      console.log('All tables created successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in createTables:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Insert sample data into the tables
   */
  insertSampleData: async () => {
    try {
      // 1. Insert sample news articles
      const newsArticles = [
        {
          title: 'Tech Giants Report Strong Quarterly Earnings',
          description: 'Major technology companies exceeded analyst expectations with their latest quarterly results.',
          source: 'Financial Times',
          url: 'https://ft.com/example',
          publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          sentiment: 'positive',
          relatedCompanies: ['AAPL', 'MSFT', 'GOOGL']
        },
        {
          title: 'Federal Reserve Signals Potential Rate Hike',
          description: 'The Federal Reserve indicated it may raise interest rates in response to persistent inflation concerns.',
          source: 'Wall Street Journal',
          url: 'https://wsj.com/example',
          publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          sentiment: 'negative',
          relatedCompanies: ['JPM', 'BAC', 'GS']
        },
        {
          title: 'Oil Prices Stabilize After Recent Volatility',
          description: 'Crude oil prices have stabilized following weeks of fluctuation due to supply chain disruptions.',
          source: 'Reuters',
          url: 'https://reuters.com/example',
          publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          sentiment: 'neutral',
          relatedCompanies: ['XOM', 'CVX', 'BP']
        }
      ];
      
      const { error: newsError } = await supabaseClient
        .from('news_articles')
        .insert(newsArticles);
        
      if (newsError) {
        console.error('Error inserting sample news articles:', newsError);
        return { success: false, error: newsError };
      }
      
      // 2. Insert sample market data
      const today = new Date();
      const marketData = [
        {
          date: new Date(today.getTime() - 259200000).toISOString().split('T')[0], // 3 days ago
          value: 4200.50,
          change: 15.20,
          percentChange: 0.36
        },
        {
          date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], // 2 days ago
          value: 4215.70,
          change: -8.30,
          percentChange: -0.20
        },
        {
          date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], // Yesterday
          value: 4207.40,
          change: 5.10,
          percentChange: 0.12
        },
        {
          date: today.toISOString().split('T')[0], // Today
          value: 4212.50,
          change: 5.10,
          percentChange: 0.12
        }
      ];
      
      const { error: marketError } = await supabaseClient
        .from('market_data')
        .insert(marketData);
        
      if (marketError) {
        console.error('Error inserting sample market data:', marketError);
        return { success: false, error: marketError };
      }
      
      console.log('Sample data inserted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in insertSampleData:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Create the database functions needed for table creation
   */
  createFunctions: async () => {
    try {
      // Create function to create news_articles table
      const createNewsArticlesFunction = `
      CREATE OR REPLACE FUNCTION create_news_articles_table()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS news_articles (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          source TEXT,
          url TEXT,
          publishedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
          relatedCompanies JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS news_articles_publishedat_idx ON news_articles (publishedAt DESC);
      END;
      $$;
      `;
      
      // Create function to create market_data table
      const createMarketDataFunction = `
      CREATE OR REPLACE FUNCTION create_market_data_table()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS market_data (
          id SERIAL PRIMARY KEY,
          date DATE UNIQUE NOT NULL,
          value DECIMAL(10, 2) NOT NULL,
          change DECIMAL(10, 2),
          percentChange DECIMAL(10, 4),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS market_data_date_idx ON market_data (date DESC);
      END;
      $$;
      `;
      
      // Create function to create analysis_results table
      const createAnalysisResultsFunction = `
      CREATE OR REPLACE FUNCTION create_analysis_results_table()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        CREATE TABLE IF NOT EXISTS analysis_results (
          id SERIAL PRIMARY KEY,
          correlation_scores JSONB,
          sentiment_summary JSONB,
          predictions JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS analysis_results_created_at_idx ON analysis_results (created_at DESC);
      END;
      $$;
      `;
      
      // Execute the function creation queries
      const { error: newsError } = await supabaseClient.rpc('exec_sql', { sql: createNewsArticlesFunction });
      if (newsError) {
        console.error('Error creating news_articles function:', newsError);
        return { success: false, error: newsError };
      }
      
      const { error: marketError } = await supabaseClient.rpc('exec_sql', { sql: createMarketDataFunction });
      if (marketError) {
        console.error('Error creating market_data function:', marketError);
        return { success: false, error: marketError };
      }
      
      const { error: analysisError } = await supabaseClient.rpc('exec_sql', { sql: createAnalysisResultsFunction });
      if (analysisError) {
        console.error('Error creating analysis_results function:', analysisError);
        return { success: false, error: analysisError };
      }
      
      console.log('All database functions created successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in createFunctions:', error);
      return { success: false, error };
    }
  }
}; 