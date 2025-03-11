from flask import Flask, jsonify, send_from_directory, Response
from market_analyzer import MarketAnalyzer
import os
import json
import queue
import threading
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes
progress_queues = {}

def generate_status_updates(queue_id):
    if queue_id not in progress_queues:
        yield f"data: {json.dumps({'status': 'Error: Invalid queue ID', 'error': True})}\n\n"
        return
        
    q = progress_queues[queue_id]
    while True:
        try:
            status = q.get(timeout=60)  # 60 second timeout
            if status == "DONE":
                del progress_queues[queue_id]
                break
            yield f"data: {json.dumps(status)}\n\n"
        except queue.Empty:
            yield f"data: {json.dumps({'status': 'Timeout waiting for updates', 'error': True})}\n\n"
            if queue_id in progress_queues:
                del progress_queues[queue_id]
            break
        except Exception as e:
            yield f"data: {json.dumps({'status': f'Error: {str(e)}', 'error': True})}\n\n"
            if queue_id in progress_queues:
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
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
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
                # Initial status update
                status_queue.put({
                    "status": "Starting analysis...",
                    "progress": 10
                })
                
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
                import traceback
                traceback_str = traceback.format_exc()
                print(f"Error in analysis thread: {str(e)}\n{traceback_str}")
                
                status_queue.put({
                    "status": f"Error: {str(e)}",
                    "progress": 100,
                    "error": True
                })
                status_queue.put("DONE")

        # Start the analysis in a background thread
        thread = threading.Thread(target=run_analysis_with_updates)
        thread.daemon = True  # Make thread a daemon so it doesn't block app shutdown
        thread.start()
        
        return jsonify({"queue_id": queue_id, "status": "Analysis started"})
        
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Error starting analysis: {str(e)}\n{traceback_str}")
        return jsonify({'error': str(e), 'traceback': traceback_str}), 500

if __name__ == '__main__':
    # Add Flask command line options
    import sys
    debug = '--debug' in sys.argv
    
    # Update requirements.txt
    try:
        with open('requirements.txt', 'r') as f:
            requirements = f.read()
        if 'flask-cors' not in requirements.lower():
            with open('requirements.txt', 'a') as f:
                f.write('\nflask-cors==4.0.0\n')
            print("Added flask-cors to requirements.txt")
    except Exception as e:
        print(f"Warning: Could not update requirements.txt: {e}")
    
    # Run the app
    app.run(debug=debug, host='0.0.0.0', port=5000, threaded=True) 