const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const overviewSchema = new Schema({
  id: String,
  tfidfvector: { vector: Object }
});


module.exports = mongoose.model('Overview', overviewSchema);
