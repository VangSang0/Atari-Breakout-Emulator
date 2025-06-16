// Need to generate a map

function generateMap() {
    let brickObjects = [];
    const gameCanvas = document.querySelector('.game-container');
    const canvasContext = gameCanvas.getContext('2d');
    
    const rows = 6;
    const cols = 7;
    const brickWidth = 42;
    const brickHeight = 5;
    const hGap = 1;
    const vGap = 1;
    
    const getBrickObjects = () => brickObjects;
    const getGameCanvas = () => gameCanvas;
    const getCanvasContext = () => canvasContext;
    function createBricks() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const xCoord = j * (brickWidth + hGap);
                const yCoord = i * (brickHeight + vGap);
                const brickColor = '#FF5733';
                brickObjects.push(createRectObject(xCoord, yCoord, brickWidth, brickHeight, brickColor));
            }
        }
    }

    function drawBricks(){
        gameCanvas.width = gameCanvas.width;
        for (let i = 0; i < brickObjects.length; i++) {
            if (!brickObjects[i].isHit){
                brickObjects[i].draw(canvasContext);
            }

        }
    }
    
    function createRectObject(xCoord, yCoord, width, height, brickColor, isHit = false){
        return {
            brickXCoord : xCoord,
            brickYCoord : yCoord,
            brickWidth: width,
            brickHeight: height,
            brickColor : brickColor,
            isHit : isHit,
            draw: function(ctx){
                ctx.fillStyle = this.brickColor;
                ctx.fillRect(this.brickXCoord, this.brickYCoord, this.brickWidth, this.brickHeight);
            }
        };
    }

    function setIsHit(brick) {
        if(!brick.isHit){
            brick.isHit = true;
        }
    }

    createBricks();

    return { drawBricks, setIsHit,  getBrickObjects, getGameCanvas, getCanvasContext}

}

// Game interactions which are ball movement, user movement, game over
function ball() {
    let ballX = 150;
    let ballY = 130;
    const radius = 3;
    let velocityX = 1;
    let velocityY = 1;

    function drawBall(ctx) {
        ctx.beginPath();
        ctx.arc(ballX, ballY, radius, 0, Math.PI * 2, true);
        ctx.fillStyle = '#FFF';
        ctx.fill();
        ctx.closePath();
    }

    function getRadius(){
        return radius;
    }

    function getPosition() {
        return { x: ballX, y: ballY };
    }

    function setPosition(x, y) {
        ballX = x;
        ballY = y;
    }
    function getVelocity() { return { x: velocityX, y: velocityY }; }
    function setVelocity(x, y) { velocityX = x; velocityY = y; }

    function changeVelocityX(){
        velocityX *= -1;
    }
    function changeVelocityY(){
        velocityY *= -1;
    }

    function changePosition(){
        ballX += velocityX;
        ballY += velocityY;
    }
    
    return { drawBall, getRadius, getPosition, 
        setPosition, changePosition, changeVelocityX, 
        changeVelocityY, setVelocity, getVelocity 
    };
}

function player() {
    let paddleX = 140;
    let paddleY = 135;
    const paddleHeight = 3;
    const paddleWidth = 40;

    function getPaddleY() {
        return paddleY;
    }
    function getPaddleX(){
        return paddleX
    }

    function drawPaddle(ctx){
        ctx.fillStyle = 'green';
        ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight)
    }
    function setPaddlePosition(mouseX, canvas) {
        // Use the whole canvas width for mouse movement
        // const canvas = map.getGameCanvas();
        // Scale mouseX to canvas width
        const scaledX = (mouseX / canvas.clientWidth) * canvas.width;
        paddleX = Math.max(0, Math.min(scaledX - paddleWidth / 2, canvas.width - paddleWidth));
    }

    return { getPaddleY, getPaddleX, drawPaddle, setPaddlePosition }
}

/**
 * It's best to create a game manager that handles the game state, input, and game loop.
 * The game manager can coordinate updates and rendering for all game objects.
 */

