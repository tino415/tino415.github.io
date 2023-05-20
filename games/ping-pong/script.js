window.pingPong = function pingPong(element, options) {
    var o = {
        WIDTH: 400,
        HEIGHT: 600,
        BACKGROUND: '#000',
        PADDLE_COLOR: '#fff',
        PADDLE_WIDTH: 50,
        PADDLE_HEIGHT: 10,
        PADDLE_OFFSET: 10,
        PADDLE_SPEED: 4,
        BALL_SPEED: 3,
        BALL_SIZE: 5,
        BALL_COLOR: '#fff',
        KEYS : {
            LEFT: 37,
            RIGHT: 39
        }
    };

    o['HORIZONTAL_HALF']   = function(o) { return o.WIDTH / 2; };
    o['VERTICAL_HALF']     = function(o) { return o.HEIGHT / 2; };
    o['PADDLE_X']          = function(o) { return o.HORIZONTAL_HALF - (o.PADDLE_WIDTH / 2); };
    o['COMPUTER_PADDLE_Y'] = function(o) { return o.PADDLE_OFFSET; };
    o['PLAYER_PADDLE_Y']   = function(o) { return o.HEIGHT - (o.PADDLE_HEIGHT + o.PADDLE_OFFSET); };

    var key;

    if (options && typeof (options) == "object") {
        for (key in options) {
            if (o.hasOwnProperty(key)) {
                o[key] = options[key];
            }
        }
    }

    for (key in o) {
        if (typeof o[key] === 'function') {
            o[key] = o[key](o);
        }
    }

    var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        function(callback) {
            setTimeout(callback, 1000/60);
        };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    element.appendChild(canvas);
    canvas.width = o.WIDTH;
    canvas.height = o.HEIGHT;

    function Paddle(y) {
        this.x = o.PADDLE_X;
        this.y = y;
        this.y_speed = this.x_speed = 0;
    }

    Paddle.prototype.render = function() {
        context.fillStyle = o.PADDLE_COLOR;
        context.fillRect(this.x, this.y, o.PADDLE_WIDTH, o.PADDLE_HEIGHT);
    };

    Paddle.prototype.collided = function(top_x, top_y, bottom_x, bottom_y) {
        return  (top_y < (this.y + o.PADDLE_HEIGHT)) && (bottom_y > this.y) &&
                (top_x < (this.x + o.PADDLE_WIDTH))  && (bottom_x > this.x);
    };

    Paddle.prototype.move = function(x, y) {
        this.x += x;
        this.y += y;
        this.x_speed = x;
        this.y_speed = y;

        if (this.x < 0) {
            this.x = 0;
            this.x_speed = 0;
        } else if (this.x + o.PADDLE_WIDTH > o.WIDTH) {
            this.x = o.WIDTH - o.PADDLE_WIDTH;
            this.x_speed = 0;
        }
    };

    function Player() {
        this.paddle = new Paddle(o.PLAYER_PADDLE_Y);
    }

    Player.prototype.render = function() {
        this.paddle.render();
    };

    Player.prototype.update = function() {
        for (var key in keys) {
            switch(Number(key)) {
                case o.KEYS.LEFT: {
                    this.paddle.move(-o.PADDLE_SPEED, 0);
                    break;
                }

                case o.KEYS.RIGHT: {
                    this.paddle.move(o.PADDLE_SPEED, 0);
                    break;
                }

                default: {
                    this.paddle.move(0, 0);
                }
            }
        }
    };

    function Computer() {
        this.paddle = new Paddle(o.COMPUTER_PADDLE_Y);
    }

    Computer.prototype.render = function() {
        this.paddle.render();
    };

    Computer.prototype.update = function () {
        var diff = -((this.paddle.x + (o.PADDLE_WIDTH / 2)) - ball.x);

        if (diff < 0 && diff < -o.PADDLE_SPEED) {
            this.paddle.move(-(o.PADDLE_SPEED + 1), 0);
        } else if (diff > 0 && diff > o.PADDLE_SPEED) {
            this.paddle.move(o.PADDLE_SPEED + 1, 0);
        }
    };

    function Ball() {
        this.reset();
    }

    Ball.prototype.reset = function() {
        this.x = o.HORIZONTAL_HALF;
        this.y = o.VERTICAL_HALF;
        this.x_speed = 0;
        this.y_speed = o.BALL_SPEED;
    };

    Ball.prototype.render = function() {
        context.beginPath();
        context.arc(this.x, this.y, o.BALL_SIZE, 2 * Math.PI, 0);
        context.fillStyle = o.BALL_COLOR;
        context.fill();
    };

    Ball.prototype.update = function() {
        this.x += this.x_speed;
        this.y += this.y_speed;

        var top_x = this.x - o.BALL_SIZE;
        var top_y = this.y - o.BALL_SIZE;
        var bottom_x = this.x + o.BALL_SIZE;
        var bottom_y = this.y + o.BALL_SIZE;

        if (top_x < 0) {
            this.x = o.BALL_SIZE;
            this.x_speed = -this.x_speed;
        } else if (bottom_x > o.WIDTH) {
            this.x = o.WIDTH - o.BALL_SIZE;
            this.x_speed = -this.x_speed;
        }

        if (this.y < 0 || this.y > o.HEIGHT) {
            this.reset();
        }

        if (top_y > o.VERTICAL_HALF) { // Is on player side
            if (player.paddle.collided(top_x, top_y, bottom_x, bottom_y)) {
                this.y_speed = -o.BALL_SPEED;
                this.x_speed += (player.paddle.x_speed / 2);
                this.y += this.y_speed;
            }
        } else { // Is on computer side
            if (computer.paddle.collided(top_x, top_y, bottom_x, bottom_y)) {
                this.y_speed = o.BALL_SPEED;
                this.x_speed += (computer.paddle.x_speed / 2);
                this.y += this.y_speed;
            }
        }
    };

    var keys = {};

    window.addEventListener('keydown', function(e) {
        keys[e.keyCode] = true;
    });

    window.addEventListener('keyup', function(e) {
        delete keys[e.keyCode];
    });

    var ball = new Ball();
    var player = new Player();
    var computer = new Computer();

    function update() {
        player.update();
        computer.update();
        ball.update();
    }

    function render() {
        context.fillStyle = o.BACKGROUND;
        context.fillRect(0, 0, o.WIDTH, o.HEIGHT);

        player.render();
        computer.render();
        ball.render();
    }

    function step() {
        update();
        render();
        animate(step);
    }

    animate(step);
};
