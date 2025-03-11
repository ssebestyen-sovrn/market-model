#!/usr/bin/env python3
"""
Market Analysis Tool Issue Fixer
This script attempts to fix common issues with the Market Analysis Tool.
"""
import os
import sys
import shutil
import subprocess

def check_environment():
    """Check if the environment is set up correctly."""
    print("Checking environment...")
    
    # Check Python version
    python_version = sys.version.split()[0]
    print(f"Python version: {python_version}")
    
    # Check if we're in the correct directory
    current_dir = os.path.abspath('.')
    print(f"Current directory: {current_dir}")
    
    # Check if required files exist
    required_files = ['app.py', 'market_analyzer.py', 'index.html', 'requirements.txt']
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("✅ All required files found")
    
    return True

def fix_permissions():
    """Fix file permissions."""
    print("\nFixing file permissions...")
    
    try:
        # Make sure all Python files are executable
        for file in os.listdir('.'):
            if file.endswith('.py'):
                file_path = os.path.join('.', file)
                os.chmod(file_path, 0o755)
                print(f"✅ Made {file} executable")
        
        return True
    except Exception as e:
        print(f"❌ Error fixing permissions: {e}")
        return False

def install_dependencies():
    """Install required dependencies."""
    print("\nInstalling dependencies...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        
        # Also install sseclient-py for testing
        subprocess.check_call([sys.executable, "-m", "pip", "install", "sseclient-py"])
        
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def check_api_key():
    """Check if the NewsAPI key is set."""
    print("\nChecking API key...")
    
    try:
        if os.path.exists('.env'):
            with open('.env', 'r') as f:
                env_content = f.read()
                
            if 'NEWSAPI_KEY=' in env_content:
                key = env_content.split('NEWSAPI_KEY=')[1].split('\n')[0].strip()
                if key and key != 'your_newsapi_key_here':
                    print(f"✅ NewsAPI key found: {key[:5]}...{key[-5:]}")
                    return True
                else:
                    print("❌ NewsAPI key is empty or using default value")
        else:
            print("❌ .env file not found")
            
            # Create .env file
            with open('.env', 'w') as f:
                f.write("NEWSAPI_KEY=your_newsapi_key_here\n# Add other API keys as needed\n")
            print("✅ Created .env file. Please edit it to add your NewsAPI key.")
        
        return False
    except Exception as e:
        print(f"❌ Error checking API key: {e}")
        return False

def fix_cors_issues():
    """Fix CORS issues in the app."""
    print("\nFixing CORS issues...")
    
    try:
        # Add flask-cors to requirements if not already there
        if os.path.exists('requirements.txt'):
            with open('requirements.txt', 'r') as f:
                requirements = f.read()
            
            if 'flask-cors' not in requirements.lower():
                with open('requirements.txt', 'a') as f:
                    f.write('\nflask-cors==4.0.0\n')
                print("✅ Added flask-cors to requirements.txt")
                
                # Install flask-cors
                subprocess.check_call([sys.executable, "-m", "pip", "install", "flask-cors==4.0.0"])
        
        return True
    except Exception as e:
        print(f"❌ Error fixing CORS issues: {e}")
        return False

def run_tests():
    """Run the test script to verify everything is working."""
    print("\nRunning tests...")
    
    try:
        subprocess.check_call([sys.executable, "test_server.py"])
        return True
    except subprocess.CalledProcessError:
        print("❌ Tests failed")
        return False
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Market Analysis Tool Issue Fixer")
    print("=" * 60)
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment check failed. Please make sure you're in the correct directory.")
        sys.exit(1)
    
    # Fix permissions
    fix_permissions()
    
    # Install dependencies
    install_dependencies()
    
    # Check API key
    check_api_key()
    
    # Fix CORS issues
    fix_cors_issues()
    
    print("\n✅ All fixes applied!")
    print("You can now run the application with: python run.py")
    
    # Ask if user wants to run tests
    response = input("\nDo you want to run tests to verify the fixes? (y/n): ")
    if response.lower() in ['y', 'yes']:
        run_tests() 