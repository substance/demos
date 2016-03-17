var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 5000;
var server = require('substance/util/server');

// For each example we need those two lines
server.serveStyles(app, '/notepad/app.css', path.join(__dirname, 'notepad', 'app.scss'));
server.serveJS(app, '/notepad/app.js', path.join(__dirname, 'notepad', 'app.js'));

// For each example we need those two lines
server.serveStyles(app, '/ghostwriter/app.css', path.join(__dirname, 'ghostwriter', 'app.scss'));
server.serveJS(app, '/ghostwriter/app.js', path.join(__dirname, 'ghostwriter', 'app.js'));

// For each example we need those two lines
server.serveStyles(app, '/collabwriter/app.css', path.join(__dirname, 'collabwriter', 'app.scss'));
server.serveJS(app, '/collabwriter/app.js', path.join(__dirname, 'collabwriter', 'app.js'));

server.serveStyles(app, '/dashboard/app.css', path.join(__dirname, 'dashboard', 'app.scss'));
server.serveJS(app, '/dashboard/app.js', path.join(__dirname, 'dashboard', 'app.js'));

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts')));

app.listen(port, function() {
  console.log("Substance Examples running on port " + port);
  console.log("http://127.0.0.1:"+port+"/");
});

// Export app for requiring in test files
module.exports = app;