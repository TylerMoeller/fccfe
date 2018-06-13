var startSeconds,
    sessionCount = 0,
    counter,
    defaultTaskTime = 25,
    defaultBreakTime = 5;

$(document).ready(function () {
  $('#taskTime').html(defaultTaskTime);
  $('#breakTime').html(defaultBreakTime);
  $('#resetClockButton').trigger('click');
  $('[data-toggle="tooltip"]').tooltip();

  // Disable notifications where not supported: mobile and IE
  if (typeof window.orientation !== 'undefined' ||
      navigator.userAgent.match(/mobile/gi) ||
      navigator.userAgent.match(/trident/gi) ||
      navigator.userAgent.match(/edge/gi)) {
    $('#notificationsLabel').css('display', 'none');
  }
});

// Manages the play/pause button and starting + stopping the timer.
$('#playPauseButton').click(function () {
  if ($('#playPauseButton').attr('class') === 'fa fa-pause fa-stack-1x') {
    $('#playPauseButton').attr('class', 'fa fa-play fa-stack-1x');
    clearInterval(counter);
  } else {
    $('#playPauseButton').attr('class', 'fa fa-pause fa-stack-1x');
    startSeconds = startSeconds || $('#taskTime').html() * 60;

    if ($('#testMode').is(':checked')) {
      counter = setInterval(countDown, 100);
    } else {
      counter = setInterval(countDown, 1000);
    }
  }
});

// uses stringToSeconds() and showTime() to subtract a second and update the time display.
// Switches to break timer / task time when the clock reaches 0:00.
function countDown() {
  var time = $('#clockTime').text();

  // subtract a second from the time and update the clock
  if (stringToSeconds(time) > 0) {
    var seconds = stringToSeconds(time) - 1;
    showTime(seconds, 'clockTime');
  }

  // Clock reaches 0:00
  if (time === '0') {
    sessionCount++;
    if (sessionCount % 2 === 1) {
      // Break Time
      if ($('#notify').is(':checked')) {
        notify('Task Timer complete!');
      }

      startTimer('break');

    } else {
      // Task Time
      if ($('#notify').is(':checked') && $('#breakTime').html() > 0) {
        notify('Break Timer complete. Start your next task! Sessions completed: ' +
        (sessionCount / 2));
      }

      $('#sessionCount').html('<span style="color:red">&#x1f345</span> ' + (sessionCount / 2));
      startTimer('task');
    }

    function startTimer(session) {
      clearInterval(counter);
      startSeconds = $('#' + session + 'Time').html() * 60;
      showTime(startSeconds, 'clockTime');

      if ($('#testMode').is(':checked') && ($('#perpetual').is(':checked'))) {
        counter = setInterval(countDown, 100);
      } else if ($('#perpetual').is(':checked')) {
        counter = setInterval(countDown, 1000);
      } else {
        $('#playPauseButton').trigger('click');
      }
    }

  }
}

//Takes a time-formatted string and converts it to seconds.
function stringToSeconds(time) {
  var timeArr = time.split(':'),
      hours,
      minutes,
      seconds;

  if (time.indexOf(':') > -1) {
    if (timeArr.length > 2) {
      hours = Number(timeArr[0]),
      minutes = Number(timeArr[1]),
      seconds = Number(timeArr[2]) + (minutes * 60) + (hours * 3600);
      return seconds;
    } else {
      minutes = Number(timeArr[0]),
      seconds = Number(timeArr[1]) + (minutes * 60);
      return seconds;
    }
  } else {
    seconds = time;
    return seconds;
  }
}

