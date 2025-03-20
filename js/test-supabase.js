/**
 * Supabase Connection Test
 * This script tests the connection to Supabase and verifies tables exist
 */

// Log the start of the test
console.log('🔍 Starting Supabase connection test...');

// Update status display
function updateStatusDisplay(message, type = 'info') {
  const statusElement = document.getElementById('supabaseStatus');
  if (statusElement) {
    statusElement.innerHTML = message;
    statusElement.className = `mt-3 small text-${type}`;
  }
}

// Test function - runs all tests
async function testSupabaseConnection() {
  try {
    console.log('📡 Testing connection to Supabase at:', CONFIG.supabase.url);
    updateStatusDisplay('<span class="spinner-border spinner-border-sm text-info" role="status"></span> Testing connection to Supabase...', 'info');
    
    // 1. Test basic connection
    const { data: connectionTest, error: connectionError } = await supabaseClient
      .from('news_articles')
      .select('count(*)', { count: 'exact', head: true });
      
    if (connectionError) {
      console.error('❌ Connection error:', connectionError.message);
      updateStatusDisplay(`❌ Connection error: ${connectionError.message}`, 'danger');
      return false;
    }
    
    console.log('✅ Connection successful!');
    updateStatusDisplay('✅ Connection to Supabase successful!', 'success');
    
    // 2. Test each table exists and count records
    const tables = ['news_articles', 'market_data', 'analysis_results'];
    let tableResults = '';
    
    for (const table of tables) {
      const { data, error, count } = await supabaseClient
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.error(`❌ Error accessing "${table}" table:`, error.message);
        tableResults += `<br>❌ Table "${table}": ${error.message}`;
      } else {
        console.log(`✅ Table "${table}" exists with approximately ${count} records`);
        tableResults += `<br>✅ Table "${table}": ${count} records`;
      }
    }
    
    // 3. Fetch one sample record from news_articles
    const { data: sampleNews, error: sampleError } = await supabaseClient
      .from('news_articles')
      .select('*')
      .limit(1)
      .single();
      
    if (sampleError) {
      console.error('❌ Error fetching sample news record:', sampleError.message);
    } else {
      console.log('📰 Sample news record:', sampleNews.title);
      tableResults += `<br>📰 Sample news: "${sampleNews.title}"`;
    }
    
    // Update final status with table results
    updateStatusDisplay(`✅ Supabase connection successful!${tableResults}`, 'success');
    
    console.log('🎉 Supabase connection test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during test:', error.message);
    updateStatusDisplay(`❌ Unexpected error: ${error.message}`, 'danger');
    return false;
  }
}

