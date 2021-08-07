const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  cnumber: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  language: [{ type: String }],
  genres: [{ type: String }],
  movies: [{ type: String }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