function gameManager() {
    const map = generateMap();
    const canvasElement = map.getGameCanvas();
    const ctx = map.getCanvasContext();
    let bricks = map.getBrickObjects();
    let numberOfBricksLeft = bricks.length

    const createBall = ball();
    const createPlayer = player();

    let gameWin = false;
    let running = true;

    const radiusOffset = createBall.getRadius();
    const paddleY = createPlayer.getPaddleY();

    canvasElement.addEventListener('mousemove', function(e) {
        const rect = canvasElement.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        createPlayer.setPaddlePosition(mouseX, canvasElement);
    });

    function update() {
        // Move ball
        console.log(bricks.length);

        if (numberOfBricksLeft === 0){
            gameWin = true;
            stop();
        }
        createBall.changePosition();
        const paddleX = createPlayer.getPaddleX()
        // For now, just simple wall bounce
        let pos = createBall.getPosition();
        if (pos.x - radiusOffset < 0 || pos.x + radiusOffset > ctx.canvas.width) {
            createBall.changeVelocityX();
            createBall.setPosition(
                Math.max(0, Math.min(pos.x, ctx.canvas.width)),
                pos.y
            );
        }   
        if (pos.y - radiusOffset < 0) {
            createBall.changeVelocityY();
            createBall.setPosition(
                pos.x,
                Math.max(0, Math.min(pos.y, ctx.canvas.height))
            );
        }
        if (pos.y + radiusOffset >= ctx.canvas.height){
            stop();
            createBall.setPosition(
                pos.x,
                Math.max(0, Math.min(pos.y, ctx.canvas.height))
            );
        }

        // Check collision with bricks and update their hit status
        bricks.forEach(brick => {
            if (brick.isHit) {
                return;
            }
            const bx = brick.brickXCoord;
            const by = brick.brickYCoord;
            const bw = brick.brickWidth;
            const bh = brick.brickHeight;

            // Simple AABB collision for ball and brick
            if (
            pos.x + radiusOffset > bx &&
            pos.x - radiusOffset < bx + bw &&
            pos.y + radiusOffset > by &&
            pos.y - radiusOffset < by + bh
            ) {
            map.setIsHit(brick);
            numberOfBricksLeft-=1;

            // Determine bounce direction
            const prevPos = {
                x: pos.x - createBall.getVelocity().x,
                y: pos.y - createBall.getVelocity().y
            };
            const hitFromLeftOrRight =
                prevPos.x + radiusOffset <= bx || prevPos.x - radiusOffset >= bx + bw;
            if (hitFromLeftOrRight) {
                createBall.changeVelocityX();
            } else {
                createBall.changeVelocityY();
            }
            }
        });

        // TODO: Add collision detection with walls, paddle, and bricks
        // for the paddle, if the ball hits it at a certain spot, it changes the velocityX and velocityY
        if (
            pos.y + radiusOffset >= paddleY &&
            pos.y - radiusOffset <= paddleY + 3 &&
            pos.x + radiusOffset >= paddleX &&
            pos.x - radiusOffset <= paddleX + 40 
        ) {
            const paddleCenter = paddleX + 40 / 2;
            const distanceFromCenter = pos.x - paddleCenter;
            const normalized = distanceFromCenter / (40 / 2);

            const velocity = createBall.getVelocity();
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

            const maxBounceAngle = Math.PI / 3;
            const bounceAngle = normalized * maxBounceAngle;

            const newVelocityX = speed * Math.sin(bounceAngle);
            const newVelocityY = -Math.abs(speed * Math.cos(bounceAngle));

            createBall.setVelocity(newVelocityX, newVelocityY);
        }

    }

    function render() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        map.drawBricks();
        createBall.drawBall(ctx);
        createPlayer.drawPaddle(ctx);
    }

    function loop() {
        if (!running) return;
        update();
        render();
        requestAnimationFrame(loop);
    }

    function start() {
        running = true;
        loop();
    }

    function stop() {
        running = false;
        const endScreen = document.querySelector('.end-screen');
        const endText = document.querySelector('.end-text');
        const resetBtn = document.querySelector('.reset');

        if (gameWin){
            console.log('we win');
            endText.innerText = 'You Won!'
        }
        console.log(endScreen);
        endScreen.style.display = 'flex'
        resetBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    return { start, stop };
}

const game = gameManager();
game.start();

// Split it up into different "factories"

