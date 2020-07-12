// Requires
var express = require('express');
var mongoose = require('mongoose');

//Variable initiation
var app = express();

// Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (error, response) => {
  if (error) {
    throw error;
  }
  console.log('Data Base: \x1b[32m%s\x1b[0m ', 'online');
});

//Routes
app.get('/', (request, response, next) => {
  // See http code response https://www.tutorialspoint.com/http/http_status_codes.htm#:~:text=The%20Status%2DCode%20element%20in,S.N.
  response.status(200).json({
    isOk: true,
    message: 'request made correctly!',
  });
});

//listen request
app.listen(3000, () => {
  console.log('Express server 3000 port: \x1b[32m%s\x1b[0m ', 'online');
});
