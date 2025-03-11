from flask import Flask, jsonify, send_from_directory, Response
from market_analyzer import MarketAnalyzer
import os
import json
import queue
import threading
from datetime import datetime

app = Flask(__name__)
progress_queues = {}

def generate_status_updates(queue_id):
    q = progress_queues[queue_id]
    while True:
        try:
            status = q.get(timeout=60)  # 60 second timeout
            if status == "DONE":
                del progress_queues[queue_id]
                break
            yield f"data: {json.dumps(status)}\n\n"
        except queue.Empty:
            del progress_queues[queue_id]
            break

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/status/<queue_id>')
def status(queue_id):
    return Response(
        generate_status_updates(queue_id),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    )

@app.route('/run_analysis', methods=['POST'])
def run_analysis():
    try:
        queue_id = str(threading.get_ident())
        status_queue = queue.Queue()
        progress_queues[queue_id] = status_queue

        def run_analysis_with_updates():
            try:
                analyzer = MarketAnalyzer()
                
                # Update status for fetching news
                status_queue.put({
                    "status": "Fetching news articles...",
                    "progress": 20
                })
                analyzer.fetch_news()
                
                # Update status for fetching stock data
                status_queue.put({
                    "status": "Fetching stock data...",
                    "progress": 40
                })
                analyzer.fetch_stock_data()
                
                # Update status for analyzing correlations
                status_queue.put({
                    "status": "Analyzing correlations...",
                    "progress": 60
                })
                correlations = analyzer.analyze_correlations()
                
                # Update status for making predictions
                status_queue.put({
                    "status": "Generating predictions...",
                    "progress": 80
                })
                predictions = analyzer.predict_price_movements()
                
                # Prepare final report
                result = {
                    'timestamp': datetime.now().isoformat(),
                    'analysis': {
                        'news_articles_analyzed': len(analyzer.news_data),
                        'stocks_analyzed': len(analyzer.stock_data),
                        'correlations': correlations,
                        'predictions': predictions
                    }
                }
                
                # Save report to file
                with open('market_analysis_report.json', 'w') as f:
                    json.dump(result, f, indent=4)
                
                # Send completion status
                status_queue.put({
                    "status": "Analysis complete!",
                    "progress": 100,
                    "result": result
                })
                
                # Mark the stream as complete
                status_queue.put("DONE")
                
            except Exception as e:
                status_queue.put({
                    "status": f"Error: {str(e)}",
                    "progress": 100,
                    "error": True
                })
                status_queue.put("DONE")

        thread = threading.Thread(target=run_analysis_with_updates)
        thread.start()
        
        return jsonify({"queue_id": queue_id})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 