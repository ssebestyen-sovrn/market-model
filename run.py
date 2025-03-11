#!/usr/bin/env python3
"""
Market Analysis Tool Launcher
This script starts the market analysis web application.
"""
import os
import sys
import subprocess
import webbrowser
import time

def check_dependencies():
    """Check if all required dependencies are installed."""
    try:
        import flask
        import flask_cors
        import pandas
        import numpy
        import requests
        import textblob
        import yfinance
        import sklearn
        import transformers
        import torch
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Installing dependencies...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            return True
        except subprocess.CalledProcessError:
            print("Failed to install dependencies. Please run: pip install -r requirements.txt")
            return False

def start_server():
    """Start the Flask server."""
    print("Starting market analysis server...")
    
    # Check if we're on Windows
    if os.name == 'nt':
        server_process = subprocess.Popen([sys.executable, "app.py"], 
                                         creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        server_process = subprocess.Popen([sys.executable, "app.py"])
    
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(2)
    
    return server_process

def open_browser():
    """Open the web browser to the application."""
    url = "http://localhost:5000"
    print(f"Opening {url} in your browser...")
    webbrowser.open(url)

if __name__ == "__main__":
    print("=" * 60)
    print("Market Analysis Tool")
    print("=" * 60)
    
    if not check_dependencies():
        sys.exit(1)
    
    server_process = start_server()
    
    # Wait a moment for the server to start
    time.sleep(2)
    
    # Test if server is running
    try:
        import requests
        response = requests.get("http://localhost:5000")
        if response.status_code == 200:
            print("Server started successfully!")
            open_browser()
            print("\nPress Ctrl+C to stop the server when you're done.")
            try:
                # Keep the script running
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\nStopping server...")
                server_process.terminate()
                print("Server stopped. Goodbye!")
        else:
            print(f"Server returned unexpected status: {response.status_code}")
            print("Please run the server manually with: python app.py")
    except requests.exceptions.ConnectionError:
        print("Could not connect to server.")
        print("Please run the server manually with: python app.py")
    except Exception as e:
        print(f"Error: {e}")
        print("Please run the server manually with: python app.py") 