// Check if schema needs to be created
async function checkSchema() {
  try {
    // Check if news_articles table exists and has data
    const { data: newsData, error: newsError, count: newsCount } = await supabaseClient
      .from('news_articles')
      .select('*', { count: 'exact', head: true });
    
    if (newsError && newsError.code === '42P01') { // PostgreSQL code for undefined_table
      console.error('Tables not found. Schema needs to be created.');
      showSchemaInstructions();
      return false;
    } else if (newsCount === 0) {
      // Table exists but no data
      console.warn('Tables exist but contain no data.');
      showSampleDataInstructions();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking schema:', error);
    return false;
  }
}

// Show schema creation instructions
function showSchemaInstructions() {
  // Create a modal with schema instructions
  const modalHtml = `
    <div class="modal fade" id="schemaModal" tabindex="-1" aria-labelledby="schemaModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title" id="schemaModalLabel">⚠️ Database Schema Not Found</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>The Supabase connection appears to be working, but the required database tables are not set up.</p>
            
            <div class="alert alert-info">
              <h6>⚠️ Important: First-time Setup</h6>
              <p>Before using the automatic setup, you need to create the <code>exec_sql</code> function in your Supabase project:</p>
              <ol>
                <li>Go to your Supabase project dashboard</li>
                <li>Go to the SQL Editor</li>
                <li>Copy and paste the following SQL:</li>
              </ol>
              <pre class="bg-dark text-light p-2"><code>-- This function allows executing arbitrary SQL
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;</code></pre>
              <p>Click "Run" to create this function.</p>
            </div>
            
            <p>There are two ways to create the necessary tables:</p>
            
            <div class="row">
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header bg-primary text-white">Option 1: Automatic Setup</div>
                  <div class="card-body">
                    <p>Click the button below to try automatic schema setup:</p>
                    <button id="setupSchemaBtn" class="btn btn-primary">Create Schema Now</button>
                    <div id="setupStatus" class="mt-2 small"></div>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header bg-secondary text-white">Option 2: Manual Setup</div>
                  <div class="card-body">
                    <p>Follow these steps to manually create the tables:</p>
                    <ol>
                      <li>Log in to your Supabase project dashboard</li>
                      <li>Go to the SQL Editor</li>
                      <li>Copy the SQL from the <code>supabase-schema.sql</code> file in this project</li>
                      <li>Paste it into the SQL Editor and run it</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="alert alert-secondary">
              <p class="mb-2">The schema will create these tables:</p>
              <ul>
                <li><code>news_articles</code> - For storing news data</li>
                <li><code>market_data</code> - For storing market prices</li>
                <li><code>analysis_results</code> - For storing analysis results</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Insert modal HTML
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('schemaModal'));
  modal.show();
  
  // Set up event listener for setup button
  document.getElementById('setupSchemaBtn').addEventListener('click', async function() {
    const button = this;
    const statusEl = document.getElementById('setupStatus');
    
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Setting up...';
    statusEl.innerHTML = 'Creating database functions...';
    statusEl.className = 'mt-2 small text-info';
    
    try {
      // 1. Create functions
      const functionsResult = await SETUP_SCHEMA.createFunctions();
      if (!functionsResult.success) {
        statusEl.innerHTML = 'Error creating functions. Check console for details.';
        statusEl.className = 'mt-2 small text-danger';
        button.innerHTML = 'Failed';
        button.className = 'btn btn-danger';
        return;
      }
      
      statusEl.innerHTML = 'Creating database tables...';
      
      // 2. Create tables
      const tablesResult = await SETUP_SCHEMA.createTables();
      if (!tablesResult.success) {
        statusEl.innerHTML = 'Error creating tables. Check console for details.';
        statusEl.className = 'mt-2 small text-danger';
        button.innerHTML = 'Failed';
        button.className = 'btn btn-danger';
        return;
      }
      
      statusEl.innerHTML = 'Inserting sample data...';
      
      // 3. Insert sample data
      const dataResult = await SETUP_SCHEMA.insertSampleData();
      if (!dataResult.success) {
        statusEl.innerHTML = 'Tables created but error inserting sample data. You may need to add data manually.';
        statusEl.className = 'mt-2 small text-warning';
        button.innerHTML = 'Partial Success';
        button.className = 'btn btn-warning';
        return;
      }
      
      // All done!
      statusEl.innerHTML = 'Success! Schema created and sample data inserted.';
      statusEl.className = 'mt-2 small text-success';
      button.innerHTML = 'Setup Complete';
      button.className = 'btn btn-success';
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error in schema setup:', error);
      statusEl.innerHTML = `Error: ${error.message}`;
      statusEl.className = 'mt-2 small text-danger';
      button.innerHTML = 'Failed';
      button.className = 'btn btn-danger';
    }
  });
}

// Show sample data instructions
function showSampleDataInstructions() {
  updateStatusDisplay('⚠️ Tables exist but have no data. Consider running the sample data inserts from supabase-schema.sql', 'warning');
}

// Run the test when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add a test button to the page
  const testButton = document.createElement('button');
  testButton.textContent = 'Test Supabase Connection';
  testButton.className = 'btn btn-info ms-2';
  
  // Add a button to open Supabase dashboard
  const dashboardButton = document.createElement('a');
  dashboardButton.textContent = 'Open Supabase Dashboard';
  dashboardButton.className = 'btn btn-outline-secondary ms-2';
  dashboardButton.href = CONFIG.supabase.url.replace('.supabase.co', '.supabase.co/project/default');
  dashboardButton.target = '_blank';
  dashboardButton.rel = 'noopener noreferrer';
  
  // Call the test function
  testButton.addEventListener('click', async () => {
    testButton.disabled = true;
    testButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Testing...';
    
    // Call the test function
    const success = await testSupabaseConnection();
    
    // Update button based on result
    if (success) {
      testButton.className = 'btn btn-success ms-2';
      testButton.textContent = 'Connection Successful!';
    } else {
      testButton.className = 'btn btn-danger ms-2';
      testButton.textContent = 'Connection Failed';
    }
    
    // Re-enable button after 3 seconds
    setTimeout(() => {
      testButton.disabled = false;
      if (success) {
        testButton.className = 'btn btn-info ms-2';
        testButton.textContent = 'Test Again';
      }
    }, 3000);
  });
  
  // Auto-run a simple connection test on page load
  setTimeout(async () => {
    try {
      // Simple connection test
      const { data, error } = await supabaseClient.from('news_articles').select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') { // PostgreSQL code for undefined_table
          updateStatusDisplay('⚠️ Supabase connected but tables not found. Schema needs to be created.', 'warning');
          await checkSchema();
        } else {
          updateStatusDisplay('❌ Supabase connection failed. Click "Test Supabase Connection" for details.', 'danger');
        }
      } else {
        updateStatusDisplay('✅ Supabase connection detected. Click "Test Supabase Connection" for details.', 'success');
      }
    } catch (error) {
      updateStatusDisplay('❌ Supabase connection error. Click "Test Supabase Connection" for details.', 'danger');
    }
  }, 1000);
  
  // Add the buttons to the UI
  const buttonContainer = document.querySelector('.d-flex.gap-3');
  buttonContainer.appendChild(testButton);
  buttonContainer.appendChild(dashboardButton);
}); 