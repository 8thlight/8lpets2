const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Get the file path
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, serve index.html
      filePath = path.join(__dirname, 'public', 'index.html');
    }

    // Get the file extension
    const extname = path.extname(filePath);

    // Set the content type based on the file extension
    let contentType = 'text/html';
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
        contentType = 'image/jpg';
        break;
    }

    // Read the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // Page not found
          fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf8');
          });
        } else {
          // Server error
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        // Success
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
