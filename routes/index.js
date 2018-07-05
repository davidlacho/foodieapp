const express = require('express');
const router = express.Router();
const searchResults = require('../models/searchSchema.js');
const fetchData = require('../js/fetchData.js');

// ==== GET API KEYS FROM CONFIG.JS FILE TO USE FOR SEARCH =====

const config = require('../js/config.js');
const food2forkApiKey = config.food2forkApiKey;

function renderRecipes(res, data) {
  if (data.recipes.length === 0) {
    res.render('template', {
      message: "nothing found!"
    });
  } else {
    res.render('template', data);
  }
}

// ===== HANDLE ROUTES =====

router.get('/', (req, res, next) => {

  let { ingredient } = req.query;
  let { recipe } = req.query;

  if (recipe != undefined) {
    url = `http://food2fork.com/api/get?key=${food2forkApiKey}&rId=${recipe}`;
    fetchData(url)
      .then((data) => {
        res.send(data);
      });
  } else if (ingredient != undefined) {
    // If results do not exist in db, create it.
    searchResults.find({
      ingredientName: ingredient
    }, function(err, docs) {
      if (docs.length === 0) {
        let recipes = [];
        const url = `http://food2fork.com/api/search?key=${food2forkApiKey}&q=${ingredient}`;
        fetchData(url)
          .then((data) => {
            recipes = data;
            recipes.recipes.forEach((recipe) => {
              recipe.social_rank = Math.round(recipe.social_rank);
            });
            const savedResults = {
              ingredientName: ingredient,
              results: recipes
            };
            searchResults.create(savedResults);
            renderRecipes(res, recipes);
          });
      } else {
        renderRecipes(res, docs[0].results);;
      }
    });
  } else {
    res.render('template');
  }
}); // END .get('/')

module.exports = router;
