import requests
import time
import sys
import os

def test_server():
    """Test if the server is running and responding correctly."""
    base_url = 'http://localhost:5000'
    
    print("\n1. Testing basic server connectivity...")
    try:
        # Test if the server is running
        response = requests.get(f'{base_url}/')
        if response.status_code == 200:
            print("✅ Server is running and responding to requests")
        else:
            print(f"❌ Server returned unexpected status code: {response.status_code}")
            print(f"Response: {response.text[:100]}...")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on http://localhost:5000/")
        return False
    except Exception as e:
        print(f"❌ Error testing server: {e}")
        return False
    
    print("\n2. Testing health endpoint...")
    try:
        response = requests.get(f'{base_url}/health')
        if response.status_code == 200:
            print("✅ Health endpoint is working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health endpoint returned unexpected status code: {response.status_code}")
            print(f"   Response: {response.text[:100]}...")
    except Exception as e:
        print(f"❌ Error testing health endpoint: {e}")
    
    print("\n3. Testing CORS headers...")
    try:
        response = requests.options(f'{base_url}/run_analysis')
        if response.status_code in [200, 204]:
            print("✅ CORS preflight request is working")
            cors_headers = [h for h in response.headers if h.lower().startswith('access-control')]
            for header in cors_headers:
                print(f"   {header}: {response.headers[header]}")
        else:
            print(f"❌ CORS preflight request returned unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing CORS: {e}")
    
    print("\n4. Testing analysis endpoint...")
    try:
        response = requests.post(f'{base_url}/run_analysis')
        if response.status_code == 200:
            print("✅ Analysis endpoint is working")
            data = response.json()
            if 'queue_id' in data:
                queue_id = data['queue_id']
                print(f"✅ Received queue ID: {queue_id}")
                
                # Test SSE connection
                print("\n5. Testing SSE connection (will wait for 3 seconds)...")
                try:
                    import sseclient
                    headers = {'Accept': 'text/event-stream'}
                    sse_response = requests.get(f'{base_url}/status/{queue_id}', 
                                              headers=headers, 
                                              stream=True)
                    client = sseclient.SSEClient(sse_response)
                    
                    # Get the first message with a timeout
                    start_time = time.time()
                    message_received = False
                    
                    for event in client.events():
                        print(f"✅ Received SSE message: {event.data[:100]}...")
                        message_received = True
                        break
                        
                        # Stop after 3 seconds
                        if time.time() - start_time > 3:
                            break
                    
                    if not message_received:
                        print("❌ No SSE messages received within timeout")
                except ImportError:
                    print("ℹ️ sseclient-py not installed, skipping SSE test")
                    print("   Install with: pip install sseclient-py")
                except Exception as e:
                    print(f"❌ Error testing SSE connection: {e}")
            else:
                print("❌ No queue ID in response")
                print(f"   Response: {data}")
        else:
            print(f"❌ Analysis endpoint returned error: {response.status_code}")
            print(f"   Response: {response.text[:100]}...")
    except Exception as e:
        print(f"❌ Error testing analysis endpoint: {e}")
    
    print("\n6. Checking file permissions...")
    try:
        current_dir = os.path.abspath('.')
        print(f"   Working directory: {current_dir}")
        
        index_path = os.path.join(current_dir, 'index.html')
        if os.path.exists(index_path):
            print(f"✅ index.html exists at {index_path}")
            print(f"   File size: {os.path.getsize(index_path)} bytes")
            print(f"   Readable: {os.access(index_path, os.R_OK)}")
        else:
            print(f"❌ index.html not found at {index_path}")
            
        # List files in directory
        print("\n   Files in directory:")
        for file in os.listdir(current_dir)[:10]:  # Show first 10 files
            print(f"   - {file}")
    except Exception as e:
        print(f"❌ Error checking file permissions: {e}")
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("Market Analysis Server Test")
    print("=" * 60)
    
    success = test_server()
    
    if success:
        print("\n✅ Basic server connectivity test passed!")
        print("You can now open http://localhost:5000/ in your browser")
    else:
        print("\n❌ Server test failed. Please check the error messages above.")
        print("Make sure the server is running with: python app.py")
        sys.exit(1) 