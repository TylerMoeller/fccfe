// Hide search controls and results. Reset page to default.
function resetPage() {
  $('.tooltipped').tooltip('remove');
  $('.tooltipped').tooltip('add');
  $('#spinner').hide();
  $('#search-row').hide();
  $('#search-results').hide();
  $('.top-link').hide();
  $('#main').removeClass('main-results-view').addClass('main-default-view');
  $('#search-icon').show();
  $('#search-field').val('');
}

// Display search controls
function displaySearchControls() {
  $('#search-icon').hide();
  $('#search-row').show();
  $('#search-field').focus();
}

// Error text
function notFound(searchTerm) {
  $('#spinner').hide();
  $('#search-results').show().html(`${'<p style="text-align:center;margin: 2em 1em 0 1em">' +
     'There were no results matching the query. The page ' +
     '"<strong><i>'}${searchTerm}</i></strong>" does not exist. You can ` +
     `<a href="https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation" target="blank">` +
       `ask for it to be created` +
     `</a>, ` +
     `or <a href="#" onclick="resetPage();displaySearchControls();">try a different search</a>.` +
   `</p>` );
}

function displaySearchResults(json) {
  const logo = 'https://tylermoeller.github.io/fccfe/WikipediaSearchViewer/Wikipedia-logo-v2.svg.png';

  // json.query.search returns search results in the order expected
  // json.query.pages looks up information for the same articles, but returns in a different order
  // Use two loops to return page info for articles in the order returned by json.query.search
  json.query.search.forEach((searchResult) => {
    json.query.pages.forEach((article) => {
      if (article.title === searchResult.title) {
        !article.thumbnail ? thumbnail = logo : thumbnail = article.thumbnail.source;
        article.extract === '' ? extract = searchResult.snippet : extract = article.extract;
        $('#search-results').append(`${'<div class="col s12 m6 l4">' +
            '<div class="card large hoverable">' +
              '<div class="card-image">' +
                '<img src="'}${thumbnail}">` +
                `<span class="card-title">${article.title}</span>` +
              `</div>` +
              `<div class="card-content">` +
                `<p>${extract}</p>` +
              `</div>` +
              `<div class="card-action">` +
                `<a href="${article.fullurl}" target="_blank">` +
                  `Read more on Wikipedia` +
                `</a>` +
              `</div>` +
            `</div>` +
          `</div>` );
      }
    });
  });

  $('#spinner').hide();
  $('#search-results').show();
  $('.top-link').show();
}

// get data for the search term and display results
function search() {
  $('#search-field').blur(); // hides the keyboard on mobile

  const searchTerm = $('#search-field').val();

  $('#main').removeClass('main-default-view').addClass('main-results-view');
  $('.top-link').hide();
  $('#search-results').html('');
  $('#spinner').show();

  // This url does a standard search for the search term, and returns json.query.search
  // generator=search looks up each page in json.query.search and returns json.query.pages
  const apiUrl = `${'https://en.wikipedia.org/w/api.php?' +
               'action=query' +
               '&format=json' +
               '&prop=pageimages|extracts|info' +
               '&list=search' +
               '&generator=search' +
               '&redirects=1' +
               '&utf8=1' +
               '&formatversion=2' +
               '&pithumbsize=500' +
               '&pilimit=50' +
               '&exsentences=2' +
               '&exlimit=20' +
               '&exintro=true' +
               '&inprop=url' +
               '&srsearch='}${encodeURIComponent(searchTerm)
  }&srinfo=` +
               `&srlimit=18` +
               `&srenablerewrites=1` +
               `&gsrsearch=${encodeURIComponent(searchTerm)
               }&gsrlimit=18`;

  $.ajax({
    cache: true,
    dataType: 'jsonp',
    url: apiUrl,
  })
    .done((json) => {
      !json.query.pages ? notFound(searchTerm) : displaySearchResults(json);
    })
    .fail((err) => {
      alert(`There was an error reaching Wikipedia. ${JSON.stringify(err)}`);
      console.error('Error: ', err);
      resetPage();
    });
}

$(document).ready((e) => {
  resetPage();
  $('.hidden').removeClass('hidden');

  // Click actions for search controls and page reset
  $('#search-icon').click(displaySearchControls);
  $('.reset').click(resetPage);
  $('#search').click(search);
  $('#search-field').click((e) => { $(e.currentTarget).val(''); });

  // If the user hits Esc, reset the page back to the default
  $(document).keyup((e) => {
    const key = e.keyCode || e.which;
    if (key === 27) resetPage();
  });

  // If user presses Enter, search
  $('#search-field').keyup((e) => {
    const key = e.keyCode || e.which;
    if (key === 13) search();
  });
});
