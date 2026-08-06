Paddles
=======

A Pong clone written as a jQuery plugin, rendered to an HTML5 canvas.

Play it: https://acwright.github.io/jquery.paddles/

Install:
-------

    $ git clone git@github.com:acwright/jquery.paddles.git
    $ cd jquery.paddles
    $ npm install

Run Server:
-----------

    $ npm start

Then navigate browser to http://localhost:3000 and get paddling!

The site is entirely static — everything it needs lives in `public/`. The
server is a convenience for local development only; it just serves that
directory. You can equally open `public/index.html` with any static file
server.

Usage:
------

    $('canvas#paddles').PADDLES();

Options (with defaults):

    paddle_length : 60      ball_color    : '#FFFFFF'
    paddle_speed  : 6       text_color    : '#FFFFFF'
    ball_diameter : 10      net_color     : '#666666'
    ball_speed    : 4       alpha         : 1.0
    paddle_color  : '#FFFFFF'   winning_score : 11
    fps           : 60

Deploying:
----------

Pushes to `master` are deployed to GitHub Pages by
`.github/workflows/pages.yml`, which publishes `public/` as-is. No build step.

One-time setup: in the repository's **Settings → Pages**, set **Source** to
**GitHub Actions**.
