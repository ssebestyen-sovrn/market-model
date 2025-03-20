/**
 * Configuration settings for the Market News Analyzer application
 * Store environment-specific configuration here
 */

const CONFIG = {
    // Supabase configuration
    // Replace these with your actual Supabase credentials
    supabase: {
        url: 'https://eoxybtczhlstwswcqbrs.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVveHlidGN6aGxzdHdzd2NxYnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NjY1OTUsImV4cCI6MjA1NzI0MjU5NX0.6SHpUnf6brXPS5wmw77kFV0TkVoiggDdSZRCtuvKbBA',
    },
    
    // Application settings
    app: {
        // Number of news items to display
        newsLimit: 10,
        
        // Default chart colors
        chartColors: {
            positive: 'rgba(75, 192, 192, 0.8)',
            negative: 'rgba(255, 99, 132, 0.8)',
            neutral: 'rgba(201, 203, 207, 0.8)',
            default: 'rgba(54, 162, 235, 0.8)'
        }
    }
}; 