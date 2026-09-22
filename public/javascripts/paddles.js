var paddles = {
  run : function() {
    paddles.initPaddles();
  },
  initPaddles: function() {
    $('canvas#paddles').PADDLES({font: 'brandishregular'});
  }
}

$(document).ready(paddles.run);