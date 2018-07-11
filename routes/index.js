const express = require('express');
const router = express.Router();
const searchResults = require('../models/searchSchema.js');
const recipeResults = require('../models/recipeSchema.js')
const fetchData = require('../js/fetchData.js');
const User = require('../models/userSchema.js');


// ==== GET API KEYS FROM CONFIG.JS FILE TO USE FOR SEARCH =====

const config = require('../js/config.js');
const food2forkApiKey = config.food2forkApiKey;

function renderRecipes(res, data) {
  if (data.recipes.length === 0) {
    res.render('searchapp', {
      message: "nothing found!"
    });
  } else {
    res.render('searchapp', data);
  }
}

// ===== HANDLE ROUTES =====

// Get Register route:

router.get('/register', (req, res, next) => {
  res.render('register');
});

// Post Register route:

router.post('/register', function(req, res, next) {

  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {
      User.find({
        name: req.body.name
      }, function(err, docs) {
        // If user does not exist:
        if (docs.length === 0) {
          if (req.body.password !== req.body.confirmPassword) {
            const err = new Error('Passwords do not match');
            err.status = 400;
            return next(err);
          } else {
            const userData = {
              email: req.body.email,
              name: req.body.name,
              password: req.body.password
            };
            //use schema's create method to insert our document into mongo:
            User.create(userData, function(error, user) {
              if (error) {
                return next(error);
              } else {
                req.session.userID = user._id;
                return res.redirect('/');
              }
            });
          }
        } else {
          const error = new Error("User already exists.");
          error.status = 409;
          next(error);
        }
      });
  } else {
    const err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// Get Homepage & Handle Query Strings

router.get('/', (req, res, next) => {

  // Query Strings:
  let {
    ingredient
  } = req.query;

  let {
    recipe
  } = req.query;

  // Check if query string searching for recipe.
  if (recipe != undefined) {
    recipe = recipe.toLowerCase(recipe);
    recipeResults.find({
      recipeID: recipe
    }, function(err, docs) {
      // if recipe results do not exists in the db, create entry in db and send data.
      if (docs.length === 0) {
        url = `http://food2fork.com/api/get?key=${food2forkApiKey}&rId=${recipe}`;
        fetchData(url)
          .then((data) => {
            const recipeSavedResults = {
              recipeID: recipe,
              results: data
            };
            recipeResults.create(recipeSavedResults);
            res.send(data);
          })
          .catch((err) => {
            const error = new Error("Something went wrong on our end.");
            error.status = 500;
            // Print a more detailed error to the server console:
            console.error(`\nERROR OCCURED: ${err}`)
            // Push this error to be handled in app.js
            next(error);
          });
      } else {
        // if recipe results exists in db, send data from db.
        res.send(docs[0].results);
      }
    });
    // Check if query string searching for ingredient
  } else if (ingredient != undefined) {
    if (ingredient.length === 0) {
      res.redirect('/')
    } else {
      ingredient = ingredient.toLowerCase(ingredient);
      searchResults.find({
        ingredientName: ingredient
      }, function(err, docs) {
        // if ingredient does not exist in db, create entry in db and send data.
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
            })
            .catch((err) => {
              const error = new Error("Whoops! Something went wrong on our end.");
              error.status = 500;
              // Print a more detailed error to the server console:
              console.error(`\nERROR OCCURED: ${err}`)
              // Push this error to be handled in app.js
              next(error);
            });
        } else {
          // if ignredient results exists in db, send data from db.
          renderRecipes(res, docs[0].results);;
        }
      });
    }
    // If no query strings, render home page
  } else {
    res.render('searchapp');
  }

}); // END .get('/')

module.exports = router;
