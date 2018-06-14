// pre-defined list of users to retrieve, available to all functions
const users = [
  "ESL_SC2",
  "OgamingSC2",
  "freecodecamp",
  "syndicate",
  "summit1g",
  "riotgames",
  "esl_csgo",
  "goldglove",
  "nightblue3",
  "imaqtpie",
  "gosu",
  "lirik",
  "starladder1",
  "wolves_bjergsen",
  "dyrus",
  "captainsparklez",
  "LegendaryLea",
  "ninja",
];

function errorHandler(err) {
  console.error(err);
  $("#preloader").html(`<h4>${err.statusText}: ${err.status}. Please Try Again Later.</h4>`).css("color", "white");
}

// Generate the template HTML for each user's social media card
function generateUserCardTemplate(user) {
  $("#user-list").append(`<div class="${user}-card twitch-card hoverable hide">
       <div class="card">
         <div class="card-stacked">
           <div class="user-logo-div ${user}-background">
             <img class="user-logo ${user}-logo animated" src="">
           </div>
           <div class="card-content">
             <p class="user-name ${user}-name"></p>
             <p class="user-game ${user}-game"></p>
             <p class="user-status ${user}-status"></p>
           </div>
           <div class="card-action ${user}-card-action">
             <div class="row valign-wrapper">
               <div class="col s4">
                 Followers <span class="user-followers ${user}-followers"></span>
               </div>
               <div class="col s4">
                 Views <span class="user-views ${user}-views"></span>
               </div>
               <div class="col s4 no-border center-align">
                 <a class="waves-effect waves-light btn btn-flat btn-small white-text purple darken-4 channel-url ${user}-url"
                    target="_blank">
                   <i class="fa fa-external-link"></i>
                 </a>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>`);
}

// Final tasks to perform when displaying the final page. This function is called every time
// a user card is populated with data and then increments callbackCounter every time.
// When the value of callbackCounter is equal to the length of the user array, we know all
// data is ready for display.
let callbackCounter = 0;

function displayData() {
  callbackCounter++;
  $("#percent-complete").text(`${((callbackCounter / users.length) * 100).toFixed(0)}%`);

  // Hide the loading spinner and fade in the final user list
  if (callbackCounter === users.length) {
    registerEventHandlers();
    $("#preloader").hide();
    $(".hide").removeClass("hide").hide().fadeIn(2000);
  }
}

// Common data for offline/online users
// wait for images to load before displaying data
function addCommonData(user, channelData) {
  const profileImg = new Image();
  const bannerImg = new Image();

  profileImg.src = channelData.logo;
  bannerImg.src = channelData.profile_banner;

  $(profileImg, bannerImg).on("load", () => {
    $(`.${user}-background`).css("background-image", `url(${bannerImg.src})`);
    $(`.${user}-logo`).attr("src", profileImg.src);
    $(`.${user}-name`).text(channelData.display_name);
    $(`.${user}-followers`).text(channelData.followers.toLocaleString());
    $(`.${user}-views`).text(channelData.views.toLocaleString());
    $(`.${user}-url`).attr("href", channelData.url);
    displayData();
  });
}

// Non-existent user social media card info
function nonExistentUser(user) {
  const img = new Image();
  img.src = "img/dead_glitch.png";

  // Wait for the image load event before displaying any data
  $(img).on("load", () => {
    $(`.${user}-card, .${user}-logo`).addClass("notFound").attr("src", img.src);
    $(`.${user}-name`).text(user);
    $(`.${user}-game`).text("Account Not Found");
    $(`.${user}-status, .${user}-card-action`).hide();
    displayData();
  });
}

// Offline user social media card info
function offlineUser(user, channelData) {
  $(`.${user}-card, .${user}-logo`).addClass("offline");
  $(`.${user}-game`).text("Offline");
  $(`.${user}-status`).hide();
  addCommonData(user, channelData);
}

// Online user social media card info
function onlineUser(user, channelData) {
  $(`.${user}-card, .${user}-logo`).addClass("online");
  $(`.${user}-game`).text(channelData.game);
  $(`.${user}-status`).text(channelData.status);
  addCommonData(user, channelData);
}

function showAllUsers() {
  $(".online, .offline, .notFound").show();
}

function showOnlineUsers() {
  $(".online").show();
  $(".offline, .notFound").hide();
}

function showOfflineUsers() {
  $(".offline").show();
  $(".online, .notFound").hide();
}

// register hover for logo animations and clicks for the filter buttons
function registerEventHandlers() {
  $(".user-logo").on("mouseenter touchstart", e => $(e.target).animateCss("swing"));
  $("#all").on("click", showAllUsers);
  $("#online").on("click", showOnlineUsers);
  $("#offline").on("click", showOfflineUsers);
}

// Primary function to get user data
function getUsers() {
  users.forEach((user) => {
    generateUserCardTemplate(user);

    // Build the URLs for the API Calls
    const callback = "?client_id=6k59fi2m275j6jiwu61memffjd97qul";
    const channelsUrl = `https://api.twitch.tv/kraken/channels/${user}${callback}`;
    const streamsUrl = `https://api.twitch.tv/kraken/streams/${user}${callback}`;

    // Make the API calls and call the appropriate function for each user based on whether they are
    // non-existent, offline, or online
    $.getJSON(channelsUrl, (channelData) => {
      $.getJSON(streamsUrl, (streamData) => {
        if (channelData.error) {
          nonExistentUser(user);
        } else if (!streamData.stream) {
          offlineUser(user, channelData);
        } else {
          onlineUser(user, channelData);
        }
      }).fail(errorHandler);
    }).fail((err) => {
      if (err.status === 404) {
        nonExistentUser(user);
      } else {
        errorHandler(err);
      }
    });
  });
}

// From: https://github.com/daneden/animate.css#usage
// Adds the animate.css class and then removes when animation is complete
$.fn.extend({
  animateCss(animationName) {
    const animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
    this.addClass(`animated ${animationName}`).one(animationEnd, () => {
      $(this).removeClass(`animated ${animationName}`);
    });
  },
});

$(getUsers);
