const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  recipeID: {
    type: String
  },
  results: {
    type: Object
  }
});

const recipeResults = mongoose.model('recipeResults', recipeSchema);
module.exports = recipeResults;
