const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const similarmoviesSchema = new Schema({
  movie_id: String,
  similar: [String]
});


module.exports = mongoose.model('Similarmovie', similarmoviesSchema);
