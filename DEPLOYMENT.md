# Deployment Guide for Market Analysis Tool

This guide explains how to deploy the Market Analysis Tool with a separate frontend and backend.

## Architecture Overview

The application is split into two parts:
1. **Frontend**: Static HTML/CSS/JS files that can be hosted on Vercel, Netlify, or any static hosting service
2. **Backend**: Flask API server that needs to be hosted on a platform that supports long-running processes

## Deploying the Frontend (Vercel)

1. Push your code to a GitHub repository
2. Connect your Vercel account to GitHub
3. Import the repository in Vercel
4. Deploy the project

The frontend is now deployed and accessible via a Vercel URL (e.g., `https://your-project.vercel.app`).

## Deploying the Backend

You have several options for hosting the backend:

### Option 1: Deploy to Heroku

1. Create a `Procfile` in your project root:
```
web: gunicorn app:app
```

2. Add gunicorn to requirements.txt:
```
gunicorn==20.1.0
```

3. Create a Heroku app:
```bash
heroku create your-market-analysis-api
```

4. Push to Heroku:
```bash
git push heroku main
```

5. Your API is now available at `https://your-market-analysis-api.herokuapp.com`

### Option 2: Deploy to Railway

1. Create a Railway account
2. Connect your GitHub repository
3. Create a new project from the repository
4. Add the following environment variables:
   - `PORT=5000`
   - `NEWSAPI_KEY=your_api_key`
5. Deploy the project
6. Your API is now available at the Railway-provided URL

### Option 3: Deploy to a VPS (DigitalOcean, AWS EC2, etc.)

1. Set up a VPS with Ubuntu
2. Install Python and required dependencies:
```bash
sudo apt update
sudo apt install python3 python3-pip
```

3. Clone your repository:
```bash
git clone https://github.com/yourusername/market-analysis.git
cd market-analysis
```

4. Install dependencies:
```bash
pip3 install -r requirements.txt
```

5. Install and configure Nginx:
```bash
sudo apt install nginx
```

6. Create a systemd service for your app:
```bash
sudo nano /etc/systemd/system/market-analysis.service
```

Add the following content:
```
[Unit]
Description=Market Analysis API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/market-analysis
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

7. Start and enable the service:
```bash
sudo systemctl start market-analysis
sudo systemctl enable market-analysis
```

8. Configure Nginx as a reverse proxy:
```bash
sudo nano /etc/nginx/sites-available/market-analysis
```

Add the following content:
```
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

9. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/market-analysis /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

10. Your API is now available at `http://your-domain.com`

## Connecting Frontend to Backend

Once both the frontend and backend are deployed:

1. Open your frontend application
2. Enter the backend API URL in the input field (e.g., `https://your-market-analysis-api.herokuapp.com`)
3. Click "Test Connection" to verify the connection
4. If successful, you can now use the application

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Verify that the backend has CORS properly configured
2. Check that the frontend is using the correct API URL
3. Ensure that the backend is accessible from the internet

### Connection Errors

If you can't connect to the backend:

1. Check if the backend server is running
2. Verify that the URL is correct and includes the protocol (http:// or https://)
3. Check if there are any firewall rules blocking the connection
4. Verify that the backend server is accessible from the internet

### API Key Issues

If you encounter issues with the NewsAPI:

1. Verify that your NewsAPI key is valid
2. Check if you've reached the API request limit
3. Ensure the key is properly set in the .env file on the backend server 