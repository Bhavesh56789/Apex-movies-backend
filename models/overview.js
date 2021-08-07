const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const overviewnewSchema = new Schema({
  id: String,
  tfidfvector: Object
});


module.exports = mongoose.model('Overviewnew', overviewnewSchema);
