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
    const ballSize = 3;
    const velocityX = 1;
    const velocityY = 1;

    function drawBall(ctx) {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2, true);
        ctx.fillStyle = '#FFF';
        ctx.fill();
        ctx.closePath();
    }

    function getPosition() {
        return { x: ballX, y: ballY };
    }

    function setPosition(x, y) {
        ballX = x;
        ballY = y;
    }

    function changePosition(){
        ballX += velocityX;
        ballY += velocityY;
    }

    
    
    return { drawBall, getPosition, setPosition, changePosition };
}

const map = generateMap();
const brickObjects = map.getBrickObjects();
map.drawBricks();
console.log(brickObjects.length);

const createBall = ball();
createBall.drawBall(map.getCanvasContext());



// Split it up into different "factories"

