// Requires
var express = require('express');

//Variable initiation
var app = express();

//Routes
app.get('/', (request, response, next) => {
  // See http code response https://www.tutorialspoint.com/http/http_status_codes.htm#:~:text=The%20Status%2DCode%20element%20in,S.N.
  response.status(200).json({
    isOk: true,
    message: 'request made correctly!',
  });
});

module.exports = app;
