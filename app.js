var express = require('express'),
    http = require('http');

var app = express();

app.server = http.createServer(app);

app.get('/', function (req, res) {
  res.send("hello, world");
});

app.server.listen((process.env.PORT || 5000), '0.0.0.0', function () {
  console.log('Running: http://%s:%s', app.server.address().address, app.server.address().port)
});
