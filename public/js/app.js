// THIS IS THE FRONT END APP.JS FILE.
$(function() {
  $('body').on('click', '.get-recipe-button', function() {
    $(".modal-title").html('<h2>Loading...</h2>');
    $(".modal-body").html('...');
    let recipeid = $(this).attr('id');
    $.get(`/?recipe=${recipeid}`, function(data) {
      let ingredients = data.recipe.ingredients;
      $(".modal-title").html(`<h2>${data.recipe.title}</h2>`);
      let combinedHTML = "<ol>";
      $.each(ingredients, function(index, value) {
        combinedHTML += `<li>${value}</li>`;
      });
      combinedHTML += "</ol>";
      $(".modal-body").html(combinedHTML);
    });
  });

  $('body').on('click', '.close-modal-button', function() {
    $(".modal-title").html("");
    $(".modal-body").html("");
  });

  $('body').on('click', '.favorite-recipe-button', function() {
    let buttonElement = $(this);
    let recipeid = $(this).attr('id');

    function unFavouriteRecipe(buttonElement) {
      $(buttonElement).removeClass('recipeButtonFavorited');
      $(buttonElement).removeClass('btn-warning');
      $(buttonElement).addClass('btn-light');
    }

    function favoriteRecipe(buttonElement) {
      $(buttonElement).removeClass('recipeButtonFavorited');
      $(buttonElement).addClass('recipeButtonFavorited');
      $(buttonElement).removeClass('btn-light');
      $(buttonElement).addClass('btn-warning');
    }

    if ($(this).hasClass('recipeButtonFavorited')) {
      $.post(`/favrecipe/?recipe=${recipeid}`, function() {
        unFavouriteRecipe(buttonElement);
      });
    } else {
      $.post(`/favrecipe/?recipe=${recipeid}`, function() {
        favoriteRecipe(buttonElement);
      });
    }
  });

});
// End .ready();
