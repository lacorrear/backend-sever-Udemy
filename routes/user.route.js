// Requires
var express = require('express');
var jwt = require('jsonwebtoken');
var mdAuth = require('../middlewares/authentication');

// Library use to encrypt password
var bcrypt = require('bcryptjs');
var User = require('../models/user');
const { count } = require('../models/user');

// Variable initiation
var app = express();

// ===========================================
// Get all users
// ===========================================
app.get('/', (request, response, next) => {
  var from = request.query.from || 0;
  from = Number(from); // making sure that from is a number

  User.find({}, ' name email img role ')
    .skip(from) // skip the first "from" values
    .limit(2)
    .exec((error, data) => {
      if (error) {
        return response.status(500).json({
          isOk: false,
          message: 'Error loading users data',
          errors: error,
        });
      }

      // Counting all registers in the data base
      User.count({}, (error, count) => {
        if (error) {
          return response.status(500).json({
            isOk: false,
            message: 'Error counting users data',
            errors: error,
          });
        }
        // See http code response https://www.tutorialspoint.com/http/http_status_codes.htm#:~:text=The%20Status%2DCode%20element%20in,S.N.
        response.status(200).json({
          isOk: true,
          users: data,
          total: count,
        });
      });
    });
});

// ===========================================
// Update user by id
// ===========================================
app.put('/:id', mdAuth.checkToken, (request, response) => {
  var id = request.params.id;
  var body = request.body;

  User.findById(id, (error, data) => {
    if (error) {
      return response.status(500).json({
        isOk: false,
        message: 'Error searching user',
        errors: error,
      });
    }

    if (!data) {
      return response.status(400).json({
        isOk: false,
        message: 'user with id:' + id + ', does not exits',
        errors: { message: 'Does not exits a user with that id' },
      });
    }

    data.name = body.name;
    data.email = body.email;
    data.role = body.role;

    data.save((error, dataSaved) => {
      if (error) {
        return response.status(400).json({
          isOk: false,
          message: 'Error updating user',
          errors: error,
        });
      }

      //In order to don't show the password , ":)" is not saved in the dataBase
      dataSaved.password = ':)';

      response.status(200).json({
        isOk: true,
        user: dataSaved,
      });
    });
  });
});

// ===========================================
// Create a new user
// ===========================================
app.post('/', mdAuth.checkToken, (request, response) => {
  var body = request.body;

  //----- save in mongoose -----
  // 1 create a new user
  var user = new User({
    name: body.name,
    email: body.email,
    // encrypting password , see https://github.com/dcodeIO/bcrypt.js
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role,
  });
  // 2 save
  user.save((error, dataSaved) => {
    if (error) {
      return response.status(400).json({
        isOk: false,
        message: 'Error creating user',
        errors: error,
        // npm install --save mongoose-unique-validator --save
      });
    }
    response.status(201).json({
      isOk: true,
      user: dataSaved,
      userToken: request.user,
    });
  });

  //----------------------------
});

// ===========================================
// Delete user by id
// ===========================================
app.delete('/:id', mdAuth.checkToken, (request, response) => {
  var id = request.params.id;

  User.findByIdAndRemove(id, (error, dataDelete) => {
    if (error) {
      return response.status(500).json({
        isOk: false,
        message: 'Error deleating user',
        errors: error,
        // npm install --save mongoose-unique-validator --save
      });
    }

    if (!dataDelete) {
      return response.status(400).json({
        isOk: false,
        message: 'Do not exits an user wiht this id',
        errors: { message: 'Do not exits an user wiht this id' },
        // npm install --save mongoose-unique-validator --save
      });
    }

    response.status(200).json({
      isOk: true,
      user: dataDelete,
    });
  });
});

module.exports = app;
