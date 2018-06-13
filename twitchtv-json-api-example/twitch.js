function getTwitchData() {
  const offlineLogo = 'https://tylermoeller.github.io/twitchtv-json-api-example/dead_glitch.png',
        users = [
                  'ESL_SC2',
                  'OgamingSC2',
                  'cretetion',
                  'freecodecamp',
                  'storbeck',
                  'habathcx',
                  'RobotCaleb',
                  'noobs2ninjas',
                  'comster404',
                  'brunofin'
                ];

  // Get information for each account. twitchChannel url tells us if the account is closed,
  // twitchStreams gives detailed information for online/offline accounts.
  users.map(user => {
    const twitchChannel = 'https://api.twitch.tv/kraken/channels/' + user + callback.replace(/g/g, '6'),
          twitchStreams = 'https://api.twitch.tv/kraken/streams/' + user + callback.replace(/g/g, '6');

    $.getJSON(twitchChannel).done(channel => {
      if (channel.status === 404) {  // process closed / non-existent accounts
        printData('#', 'closed', offlineLogo, user, channel.message, 'event_busy');
        return;
      }

      $.getJSON(twitchStreams).done(stream => {
        if (!stream.stream) { // process offline accounts
          printData(channel.url, 'offline', channel.logo, channel.display_name, 'offline', 'event');
          return;
        }
        // process online accounts
        printData(channel.url, 'online', channel.logo, channel.display_name, channel.status, 'event_available');
      });
    });
  });
}

function printData(userUrl, userStatus, userLogo, displayName, currentlyStreaming, userIcon) {

  // create the info card for each user. displayName is converted to lower case
  // in IDs so it can be searched later via (case-sensitive) CSS wildcard selectors
  $('#' + userStatus).append(
    '<div id="' + displayName.toLowerCase() + '" class="users">' +
      '<div class="card-panel hoverable ' + userStatus + '">' +
        '<div class="row content-row">' +
          '<div class="col s12 m3 center">' +
            '<img class="responsive-img circle logo" src="' + userLogo + '">' +
          '</div>' +
          '<div class="col s12 m9 details-col">' +
            '<div class="row info-row">' +
              '<span>' +
                '<i class="material-icons">person</i>&nbsp;&nbsp;' +
                '<span style="font-weight: bold">' + displayName + '</span>' +
             '</span>' +
            '</div>' +
            '<div class="row info-row">' +
              '<span>' +
                '<i class="material-icons right-align">' + userIcon + '</i>&nbsp;&nbsp;' +
                currentlyStreaming +
              '</span>' +
            '</div>' +
            '<div class="row info-row channel-link">' +
              '<span>' +
                '<i class="material-icons">visibility</i>&nbsp;&nbsp;' +
                '<a href="' + userUrl + '" target="_blank">' +
                  'Visit ' + displayName + ' on Twitch.tv' +
                '</a>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );

  // remove the URL and cirular logo formatting for closed/non-existent accounts
  if (userStatus === 'closed') {
    $('#' + displayName.toLowerCase() + ' .logo').removeClass('circle');
    $('#' + displayName.toLowerCase() + ' .channel-link').remove();
  }
}

// All | Online | Offline Filtering and Search
$('#filter-offline').click(e => {
  $('#online').hide();
  $('#closed').hide();
  $('#offline').show();
});

$('#filter-online').click(e => {
  $('#online').show();
  $('#closed').hide();
  $('#offline').hide();
});

$('#filter-all').click(e => {
  $('#online').show();
  $('#closed').show();
  $('#offline').show();
});

$('#search-input').click(e => {
  $(e.currentTarget).val('');
  $('.users').show();
});

$('#search-input').on('change keyup paste', e => {
  const key = e.keyCode || e.which;
  if (key === 13) $(e.currentTarget).blur();  // hides mobile keyboard on enter/return

  $('.users').show();
  $('.users').not('[id*=' + $('#search-input').val().toLowerCase() + ']').hide();
  $('.users [id*=' + $('#search-input').val().toLowerCase() + ']').show();
});

$(document).ready(getTwitchData);

const callback = '?client_id=gk59fi2m275jgjiwug1memffjd97qul&callback=?';
