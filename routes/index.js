const express = require('express');
const router = express.Router();
const searchResults = require('../models/searchSchema.js');
const recipeResults = require('../models/recipeSchema.js')
const fetchData = require('../js/fetchData.js');
const User = require('../models/userSchema.js');
const mid = require('../middleware');

// ==== GET API KEYS FROM CONFIG.JS FILE TO USE FOR SEARCH =====

const config = require('../js/config.js');
const food2forkApiKey = config.food2forkApiKey;

// ===== FUNCTIONS:

function renderRecipes(res, data) {
  if (data.recipes.length === 0) {
    res.render('searchapp', {
      message: "nothing found!",
      backButtonOff: true
    });
  } else {
    // Check if the user has favorited the recipe:
    let usersFaved = [];
    if (res.locals.currentUser) {
      User.find({
        _id: res.locals.currentUser
      }, function(err, docs) {
        if (err) {
          next(err);
        } else {
          docs[0].favRecipes.forEach((favedRecipes) => {
            usersFaved.push(favedRecipes.recipe);
          });
        }
        data.recipes.forEach((recipe) => {
          recipe.favOption = true;
          if (usersFaved.includes(recipe.recipe_id)) {
            recipe.isFavorited = true;
          } else {
            recipe.isFavorited = false;
          }
        });
        res.render('searchapp', data);
      });
    } else {
      // If there is no user logged in, render search data
      data.recipes.forEach((recipe) => {
        recipe.favOption = false;
      });
      res.render('searchapp', data);
    }
  }
}

function removeCharacterCode(stringToRemoveCharCode) {
  let in1 = stringToRemoveCharCode.indexOf("&#");
  let in2 = stringToRemoveCharCode.indexOf(";");
  let convertedCharCodeString = stringToRemoveCharCode.substring(in1 + 2, in2);
  let charCode = Number(convertedCharCodeString);
  let convertedChar = String.fromCharCode(charCode);
  let replace = ("&#" + convertedCharCodeString + ";");
  newString = stringToRemoveCharCode.replace(replace, convertedChar);
  if (newString.includes("&#")) {
    removeCharacterCode(newString)
  } else {
    return newString
  }
}

// ===== HANDLE ROUTES =====

// Get login route:
router.get('/login', mid.loggedOut, (req, res, next) => {
  res.render('login');
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        if (error) {
          return next(error);
        } else {
          const err = new Error("Wrong email or password");
          err.status = 401;
          return next(err);
        }
      } else {
        // Create a session if user is authenticated
        req.session.userID = user._id;
        return res.redirect('/');
      }
    });
  } else {
    const err = new Error('Email and password are required.');
    err.status = 401;
    next(err);
  }
});

//GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    })
  }
});

// Get Register route:
router.get('/register', mid.loggedOut, (req, res, next) => {
  res.render('register');
});

// Post Register route:
router.post('/register', function(req, res, next) {
  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {
    User.find({
      email: req.body.email
    }, function(err, docs) {
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
        const err = new Error("User already exists. Do you mean to login?");
        err.status = 409;
        next(err);
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
            recipeSavedResults.results.recipe.social_rank = Math.round(recipeSavedResults.results.recipe.social_rank);
            removeCharacterCode(recipeSavedResults.results.recipe.title);
            recipeSavedResults.results.recipe.title = newString;
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
                removeCharacterCode(recipe.title);
                recipe.title = newString;
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

// Get profile page
router.get('/profile', mid.requiresLogin, function(req, res, next) {

  let UserRecipesIDs = [];
  User.findById(res.locals.currentUser)
    .exec(function(err, user) {
      if (err) {
        return next(err);
      } else {
        if (!user.favRecipes) {
          user.favRecipes = [];
        }
        if (user.favRecipes.length > 0) {
          user.favRecipes.forEach((favedRecipes) => {
            UserRecipesIDs.push(favedRecipes.recipe);
          });
          let newArray = [];
          UserRecipesIDs.forEach((arrayElement) => {
            recipeResults.find({
              recipeID: arrayElement
            }, function(err, recResults) {
              if (err) {
                next(err);
              } else {
                newArray.push(recResults[0].results.recipe);
              }
              if (newArray.length === UserRecipesIDs.length) {

                newArray.forEach((recipe) => {
                  recipe.favOption = true;
                  recipe.isFavorited = true;
                });
                return res.render('profile', {
                  name: user.name,
                  recipes: newArray
                });
              }
            });
          });
        } else {
          return res.render('profile', {
            name: user.name,
          });
        }
      }
    });
});

// Post favorite recipes
router.post('/favrecipe', mid.requiresLogin, function(req, res, next) {
  let {
    recipe
  } = req.query;

  User.find({
    _id: res.locals.currentUser
  }, function(err, docs) {

    if (err) {
      return next(err);
    }

    const result = docs[0].favRecipes.find(obj => {
      return obj.recipe === recipe;
    });

    // If the recipe does not exist in this user's data:
    if (!result) {
      User.update({
        _id: res.locals.currentUser
      }, {
        $push: {
          favRecipes: {
            recipe
          }
        }
      }, function(err) {
        if (err) {
          return next(err);
        }
        res.sendStatus(200);
      });
    } else {
      // If the recipe DOES exist in the user's data, remove it.
      User.update({
        _id: res.locals.currentUser
      }, {
        $pull: {
          favRecipes: {
            recipe
          }
        }
      }, function(err) {
        if (err) {
          return next(err);
        }
        res.sendStatus(200);

      });
    }

  });

  // Check if query string searching for recipe.
  if (recipe != undefined) {
    recipe = recipe.toLowerCase(recipe);
    recipeResults.find({
      recipeID: recipe
    }, function(err, docs) {
      if (docs.length === 0) {
        url = `http://food2fork.com/api/get?key=${food2forkApiKey}&rId=${recipe}`;
        fetchData(url)
          .then((data) => {
            const recipeSavedResults = {
              recipeID: recipe,
              results: data
            };
            recipeSavedResults.results.recipe.social_rank = Math.round(recipeSavedResults.results.recipe.social_rank);
            removeCharacterCode(recipeSavedResults.results.recipe.title);
            recipeSavedResults.results.recipe.title = newString;
            recipeResults.create(recipeSavedResults);

            let ingredientToCheck = recipeSavedResults.results.recipe.title;
            ingredientToCheck = ingredientToCheck.toLowerCase(ingredientToCheck);

            searchResults.find({
              ingredientName: ingredientToCheck
            }, function(err, docs) {
              if (err) {
                return next(err)
              } else {
                if (docs.length === 0) {
                  let recipes = [];
                  const url = `http://food2fork.com/api/search?key=${food2forkApiKey}&q=${ingredientToCheck}`;
                  fetchData(url)
                    .then((data) => {
                      recipes = data;
                      recipes.recipes.forEach((recipe) => {
                        removeCharacterCode(recipe.title);
                        recipe.title = newString;
                        recipe.social_rank = Math.round(recipe.social_rank);
                      });
                      const savedResults = {
                        ingredientName: ingredientToCheck,
                        results: recipes
                      };
                      searchResults.create(savedResults);
                    })
                }
              }
            });
          })
          .catch((err) => {
            const error = new Error("Something went wrong on our end.");
            error.status = 500;
            console.error(`\nERROR OCCURED: ${err}`)
            next(error);
          });
      }
    }); //End recipeResults.find()
  } //End if(recipe != undefined)
}); //End router.post(/favrecipe)

module.exports = router;
