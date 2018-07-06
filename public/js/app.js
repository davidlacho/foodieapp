// THIS IS THE FRONT END APP.JS FILE.
$(function() {

  $('body').on('click', '.get-recipe-button', function() {
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
    $(".modal-title").html("Loading...");
    $(".modal-body").html("...");
  })
});
// End .ready();