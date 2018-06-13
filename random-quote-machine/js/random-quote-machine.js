/* jshint esversion: 6 */

function hideData() {
  $('#quote-actions').hide();
  $('#spinner').show();
  $('#quote-text').hide();
}

function showData() {
  $('#spinner').hide();
  $('#quote-text').show();
  $('#quote-actions').show();
}

function quoteHandler(data) {
  const quoteText = data.quoteText.trim(),
        quoteAuthor = '~' + (data.quoteAuthor.trim() || 'Anonymous'),
        quoteMachineUrl = 'http://s.codepen.io/TylerMoeller/debug/WQGjvO',
        tweetText = encodeURIComponent(quoteText + ' ' + quoteAuthor + ' ' + quoteMachineUrl),
        tweetUrl = 'https://\ttwitter.com/intent/tweet?text=' + tweetText, // '\t' bypasses adblock
        wikiUrl = 'https://en.wikipedia.org/wiki/' + data.quoteAuthor.trim().replace(/\s/g, '_');

  // Only accept quotes that can be tweeted in 140 chars or less.
  // Tweet length is 163. 140 character text limit + 23-character twitter-shortened URL = 163.
  if (tweetText.length > 163) {
    getQuote();
    return;
  }

  // Populate the HTML. setTimeout throttles requests to one quote per second
  setTimeout(() => {
    $('#quote').text(quoteText);
    $('#author').text(quoteAuthor);
    $('#tweetLink').attr('href', tweetUrl);
    $('#wikiLink').attr('href', wikiUrl);
    $('.tooltipped').tooltip({ delay: 50 }).click(() => $('.tooltipped').blur());
    showData();
  }, 1000);
}

function error(err) {
  $('#author').html('~ Random Quote Machine');

  if (err === 'https') {
    $('#quote').html('The Forismatic Quotes API does not support HTTPS. ' +
                     'Please open this page over HTTP instead.');
  } else {
    $('#quote').html('Error: ' + err.status + ' (' + err.statusText + '). ' +
                     'Please try again later.');
  }

  showData();
}

// Get a quote from the Forismatic API
function getQuote() {
  hideData();

  if (window.location.protocol !== 'http:') {
    error('https');
    return;
  }

  $.getJSON('http://api.forismatic.com/api/1.0/?method=getQuote&format=jsonp&lang=en&jsonp=?')
    .done(quoteHandler)
    .fail(error);

  $('.new-quote-btn').blur();
}

$(document).ready(getQuote);
