var paddles = {
  run : function() {
    paddles.initPaddles();
  },
  initPaddles: function() {
    $('canvas#paddles').PADDLES();
  }
}

$(document).ready(paddles.run);