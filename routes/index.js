const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// ==== GET API KEYS FROM CONFIG.JS FILE =====
const config = require('../js/config.js');
const food2forkApiKey = config.food2forkApiKey;

// ===== FETCH HANDLERS =====

function fetchData(url) {

  return fetch(url)
    .then(res => checkStatus(res))
    .then(res => res.json())
    .catch(error => console.log('Looks like there was a problem: ', error));
}

function checkStatus(res) {
  if (res.ok) {
    return Promise.resolve(res)
  } else {
    return Promise.reject(new Error(res.statusText));
  }
}

// ===== HANDLE ROUTES =====


router.get('/', (req, res, next) => {
  let { ingredient } = req.query;
  let { recipe } = req.query;

  if (recipe != undefined) {
    url = `http://food2fork.com/api/get?key=${food2forkApiKey}&rId=${recipe}`;
    console.log(url);
    fetchData(url)
      .then((data) => {
        recipeIngredients = data;
        console.log(data);
      })
    res.render('template');
  } else if (ingredient != undefined) {
    let recipes = [];
    const url = `http://food2fork.com/api/search?key=${food2forkApiKey}&q=${ingredient}`;
    fetchData(url)
      .then((data) => {
        recipes = data;
        if (recipes.recipes.length === 0) {
          res.render('template', {
            message : "Nothing found! Try again."
          });
          // NOTHING RETURNED
        } else {
          recipes.recipes.forEach((recipe) => {
            recipe.social_rank = Math.round(recipe.social_rank);
          });
          res.render('template', recipes);
        }
      });
  } else {
    res.render('template');
  }
});

module.exports = router;
