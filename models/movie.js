const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  adult: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  genres: {
    type: String,
    required: true
  },
  original_title: {
    type: String,
    required: true
  },
  overview: {
    type: String,
    required: true
  },
  popularity: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  production_companies: {
    type: String,
    required: true
  },
  production_countries: {
    type: String,
    required: true
  },
  release_date: {
    type: String,
    required: true
  },
  revenue: {
    type: String,
    required: true
  },
  runtime: {
    type: String,
    required: true
  },
  spoken_languages: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  vote_average: {
    type: String,
    required: true
  },
  vote_count: {
    type: String,
    required: true
  },
  score: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Movie', movieSchema);

