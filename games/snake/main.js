(function ( $ ) {
    var UP = 0;
    var LEFT = 1;
    var DOWN = 2;
    var RIGHT = 3;
    
    var K_UP = 38;
    var K_RIGHT = 39;
    var K_DOWN = 40;
    var K_LEFT = 37;
    var K_ESC = 27;

    $.fn.snakeGame = function(options) {

        var settings = $.extend({
            FPS : 15,
            actor_size : 20,
            snake_color : '#FFFFFF',
            snake_start_x : 0,
            snake_start_y : 0,
            snake_len : 1,
            snake_grow : 1,
            food_color : '#FF0000',
            background : '#000000',
            scene_height : 512,
            scene_width : 1024,
            on_lose : function() {alert("Prehral si")}
        }, options);

        scene_hmax = settings.scene_height - settings.actor_size - 10;
        scene_wmax = settings.scene_width - settings.actor_size - 10;

        this.attr('tabindex', '0');

        this.css({
            'background' : settings.background,
            'height' : settings.scene_height + 'px',
            'width' : settings.scene_width + 'px',
            'position' : 'relative',
        })

        function out(x, y) {
            if(x < 0 || x > scene_hmax
                || y < 0 || y > scene_wmax) return true;
            return false;
        }

        function rand(dimension) {
            len = settings.actor_size;
            return Math.round(Math.random() * dimension/len) * len;
        }

        function printMenu(scene, score) {
            scene.empty();
            menu = $("\
                <div>\
                    <p>Restart</p>\
                    <p>Your score: "+score+" </p>\
                </div>");
            scene.append(menu);
            menu.css({
                padding : '20px',
                color : '#0000FF',
                background : '#CCCCCC',
                textAlign : 'center',
            })

            menu.keydown(function(event) {
                if(event.which == 13) scene.play();
            })

            menu.click(function() {
                scene.play();
            })
            menu.attr('tabindex', '0');
            menu.focus();
        }

        function Element() {
            element = $('<div></div>');
            element.css({
                'position' : 'absolute',
                'height' : settings.actor_size,
                'width' : settings.actor_size,
                'top' : '0px',
                'left' : '0px',
            })
            $.extend(element,{
                x : 0,
                y : 0,
                update : function(x, y) {
                    this.x = x || this.x;
                    this.y = y || this.y;
                    this.css({
                        top : this.x + 'px',
                        left : this.y + 'px',
                    })
                }
            })
            return element
        }
        
        function Food() {
            element = Element();
            element.css('background', settings.food_color);
            element.extend(element,{
                regenerate : function(snake) {
                    do {
                        this.x = rand(scene_hmax);
                        this.y = rand(scene_wmax);
                    } while(snake.colide(this.x, this.y));
                    this.update()
                }
            })
            return element;
        }
        
        function SnakeBlock(x, y) {
            element = Element();
            element.css('background', settings.snake_color);
            element.update(x, y);
            return element;
        }

        function Snake(scene) {
            return {
                y : settings.snake_start_x,
                x : settings.snake_start_y,
                body : [SnakeBlock()],
                len : settings.snake_len,
                scene : scene,
                vector : RIGHT,
                move : function() {
                    switch(this.vector) {
                        case UP: this.x -= settings.actor_size; break;
                        case RIGHT: this.y += settings.actor_size; break;
                        case DOWN: this.x += settings.actor_size; break;
                        case LEFT: this.y -= settings.actor_size; break;
                    }
                    console.log(this.colide(this.x, this.y));
                    if(this.colide(this.x, this.y)) {
                        return false;
                    }
                    this.body.push(SnakeBlock(this.x, this.y));
                    if(this.body.length > this.len) this.body.shift().remove();
                    this.scene.append(this.body[this.body.length-1]);
                    return true;
                },
                colide : function(x, y) {
                    for(i=0; i<this.body.length; i++) {
                        if(this.body[i].x == x && this.body[i].y == y) {
                            return true;
                        }
                    };
                    return false;
                }
            }
        }

        scene = this;

        this.play = function() {
            console.log("Play called");

            this.keydown(function(event) {
                switch(event.which) {
                    case K_UP:
                        if(snake.vector != DOWN) snake.vector = UP;
                        break;
                    case K_RIGHT:
                        if(snake.vector != LEFT) snake.vector = RIGHT;
                        break;
                    case K_DOWN:
                        if(snake.vector != UP) snake.vector = DOWN;
                        break;
                    case K_LEFT:
                        if(snake.vector != RIGHT) snake.vector = LEFT;
                        break;
                }
                event.preventDefault()
            })

            this.empty();
            this.focus();
            this.append(snake = Snake(this), food = Food());
            food.regenerate(snake);

            scene.gameLoop = setInterval(function(){
                if(!snake.move() || out(snake.x, snake.y)) {
                    console.log("Ending " + scene.gameLoop);
                    clearInterval(scene.gameLoop);
                    printMenu(scene, snake.len);
                }
                else if(snake.x == food.x && snake.y == food.y) {
                    snake.len += settings.snake_grow;
                    food.regenerate(snake);
                }
            }, (1/settings.FPS)*1000);
            console.log("Started " + scene.gameLoop);

            return this;
        }

        this.stop = function() {
            clearInterval(scene.gameLoop);
        }

        this.keyup(function(event) {
            if(event.keyCode == K_ESC){
                scene.blur();
            }
        })

        return this;

    }

}( jQuery ));

