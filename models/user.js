var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// Creating valid roles
var validRoles = {
  values: ['ADMIN_ROLE', 'USER_ROLE'],
  message: '{VALUE} is not a valid role',
};

// Data schema with validation
var userSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, unique: true, required: [true, 'The email is required'] },
  password: { type: String, required: [true, 'Password is required'] },
  img: { type: String, required: false },
  role: { type: String, required: true, enum: validRoles, default: 'USER_ROLE' },
});

userSchema.plugin(uniqueValidator, { message: 'The {PATH} must be unique' });

module.exports = mongoose.model('User', userSchema);
