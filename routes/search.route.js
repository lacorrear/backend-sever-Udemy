// Requires
var express = require('express');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

//Variable initiation
var app = express();

//Routes

// ===========================================
// General by collection
// ===========================================
app.get('/collection/:group/:parameter', (request, response) => {
  var group = request.params.group;
  var parameter = request.params.parameter;
  //regular expresion in order to search in all data insensible to upperCase and lowerCase
  var regex = new RegExp(parameter, 'i');

  var promise;

  switch (group) {
    case 'hospitals':
      promise = searchHospitals(regex);
      break;
    case 'doctors':
      promise = searchDoctors(regex);
      break;
    case 'users':
      promise = searchUsers(regex);
      break;
    default:
      // See http code response
      return response.status(400).json({
        isOk: false,
        message: 'there are only 3 collections: users,doctors and hospitals ',
        error: { message: 'name collection is not found' },
      });
  }

  promise.then((data) => {
    // See http code response
    response.status(200).json({
      isOk: true,
      [group]: data,
    });
  });
});

// ===========================================
// General searching
// ===========================================
app.get('/all/:parameter', (request, response, next) => {
  var parameter = request.params.parameter;
  //regular expresion in order to search in all data insensible to upperCase and lowerCase
  var regex = new RegExp(parameter, 'i');

  Promise.all([searchHospitals(regex), searchDoctors(regex), searchUsers(regex)]).then((dataOut) => {
    // See http code response
    response.status(200).json({
      isOk: true,
      hospitals: dataOut[0],
      doctors: dataOut[1],
      users: dataOut[2],
    });
  });
});

// making an asynchronous searching process for Hospitals
function searchHospitals(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ name: regex })
      //  populate shows user info
      .populate('user', 'name email')
      .exec((error, data) => {
        if (error) {
          reject('Error loading hospitals', error);
        } else resolve(data);
      });
  });
}

// making an asynchronous searching process for Doctors
function searchDoctors(regex) {
  return new Promise((resolve, reject) => {
    Doctor.find({ name: regex })
      //  populate shows user info
      .populate('user', 'name email')
      .populate('hospital')
      .exec((error, data) => {
        if (error) {
          reject('Error loading Doctors', error);
        } else resolve(data);
      });
  });
}

// making an asynchronous searching process for Users
function searchUsers(regex) {
  return new Promise((resolve, reject) => {
    // seacrh user by name and email
    User.find({}, 'name email role')
      .or([{ name: regex }, { email: regex }])
      .exec((error, data) => {
        if (error) {
          reject('Error loading Users', error);
        } else resolve(data);
      });
  });
}

module.exports = app;
