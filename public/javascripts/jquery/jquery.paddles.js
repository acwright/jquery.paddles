(function($) {

  $.fn.PADDLES = function(options) {
  
    var defaults = {
      'paddle_length' : 60,
      'paddle_speed' : 6,
      'ball_diameter' : 10,
      'ball_speed' : 4,
      'paddle_color' : '#FFFFFF',
      'ball_color' : '#FFFFFF',
      'text_color' : '#FFFFFF',
      'net_color' : '#666666',
      'alpha' : 1.0,
      'winning_score' : 11,
      'fps' : 60,
      'font' : null
    };

    var options = $.extend({}, defaults, options);
  
    function PADDLES(canvas, options) {
      
      var PADDLES = this;
      
      PADDLES.options = options;
      
      PADDLES.TITLE_SCREEN = 0;
      PADDLES.INSTRUCTIONS_SCREEN = 1;
      PADDLES.GAME_SCREEN = 2;
      PADDLES.END_SCREEN = 3;
      PADDLES.END_SCREEN_DELAY = 3;
      PADDLES.DEFAULT_BALL_VELOCITY = PADDLES.options.ball_speed;
      PADDLES.DEFAULT_PADDLE_VELOCITY = PADDLES.options.paddle_speed;
      PADDLES.VELOCITY_INCREMENT = 0.05;
      PADDLES.PADDLE_WIDTH = 20;
      PADDLES.END_SCREEN_DELAY = 3;
      
      PADDLES.game_loop = null;
      PADDLES.score_timout = null;
      PADDLES.check_for_collisions = true;
      PADDLES.fps_desired = PADDLES.options.fps;
      PADDLES.fps_actual = 0;
      PADDLES.debug = false;
      PADDLES.state = PADDLES.TITLE_SCREEN;
      PADDLES.server = 1;
      
      PADDLES.canvas = {
        'context' : $(canvas)[0].getContext('2d'),
        'origin' : {
          'x' : $(canvas).offset().left,
          'y' : $(canvas).offset().top
        },
        'size' : {
          'width' : $(canvas).innerWidth(),
          'height' : $(canvas).innerHeight()
        }
      };
      
      PADDLES.title_screen_hit_areas = {
        'play' : null,
        'instructions' : null
      };
      
      PADDLES.instructions_screen_hit_areas = {
        'back' : null,
      };
      
      PADDLES.score = {
        'human' : 0,
        'computer' : 0,
      };
      
      PADDLES.ball = {
        'origin' : {
          'x' : 1,
          'y' : 1,
        },
        'size' : {
          'width' : PADDLES.options.ball_diameter,
          'height' : PADDLES.options.ball_diameter
        },
        'dir_x' : 1,
        'dir_y' : 1,
        'vel_x' : PADDLES.DEFAULT_BALL_VELOCITY,
        'vel_y' : PADDLES.DEFAULT_BALL_VELOCITY
      };
      
      PADDLES.paddles = {
        'human' : {
          'origin' : {
            'x' : PADDLES.canvas.size.width - PADDLES.PADDLE_WIDTH * 2,
            'y' : PADDLES.canvas.size.height / 2 - PADDLES.options.paddle_length / 2,
          },
          'size' : {
            'width' : PADDLES.PADDLE_WIDTH,
            'height' : PADDLES.options.paddle_length
          },
          'dir_x' : 1,
          'dir_y' : 1,
          'vel_x' : 0,
          'vel_y' : 0
        },
        'computer' : {
          'origin' : {
            'x' : 20,
            'y' : PADDLES.canvas.size.height / 2 - PADDLES.options.paddle_length / 2,
          },
          'size' : {
            'width' : 20,
            'height' : PADDLES.options.paddle_length
          },
          'dir_x' : 1,
          'dir_y' : 1,
          'vel_x' : 0,
          'vel_y' : 0
        }
      };
    
      this.init = function() {
        
        PADDLES.initCanvas();
        PADDLES.changeState(PADDLES.TITLE_SCREEN);
      
      };
      
      this.initCanvas = function() {
          
        $(canvas)[0].width = PADDLES.canvas.size.width;
        $(canvas)[0].height = PADDLES.canvas.size.height;
        
        PADDLES.clearCanvas();
      
      };
      
      this.clearCanvas = function() {
      
        PADDLES.canvas.context.clearRect(0, 0, PADDLES.canvas.size.width, PADDLES.canvas.size.height);
        PADDLES.canvas.context.globalAlpha = PADDLES.options.alpha;
        
      };
      
      this.initGame = function() {
        
        PADDLES.score = {
          'human' : 0,
          'computer' : 0
        };
        PADDLES.ball.origin = {
          'x' : PADDLES.canvas.size.width / 2,
          'y' : PADDLES.canvas.size.height / 2
        };
        PADDLES.ball.vel_x = PADDLES.DEFAULT_BALL_VELOCITY;
        PADDLES.ball.vel_y = PADDLES.DEFAULT_BALL_VELOCITY;
        
      };
      
      this.runGame = function(frame_rate) {
        
        var start = new Date().getTime();
        var elapsed = 0;
         
        if(PADDLES.game_loop) {
          window.clearTimeout(PADDLES.game_loop);
        }
        
        var game_loop = function() {
          
          elapsed += 1000 / PADDLES.fps_desired;
          var diff = (new Date().getTime() - start) - elapsed;
          PADDLES.fps_actual = 1000 / (Math.floor(1000 / PADDLES.fps_desired) - diff); // Is this right???
          
          if(PADDLES.score.human == PADDLES.options.winning_score || PADDLES.score.computer == PADDLES.options.winning_score) {
            window.clearTimeout(PADDLES.game_loop);
            PADDLES.changeState(PADDLES.END_SCREEN);
          } else {
            PADDLES.updatePaddles();
            PADDLES.updateBall();
            PADDLES.drawGameScreen();
            PADDLES.game_loop = window.setTimeout(game_loop, Math.floor(1000 / PADDLES.fps_desired) - diff);
          }
        };
        PADDLES.game_loop = window.setTimeout(game_loop, Math.floor(1000 / PADDLES.fps_desired));
        
      };
      
      this.changeState = function(state) {
        
        switch(state) {
          
          case PADDLES.GAME_SCREEN :
            PADDLES.initGame();
            PADDLES.game_loop = PADDLES.runGame(PADDLES.frame_rate);
            $(document)
              .unbind()
              .keydown(function(event) {
                switch(event.keyCode) {
                  case 80 : // P
                    if(PADDLES.game_loop){
                      window.clearTimeout(PADDLES.game_loop);
                      PADDLES.game_loop = null;
                    } else {
                      PADDLES.game_loop = PADDLES.game_loop = PADDLES.runGame(PADDLES.frame_rate);
                    }
                    break;
                  case 27 : // Escape
                  case 81 : // Q
                    window.clearTimeout(PADDLES.game_loop);
                    PADDLES.game_loop = null;
                    PADDLES.changeState(PADDLES.TITLE_SCREEN);
                    break;
                  case 37 : // Left
                  case 40 : // Down
                    PADDLES.paddles.human.vel_y = PADDLES.DEFAULT_PADDLE_VELOCITY;
                    PADDLES.paddles.human.dir_y = 1;
                    break;
                  case 39 : // Right
                  case 38 : // Up
                    PADDLES.paddles.human.vel_y = PADDLES.DEFAULT_PADDLE_VELOCITY;
                    PADDLES.paddles.human.dir_y = -1;
                    break;
                  case 68 : // D
                    PADDLES.debug = !PADDLES.debug;
                    break;
                  default :
                    break;
                }
              })
              .keyup(function(event) {
                switch(event.keyCode) {
                  case 37 : // Left
                  case 40 : // Down
                    PADDLES.paddles.human.vel_y = 0;
                    break;
                  case 39 : // Right
                  case 38 : // Up
                    PADDLES.paddles.human.vel_y = 0;
                    break;
                  default :
                    break;
                }
              })
              .mousemove(function(event) {
                var mouse = {
                  'x' : event.pageX - PADDLES.canvas.origin.x,
                  'y' : event.pageY - PADDLES.canvas.origin.y
                };
                if(mouse.y > (PADDLES.paddles.human.size.height / 2) && mouse.y < PADDLES.canvas.size.height - (PADDLES.paddles.human.size.height / 2)) {
                  PADDLES.paddles.human.origin.y = mouse.y - (PADDLES.paddles.human.size.height / 2);
                }
              })
              .click(function(event) {
                var click = {
                  'x' : event.pageX,
                  'y' : event.pageY
                };
                if(!PADDLES.isMouseOver(click, PADDLES.canvas)) {
                  if(PADDLES.game_loop){
                    window.clearTimeout(PADDLES.game_loop);
                    PADDLES.game_loop = null;
                  } else {
                    PADDLES.game_loop = PADDLES.runGame(PADDLES.frame_rate);
                  }
                }
                return false;
              });
            break;
            
          case PADDLES.INSTRUCTIONS_SCREEN :
            PADDLES.drawInstructionsScreen();
            $(document)
              .unbind()
              .keydown(function(event) {
                switch(event.keyCode) {
                  case 66 : // B
                    PADDLES.changeState(PADDLES.TITLE_SCREEN);
                    break;
                  default :
                    break;
                }
              });
            $(canvas)
              .unbind()
              .click(function(event) {
                var click = {
                  'x' : event.pageX - PADDLES.canvas.origin.x,
                  'y' : event.pageY - PADDLES.canvas.origin.y
                };
                if(PADDLES.isMouseOver(click, PADDLES.instructions_screen_hit_areas.back)) {
                  PADDLES.changeState(PADDLES.TITLE_SCREEN);
                }
                return false;
              });
            break;
            
          case PADDLES.END_SCREEN :
            PADDLES.drawEndScreen();
            var end_timeout = setTimeout(function() {
              PADDLES.changeState(PADDLES.TITLE_SCREEN);
            }, PADDLES.END_SCREEN_DELAY * 1000);
            break;
            
          case PADDLES.TITLE_SCREEN :
          default :
            PADDLES.drawTitleScreen();
            $(document)
              .unbind()
              .keydown(function(event) {
                switch(event.keyCode) {
                  case 80 : // P
                    PADDLES.changeState(PADDLES.GAME_SCREEN);
                    break;
                  case 73 : // I
                    PADDLES.changeState(PADDLES.INSTRUCTIONS_SCREEN);
                    break;
                  default :
                    break;
                }
              });
            $(canvas)
              .unbind()
              .click(function(event) {
                var click = {
                  'x' : event.pageX - PADDLES.canvas.origin.x,
                  'y' : event.pageY - PADDLES.canvas.origin.y
                };
                if(PADDLES.isMouseOver(click, PADDLES.title_screen_hit_areas.play)) {
                  PADDLES.changeState(PADDLES.GAME_SCREEN);
                } else if(PADDLES.isMouseOver(click, PADDLES.title_screen_hit_areas.instructions)) {
                  PADDLES.changeState(PADDLES.INSTRUCTIONS_SCREEN);
                }
                return false;
              });
            break;
            
        }
        
      };
      
      this.isMouseOver = function(mouse, hit_area) {
        
        if(mouse.x >= hit_area.origin.x && 
          mouse.x <= hit_area.origin.x + hit_area.size.width &&
          mouse.y >= hit_area.origin.y &&
          mouse.y <= hit_area.origin.y + hit_area.size.height){
          return true;
        } else {
          return false;
        }
        
      };
      
      this.updateBall = function() {
        
        /* Calculate ball position on next tick */
        var next_origin = {
          'x' : Math.floor(PADDLES.ball.origin.x + PADDLES.ball.vel_x * PADDLES.ball.dir_x),
          'y' : Math.floor(PADDLES.ball.origin.y + PADDLES.ball.vel_y * PADDLES.ball.dir_y)
        };
        
        /* Calculate new ball position */
        PADDLES.ball.origin.x += Math.floor(PADDLES.ball.vel_x * PADDLES.ball.dir_x);
        PADDLES.ball.origin.y += Math.floor(PADDLES.ball.vel_y * PADDLES.ball.dir_y);
        
        if(PADDLES.check_for_collisions){
          
          /* Check for paddle collisions */
          if(next_origin.x <= PADDLES.paddles.computer.origin.x
            && next_origin.y + PADDLES.ball.size.height / 2 >= PADDLES.paddles.computer.origin.y
            && next_origin.y + PADDLES.ball.size.height / 2 <= PADDLES.paddles.computer.origin.y + PADDLES.paddles.computer.size.height) {
            PADDLES.ball.vel_x += PADDLES.paddles.computer.vel_x * PADDLES.paddles.computer.dir_y;
            PADDLES.ball.vel_y += PADDLES.paddles.computer.vel_y * -PADDLES.paddles.computer.dir_y;
            PADDLES.ball.dir_x = -PADDLES.ball.dir_x;
            PADDLES.ball.origin.x = PADDLES.paddles.computer.size.width + PADDLES.paddles.computer.origin.x;
          }
          if(next_origin.x >= PADDLES.paddles.human.origin.x - PADDLES.ball.size.width
            && next_origin.y + PADDLES.ball.size.height / 2 >= PADDLES.paddles.human.origin.y
            && next_origin.y + PADDLES.ball.size.height / 2 <= PADDLES.paddles.human.origin.y + PADDLES.paddles.human.size.height) {
            PADDLES.ball.vel_x += PADDLES.paddles.human.vel_x * PADDLES.paddles.human.dir_y;
            PADDLES.ball.vel_y += PADDLES.paddles.human.vel_y * -PADDLES.paddles.human.dir_y;
            PADDLES.ball.dir_x = -PADDLES.ball.dir_x;
            PADDLES.ball.origin.x = PADDLES.paddles.human.origin.x - PADDLES.ball.size.width;
          }
          
          /* Check for wall collisions */
          if(next_origin.x <= 0) {
            PADDLES.ball.origin.x = 1;
            PADDLES.ball.vel_x = 0;
            PADDLES.ball.vel_y = 0;
            PADDLES.check_for_collisions = false;
            if(PADDLES.score_timeout == null) {
              PADDLES.score_timeout = setTimeout(function() {
                PADDLES.server = -1;
                PADDLES.score.human++;
                PADDLES.ball.origin = {
                  'x' : PADDLES.canvas.size.width / 2,
                  'y' : PADDLES.canvas.size.height / 2
                };
                PADDLES.ball.dir_x = PADDLES.server;
                PADDLES.ball.vel_x = PADDLES.DEFAULT_BALL_VELOCITY;
                PADDLES.ball.vel_y = PADDLES.DEFAULT_BALL_VELOCITY;
                PADDLES.score_timeout = null;
                PADDLES.check_for_collisions = true;
              }, 1000);
            }
          }
          if(next_origin.x + PADDLES.ball.size.width >= PADDLES.canvas.size.width) {
            PADDLES.ball.origin.x = PADDLES.canvas.size.width - PADDLES.ball.size.width - 1;
            PADDLES.ball.vel_x = 0;
            PADDLES.ball.vel_y = 0;
            PADDLES.check_for_collisions = false;
            if(PADDLES.score_timeout == null) {
              PADDLES.score_timeout = setTimeout(function() {
                PADDLES.server = 1;
                PADDLES.score.computer++;
                PADDLES.ball.origin = {
                  'x' : PADDLES.canvas.size.width / 2,
                  'y' : PADDLES.canvas.size.height / 2
                };
                PADDLES.ball.dir_x = PADDLES.server;
                PADDLES.ball.vel_x = PADDLES.DEFAULT_BALL_VELOCITY;
                PADDLES.ball.vel_y = PADDLES.DEFAULT_BALL_VELOCITY;
                PADDLES.score_timeout = null;
                PADDLES.check_for_collisions = true;
              }, 1000);
            }
          }
          if(next_origin.y <= 0) {
            PADDLES.ball.dir_y = -PADDLES.ball.dir_y;
            PADDLES.ball.origin.y = 0;
            PADDLES.ball.vel_x += PADDLES.VELOCITY_INCREMENT;
            PADDLES.ball.vel_y += PADDLES.VELOCITY_INCREMENT;
          }
          if(next_origin.y + PADDLES.ball.size.height >= PADDLES.canvas.size.height) {
            PADDLES.ball.dir_y = -PADDLES.ball.dir_y;
            PADDLES.ball.origin.y = PADDLES.canvas.size.height - PADDLES.ball.size.height;
            PADDLES.ball.vel_x += PADDLES.VELOCITY_INCREMENT;
            PADDLES.ball.vel_y += PADDLES.VELOCITY_INCREMENT;
          }
        
        }
        
      };
      
      this.updatePaddles = function() {
        
        PADDLES.paddles.computer.vel_y = PADDLES.DEFAULT_PADDLE_VELOCITY;
        PADDLES.paddles.computer.dir_y = PADDLES.ball.dir_y;
        
        PADDLES.paddles.human.origin.y += Math.floor(PADDLES.paddles.human.vel_y * PADDLES.paddles.human.dir_y);
        PADDLES.paddles.computer.origin.y += Math.floor(PADDLES.paddles.computer.vel_y * PADDLES.paddles.computer.dir_y);
        
        if(PADDLES.paddles.human.origin.y <= 0) {
          PADDLES.paddles.human.origin.y = 0;
          PADDLES.paddles.human.vel_y = 0;
        }
        if(PADDLES.paddles.human.origin.y >= PADDLES.canvas.size.height - PADDLES.paddles.human.size.height) {
          PADDLES.paddles.human.origin.y = PADDLES.canvas.size.height - PADDLES.paddles.human.size.height;
          PADDLES.paddles.human.vel_y = 0;
        }
        if(PADDLES.paddles.computer.origin.y <= 0) {
          PADDLES.paddles.computer.origin.y = 0;
          PADDLES.paddles.computer.vel_y = 0;
        }
        if(PADDLES.paddles.computer.origin.y >= PADDLES.canvas.size.height - PADDLES.paddles.computer.size.height) {
          PADDLES.paddles.computer.origin.y = PADDLES.canvas.size.height - PADDLES.paddles.computer.size.height;
          PADDLES.paddles.computer.vel_y = 0;
        }
        
      };
      
      this.drawTitleScreen = function() {
        
        PADDLES.clearCanvas();
        
        PADDLES.setStroke(PADDLES.options.text_color);
        PADDLES.setFill(PADDLES.options.text_color);
        
        PADDLES.canvas.context.font = PADDLES.options.font;
        var title = {
          'text' : 'PADDLES',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        title.size.width = PADDLES.canvas.context.measureText(title.text).width;
        title.size.height = (PADDLES.canvas.context.measureText(title.text).height || 64);
        title.origin.x = PADDLES.canvas.size.width / 2 - title.size.width / 2;
        title.origin.y = PADDLES.canvas.size.height / 2 - title.size.height * 0.5;
        PADDLES.canvas.context.fillText(title.text, title.origin.x, title.origin.y);
        
        PADDLES.canvas.context.font = PADDLES.options.font;
        var play = {
          'text' : 'Play',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        var instructions = {
          'text' : 'Instructions',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        play.size.width = PADDLES.canvas.context.measureText(play.text).width;
        play.size.height = (PADDLES.canvas.context.measureText(play.text).height || 20);
        play.origin.x = PADDLES.canvas.size.width / 2 - play.size.width / 2;
        play.origin.y = PADDLES.canvas.size.height / 2 + play.size.height;
        instructions.size.width = PADDLES.canvas.context.measureText(instructions.text).width;
        instructions.size.height = (PADDLES.canvas.context.measureText(instructions.text).height || 20);
        instructions.origin.x = PADDLES.canvas.size.width / 2 - instructions.size.width / 2;
        instructions.origin.y = PADDLES.canvas.size.height / 2 + instructions.size.height * 3;
        PADDLES.canvas.context.fillText(play.text, play.origin.x, play.origin.y);
        PADDLES.canvas.context.fillText(instructions.text, instructions.origin.x, instructions.origin.y);
        
        PADDLES.title_screen_hit_areas.play = {
          'origin' : {
            'x' : play.origin.x,
            'y' : play.origin.y - play.size.height
          },
          'size' : {
            'width' : play.size.width,
            'height' : play.size.height
          }
        };
        PADDLES.title_screen_hit_areas.instructions = {
          'origin' : {
            'x' : instructions.origin.x,
            'y' : instructions.origin.y - instructions.size.height
          },
          'size' : {
            'width' : instructions.size.width,
            'height' : instructions.size.height
          }
        };
        
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(play.origin.x, play.origin.y + 5);
        PADDLES.canvas.context.lineTo(play.origin.x + PADDLES.canvas.context.measureText('P').width, play.origin.y + 5);
        PADDLES.canvas.context.lineTo(play.origin.x + PADDLES.canvas.context.measureText('P').width, play.origin.y + 10);
        PADDLES.canvas.context.lineTo(play.origin.x, play.origin.y + 10);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(instructions.origin.x, instructions.origin.y + 5);
        PADDLES.canvas.context.lineTo(instructions.origin.x + PADDLES.canvas.context.measureText('H').width, instructions.origin.y + 5);
        PADDLES.canvas.context.lineTo(instructions.origin.x + PADDLES.canvas.context.measureText('H').width, instructions.origin.y + 10);
        PADDLES.canvas.context.lineTo(instructions.origin.x, instructions.origin.y + 10);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        
      };
      
      this.drawGameScreen = function() {
        
        PADDLES.clearCanvas();
        
        /* Draw Net */
        PADDLES.setStroke(PADDLES.options.net_color);
        PADDLES.setFill(PADDLES.options.net_color);
        var squares = Math.floor(PADDLES.canvas.size.height / 10) / 2;
        for(i = 0; i <= squares; i++) {
          PADDLES.canvas.context.fillRect(PADDLES.canvas.size.width / 2 - 5, i * 20 + 5, 10, 10);
        }
        
        /* Draw Score */
        PADDLES.setStroke(PADDLES.options.text_color);
        PADDLES.setFill(PADDLES.options.text_color);
        PADDLES.canvas.context.font = PADDLES.options.font;
        var computer = {
          'text' : PADDLES.score.computer,
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        var human = {
          'text' : PADDLES.score.human,
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        computer.size.width = PADDLES.canvas.context.measureText(computer.text).width;
        computer.size.height = (PADDLES.canvas.context.measureText(computer.text).height || 28);
        computer.origin.x = PADDLES.canvas.size.width / 2 - computer.size.width / 2 - 40;
        computer.origin.y = computer.size.height * 1.5;
        human.size.width = PADDLES.canvas.context.measureText(human.text).width;
        human.size.height = (PADDLES.canvas.context.measureText(human.text).height || 28);
        human.origin.x = PADDLES.canvas.size.width / 2 - human.size.width / 2 + 40;
        human.origin.y = human.size.height * 1.5;
        PADDLES.canvas.context.fillText(computer.text, computer.origin.x, computer.origin.y);
        PADDLES.canvas.context.fillText(human.text, human.origin.x, human.origin.y);
        
        /* Draw Ball */
        PADDLES.setStroke(PADDLES.options.ball_color);
        PADDLES.setFill(PADDLES.options.ball_color);
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.arc(PADDLES.ball.origin.x + PADDLES.ball.size.width / 2, PADDLES.ball.origin.y + PADDLES.ball.size.width / 2, PADDLES.ball.size.width / 2, 0, Math.PI*2, true); 
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        
        /* Draw Paddles */
        PADDLES.setStroke(PADDLES.options.paddle_color);
        PADDLES.setFill(PADDLES.options.paddle_color);
        PADDLES.canvas.context.fillRect(PADDLES.paddles.human.origin.x, PADDLES.paddles.human.origin.y, PADDLES.paddles.human.size.width, PADDLES.paddles.human.size.height);
        PADDLES.canvas.context.fillRect(PADDLES.paddles.computer.origin.x, PADDLES.paddles.computer.origin.y, PADDLES.paddles.computer.size.width, PADDLES.paddles.computer.size.height);
        
        /* Draw Debug Data */
        if(PADDLES.debug){
          PADDLES.setStroke('red');
          PADDLES.setFill('red');
          PADDLES.canvas.context.font = PADDLES.options.font;
          var debug = {
            'text' : Math.floor(PADDLES.fps_actual) + ' fps',
            'origin' : {
              'x' : 0,
              'y' : 0
            },
            'size' : {
              'width' : 0,
              'height' : 0,
            }
          };
          debug.size.width = PADDLES.canvas.context.measureText(debug.text).width;
          debug.size.height = (PADDLES.canvas.context.measureText(debug.text).height || 28);
          debug.origin.x = PADDLES.canvas.size.width / 2 - debug.size.width / 2 - 60;
          debug.origin.y = PADDLES.canvas.size.height - debug.size.height * 0.5;
          PADDLES.canvas.context.fillText(debug.text, debug.origin.x, debug.origin.y);
        }
        
      };
      
      this.drawInstructionsScreen = function() {
        
        PADDLES.clearCanvas();
        
        PADDLES.setStroke(PADDLES.options.text_color);
        PADDLES.setFill(PADDLES.options.text_color);
        
        PADDLES.canvas.context.font = PADDLES.options.font;
        var title = {
          'text' : 'INSTRUCTIONS',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        title.size.width = PADDLES.canvas.context.measureText(title.text).width;
        title.size.height = (PADDLES.canvas.context.measureText(title.text).height || 64);
        title.origin.x = PADDLES.canvas.size.width / 2 - title.size.width / 2;
        title.origin.y = PADDLES.canvas.size.height / 2 - title.size.height * 0.5;
        PADDLES.canvas.context.fillText(title.text, title.origin.x, title.origin.y);
        
        PADDLES.canvas.context.font = PADDLES.options.font;
        var controls = {
          'text' : 'Use          or          to control the paddle',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        var win = {
          'text' : 'First player to reach ' + PADDLES.options.winning_score + ' points wins!!',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        var back = {
          'text' : 'Back to main screen',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'size' : {
            'width' : 0,
            'height' : 0,
          }
        };
        controls.size.width = PADDLES.canvas.context.measureText(controls.text).width;
        controls.size.height = (PADDLES.canvas.context.measureText(controls.text).height || 20);
        controls.origin.x = PADDLES.canvas.size.width / 2 - controls.size.width / 2;
        controls.origin.y = PADDLES.canvas.size.height / 2 + controls.size.height;
        win.size.width = PADDLES.canvas.context.measureText(win.text).width;
        win.size.height = (PADDLES.canvas.context.measureText(win.text).height || 20);
        win.origin.x = PADDLES.canvas.size.width / 2 - win.size.width / 2;
        win.origin.y = PADDLES.canvas.size.height / 2 + win.size.height * 3;
        back.size.width = PADDLES.canvas.context.measureText(back.text).width;
        back.size.height = (PADDLES.canvas.context.measureText(back.text).height || 20);
        back.origin.x = PADDLES.canvas.size.width / 2 - back.size.width / 2;
        back.origin.y = PADDLES.canvas.size.height / 2 + back.size.height * 5;
        PADDLES.canvas.context.fillText(controls.text, controls.origin.x, controls.origin.y);
        PADDLES.canvas.context.fillText(win.text, win.origin.x, win.origin.y);
        PADDLES.canvas.context.fillText(back.text, back.origin.x, back.origin.y);
        
        PADDLES.instructions_screen_hit_areas.back = {
          'origin' : {
            'x' : back.origin.x,
            'y' : back.origin.y - back.size.height
          },
          'size' : {
            'width' : back.size.width,
            'height' : back.size.height
          }
        };
        
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(back.origin.x, back.origin.y + 5);
        PADDLES.canvas.context.lineTo(back.origin.x + PADDLES.canvas.context.measureText('B').width, back.origin.y + 5);
        PADDLES.canvas.context.lineTo(back.origin.x + PADDLES.canvas.context.measureText('B').width, back.origin.y + 10);
        PADDLES.canvas.context.lineTo(back.origin.x, back.origin.y + 10);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        
        /* Draw mouse symbol */
        var mouse_origin = {
          'x' : controls.origin.x + PADDLES.canvas.context.measureText('Use').width + PADDLES.canvas.context.measureText('          ').width / 2  - 6,
          'y' : controls.origin.y
        };
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(mouse_origin.x, mouse_origin.y);
        PADDLES.canvas.context.lineTo(mouse_origin.x, mouse_origin.y - 20);
        PADDLES.canvas.context.lineTo(mouse_origin.x + 10, mouse_origin.y - 3);
        PADDLES.canvas.context.lineTo(mouse_origin.x + 6, mouse_origin.y - 4);
        PADDLES.canvas.context.lineTo(mouse_origin.x + 8, mouse_origin.y + 4);
        PADDLES.canvas.context.lineTo(mouse_origin.x + 5, mouse_origin.y + 5);
        PADDLES.canvas.context.lineTo(mouse_origin.x + 3, mouse_origin.y - 3);
        PADDLES.canvas.context.lineTo(mouse_origin.x, mouse_origin.y);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        
        /* Draw dpad symbols */
        var dpad_origin = {
          'x' : controls.origin.x + PADDLES.canvas.context.measureText('Use          or').width + PADDLES.canvas.context.measureText('          ').width / 2,
          'y' : controls.origin.y - 7
        };
        /* Up */
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(dpad_origin.x - 5, dpad_origin.y - 8);
        PADDLES.canvas.context.lineTo(dpad_origin.x, dpad_origin.y - 15);
        PADDLES.canvas.context.lineTo(dpad_origin.x + 5, dpad_origin.y - 8);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        /* Down */
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(dpad_origin.x - 5, dpad_origin.y + 8);
        PADDLES.canvas.context.lineTo(dpad_origin.x, dpad_origin.y + 15);
        PADDLES.canvas.context.lineTo(dpad_origin.x + 5, dpad_origin.y + 8);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        /* Left */
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(dpad_origin.x - 8, dpad_origin.y + 5);
        PADDLES.canvas.context.lineTo(dpad_origin.x - 15, dpad_origin.y);
        PADDLES.canvas.context.lineTo(dpad_origin.x - 8, dpad_origin.y - 5);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        /* Right */
        PADDLES.canvas.context.beginPath();
        PADDLES.canvas.context.moveTo(dpad_origin.x + 8, dpad_origin.y + 5);
        PADDLES.canvas.context.lineTo(dpad_origin.x + 15, dpad_origin.y);
        PADDLES.canvas.context.lineTo(dpad_origin.x + 8, dpad_origin.y - 5);
        PADDLES.canvas.context.closePath();
        PADDLES.canvas.context.stroke();
        PADDLES.canvas.context.fill();
        
      };
      
      this.drawEndScreen = function() {
        
        PADDLES.clearCanvas();
        
        PADDLES.setStroke(PADDLES.options.text_color);
        PADDLES.setFill(PADDLES.options.text_color);
        
        PADDLES.canvas.context.font = PADDLES.options.font;
        var game_over = {
          'text' : 'GAME OVER',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'width' : 0,
          'height' : 0,
        };
        game_over.width = PADDLES.canvas.context.measureText(game_over.text).width;
        game_over.height = (PADDLES.canvas.context.measureText(game_over.text).height || 64);
        game_over.origin.x = PADDLES.canvas.size.width / 2 - game_over.width / 2;
        game_over.origin.y = PADDLES.canvas.size.height / 2 - game_over.height * 0.5;
        PADDLES.canvas.context.fillText(game_over.text, game_over.origin.x, game_over.origin.y);
        
        PADDLES.canvas.context.font = PADDLES.options.font;
        var result = {
          'text' : PADDLES.score.human == 11 ? 'Congratulations!! You Won!!' : 'You lost! Try again...',
          'origin' : {
            'x' : 0,
            'y' : 0
          },
          'width' : 0,
          'height' : 0,
        };
        result.width = PADDLES.canvas.context.measureText(result.text).width;
        result.height = (PADDLES.canvas.context.measureText(result.text).height || 20);
        result.origin.x = PADDLES.canvas.size.width / 2 - result.width / 2;
        result.origin.y = PADDLES.canvas.size.height / 2 + result.height;
        PADDLES.canvas.context.fillText(result.text, result.origin.x, result.origin.y);
        
      };
      
      this.setFill = function(fill) {
        if(fill !== false){
          if(typeof(fill) == 'string') {
            PADDLES.canvas.context.fillStyle = fill;
          }
        } else {
          PADDLES.canvas.context.fillStyle = 'transparent';
        }
      };
      
      this.setStroke = function(stroke) {
        if(stroke !== false){
          if(typeof(stroke) == 'string') {
            PADDLES.canvas.context.strokeStyle = stroke;
          }
        } else {
          PADDLES.canvas.context.strokeStyle = 'transparent';
        }
      };
    
    };
  
    $(this).each(function(index) {
    
      if($(this).is('canvas')) {
        
        var canvas = this;
        
        /* Make sure canvas is actually on screen before drawing!! */
        var visible_timeout = setInterval(function() {
          if($(canvas).parents().is(':visible') && $(canvas).parents().css('display') != 'none') {
            var ping = new PADDLES(canvas, options);
            ping.init();
            clearInterval(visible_timeout);
          }
        },100);
    
      }
    
    });
  
  };
  
})(jQuery);