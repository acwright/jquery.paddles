
/**
 * Local development server.
 *
 * The site is fully static (everything lives under public/), so this just
 * serves that directory. GitHub Pages serves the same files in production.
 */

var express = require('express');
var path = require('path');

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function() {
  console.log('Paddles running at http://localhost:' + port);
});
