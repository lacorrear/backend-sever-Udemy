// Requires
var express = require('express');
var mdAuth = require('../middlewares/authentication');

// Define data model
var Doctor = require('../models/doctor');

// Variable initiation
var app = express();

// ===========================================
// Create a new doctor
// ===========================================
app.post('/', mdAuth.checkToken, (request, response) => {
  var body = request.body;
  // token is given when in logIn

  //----- save in mongoose -----
  // 1 create a new doctor
  var doctor = new Doctor({
    name: body.name,
    // img: body.img,
    user: request.user._id,
    // the hospital id is required in this field
    hospital: body.hospital,
  });
  // 2 save
  doctor.save((error, dataSaved) => {
    if (error) {
      return response.status(400).json({
        isOk: false,
        message: 'Error creating doctor',
        errors: error,
        // npm install --save mongoose-unique-validator --save
      });
    }
    response.status(201).json({
      isOk: true,
      doctor: dataSaved,
      doctorToken: request.doctor,
    });
  });

  //----------------------------
});

// ===========================================
// Get all doctors
// ===========================================
app.get('/', (request, response, next) => {
  var from = request.query.from || 0;
  from = Number(from); // making sure that from is a number

  // [name img user hospital] are the properties you want to get
  Doctor.find({}, ' name img user hospital')
    .skip(from) // skip the first "from" values
    .limit(5)
    .populate('user', 'name email') // in order to show user info in the response
    .populate('hospital') // in order to show all hospital info in the response
    .exec((error, data) => {
      if (error) {
        return response.status(500).json({
          isOk: false,
          message: 'Error loading doctors data',
          errors: error,
        });
      }

      // Counting all registers in the data base
      Doctor.count({}, (error, count) => {
        if (error) {
          return response.status(500).json({
            isOk: false,
            message: 'Error counting doctors data',
            errors: error,
          });
        }

        // See http code response https://www.tutorialspoint.com/http/http_status_codes.htm#:~:text=The%20Status%2DCode%20element%20in,S.N.
        response.status(200).json({
          isOk: true,
          doctors: data,
          total: count,
        });
      });
    });
});

// ===========================================
// Update doctor by id
// ===========================================
app.put('/:id', mdAuth.checkToken, (request, response) => {
  var id = request.params.id;
  var body = request.body;

  Doctor.findById(id, (error, data) => {
    if (error) {
      return response.status(500).json({
        isOk: false,
        message: 'Error searching doctor',
        errors: error,
      });
    }

    if (!data) {
      return response.status(400).json({
        isOk: false,
        message: 'doctor with id:' + id + ', does not exits',
        errors: { message: 'Does not exits an doctor with that id' },
      });
    }

    data.name = body.name;
    // data.img = body.img;
    data.user = request.user._id;
    // the hospital id is required in this field
    data.hospital = body.hospital;

    data.save((error, dataSaved) => {
      if (error) {
        return response.status(400).json({
          isOk: false,
          message: 'Error updating doctor',
          errors: error,
        });
      }

      response.status(200).json({
        isOk: true,
        doctor: dataSaved,
      });
    });
  });
});

// ===========================================
// Delete doctor by id
// ===========================================
app.delete('/:id', mdAuth.checkToken, (request, response) => {
  var id = request.params.id;

  Doctor.findByIdAndRemove(id, (error, dataDelete) => {
    if (error) {
      return response.status(500).json({
        isOk: false,
        message: 'Error deleating doctor',
        errors: error,
        // npm install --save mongoose-unique-validator --save
      });
    }

    if (!dataDelete) {
      return response.status(400).json({
        isOk: false,
        message: 'Do not exits an doctor wiht this id',
        errors: { message: 'Do not exits an doctor wiht this id' },
        // npm install --save mongoose-unique-validator --save
      });
    }

    response.status(200).json({
      isOk: true,
      doctor: dataDelete,
    });
  });
});

module.exports = app;
