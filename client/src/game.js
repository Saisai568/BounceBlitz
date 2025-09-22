/**
 * Ball Bouncing Game - Game Logic
 * A single-player ball bouncing game similar to Breakout/Pong
 */

class BallBouncingGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.lastTime = 0;
        
        // Ball properties
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            vx: 4,
            vy: 4,
            radius: 10,
            speed: 4,
            maxSpeed: 12,
            trail: []
        };
        
        // Paddle properties
        this.paddle = {
            x: this.width / 2 - 60,
            y: this.height - 30,
            width: 120,
            height: 15,
            speed: 8,
            color: '#4CAF50'
        };
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        
        // Audio
        this.soundEnabled = true;
        this.setupAudio();
        
        // Game loop
        this.animationFrame = null;
        
        // Visual effects
        this.particles = [];
        this.screenShake = 0;
        
        // Level progression
        this.scoreThreshold = 10; // Points needed to advance level
        this.speedIncrement = 0.5; // Speed increase per level
        
        console.log('Ball Bouncing Game initialized');
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
            
            // Handle pause
            if (e.key.toLowerCase() === 'p' && this.gameState === 'playing') {
                this.pauseGame();
            } else if (e.key.toLowerCase() === 'p' && this.gameState === 'paused') {
                this.resumeGame();
            }
            
            // Handle sound toggle
            if (e.key.toLowerCase() === 'm') {
                this.toggleSound();
            }
            
            console.log(`Key pressed: ${e.key}`);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
        
        // Prevent arrow key scrolling
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    setupAudio() {
        this.hitSound = document.getElementById('hitSound');
        this.successSound = document.getElementById('successSound');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        
        // Set volumes
        if (this.hitSound) this.hitSound.volume = 0.3;
        if (this.successSound) this.successSound.volume = 0.5;
        if (this.backgroundMusic) this.backgroundMusic.volume = 0.2;
    }
    
    playSound(soundElement) {
        if (!this.soundEnabled || !soundElement) return;
        
        try {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => console.log('Sound play prevented:', e));
        } catch (e) {
            console.log('Sound error:', e);
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.backgroundMusic) {
            if (this.soundEnabled && this.gameState === 'playing') {
                this.backgroundMusic.play().catch(e => console.log('Music play prevented:', e));
            } else {
                this.backgroundMusic.pause();
            }
        }
        console.log(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    }
    
    startGame() {
        this.gameState = 'playing';
        this.resetBall();
        this.hideAllScreens();
        
        if (this.soundEnabled && this.backgroundMusic) {
            this.backgroundMusic.play().catch(e => console.log('Music play prevented:', e));
        }
        
        this.gameLoop();
        console.log('Game started');
    }
    
    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        this.showScreen('pauseScreen');
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        
        console.log('Game paused');
    }
    
    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        this.hideAllScreens();
        
        if (this.soundEnabled && this.backgroundMusic) {
            this.backgroundMusic.play().catch(e => console.log('Music play prevented:', e));
        }
        
        console.log('Game resumed');
    }
    
    endGame() {
        this.gameState = 'gameOver';
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        
        // Update final score display
        const finalScoreElement = document.getElementById('finalScore');
        if (finalScoreElement) {
            finalScoreElement.textContent = `Final Score: ${this.score}`;
        }
        
        this.showScreen('gameOverScreen');
        console.log(`Game over. Final score: ${this.score}`);
    }
    
    restartGame() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.ball.speed = 4;
        this.particles = [];
        this.screenShake = 0;
        
        // Update UI
        this.updateUI();
        
        // Start new game
        this.startGame();
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        
        // Random angle between -60 and 60 degrees, but not too vertical
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        const speed = this.ball.speed;
        
        this.ball.vx = Math.sin(angle) * speed;
        this.ball.vy = Math.cos(angle) * speed;
        
        // Ensure ball moves downward initially
        if (this.ball.vy < 0) this.ball.vy = -this.ball.vy;
        
        this.ball.trail = [];
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.updatePaddle(deltaTime);
        this.updateBall(deltaTime);
        this.updateParticles(deltaTime);
        this.updateScreenShake(deltaTime);
        this.checkLevelProgression();
    }
    
    updatePaddle(deltaTime) {
        const paddleSpeed = this.paddle.speed;
        
        // Handle paddle movement
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.paddle.x -= paddleSpeed;
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.paddle.x += paddleSpeed;
        }
        
        // Keep paddle within bounds
        this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
    }
    
    updateBall(deltaTime) {
        // Add to trail
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > 10) {
            this.ball.trail.shift();
        }
        
        // Update position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Wall collisions
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.width) {
            this.ball.vx = -this.ball.vx;
            this.ball.x = Math.max(this.ball.radius, Math.min(this.width - this.ball.radius, this.ball.x));
            this.playSound(this.hitSound);
            this.addParticles(this.ball.x, this.ball.y, '#FFD700');
            this.screenShake = 5;
        }
        
        // Top wall collision
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.vy = -this.ball.vy;
            this.ball.y = this.ball.radius;
            this.playSound(this.hitSound);
            this.addParticles(this.ball.x, this.ball.y, '#FFD700');
            this.screenShake = 5;
        }
        
        // Paddle collision
        this.checkPaddleCollision();
        
        // Bottom boundary (game over condition)
        if (this.ball.y - this.ball.radius > this.height) {
            this.loseLife();
        }
    }
    
    checkPaddleCollision() {
        const ballBottom = this.ball.y + this.ball.radius;
        const ballTop = this.ball.y - this.ball.radius;
        const ballLeft = this.ball.x - this.ball.radius;
        const ballRight = this.ball.x + this.ball.radius;
        
        const paddleTop = this.paddle.y;
        const paddleBottom = this.paddle.y + this.paddle.height;
        const paddleLeft = this.paddle.x;
        const paddleRight = this.paddle.x + this.paddle.width;
        
        // Check if ball intersects with paddle
        if (ballBottom >= paddleTop && ballTop <= paddleBottom &&
            ballRight >= paddleLeft && ballLeft <= paddleRight &&
            this.ball.vy > 0) {
            
            // Calculate hit position relative to paddle center (-1 to 1)
            const paddleCenter = paddleLeft + this.paddle.width / 2;
            const hitPos = (this.ball.x - paddleCenter) / (this.paddle.width / 2);
            
            // Adjust ball velocity based on hit position
            const maxBounceAngle = Math.PI / 3; // 60 degrees
            const bounceAngle = hitPos * maxBounceAngle;
            
            const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
            this.ball.vx = Math.sin(bounceAngle) * speed;
            this.ball.vy = -Math.abs(Math.cos(bounceAngle) * speed); // Ensure upward movement
            
            // Position ball above paddle
            this.ball.y = paddleTop - this.ball.radius;
            
            // Increase score
            this.score += 1;
            this.updateUI();
            
            // Visual effects
            this.playSound(this.successSound);
            this.addParticles(this.ball.x, paddleTop, this.paddle.color);
            this.screenShake = 8;
            
            console.log(`Paddle hit! Score: ${this.score}`);
        }
    }
    
    loseLife() {
        this.lives -= 1;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.endGame();
        } else {
            // Reset ball position after a short delay
            setTimeout(() => {
                if (this.gameState === 'playing') {
                    this.resetBall();
                }
            }, 1000);
        }
        
        // Visual effect for life lost
        this.addParticles(this.ball.x, this.height, '#FF4444');
        this.screenShake = 15;
        
        console.log(`Life lost! Lives remaining: ${this.lives}`);
    }
    
    checkLevelProgression() {
        const newLevel = Math.floor(this.score / this.scoreThreshold) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            
            // Increase ball speed
            this.ball.speed = Math.min(this.ball.maxSpeed, 4 + (this.level - 1) * this.speedIncrement);
            
            // Normalize velocity to new speed
            const currentSpeed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
            this.ball.vx = (this.ball.vx / currentSpeed) * this.ball.speed;
            this.ball.vy = (this.ball.vy / currentSpeed) * this.ball.speed;
            
            this.updateUI();
            
            console.log(`Level up! Level: ${this.level}, Speed: ${this.ball.speed}`);
        }
    }
    
    addParticles(x, y, color) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: color,
                life: 1.0,
                decay: 0.02
            });
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateScreenShake(deltaTime) {
        if (this.screenShake > 0) {
            this.screenShake -= 0.5;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 17, 34, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Apply screen shake
        if (this.screenShake > 0) {
            this.ctx.save();
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // Render game objects
        this.renderBall();
        this.renderPaddle();
        this.renderParticles();
        this.renderUI();
        
        // Restore context if screen shake was applied
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
    }
    
    renderBall() {
        // Render trail
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < this.ball.trail.length; i++) {
            const trail = this.ball.trail[i];
            const alpha = (i / this.ball.trail.length) * 0.3;
            this.ctx.globalAlpha = alpha;
            
            this.ctx.fillStyle = '#4FC3F7';
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, this.ball.radius * (i / this.ball.trail.length), 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Render ball
        this.ctx.globalAlpha = 1.0;
        
        // Outer glow
        const gradient = this.ctx.createRadialGradient(
            this.ball.x, this.ball.y, 0,
            this.ball.x, this.ball.y, this.ball.radius * 2
        );
        gradient.addColorStop(0, 'rgba(79, 195, 247, 0.8)');
        gradient.addColorStop(0.7, 'rgba(79, 195, 247, 0.3)');
        gradient.addColorStop(1, 'rgba(79, 195, 247, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball body
        const ballGradient = this.ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        ballGradient.addColorStop(0, '#81D4FA');
        ballGradient.addColorStop(1, '#0277BD');
        
        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - 3, this.ball.y - 3, this.ball.radius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    renderPaddle() {
        // Paddle shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(this.paddle.x + 2, this.paddle.y + 2, this.paddle.width, this.paddle.height);
        
        // Paddle gradient
        const paddleGradient = this.ctx.createLinearGradient(
            this.paddle.x, this.paddle.y,
            this.paddle.x, this.paddle.y + this.paddle.height
        );
        paddleGradient.addColorStop(0, '#66BB6A');
        paddleGradient.addColorStop(1, '#2E7D32');
        
        this.ctx.fillStyle = paddleGradient;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Paddle highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, 3);
    }
    
    renderParticles() {
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1.0;
    }
    
    renderUI() {
        // Speed indicator
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Speed: ${this.ball.speed.toFixed(1)}`, this.width - 10, 25);
        
        // FPS counter (for development)
        if (this.lastTime > 0) {
            const fps = Math.round(1000 / (Date.now() - this.lastTime));
            this.ctx.fillText(`FPS: ${fps}`, this.width - 10, 45);
        }
    }
    
    updateUI() {
        // Update score, lives, and level displays
        const scoreElement = document.getElementById('score');
        const livesElement = document.getElementById('lives');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (livesElement) livesElement.textContent = this.lives;
        if (levelElement) levelElement.textContent = this.level;
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
        
        const overlay = document.getElementById('gameOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
    
    hideAllScreens() {
        const screens = ['startScreen', 'gameOverScreen', 'pauseScreen'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.add('hidden');
            }
        });
        
        const overlay = document.getElementById('gameOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }
}

// Export for use in main.js
window.BallBouncingGame = BallBouncingGame;
