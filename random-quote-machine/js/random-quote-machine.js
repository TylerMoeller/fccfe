function hideData() {
  $('#quote-actions, #quote-text').hide();
  $('#spinner').show();
}

function showData() {
  $('#quote-text, #quote-actions').show();
  $('#spinner').hide();
}

function quoteHandler(data) {
  const quoteText = data.quoteText.trim(),
    quoteAuthor = `~${  data.quoteAuthor.trim() || 'Anonymous'}`,
    quoteMachineUrl = 'https://tylermoeller.github.io/fccfe/random-quote-machine/',
    tweetText = encodeURIComponent(`${quoteText  } ${  quoteAuthor  } ${  quoteMachineUrl}`),
    tweetUrl = `https://\ttwitter.com/intent/tweet?text=${  tweetText}`, // '\t' bypasses adblock
    wikiUrl = `https://en.wikipedia.org/wiki/${  data.quoteAuthor.trim().replace(/\s/g, '_')}`;

  // 280 character text limit + 23-character twitter-shortened URL = 303.
  if (tweetText.length > 303) {
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
  $('#quote').html(`Error: ${  err.status  } (${  err.statusText  }). ` + `Please try again later.`);
  showData();
}

// Get a quote from the Forismatic API
function getQuote() {
  hideData();

  $.getJSON('https://api.forismatic.com/api/1.0/?method=getQuote&format=jsonp&lang=en&jsonp=?')
    .done(quoteHandler)
    .fail(error);

  $('.new-quote-btn').blur();
}

$(getQuote);
