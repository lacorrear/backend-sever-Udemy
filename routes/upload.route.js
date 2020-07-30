// Requires
var express = require('express');
const fileUpload = require('express-fileupload');
var fs = require('fs');

var User = require('../models/user');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');

//Variable initiation
var app = express();

// default options
app.use(fileUpload());

// Routes
app.put('/:type/:id', (req, res) => {
  var type = req.params.type;
  var id = req.params.id;

  // Type-collection validation
  // -------------------------------------------------------
  var validCollections = ['users', 'hospitals', 'doctors'];
  if (validCollections.indexOf(type) < 0) {
    return res.status(400).json({
      isOk: false,
      //   message: 'No valid collection',
      message: `${type} is not a valid collection `,
      errors: { message: 'Only ' + validCollections.join(',') + ' are  valid collections' },
    });
  }

  // File validation
  // -------------------------------------------------------
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      isOk: false,
      message: 'No files were uploaded.',
      errors: { message: 'You must select a image file' },
    });
  }

  // Extensions File validation
  // -------------------------------------------------------
  // Getting the name of the input field (i.e. "sampleFile")
  var sampleFile = req.files.image;
  var splitFileName = sampleFile.name.split('.');
  var extensionFile = splitFileName[splitFileName.length - 1];

  var validExtensions = ['jpg', 'png', 'gif', 'jpeg'];

  if (validExtensions.indexOf(extensionFile) < 0) {
    return res.status(400).json({
      isOk: false,
      message: 'Not valid estension file',
      errors: { message: ' Only ' + validExtensions.join(',') + ' extensions are valid' },
    });
  }

  // Moving/saving file + Id validation
  // -------------------------------------------------------
  // Assigning file new name in order to save it in the data base
  // userId-randomNumber.extensionFile
  var newFileName = `${id}-${new Date().getMilliseconds()}.${extensionFile}`;
  // Assinging new path
  var path = `./uploads/${type}/${newFileName}`;

  // Id validation
  // -------------------------
  // See return value from callback in Nodejs and Mongoose
  // https://stackoverflow.com/questions/21570985/return-value-from-callback-in-node-js-and-mongoose/21571589
  idValidation(type, id, (idIsOk) => {
    //
    if (idIsOk === true) {
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(path, (err) => {
        if (err) {
          return res.status(500).json({
            isOk: false,
            message: 'Error moving file',
            errors: err,
          });
        }
        loadByCollection(type, id, newFileName, res);
      });
    } else {
      return res.status(400).json({
        isOk: false,
        message: 'There is not a ' + type.slice(0, -1) + ' with this id in the data base',
        errors: { message: 'id: ' + id + ', is not found' },
      });
    }
  });
});

function idValidation(type, id, callback) {
  var idOk = null;
  switch (type) {
    case 'users':
      User.findById(id, (err, data) => {
        if (err || !data) {
          idOk = false;
        } else {
          idOk = true;
        }
        callback(idOk);
      });
      break;
    case 'hospitals':
      Hospital.findById(id, (err, data) => {
        if (err || !data) {
          idOk = false;
        } else {
          idOk = true;
        }
        callback(idOk);
      });
      break;
    case 'doctors':
      Doctor.findById(id, (err, data) => {
        if (err || !data) {
          idOk = false;
        } else {
          idOk = true;
        }
        callback(idOk);
      });
      break;
  }
}

function loadByCollection(type, id, newFileName, res) {
  switch (type) {
    case 'users':
      User.findById(id, (err, data) => {
        if (err) {
          return res.status(500).json({
            isOk: false,
            message: 'Error finding user by Id',
            errors: err,
          });
        }

        // If a previous image exist, is delete
        var oldPath = './uploads/users/' + data.img;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

        // upload the new image
        data.img = newFileName;
        data.save((err, dataSaved) => {
          if (err) {
            return res.status(500).json({
              isOk: false,
              message: 'Error saving user image',
              errors: err,
            });
          }
          dataSaved.password = ':)';
          return res.status(200).json({
            isOk: true,
            message: 'User image uploaded successfully',
            user: dataSaved,
          });
        });
      });

      break;
    case 'hospitals':
      Hospital.findById(id, (err, data) => {
        if (err) {
          return res.status(500).json({
            isOk: false,
            message: 'Error finding hospital by Id',
            errors: err,
          });
        }

        // If a previous image exist, is delete
        var oldPath = './uploads/hospitals/' + data.img;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

        // upload the new image
        data.img = newFileName;
        data.save((err, dataSaved) => {
          if (err) {
            return res.status(500).json({
              isOk: false,
              message: 'Error saving hospital image',
              errors: err,
            });
          }
          return res.status(200).json({
            isOk: true,
            message: 'Hospital image uploaded successfully',
            hospital: dataSaved,
          });
        });
      });
      break;
    case 'doctors':
      Doctor.findById(id, (err, data) => {
        if (err) {
          return res.status(500).json({
            isOk: false,
            message: 'Error finding doctor by Id',
            errors: err,
          });
        }

        // If a previous image exist, is delete
        var oldPath = './uploads/doctors/' + data.img;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

        // upload the new image
        data.img = newFileName;
        data.save((err, dataSaved) => {
          if (err) {
            return res.status(500).json({
              isOk: false,
              message: 'Error saving doctor image',
              errors: err,
            });
          }
          return res.status(200).json({
            isOk: true,
            message: 'Doctor image uploaded successfully',
            doctor: dataSaved,
          });
        });
      });
      break;
  }
}

module.exports = app;
