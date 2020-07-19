// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Variable initiation
var app = express();

// BodyParse
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import Routes
var appRoutes = require('./routes/app.route');
var userRoutes = require('./routes/user.route');
var loginRoutes = require('./routes/login.route');

// Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
  if (error) {
    throw error;
  }
  console.log('Data Base: \x1b[32m%s\x1b[0m ', 'online');
});

// listen request
app.listen(3000, () => {
  console.log('Express server 3000 port: \x1b[32m%s\x1b[0m ', 'online');
});
