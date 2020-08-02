// Requires
var express = require('express');
var jwt = require('jsonwebtoken');
// Library use to encrypt password
var bcrypt = require('bcryptjs');
var User = require('../models/user');
const SEED = require('../config/config').SEED;
// Google auth
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET_ID = require('../config/config').GOOGLE_SECRET_ID;
const { OAuth2Client } = require('google-auth-library');

// Variable initiation
var app = express();

// =================================================
// This is a Google authentication
// =================================================
app.post('/google', (request, response) => {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID, '');
  var token = request.body.token || ''; // see video 12.4

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
      // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      // [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    User.findOne({ email: payload.email }, (err, userOut) => {
      if (err) {
        return response.status(500).json({
          isOk: false,
          message: 'Error finding user',
          errors: err,
        });
      }

      if (userOut) {
        if (userOut.google === false) {
          return response.status(400).json({
            isOk: false,
            message: 'User must use original authentication ',
          });
        } else {
          // create token
          // expiresIn time in seconds (14400 = 4h)
          userOut.password = ':)';
          var token = jwt.sign({ user: userOut }, SEED, { expiresIn: 14400 });

          response.status(201).json({
            isOk: true,
            message: 'Successfully login with Google',
            user: userOut,
            token: token,
            id: userOut.id,
          });
        }
      } else {
        var user = new User();
        user.name = payload.name;
        user.email = payload.email;
        user.password = ':)';
        user.img = payload.picture;
        user.google = true;

        user.save((err, userSavedDB) => {
          if (err) {
            return response.status(500).json({
              isOk: false,
              message: 'Error saving user in the data base',
              errors: err,
            });
          }
          // create token
          // expiresIn time in seconds (14400 = 4h)
          userSavedDB.password = ':)';
          var token = jwt.sign({ user: userSavedDB }, SEED, { expiresIn: 14400 });

          response.status(201).json({
            isOk: true,
            message: 'Successfully login with Google',
            user: userSavedDB,
            token: token,
            id: userSavedDB.id,
          });
        });
      }
    });
  }
  verify().catch((error) => {
    return response.status(500).json({
      isOk: false,
      message: 'Error in token validation',
      errors: error,
    });
  });
});

// =================================================
// This is a manual authentication
// =================================================
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
