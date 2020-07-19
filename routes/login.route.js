// Requires
var express = require('express');
var jwt = require('jsonwebtoken');
// Library use to encrypt password
var bcrypt = require('bcryptjs');
var User = require('../models/user');
const SEED = require('../config/config').SEED;

// Variable initiation
var app = express();

app.post('/', (request, response) => {
  var body = request.body;

  User.findOne({ email: body.email }, (error, data) => {
    // check if there is any error
    if (error) {
      return response.status(500).json({
        isOk: false,
        message: 'Error finding  user',
        errors: error,
      });
    }

    // check if the user exist
    if (!data) {
      return response.status(400).json({
        isOk: false,
        message: 'No valid credentials - email',
        errors: error,
      });
    }

    // check if the password is correct
    if (!bcrypt.compareSync(body.password, data.password)) {
      return response.status(400).json({
        isOk: false,
        message: 'No valid credentials - password',
        errors: error,
      });
    }

    // create token
    // expiresIn time in seconds (14400 = 4h)
    data.password = ':)';
    var token = jwt.sign({ user: data }, SEED, { expiresIn: 14400 });

    response.status(201).json({
      isOk: true,
      message: 'Successfully login',
      user: data,
      token: token,
      id: data.id,
    });
  });
});

module.exports = app;
