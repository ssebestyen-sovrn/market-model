import requests
import time
import sys

def test_server():
    """Test if the server is running and responding correctly."""
    try:
        # Test if the server is running
        response = requests.get('http://localhost:5000/')
        if response.status_code == 200:
            print("✅ Server is running and responding to requests")
        else:
            print(f"❌ Server returned unexpected status code: {response.status_code}")
            return False
        
        # Test the analysis endpoint
        print("Testing analysis endpoint...")
        response = requests.post('http://localhost:5000/run_analysis')
        if response.status_code == 200:
            print("✅ Analysis endpoint is working")
            data = response.json()
            if 'queue_id' in data:
                queue_id = data['queue_id']
                print(f"✅ Received queue ID: {queue_id}")
            else:
                print("❌ No queue ID in response")
                return False
        else:
            print(f"❌ Analysis endpoint returned error: {response.status_code}")
            print(response.text)
            return False
        
        return True
    
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure it's running on http://localhost:5000/")
        return False
    except Exception as e:
        print(f"❌ Error testing server: {e}")
        return False

if __name__ == "__main__":
    print("Testing connection to the market analysis server...")
    success = test_server()
    
    if success:
        print("\n✅ Server is working correctly!")
        print("You can now open http://localhost:5000/ in your browser")
    else:
        print("\n❌ Server test failed. Please check the error messages above.")
        print("Make sure the server is running with: python app.py")
        sys.exit(1) 