const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  ingredientName: {
    type: String
  },
  results: {
    type: Object
  }
});

const searchResults = mongoose.model('results', searchSchema);
module.exports = searchResults;
