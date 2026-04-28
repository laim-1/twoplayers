const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = {
    screen: 'menu',
    totalRounds: 10,
    currentRound: 0,
    p1Score: 0,
    p2Score: 0,
    currentGame: null,
    gameTimer: 0,
    gameTime: 30
};

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Player objects
const players = {
    p1: {
        x: 100,
        y: 500,
        width: 40,
        height: 40,
        color: '#FF6B6B',
        vx: 0,
        vy: 0,
        speed: 5,
        score: 0
    },
    p2: {
        x: 700,
        y: 500,
        width: 40,
        height: 40,
        color: '#4ECDC4',
        vx: 0,
        vy: 0,
        speed: 5,
        score: 0
    }
};

// Game list with empty slot
const games = [
    { name: 'Speed Ball', fn: speedBall },
    { name: 'Dodge Rush', fn: dodgeRush },
    { name: 'Pattern Repeat', fn: patternRepeat },
    { name: 'Tap Race', fn: tapRace },
    { name: 'Color Match', fn: colorMatch },
    { name: 'Chase', fn: chase },
    { name: 'Target Shoot', fn: targetShoot },
    { name: 'Simon Says', fn: simonSays },
    { name: 'Catch the Falling', fn: catchFalling },
    { name: 'Synchronized Movement', fn: syncMovement },
    { name: 'Empty Slot', fn: null } // Placeholder for future game
];

function selectRounds(rounds) {
    gameState.totalRounds = rounds;
    gameState.currentRound = 0;
    gameState.p1Score = 0;
    gameState.p2Score = 0;
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    nextRound();
}

function nextRound() {
    document.getElementById('roundEndMenu').classList.add('hidden');
    gameState.currentRound++;
    
    if (gameState.currentRound > gameState.totalRounds) {
        endGame();
        return;
    }
    
    startNewGame();
}

function startNewGame() {
    const gameIndex = (gameState.currentRound - 1) % games.length;
    gameState.currentGame = games[gameIndex];
    
    document.getElementById('gameTitle').textContent = gameState.currentGame.name;
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('totalRounds').textContent = gameState.totalRounds;
    
    gameState.gameTimer = gameState.gameTime;
    players.p1.score = 0;
    players.p2.score = 0;
    
    resetPlayerPositions();
    
    if (gameState.currentGame.fn) {
        gameState.currentGame.fn.init();
    }
    
    gameState.screen = 'game';
    gameLoop();
}

function resetPlayerPositions() {
    players.p1.x = 100;
    players.p1.y = 500;
    players.p1.vx = 0;
    players.p1.vy = 0;
    
    players.p2.x = 700;
    players.p2.y = 500;
    players.p2.vx = 0;
    players.p2.vy = 0;
}

