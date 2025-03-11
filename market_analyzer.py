import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from textblob import TextBlob
import yfinance as yf
from dotenv import load_dotenv
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import json
from typing import Dict, List, Tuple
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketAnalyzer:
    def __init__(self):
        load_dotenv()
        self.newsapi_key = os.getenv('NEWSAPI_KEY')
        self.sp500_tickers = self._get_sp500_tickers()
        self.news_data = []
        self.stock_data = {}
        self.predictions = {}

    def _get_sp500_tickers(self) -> List[str]:
        """Get list of S&P 500 tickers using Wikipedia."""
        try:
            table = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')
            return table[0]['Symbol'].tolist()
        except Exception as e:
            logger.error(f"Error fetching S&P 500 tickers: {e}")
            return []

    def fetch_news(self) -> None:
        """Fetch top 500 news stories from the last 48 hours."""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=2)
            
            url = 'https://newsapi.org/v2/everything'
            params = {
                'q': 'stock OR market OR finance OR economy',
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': 500,
                'from': start_date.isoformat(),
                'to': end_date.isoformat(),
                'apiKey': self.newsapi_key
            }
            
            response = requests.get(url, params=params)
            if response.status_code == 200:
                self.news_data = response.json()['articles']
                logger.info(f"Successfully fetched {len(self.news_data)} news articles")
            else:
                logger.error(f"Error fetching news: {response.status_code}")
        except Exception as e:
            logger.error(f"Error in fetch_news: {e}")

    def analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment of text using TextBlob."""
        try:
            return TextBlob(text).sentiment.polarity
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return 0.0

    def fetch_stock_data(self) -> None:
        """Fetch stock data for all S&P 500 companies for the last 24 hours."""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=1)
            
            for ticker in self.sp500_tickers:
                try:
                    stock = yf.Ticker(ticker)
                    hist = stock.history(start=start_date, end=end_date, interval='1h')
                    if not hist.empty:
                        self.stock_data[ticker] = {
                            'price_change': ((hist['Close'][-1] - hist['Close'][0]) / hist['Close'][0]) * 100,
                            'data': hist
                        }
                except Exception as e:
                    logger.error(f"Error fetching data for {ticker}: {e}")
            
            logger.info(f"Successfully fetched stock data for {len(self.stock_data)} companies")
        except Exception as e:
            logger.error(f"Error in fetch_stock_data: {e}")

    def analyze_correlations(self) -> Dict:
        """Analyze correlations between news sentiment and stock price movements."""
        correlations = {}
        
        try:
            for article in self.news_data:
                # Combine title and description for sentiment analysis
                text = f"{article['title']} {article['description']}"
                sentiment = self.analyze_sentiment(text)
                
                # Check for ticker mentions in the article
                for ticker in self.sp500_tickers:
                    if ticker in text or ticker.lower() in text.lower():
                        if ticker in self.stock_data:
                            price_change = self.stock_data[ticker]['price_change']
                            
                            if ticker not in correlations:
                                correlations[ticker] = []
                            
                            correlations[ticker].append({
                                'sentiment': sentiment,
                                'price_change': price_change,
                                'article_title': article['title'],
                                'published_at': article['publishedAt']
                            })
            
            logger.info(f"Analyzed correlations for {len(correlations)} tickers")
            return correlations
        except Exception as e:
            logger.error(f"Error in analyze_correlations: {e}")
            return {}

    def predict_price_movements(self) -> Dict:
        """Predict price movements for the next 24 hours."""
        predictions = {}
        
        try:
            for ticker, data in self.stock_data.items():
                if isinstance(data, dict) and 'data' in data:
                    df = data['data']
                    
                    # Prepare features
                    df['Hour'] = pd.to_datetime(df.index).hour
                    df['Returns'] = df['Close'].pct_change()
                    df['Volatility'] = df['Returns'].rolling(window=3).std()
                    
                    # Remove NaN values
                    df = df.dropna()
                    
                    if len(df) > 0:
                        # Prepare features for prediction
                        features = ['Hour', 'Returns', 'Volatility']
                        X = df[features].values
                        y = df['Close'].values
                        
                        # Train model
                        model = RandomForestRegressor(n_estimators=100, random_state=42)
                        model.fit(X[:-1], y[1:])
                        
                        # Prepare last known data point for prediction
                        last_data = X[-1].reshape(1, -1)
                        
                        # Make prediction
                        predicted_price = model.predict(last_data)[0]
                        current_price = df['Close'].iloc[-1]
                        predicted_change = ((predicted_price - current_price) / current_price) * 100
                        
                        predictions[ticker] = {
                            'current_price': current_price,
                            'predicted_price': predicted_price,
                            'predicted_change_percent': predicted_change
                        }
            
            logger.info(f"Generated predictions for {len(predictions)} tickers")
            return predictions
        except Exception as e:
            logger.error(f"Error in predict_price_movements: {e}")
            return {}

    def run_analysis(self) -> Dict:
        """Run the complete analysis pipeline."""
        try:
            # Fetch all necessary data
            self.fetch_news()
            self.fetch_stock_data()
            
            # Perform analysis
            correlations = self.analyze_correlations()
            predictions = self.predict_price_movements()
            
            # Prepare final report
            report = {
                'timestamp': datetime.now().isoformat(),
                'analysis': {
                    'news_articles_analyzed': len(self.news_data),
                    'stocks_analyzed': len(self.stock_data),
                    'correlations': correlations,
                    'predictions': predictions
                }
            }
            
            # Save report to file
            with open('market_analysis_report.json', 'w') as f:
                json.dump(report, f, indent=4)
            
            logger.info("Analysis completed successfully")
            return report
        except Exception as e:
            logger.error(f"Error in run_analysis: {e}")
            return {'error': str(e)}

if __name__ == "__main__":
    analyzer = MarketAnalyzer()
    analysis_report = analyzer.run_analysis()
    print("Analysis complete. Results saved to market_analysis_report.json") 