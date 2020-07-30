// Requires
var express = require('express');
// Middelware to check the token
var mdAuth = require('../middlewares/authentication');

// Define data model
var Hospital = require('../models/hospital');
const { populate } = require('../models/hospital');

// Variable initiation
var app = express();

// ===========================================
// Create a new hospital
// ===========================================
app.post('/', mdAuth.checkToken, (request, response) => {
  var body = request.body;
  // token is given when ypu logIn

  //----- save in mongoose -----
  // 1 create a new hospital
  var hospital = new Hospital({
    name: body.name,
    // img: body.img,
    user: request.user._id,
  });
  // 2 save
  hospital.save((error, dataSaved) => {
    if (error) {
      return response.status(400).json({
        isOk: false,
        message: 'Error creating hospital',
        errors: error,
        // npm install --save mongoose-unique-validator --save
      });
    }
    response.status(201).json({
      isOk: true,
      hospital: dataSaved,
    });
  });

  //----------------------------
});

// ===========================================
// Get all hospitals
// ===========================================
app.get('/', (request, response, next) => {
  var from = request.query.from || 0;
  from = Number(from); // making sure that from is a number

  // [name img user ] are the properties you want to get
  Hospital.find({}, ' name img user ')
    .skip(from) // skip the first "from" values
    .limit(2)
    .populate('user', 'name email') // in order to show user info in the response
    .exec((error, data) => {
      if (error) {
        return response.status(500).json({
          isOk: false,
          message: 'Error loading hospitals data',
          errors: error,
        });
      }

      // Counting all registers in the data base
      Hospital.count({}, (error, count) => {
        if (error) {
          return response.status(500).json({
            isOk: false,
            message: 'Error counting hospitals data',
            errors: error,
          });
        }
        // See http code response https://www.tutorialspoint.com/http/http_status_codes.htm#:~:text=The%20Status%2DCode%20element%20in,S.N.
        response.status(200).json({
          isOk: true,
          hospitals: data,
          total: count,
        });
      });
    });
});

// ===========================================
// Update hospital by id
// ===========================================
app.put('/:id', mdAuth.checkToken, (request, response) => {
  var id = request.params.id;
  var body = request.body;

  Hospital.findById(id, (error, data) => {
    if (error) {
      return response.status(500).json({
        isOk: false,
        message: 'Error searching hospital',
        errors: error,
      });
    }

    if (!data) {
      return response.status(400).json({
        isOk: false,
        message: 'hospital with id:' + id + ', does not exits',
        errors: { message: 'Does not exits an hospital with that id' },
      });
    }

    data.name = body.name;
    // data.img = body.img;
    data.user = request.user._id;

    data.save((error, dataSaved) => {
      if (error) {
        return response.status(400).json({
          isOk: false,
          message: 'Error updating hospital',
          errors: error,
        });
      }

      response.status(200).json({
        isOk: true,
        hospital: dataSaved,
      });
    });
  });
});

// ===========================================
// Delete hospital by id
// ===========================================
app.delete('/:id', mdAuth.checkToken, (request, response) => {
  var id = request.params.id;

  Hospital.findByIdAndRemove(id, (error, dataDelete) => {
    if (error) {
      return response.status(500).json({
        isOk: false,
        message: 'Error deleating hospital',
        errors: error,
        // npm install --save mongoose-unique-validator --save
      });
    }

    if (!dataDelete) {
      return response.status(400).json({
        isOk: false,
        message: 'Do not exits an hospital wiht this id',
        errors: { message: 'Do not exits an hospital wiht this id' },
        // npm install --save mongoose-unique-validator --save
      });
    }

    response.status(200).json({
      isOk: true,
      hospital: dataDelete,
    });
  });
});

module.exports = app;
