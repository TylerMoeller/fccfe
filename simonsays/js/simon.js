$(document).ready(function () {
  $('.center-controls').addClass('disabled');
  $('.color-button').addClass('disabled');
  gameMode = 'normal';

  // Attempt to pre-load audio files and cache
  $('#greenSound').get(0).load();
  $('#redSound').get(0).load();
  $('#blueSound').get(0).load();
  $('#yellowSound').get(0).load();
});

// Default game settings
function resetGame() {
  turnCount = 0,
  computerMoves = [],
  humanMoves = [];
  $('.main').removeAttr('style'); // remove jQuery animation styles
  $('.score').text('--');
}

// Power Switch
$('.power-toggle-box').click(function (e) {
  resetGame();
  if ($('.power-toggle-box').hasClass('text-left')) {
    $('.power-toggle-box').removeClass('text-left');
    $('.power-toggle-box').addClass('text-right');
    $('.center-controls').removeClass('disabled');
  } else {
    $('.power-toggle-box').removeClass('text-right');
    $('.power-toggle-box').addClass('text-left');
    $('.center-controls').addClass('disabled');
    $('.color-button').addClass('disabled');
    $('#strict').css('background-color', 'yellow');
  }
});

// Start Button: Reset the game and play an opening animation sequence
$('#start').click(function (e) {
  resetGame();
  var delay = 250,
      colors = ['green', 'red', 'blue', 'yellow', 'green', 'yellow',
                'red', 'blue', 'green', 'red', 'green', 'yellow',
              'blue', 'yellow', 'green', 'blue', 'red', 'yellow',
               ];

  $('.color-button').removeClass('disabled');
  playAnimation(colors, delay);
  $('.score').delay((colors.length * (delay + 100)))
    .fadeOut(delay).fadeIn(delay).fadeOut(delay).fadeIn(delay)
    .promise()
    .done(function () {
    $('.score').text('0');
    computerMove();
  });
});

// Strict Button - end game on first error or repeat required sequence
$('#strict').click(function (e) {
  if ($(this).css('background-color') === 'rgb(255, 255, 0)') {
    $(this).css('background-color', 'red');
    gameMode = 'strict';
  } else {
    $(this).css('background-color', 'yellow');
    gameMode = 'normal';
  }
});

$('.color-button').on('mousedown touchstart', function (e) {
  if (humanMoves.length >= turnCount) {
    return; // prevent accidental double-click
  } else {
    $(this).addClass('active');
    $('#' + this.id + 'Sound').get(0).play();
  }
});

// Every time the human clicks, the color clicked is added to an array
// and compared to the array of colors used by the computer
$('.color-button').on('mouseup touchend', function (e) {
  if (humanMoves.length >= turnCount) {
    return;
  }

  $(this).removeClass('active');
  humanMoves.push(this.id);
  if (computerMoves[clickCount] !== humanMoves[clickCount]) {
    clickCount = 0;
    if (gameMode === 'strict') {
      $('.score').text(':(');
      return;
    } else {
      $('.score').text('!!')
        .fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200)
        .promise()
      .done(function () {
        $('.score').text(((turnCount > 9) ? turnCount : '0' + turnCount));
        humanMoves = [];
        setTimeout(playAnimation(computerMoves, timeDelay), 1000);
      });

      return;
    }
  }

  clickCount++;
  if (humanMoves.length === turnCount) {
    setTimeout(computerMove, 1000); // 1 second delay before computer plays
  }
});

// Highlight colors played by the computer
function computerClick(color, delay) {
  $('.color-button').addClass('disabled');
  $('#' + color + 'Sound').get(0).play();
  return $('#' + color).addClass('active')
    .delay(delay, '_fx')
    .dequeue('_fx')
    .promise('_fx')
    .done(function () {
    $('#' + color).removeClass('active');
    $('.color-button').removeClass('disabled');
  });
}

// Takes an array of colors and a delay time to dynamically build
// a jQuery .queue, calling computerClick() to animate one element at a time.
function playAnimation(colors, delay) {
  $({}).queue('_fx', $.map(colors, function (color) {
    return function (next) {
      computerClick(color, delay).then(function () {
        return $({}).delay(100, '_fx').dequeue('_fx').promise('_fx');
      }).then(next);
    };
  })).dequeue('_fx');
}

// Computer move: Checks for win, increases speed every five turns
// and shows the human what moves they will need to repeat.
function computerMove() {
  // Check for Win
  if (turnCount === 20) {
    $('.score').text(':)');
    $('.main').show('slow').rotate(1080);
    return;
  }

  // Increase game speed by 250ms per move every 5 turns
  if (turnCount < 20 && turnCount % 5 === 0) {
    timeDelay = 1000 - (250 * turnCount / 5);
  }

  // Pick a random new color for this turn and reset the human moves from last turn
  var colors = ['green', 'red', 'blue', 'yellow'];
  var randomColor = colors[Math.floor(Math.random() * colors.length)];
  humanMoves = [];
  clickCount = 0;

  // Play the colors and update the turnCount / score
  computerMoves.push(randomColor);
  playAnimation(computerMoves, timeDelay);
  turnCount++;
  $('.score').text(((turnCount > 9) ? turnCount : '0' + turnCount));
}

// Rotation animation used for the game board
$.fn.rotate = function (degrees, step, current) {
  $self = $(this);
  current = current || 0,
    step = step || 5,
    current += step;
  $self.css({
    '-webkit-transform': 'rotate(' + current + 'deg)',
    '-moz-transform': 'rotate(' + current + 'deg)',
    '-ms-transform': 'rotate(' + current + 'deg)',
    transform: 'rotate(' + current + 'deg)',
  });
  if (current != degrees) {
    setTimeout(function () {
      $self.rotate(degrees, step, current);
    }, 5);
  }
};
