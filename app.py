from flask import Flask, jsonify, send_from_directory, Response, request
from market_analyzer import MarketAnalyzer
import os
import json
import queue
import threading
from datetime import datetime
from flask_cors import CORS

# Create Flask app with correct static folder configuration
app = Flask(__name__, static_folder=os.path.dirname(os.path.abspath(__file__)))
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes and all origins
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

# Add a route to serve static files
@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory('.', path)
    except Exception as e:
        return f"Error serving {path}: {str(e)}", 404

@app.route('/status/<queue_id>')
def status(queue_id):
    return Response(
        generate_status_updates(queue_id),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    )

@app.route('/run_analysis', methods=['POST', 'OPTIONS'])
def run_analysis():
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        return response
        
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
        
        response = jsonify({"queue_id": queue_id, "status": "Analysis started"})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
        
    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Error starting analysis: {str(e)}\n{traceback_str}")
        response = jsonify({'error': str(e), 'traceback': traceback_str}), 500
        response[0].headers['Access-Control-Allow-Origin'] = '*'
        return response

# Add a route to check server status
@app.route('/health')
def health_check():
    response = jsonify({
        "status": "ok", 
        "server": "Market Analysis Tool",
        "version": "1.0.0",
        "cors_enabled": True
    })
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

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
    
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Print server information
    print(f"Server running at http://0.0.0.0:{port}")
    print(f"Working directory: {os.path.abspath('.')}")
    
    # Run the app
    app.run(debug=debug, host='0.0.0.0', port=port, threaded=True) 