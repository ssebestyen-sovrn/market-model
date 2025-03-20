-- News Articles Table
CREATE TABLE news_articles (
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

-- Market Data Table
CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    change DECIMAL(10, 2),
    percentChange DECIMAL(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis Results Table
CREATE TABLE analysis_results (
    id SERIAL PRIMARY KEY,
    correlation_scores JSONB,
    sentiment_summary JSONB,
    predictions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX news_articles_publishedat_idx ON news_articles (publishedAt DESC);
CREATE INDEX market_data_date_idx ON market_data (date DESC);
CREATE INDEX analysis_results_created_at_idx ON analysis_results (created_at DESC);

-- Example insert data for testing
INSERT INTO news_articles (title, description, source, url, publishedAt, sentiment, relatedCompanies)
VALUES 
('Tech Giants Report Strong Quarterly Earnings', 'Major technology companies exceeded analyst expectations with their latest quarterly results.', 'Financial Times', 'https://ft.com/example', NOW() - INTERVAL '1 day', 'positive', '["AAPL", "MSFT", "GOOGL"]'),
('Federal Reserve Signals Potential Rate Hike', 'The Federal Reserve indicated it may raise interest rates in response to persistent inflation concerns.', 'Wall Street Journal', 'https://wsj.com/example', NOW() - INTERVAL '2 days', 'negative', '["JPM", "BAC", "GS"]'),
('Oil Prices Stabilize After Recent Volatility', 'Crude oil prices have stabilized following weeks of fluctuation due to supply chain disruptions.', 'Reuters', 'https://reuters.com/example', NOW() - INTERVAL '3 days', 'neutral', '["XOM", "CVX", "BP"]');

-- Example market data (S&P 500 prices) for testing
INSERT INTO market_data (date, value, change, percentChange)
VALUES 
(CURRENT_DATE - INTERVAL '3 days', 4200.50, 15.20, 0.36),
(CURRENT_DATE - INTERVAL '2 days', 4215.70, -8.30, -0.20),
(CURRENT_DATE - INTERVAL '1 day', 4207.40, 5.10, 0.12),
(CURRENT_DATE, 4212.50, 5.10, 0.12); 