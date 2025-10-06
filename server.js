const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

// Simple data storage in memory (for testing)
let sessionsData = {
  lastUpdated: new Date().toISOString(),
  totalSessions: 0,
  sessions: []
};

// Load existing data if file exists
const dataFile = './data/sessions.json';
if (fs.existsSync(dataFile)) {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    sessionsData = JSON.parse(data);
    console.log(`Loaded ${sessionsData.totalSessions} existing sessions`);
  } catch (error) {
    console.log('Could not load existing data:', error.message);
  }
}

// Save data to file
function saveData() {
  try {
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
    }
    fs.writeFileSync(dataFile, JSON.stringify(sessionsData, null, 2));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error.message);
  }
}

// Handle POST /save-data.php (emulating PHP endpoint)
function handleSaveData(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const sessionData = JSON.parse(body);
      
      // Add timestamp and ID if not present
      if (!sessionData.timestamp) {
        sessionData.timestamp = new Date().toISOString();
      }
      if (!sessionData.id) {
        sessionData.id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
      
      // Add to sessions
      sessionsData.sessions.push(sessionData);
      sessionsData.totalSessions = sessionsData.sessions.length;
      sessionsData.lastUpdated = new Date().toISOString();
      
      // Save to file
      saveData();
      
      // Send response
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        sessionId: sessionData.id,
        totalSessions: sessionsData.totalSessions
      }));
      
      console.log(`✅ New session saved. Total sessions: ${sessionsData.totalSessions}`);
      
    } catch (error) {
      console.error('Error processing save request:', error.message);
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Invalid JSON data'
      }));
    }
  });
}

// Handle GET /get-data.php (emulating PHP endpoint)
function handleGetData(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  const response = {
    success: true,
    totalSessions: sessionsData.totalSessions,
    lastUpdated: sessionsData.lastUpdated,
    sessions: sessionsData.sessions
  };
  
  res.end(JSON.stringify(response));
}

// Serve static files
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    const contentType = mime[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${req.method} ${pathname}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  // Handle API endpoints
  if (pathname === '/save-data.php' && req.method === 'POST') {
    handleSaveData(req, res);
    return;
  }
  
  if (pathname === '/get-data.php' && req.method === 'GET') {
    handleGetData(req, res);
    return;
  }
  
  // Serve static files
  let filePath = pathname === '/' ? './index.html' : `.${pathname}`;
  
  // Security: prevent directory traversal
  if (filePath.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  serveStaticFile(filePath, res);
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📊 Dashboard available at http://localhost:8000/dashboard.html');
  console.log('💾 Data will be saved to ./data/sessions.json');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  saveData();
  process.exit(0);
});