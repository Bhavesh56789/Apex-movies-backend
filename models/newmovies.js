const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newmovieSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  poster_path: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('newmovies', newmovieSchema);

