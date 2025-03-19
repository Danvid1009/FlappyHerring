const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game constants
const GRAVITY = 0.25;
const FLAP_STRENGTH = -7;
const PIPE_SPEED = 3;
const PIPE_GAP = 150;
const PIPE_WIDTH = 50;
const MAX_ROTATION = 25;

// Game state
let bird = {
    x: canvas.width / 3,
    y: canvas.height / 2,
    velocity: 0,
    rotation: 0,
    width: 40,
    height: 30
};

let pipes = [];
let score = 0;
let gameOver = false;
let lastPipeTime = 0;

// Load herring image
const herringImage = new Image();
herringImage.src = 'assets/herring.png';

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else {
            bird.velocity = FLAP_STRENGTH;
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameOver) {
        resetGame();
    } else {
        bird.velocity = FLAP_STRENGTH;
    }
});

// Game functions
function createPipe() {
    const gapY = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
    pipes.push({
        x: canvas.width,
        gapY: gapY,
        passed: false
    });
}

function update() {
    if (gameOver) return;

    // Update bird
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    bird.rotation = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, bird.velocity * 2));

    // Generate pipes
    const currentTime = Date.now();
    if (currentTime - lastPipeTime > 1500) {
        createPipe();
        lastPipeTime = currentTime;
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED;

        // Check for score
        if (!pipe.passed && pipe.x < bird.x) {
            score++;
            scoreElement.textContent = `Score: ${score}`;
            pipe.passed = true;
        }

        // Remove off-screen pipes
        if (pipe.x < -PIPE_WIDTH) {
            pipes.splice(i, 1);
        }

        // Check collisions
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + PIPE_WIDTH) {
            if (bird.y < pipe.gapY - PIPE_GAP/2 || 
                bird.y + bird.height > pipe.gapY + PIPE_GAP/2) {
                gameOver = true;
            }
        }
    }

    // Check boundaries
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        gameOver = true;
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    ctx.fillStyle = '#2ecc71';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY - PIPE_GAP/2);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP/2, PIPE_WIDTH, canvas.height);
    });

    // Draw bird
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    ctx.rotate(bird.rotation * Math.PI / 180);
    ctx.drawImage(herringImage, -bird.width/2, -bird.height/2, bird.width, bird.height);
    ctx.restore();

    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        ctx.font = '20px Arial';
        ctx.fillText('Click or press SPACE to restart', canvas.width/2, canvas.height/2 + 40);
    }
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    gameOver = false;
    lastPipeTime = Date.now();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 