function gameLoop() {
    if (gameState.screen !== 'game') return;
    
    // Clear canvas
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update game
    if (gameState.currentGame.fn) {
        gameState.currentGame.fn.update();
        gameState.currentGame.fn.draw();
    }
    
    // Update timer
    gameState.gameTimer -= 0.016; // ~60 FPS
    document.getElementById('timer').textContent = Math.ceil(gameState.gameTimer);
    
    // Check if time's up
    if (gameState.gameTimer <= 0) {
        endGameRound();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

function endGameRound() {
    gameState.screen = 'menu';
    
    let winner = '';
    let message = '';
    
    if (players.p1.score > players.p2.score) {
        winner = '🎉 Player 1 Wins!';
        gameState.p1Score += 1;
    } else if (players.p2.score > players.p1.score) {
        winner = '🎉 Player 2 Wins!';
        gameState.p2Score += 1;
    } else {
        winner = "It's a Tie!";
        gameState.p1Score += 0.5;
        gameState.p2Score += 0.5;
    }
    
    message = `P1: ${Math.floor(players.p1.score)} | P2: ${Math.floor(players.p2.score)}`;
    
    document.getElementById('roundWinner').textContent = winner;
    document.getElementById('roundMessage').textContent = message;
    document.getElementById('p1Score').textContent = gameState.p1Score;
    document.getElementById('p2Score').textContent = gameState.p2Score;
    document.getElementById('roundEndMenu').classList.remove('hidden');
}

function endGame() {
    document.getElementById('finalP1Score').textContent = gameState.p1Score;
    document.getElementById('finalP2Score').textContent = gameState.p2Score;
    
    if (gameState.p1Score > gameState.p2Score) {
        document.getElementById('winner').textContent = '🏆 Player 1 is the Champion!';
    } else if (gameState.p2Score > gameState.p1Score) {
        document.getElementById('winner').textContent = '🏆 Player 2 is the Champion!';
    } else {
        document.getElementById('winner').textContent = "🏆 It's a Perfect Tie!";
    }
    
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('gameOverMenu').classList.remove('hidden');
}

// ===== GAME 1: SPEED BALL =====
const speedBall = {
    ball: { x: 400, y: 300, vx: 5, vy: 3, radius: 15 },
    speed: 5,
    
    init() {
        this.ball.x = 400;
        this.ball.y = 300;
        this.ball.vx = 5;
        this.ball.vy = 3;
        this.speed = 5;
        players.p1.score = 0;
        players.p2.score = 0;
    },
    
    update() {
        // Ball physics
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Wall bounces
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > canvas.height) {
            this.ball.vy *= -1;
            this.ball.y = Math.max(this.ball.radius, Math.min(canvas.height - this.ball.radius, this.ball.y));
        }
        
        // Player 1 controls
        if (keys['w']) players.p1.y = Math.max(0, players.p1.y - players.p1.speed);
        if (keys['s']) players.p1.y = Math.min(canvas.height - players.p1.height, players.p1.y + players.p1.speed);
        if (keys['a']) players.p1.x = Math.max(0, players.p1.x - players.p1.speed);
        if (keys['d']) players.p1.x = Math.min(canvas.width - players.p1.width, players.p1.x + players.p1.speed);
        
        // Player 2 controls
        if (keys['arrowup']) players.p2.y = Math.max(0, players.p2.y - players.p2.speed);
        if (keys['arrowdown']) players.p2.y = Math.min(canvas.height - players.p2.height, players.p2.y + players.p2.speed);
        if (keys['arrowleft']) players.p2.x = Math.max(0, players.p2.x - players.p2.speed);
        if (keys['arrowright']) players.p2.x = Math.min(canvas.width - players.p2.width, players.p2.x + players.p2.speed);
        
        // Ball collision with player 1
        if (this.checkCollision(this.ball, players.p1)) {
            players.p1.score++;
            this.ball.vx = Math.abs(this.ball.vx) * this.speed;
            this.speed += 0.5;
        }
        
        // Ball collision with player 2
        if (this.checkCollision(this.ball, players.p2)) {
            players.p2.score++;
            this.ball.vx = -Math.abs(this.ball.vx) * this.speed;
            this.speed += 0.5;
        }
        
        // Out of bounds = lose
        if (this.ball.x < 0 || this.ball.x > canvas.width) {
            if (this.ball.x < 0) players.p2.score++;
            else players.p1.score++;
            this.init();
        }
    },
    
    checkCollision(ball, player) {
        return ball.x - ball.radius < player.x + player.width &&
               ball.x + ball.radius > player.x &&
               ball.y - ball.radius < player.y + player.height &&
               ball.y + ball.radius > player.y;
    },
    
    draw() {
        // Players
        ctx.fillStyle = players.p1.color;
        ctx.fillRect(players.p1.x, players.p1.y, players.p1.width, players.p1.height);
        ctx.fillStyle = players.p2.color;
        ctx.fillRect(players.p2.x, players.p2.y, players.p2.width, players.p2.height);
        
        // Ball
        ctx.fillStyle = '#FFE66D';
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
    }
};

// ===== GAME 2: DODGE RUSH =====
const dodgeRush = {
    obstacles: [],
    obstacleSpeed: 3,
    spawnRate: 0,
    
    init() {
        this.obstacles = [];
        this.obstacleSpeed = 3;
        this.spawnRate = 0;
        players.p1.score = 0;
        players.p2.score = 0;
        players.p1.y = canvas.height - 100;
        players.p2.y = canvas.height - 100;
    },
    
    update() {
        this.spawnRate++;
        
        // Spawn obstacles
        if (this.spawnRate > 30 - Math.floor(gameState.gameTimer / 2)) {
            this.obstacles.push({
                x: Math.random() * (canvas.width / 2),
                y: 0,
                width: 50,
                height: 30
            });
            this.obstacles.push({
                x: canvas.width / 2 + Math.random() * (canvas.width / 2),
                y: 0,
                width: 50,
                height: 30
            });
            this.spawnRate = 0;
        }
        
        // Update obstacles
        this.obstacles.forEach(obs => obs.y += this.obstacleSpeed + gameState.gameTime - gameState.gameTimer);
        this.obstacles = this.obstacles.filter(obs => obs.y < canvas.height);
        
        // Player 1 controls (left half)
        if (keys['a']) players.p1.x = Math.max(0, players.p1.x - players.p1.speed);
        if (keys['d']) players.p1.x = Math.min(canvas.width / 2 - players.p1.width, players.p1.x + players.p1.speed);
        
        // Player 2 controls (right half)
        if (keys['arrowleft']) players.p2.x = Math.max(canvas.width / 2, players.p2.x - players.p2.speed);
        if (keys['arrowright']) players.p2.x = Math.min(canvas.width - players.p2.width, players.p2.x + players.p2.speed);
        
        // Collision detection
        this.obstacles.forEach(obs => {
            if (this.checkCollision(obs, players.p1)) {
                players.p2.score++;
                players.p1.y = canvas.height - 100;
            }
            if (this.checkCollision(obs, players.p2)) {
                players.p1.score++;
                players.p2.y = canvas.height - 100;
            }
        });
    },
    
    checkCollision(obs, player) {
        return obs.x < player.x + player.width &&
               obs.x + obs.width > player.x &&
               obs.y < player.y + player.height &&
               obs.y + obs.height > player.y;
    },
    
    draw() {
        // Center line
        ctx.strokeStyle = '#ddd';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Players
        ctx.fillStyle = players.p1.color;
        ctx.fillRect(players.p1.x, players.p1.y, players.p1.width, players.p1.height);
        ctx.fillStyle = players.p2.color;
        ctx.fillRect(players.p2.x, players.p2.y, players.p2.width, players.p2.height);
        
        // Obstacles
        this.obstacles.forEach(obs => {
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
};

// ===== GAME 3: PATTERN REPEAT =====
const patternRepeat = {
    pattern: [],
    playerPattern: [],
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
    displayIndex: 0,
    displayTime: 0,
    waitingForInput: false,
    
    init() {
        this.pattern = [];
        this.playerPattern = [];
        this.displayIndex = 0;
        this.displayTime = 0;
        this.waitingForInput = false;
        players.p1.score = 0;
        players.p2.score = 0;
        this.addToPattern();
    },
    
    addToPattern() {
        const newColor = Math.floor(Math.random() * this.colors.length);
        this.pattern.push(newColor);
        this.playerPattern = [];
        this.displayIndex = 0;
        this.displayTime = 60;
        this.waitingForInput = false;
    },
    
    update() {
        if (this.displayTime > 0) {
            this.displayTime--;
            return;
        }
        
        this.waitingForInput = true;
        
        // Player 1 input (WASD for colors)
        if (keys['w'] && this.playerPattern.length < this.pattern.length) {
            this.playerPattern.push(0);
            keys['w'] = false;
        }
        if (keys['a'] && this.playerPattern.length < this.pattern.length) {
            this.playerPattern.push(1);
            keys['a'] = false;
        }
        if (keys['s'] && this.playerPattern.length < this.pattern.length) {
            this.playerPattern.push(2);
            keys['s'] = false;
        }
        if (keys['d'] && this.playerPattern.length < this.pattern.length) {
            this.playerPattern.push(3);
            keys['d'] = false;
        }
        
        // Check pattern
        if (this.playerPattern.length > 0) {
            if (this.playerPattern[this.playerPattern.length - 1] !== this.pattern[this.playerPattern.length - 1]) {
                players.p2.score++;
                this.init();
                return;
            }
        }
        
        if (this.playerPattern.length === this.pattern.length) {
            players.p1.score++;
            this.addToPattern();
        }
    },
    
    draw() {
        // Display pattern as 4 colored squares
        const colors = [
            [100, 100, this.colors[0]],
            [300, 100, this.colors[1]],
            [500, 100, this.colors[2]],
            [700, 100, this.colors[3]]
        ];
        
        colors.forEach(([x, y, color], idx) => {
            ctx.fillStyle = color;
            ctx.globalAlpha = (this.displayTime > 0 && idx === this.pattern[this.displayIndex] ? 1 : 0.3);
            ctx.fillRect(x, y, 80, 80);
            ctx.globalAlpha = 1;
        });
        
        // Instructions
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Follow the pattern!', canvas.width / 2, 300);
        ctx.fillText(`Current: ${this.playerPattern.length} / ${this.pattern.length}`, canvas.width / 2, 400);
    }
};

// ===== GAME 4: TAP RACE =====
const tapRace = {
    p1Taps: 0,
    p2Taps: 0,
    p1LastKey: 0,
    p2LastKey: 0,
    target: 30,
    
    init() {
        this.p1Taps = 0;
        this.p2Taps = 0;
        this.target = 30;
        players.p1.score = 0;
        players.p2.score = 0;
    },
    
    update() {
        // Player 1: W key spam
        if (keys['w'] && gameState.gameTimer - this.p1LastKey > 0.05) {
            this.p1Taps++;
            this.p1LastKey = gameState.gameTimer;
            players.p1.score = this.p1Taps;
        }
        
        // Player 2: Up arrow spam
        if (keys['arrowup'] && gameState.gameTimer - this.p2LastKey > 0.05) {
            this.p2Taps++;
            this.p2LastKey = gameState.gameTimer;
            players.p2.score = this.p2Taps;
        }
    },
    
    draw() {
        // Progress bars
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(50, 200, (this.p1Taps / this.target) * 300, 60);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(50, 200, 300, 60);
        
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(450, 200, (this.p2Taps / this.target) * 300, 60);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(450, 200, 300, 60);
        
        // Text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`P1: ${this.p1Taps}`, 200, 150);
        ctx.fillText(`P2: ${this.p2Taps}`, 600, 150);
        ctx.font = '16px Arial';
        ctx.fillText('Mash W (P1) and Up Arrow (P2)!', canvas.width / 2, 400);
    }
};

// ===== GAME 5: COLOR MATCH =====
const colorMatch = {
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
    currentColor: 0,
    responseTime: 0,
    roundCount: 0,
    
    init() {
        this.roundCount = 0;
        players.p1.score = 0;
        players.p2.score = 0;
        this.nextColor();
    },
    
    nextColor() {
        this.currentColor = Math.floor(Math.random() * this.colors.length);
        this.responseTime = 0;
    },
    
    update() {
        this.responseTime++;
        
        let p1Input = -1, p2Input = -1;
        
        // Player 1 combos (WASD)
        if (keys['w'] && keys['a']) p1Input = 0;
        if (keys['w'] && keys['d']) p1Input = 1;
        if (keys['s'] && keys['a']) p1Input = 2;
        if (keys['s'] && keys['d']) p1Input = 3;
        
        // Player 2 combos (Arrow keys)
        if (keys['arrowup'] && keys['arrowleft']) p2Input = 0;
        if (keys['arrowup'] && keys['arrowright']) p2Input = 1;
        if (keys['arrowdown'] && keys['arrowleft']) p2Input = 2;
        if (keys['arrowdown'] && keys['arrowright']) p2Input = 3;
        
        if (p1Input === this.currentColor) {
            players.p1.score += Math.max(1, 10 - this.responseTime / 10);
            this.nextColor();
        }
        if (p2Input === this.currentColor) {
            players.p2.score += Math.max(1, 10 - this.responseTime / 10);
            this.nextColor();
        }
    },
    
    draw() {
        // Large color box
        ctx.fillStyle = this.colors[this.currentColor];
        ctx.fillRect(250, 100, 300, 200);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(250, 100, 300, 200);
        
        // Instructions
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press matching color combo!', canvas.width / 2, 350);
        ctx.font = '12px Arial';
        ctx.fillText('P1: W+A=Red, W+D=Cyan, S+A=Yellow, S+D=Green', canvas.width / 2, 380);
        ctx.fillText('P2: Up+Left=Red, Up+Right=Cyan, Down+Left=Yellow, Down+Right=Green', canvas.width / 2, 410);
    }
};

// ===== GAME 6: CHASE =====
const chase = {
    chaser: 0, // 0 = p1 chases p2, 1 = p2 chases p1
    cooldown: 0,
    
    init() {
        this.chaser = Math.random() > 0.5 ? 0 : 1;
        this.cooldown = 0;
        players.p1.score = 0;
        players.p2.score = 0;
        players.p1.x = 100;
        players.p1.y = 300;
        players.p2.x = 700;
        players.p2.y = 300;
    },
    
    update() {
        // Player 1 controls
        if (keys['w']) players.p1.y = Math.max(0, players.p1.y - players.p1.speed);
        if (keys['s']) players.p1.y = Math.min(canvas.height - players.p1.height, players.p1.y + players.p1.speed);
        if (keys['a']) players.p1.x = Math.max(0, players.p1.x - players.p1.speed);
        if (keys['d']) players.p1.x = Math.min(canvas.width - players.p1.width, players.p1.x + players.p1.speed);
        
        // Player 2 controls
        if (keys['arrowup']) players.p2.y = Math.max(0, players.p2.y - players.p2.speed);
        if (keys['arrowdown']) players.p2.y = Math.min(canvas.height - players.p2.height, players.p2.y + players.p2.speed);
        if (keys['arrowleft']) players.p2.x = Math.max(0, players.p2.x - players.p2.speed);
        if (keys['arrowright']) players.p2.x = Math.min(canvas.width - players.p2.width, players.p2.x + players.p2.speed);
        
        // Collision
        if (this.checkCollision(players.p1, players.p2)) {
            if (this.chaser === 0) {
                players.p1.score++;
            } else {
                players.p2.score++;
            }
            this.cooldown = 60;
        }
    },
    
    checkCollision(p1, p2) {
        return p1.x < p2.x + p2.width &&
               p1.x + p1.width > p2.x &&
               p1.y < p2.y + p2.height &&
               p1.y + p1.height > p2.y;
    },
    
    draw() {
        // Players with labels
        ctx.fillStyle = this.chaser === 0 ? '#FF6B6B' : 'rgba(255, 107, 107, 0.5)';
        ctx.fillRect(players.p1.x, players.p1.y, players.p1.width, players.p1.height);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.chaser === 0 ? 'CHASE' : 'EVADE', players.p1.x + players.p1.width / 2, players.p1.y - 5);
        
        ctx.fillStyle = this.chaser === 1 ? '#4ECDC4' : 'rgba(78, 205, 196, 0.5)';
        ctx.fillRect(players.p2.x, players.p2.y, players.p2.width, players.p2.height);
        ctx.fillStyle = '#333';
        ctx.fillText(this.chaser === 1 ? 'CHASE' : 'EVADE', players.p2.x + players.p2.width / 2, players.p2.y - 5);
    }
};

// ===== GAME 7: TARGET SHOOT =====
const targetShoot = {
    targets: [],
    spawnRate: 0,
    
    init() {
        this.targets = [];
        this.spawnRate = 0;
        players.p1.score = 0;
        players.p2.score = 0;
    },
    
    update() {
        this.spawnRate++;
        
        // Spawn targets
        if (this.spawnRate > 20 - Math.floor(gameState.gameTime - gameState.gameTimer)) {
            this.targets.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 15,
                owner: null
            });
            this.spawnRate = 0;
        }
        
        // Player 1 shoots (W or spacebar)
        if (keys['w'] || keys[' ']) {
            this.targets = this.targets.filter(t => {
                const dist = Math.sqrt(Math.pow(t.x - players.p1.x, 2) + Math.pow(t.y - players.p1.y, 2));
                if (dist < 100) {
                    players.p1.score++;
                    return false;
                }
                return true;
            });
        }
        
        // Player 2 shoots (Up arrow)
        if (keys['arrowup']) {
            this.targets = this.targets.filter(t => {
                const dist = Math.sqrt(Math.pow(t.x - players.p2.x, 2) + Math.pow(t.y - players.p2.y, 2));
                if (dist < 100) {
                    players.p2.score++;
                    return false;
                }
                return true;
            });
        }
        
        // Player movement
        if (keys['a']) players.p1.x = Math.max(0, players.p1.x - players.p1.speed);
        if (keys['d']) players.p1.x = Math.min(canvas.width - players.p1.width, players.p1.x + players.p1.speed);
        if (keys['s']) players.p1.y = Math.min(canvas.height - players.p1.height, players.p1.y + players.p1.speed);
        
        if (keys['arrowleft']) players.p2.x = Math.max(0, players.p2.x - players.p2.speed);
        if (keys['arrowright']) players.p2.x = Math.min(canvas.width - players.p2.width, players.p2.x + players.p2.speed);
        if (keys['arrowdown']) players.p2.y = Math.min(canvas.height - players.p2.height, players.p2.y + players.p2.speed);
    },
    
    draw() {
        // Players
        ctx.fillStyle = players.p1.color;
        ctx.fillRect(players.p1.x, players.p1.y, players.p1.width, players.p1.height);
        ctx.fillStyle = players.p2.color;
        ctx.fillRect(players.p2.x, players.p2.y, players.p2.width, players.p2.height);
        
        // Targets
        this.targets.forEach(t => {
            ctx.fillStyle = '#FFE66D';
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // Instructions
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Shoot targets! P1: W to shoot. P2: Up Arrow to shoot', canvas.width / 2, 30);
    }
};

// ===== GAME 8: SIMON SAYS =====
const simonSays = {
    sequence: [],
    playerSequence: [],
    displayIndex: 0,
    displayTime: 0,
    waitingForInput: false,
    directionMap: { 'up': 0, 'right': 1, 'down': 2, 'left': 3 },
    colors: ['#95E1D3', '#FFE66D', '#FF6B6B', '#4ECDC4'],
    
    init() {
        this.sequence = [];
        this.playerSequence = [];
        this.displayIndex = 0;
        this.displayTime = 0;
        this.waitingForInput = false;
        players.p1.score = 0;
        players.p2.score = 0;
        this.addToSequence();
    },
    
    addToSequence() {
        this.sequence.push(Math.floor(Math.random() * 4));
        this.playerSequence = [];
        this.displayIndex = 0;
        this.displayTime = 120;
        this.waitingForInput = false;
    },
    
    update() {
        if (this.displayTime > 0) {
            this.displayTime--;
            return;
        }
        
        this.waitingForInput = true;
        
        let input = -1;
        
        // Player 1 or 2 input (directional keys)
        if (keys['w'] || keys['arrowup']) input = 0;
        if (keys['d'] || keys['arrowright']) input = 1;
        if (keys['s'] || keys['arrowdown']) input = 2;
        if (keys['a'] || keys['arrowleft']) input = 3;
        
        if (input !== -1 && this.playerSequence.length < this.sequence.length) {
            this.playerSequence.push(input);
            
            if (this.playerSequence[this.playerSequence.length - 1] !== this.sequence[this.playerSequence.length - 1]) {
                if (input === 0 || input === 1) players.p1.score += 0; // P1 wrong
                else players.p2.score += 0; // P2 wrong
                this.init();
                return;
            }
        }
        
        if (this.playerSequence.length === this.sequence.length) {
            players.p1.score++;
            players.p2.score++;
            this.addToSequence();
        }
    },
    
    draw() {
        const directions = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        const positions = [
            [canvas.width / 2, 100],
            [canvas.width - 100, canvas.height / 2],
            [canvas.width / 2, canvas.height - 100],
            [100, canvas.height / 2]
        ];
        
        // Draw direction buttons
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = this.colors[i];
            ctx.globalAlpha = (this.displayTime > 0 && this.sequence[this.displayIndex] === i ? 1 : 0.3);
            ctx.beginPath();
            ctx.arc(positions[i][0], positions[i][1], 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Instructions
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Sequence: ${this.playerSequence.length} / ${this.sequence.length}`, canvas.width / 2, 350);
        ctx.font = '12px Arial';
        ctx.fillText('Both players use directional keys to follow the sequence', canvas.width / 2, 400);
    }
};

// ===== GAME 9: CATCH THE FALLING =====
const catchFalling = {
    items: [],
    spawnRate: 0,
    lives: 3,
    
    init() {
        this.items = [];
        this.spawnRate = 0;
        this.lives = 3;
        players.p1.score = 0;
        players.p2.score = 0;
        players.p1.x = 50;
        players.p1.y = 500;
        players.p2.x = canvas.width - 90;
        players.p2.y = 500;
    },
    
    update() {
        this.spawnRate++;
        
        // Spawn items
        if (this.spawnRate > 30 - Math.floor(gameState.gameTime - gameState.gameTimer)) {
            this.items.push({
                x: Math.random() < 0.5 ? Math.random() * (canvas.width / 2) : canvas.width / 2 + Math.random() * (canvas.width / 2),
                y: 0,
                width: 25,
                height: 25,
                caught: false
            });
            this.spawnRate = 0;
        }
        
        // Update items
        this.items.forEach(item => item.y += 4);
        
        // Player 1 controls
        if (keys['a']) players.p1.x = Math.max(0, players.p1.x - players.p1.speed);
        if (keys['d']) players.p1.x = Math.min(canvas.width / 2 - players.p1.width, players.p1.x + players.p1.speed);
        
        // Player 2 controls
        if (keys['arrowleft']) players.p2.x = Math.max(canvas.width / 2, players.p2.x - players.p2.speed);
        if (keys['arrowright']) players.p2.x = Math.min(canvas.width - players.p2.width, players.p2.x + players.p2.speed);
        
        // Collision detection
        this.items.forEach(item => {
            if (item.y > canvas.height) {
                players.p2.score++;
                item.caught = true;
            } else if (this.checkCollision(item, players.p1)) {
                players.p1.score++;
                item.caught = true;
            } else if (this.checkCollision(item, players.p2)) {
                players.p2.score++;
                item.caught = true;
            }
        });
        
        this.items = this.items.filter(item => !item.caught && item.y < canvas.height + 50);
    },
    
    checkCollision(item, player) {
        return item.x < player.x + player.width &&
               item.x + item.width > player.x &&
               item.y < player.y + player.height &&
               item.y + item.height > player.y;
    },
    
    draw() {
        // Center line
        ctx.strokeStyle = '#ddd';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Players
        ctx.fillStyle = players.p1.color;
        ctx.fillRect(players.p1.x, players.p1.y, players.p1.width, players.p1.height);
        ctx.fillStyle = players.p2.color;
        ctx.fillRect(players.p2.x, players.p2.y, players.p2.width, players.p2.height);
        
        // Items
        this.items.forEach(item => {
            ctx.fillStyle = '#FFE66D';
            ctx.fillRect(item.x, item.y, item.width, item.height);
        });
    }
};

// ===== GAME 10: SYNCHRONIZED MOVEMENT =====
const syncMovement = {
    targets: [],
    matchCount: 0,
    
    init() {
        this.targets = [];
        this.matchCount = 0;
        players.p1.score = 0;
        players.p2.score = 0;
        this.generateTargets();
    },
    
    generateTargets() {
        this.targets = [
            { x: Math.random() * (canvas.width - 80), y: Math.random() * (canvas.height - 80), matched: false }
        ];
    },
    
    update() {
        // Player 1 controls
        if (keys['w']) players.p1.y = Math.max(0, players.p1.y - players.p1.speed);
        if (keys['s']) players.p1.y = Math.min(canvas.height - players.p1.height, players.p1.y + players.p1.speed);
        if (keys['a']) players.p1.x = Math.max(0, players.p1.x - players.p1.speed);
        if (keys['d']) players.p1.x = Math.min(canvas.width - players.p1.width, players.p1.x + players.p1.speed);
        
        // Player 2 controls
        if (keys['arrowup']) players.p2.y = Math.max(0, players.p2.y - players.p2.speed);
        if (keys['arrowdown']) players.p2.y = Math.min(canvas.height - players.p2.height, players.p2.y + players.p2.speed);
        if (keys['arrowleft']) players.p2.x = Math.max(0, players.p2.x - players.p2.speed);
        if (keys['arrowright']) players.p2.x = Math.min(canvas.width - players.p2.width, players.p2.x + players.p2.speed);
        
        // Check if both players are at target
        if (this.targets.length > 0 && !this.targets[0].matched) {
            const p1AtTarget = Math.abs(players.p1.x - this.targets[0].x) < 50 && Math.abs(players.p1.y - this.targets[0].y) < 50;
            const p2AtTarget = Math.abs(players.p2.x - this.targets[0].x) < 50 && Math.abs(players.p2.y - this.targets[0].y) < 50;
            
            if (p1AtTarget && p2AtTarget) {
                players.p1.score++;
                players.p2.score++;
                this.targets[0].matched = true;
                this.generateTargets();
            }
        }
    },
    
    draw() {
        // Players
        ctx.fillStyle = players.p1.color;
        ctx.fillRect(players.p1.x, players.p1.y, players.p1.width, players.p1.height);
        ctx.fillStyle = players.p2.color;
        ctx.fillRect(players.p2.x, players.p2.y, players.p2.width, players.p2.height);
        
        // Target zone
        if (this.targets.length > 0) {
            ctx.fillStyle = '#95E1D3';
            ctx.globalAlpha = 0.3;
            ctx.fillRect(this.targets[0].x, this.targets[0].y, 80, 80);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#95E1D3';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.targets[0].x, this.targets[0].y, 80, 80);
        }
        
        // Instructions
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Both players move to the target zone together!', canvas.width / 2, 30);
    }
};
