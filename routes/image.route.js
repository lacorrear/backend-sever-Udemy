// Requires
var express = require('express');
var fs = require('fs');

//Variable initiation
var app = express();

//Routes
app.get('/:type/:img', (req, res, next) => {
  // reading variables from url
  var type = req.params.type;
  var img = req.params.img;

  // We define serverPath In order to give a sendFile function a absolute image path
  const serverPath = require('path');
  var path = `uploads/${type}/${img}`;

  fs.exists(path, (exists) => {
    if (!exists) {
      path = 'assets/no-img.jpg';
    }
    return res.sendFile(serverPath.resolve(path));
  });
});

module.exports = app;
