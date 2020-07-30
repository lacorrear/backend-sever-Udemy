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
var userRoutes = require('./routes/user.route');
var loginRoutes = require('./routes/login.route');
var hospitalRoutes = require('./routes/hospital.route');
var doctorRoutes = require('./routes/doctor.route');
var searchRoutes = require('./routes/search.route');
var uploadRoutes = require('./routes/upload.route');
var imageRoutes = require('./routes/image.route');
var appRoutes = require('./routes/app.route');

// Server index config --see video 11.15 File system
//
// Display image on the browser
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Routes
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/search', searchRoutes);
app.use('/upload', uploadRoutes);
app.use('/image', imageRoutes);
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
