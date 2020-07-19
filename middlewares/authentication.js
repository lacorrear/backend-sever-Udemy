// Requires
var jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

// ===========================================
// Verify Token (Middleware)
// ===========================================
exports.checkToken = function (request, response, next) {
  //get token
  var token = request.query.token;

  // Check if token is valid
  jwt.verify(token, SEED, (error, decoded) => {
    if (error) {
      return response.status(401).json({
        isOk: false,
        message: 'Error in token validation',
        errors: error,
      });
    }

    request.user = decoded.user;
    next();
  });
};

// ----------------------------------------------------
// This method apply for ALL the functions below
// is not a good practice check token qith this method
// because is not flexible
//
// app.use('/', (request, response, next) => {
//   //get token
//   var token = request.query.token;

//   // Check if token is valid
//   jwt.verify(token, SEED, (error, decoded) => {
//     if (error) {
//       return response.status(401).json({
//         isOk: false,
//         message: 'Error in token validation',
//         errors: error,
//       });
//     }
//     next();
//   });
// });
//
// ----------------------------------------------------