//converts seconds from stringToSeconds() back to a time-formatted string.
function showTime(seconds, id) {
  var displayHours = Math.floor(seconds / 3600),
      displayMinutes = Math.floor((seconds - (displayHours * 3600)) / 60),
      displaySeconds = seconds - (displayHours * 3600) - (displayMinutes * 60),
      time = displayHours + ':' + displayMinutes + ':' + displaySeconds;

  if (id == 'clockTime') {
    //main clock shows H:MM:SS, MM:SS, M:SS, SS, or S
    if (displaySeconds < 10 && displayMinutes > 0) {
      displaySeconds = '0' + displaySeconds;
    }

    if (displayMinutes < 10 && displayHours > 0) {
      displayMinutes = '0' + displayMinutes;
    }

    time = displayHours + ':' + displayMinutes + ':' + displaySeconds;

    if (displayHours === 0) {
      time = displayMinutes + ':' + displaySeconds;
    }

    if (displayHours === 0 && displayMinutes === 0) {
      time = displaySeconds;
    }

    // update the progress bar after updating the clock if the timer is running
    if (startSeconds) {
      var progress = (100 - ((seconds / startSeconds) * 100)).toFixed(0);
      $('#progressBar').css('width', progress + '%');
      $('#showProgress').css('visibility', 'visible');
      if (sessionCount % 2 === 1) {
        $('#progressBar').html('&nbsp;Break&nbsp;Time:&nbsp;&nbsp;' + progress + '%&nbsp;complete');
      } else {
        $('#progressBar').html('&nbsp;Task&nbsp;Time:&nbsp;&nbsp;' + progress + '%&nbsp;complete');
      }
    }
  } else {
    //task and break times shown as H:MM, MM, or M.
    if (displayHours === 0) {
      time = displayMinutes;
    } else if (displayHours > 0 && displayMinutes < 10) {
      time = displayHours + ':' + '0' + displayMinutes;
    } else {
      time = displayHours + ':' + displayMinutes;
    }
  }

  $('#' + id).html(time);
}

// Ask permission for desktop notifications when the setting is enabled
// If permission is denied, alert the user and hide the setting.
$('#notify').change(function () {
  if ($('#notify').is(':checked')) {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission(function () {
        if (Notification.permission !== 'granted') {
          alert('Desktop notifications are disabled or not supported in your browser.');
          $('#notificationsLabel').css('display', 'none');
        }
      });
    }
  }
});

// Desktop notification message
function notify(message) {
  var notification = new Notification('Pomodoro Timer', {
    icon: 'https://farm2.staticflickr.com/1463/25084523152_7b93879cce_o.jpg',
    body: message,
  });
}

$('#taskTimeUpButton').click(function () {
  var seconds = stringToSeconds($('#taskTime').html()) * 60;
  if (seconds < (7200)) {
    var id = 'taskTime';
    seconds = seconds + 60;
    showTime(seconds, id);
    updateClock(seconds);
  }
});

$('#taskTimeDownButton').click(function () {
  var seconds = stringToSeconds($('#taskTime').html()) * 60;
  if (seconds > (60)) {
    var id = 'taskTime';
    seconds = seconds - 60;
    showTime(seconds, id);
    updateClock(seconds);
  }
});

$('#taskTimeResetButton').click(function () {
  $('#taskTime').html(defaultTaskTime);
  var seconds = stringToSeconds($('#taskTime').html()) * 60;
  var id = 'taskTime';
  showTime(seconds, id);
  updateClock(seconds);
});

//Update the clock with the current Task Time value
function updateClock(seconds) {
  if (!startSeconds) {
    var id = 'clockTime';
    showTime(seconds, id);
  }
}

//adjust break times
$('#breakTimeUpButton').click(function () {
  var time = $('#breakTime').html();
  var seconds = stringToSeconds(time) * 60;
  if (seconds < (7200)) {
    var id = 'breakTime';
    seconds = seconds + 60;
    showTime(seconds, id);
  }
});

$('#breakTimeDownButton').click(function () {
  var time = $('#breakTime').html();
  var seconds = stringToSeconds(time) * 60;
  if (seconds > (0)) {
    var id = 'breakTime';
    seconds = seconds - 60;
    showTime(seconds, id);
  }
});

$('#breakTimeResetButton').click(function () {
  $('#breakTime').html(defaultBreakTime);
});

//Reset the timer back to the current Task Time setting. Stop the clock if running.
$('#resetClockButton').click(function () {
  clearInterval(counter);
  var seconds = stringToSeconds($('#taskTime').html()) * 60;
  startSeconds = null;
  var id = 'clockTime';
  showTime(seconds, id);
  sessionCount = 0;
  $('#playPauseButton').attr('class', 'fa fa-play fa-stack-1x');
  $('#showProgress').css('visibility', 'hidden');
  $('#sessionCount').html('<span style="color:red">&#x1f345</span> 0');
});
