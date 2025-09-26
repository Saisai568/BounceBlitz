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
        
        // i18n
        this.supportedLanguages = ['en', 'zh-TW', 'ja'];
        this.translations = {
            en: {
                title: 'Ball Bouncing Game',
                score: 'Score:',
                lives: 'Lives:',
                level: 'Level:',
                start_title: 'Ball Bouncing Game',
                start_tip1: 'Use arrow keys or A/D to move the paddle',
                start_tip2: 'Keep the ball from falling off the bottom!',
                start: 'Start Game',
                game_over: 'Game Over!',
                final_score: 'Final Score: {score}',
                play_again: 'Play Again',
                paused: 'Game Paused',
                press_p_to_resume: 'Press P to resume',
                settings_title: 'Game Settings',
                paddle_width: 'Paddle Width:',
                initial_ball_speed: 'Initial Ball Speed:',
                sound_effects: 'Sound Effects:',
                apply_settings: 'Apply Settings',
                reset_defaults: 'Reset Defaults',
                close: 'Close',
                move_paddle: 'Move paddle',
                pause_resume: 'Pause/Resume',
                toggle_sound: 'Toggle sound',
                settings: 'Settings',
                speed: 'Speed: {speed}',
                fps: 'FPS: {fps}',
                language: 'Language:',
                lang_en: 'English',
                lang_zhTW: 'Traditional Chinese',
                lang_ja: 'Japanese'
            },
            'zh-TW': {
                title: '彈球遊戲',
                score: '分數：',
                lives: '生命：',
                level: '關卡：',
                start_title: '彈球遊戲',
                start_tip1: '使用方向鍵或 A/D 移動擋板',
                start_tip2: '讓球不要掉到下面！',
                start: '開始遊戲',
                game_over: '遊戲結束！',
                final_score: '最終分數：{score}',
                play_again: '再玩一次',
                paused: '已暫停',
                press_p_to_resume: '按 P 繼續',
                settings_title: '遊戲設定',
                paddle_width: '擋板寬度：',
                initial_ball_speed: '初始球速：',
                sound_effects: '音效：',
                apply_settings: '套用設定',
                reset_defaults: '回復預設',
                close: '關閉',
                move_paddle: '移動擋板',
                pause_resume: '暫停/繼續',
                toggle_sound: '切換音效',
                settings: '設定',
                speed: '速度：{speed}',
                fps: 'FPS：{fps}',
                language: '語言：',
                lang_en: '英文',
                lang_zhTW: '繁體中文',
                lang_ja: '日文'
            },
            ja: {
                title: 'ボールバウンドゲーム',
                score: 'スコア:',
                lives: 'ライフ:',
                level: 'レベル:',
                start_title: 'ボールバウンドゲーム',
                start_tip1: '矢印キーまたは A/D でパドルを移動',
                start_tip2: 'ボールを落とさないように！',
                start: 'ゲーム開始',
                game_over: 'ゲームオーバー！',
                final_score: '最終スコア: {score}',
                play_again: 'もう一度',
                paused: '一時停止中',
                press_p_to_resume: 'P キーで再開',
                settings_title: 'ゲーム設定',
                paddle_width: 'パドル幅:',
                initial_ball_speed: '初期ボール速度:',
                sound_effects: '効果音:',
                apply_settings: '設定を適用',
                reset_defaults: 'デフォルトに戻す',
                close: '閉じる',
                move_paddle: 'パドルを移動',
                pause_resume: '一時停止/再開',
                toggle_sound: 'サウンド切替',
                settings: '設定',
                speed: '速度: {speed}',
                fps: 'FPS: {fps}',
                language: '言語:',
                lang_en: '英語',
                lang_zhTW: '繁体字中国語',
                lang_ja: '日本語'
            }
        };
        this.language = this.loadLanguage ? this.loadLanguage() : (document.documentElement.getAttribute('lang') || 'en');
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.lastTime = 0;
        this.ballLost = false; // Prevent multiple life losses
        
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
        
        // Level progression (score threshold removed - levels advance by brick clearing only)
        this.speedIncrement = 0.5; // Speed increase per level
        
        // Bricks system
        this.bricks = [];
        this.brickRows = 6;
        this.brickCols = 10;
        this.brickWidth = 75;
        this.brickHeight = 25;
        this.brickPadding = 5;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 35;
        this.brickColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
        
        // Settings
        this.settings = {
            paddleWidth: 120,
            initialSpeed: 4,
            soundEnabled: true
        };
        this.previousScreen = null; // For settings screen navigation
        this.loadSettings();
        
        // Initialize bricks
        this.createBricks();
        
        this.setupSettingsListeners();
        // Apply initial translations to static DOM
        this.applyTranslationsToDOM();
        console.log('Ball Bouncing Game initialized with', this.bricks.length, 'bricks');
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
                // Persist sound setting to match settings menu
                this.settings.soundEnabled = this.soundEnabled;
                this.saveSettings();
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
        
        // Fix pause/reset edge case - if ball was lost during pause, reset it now
        if (this.ballLost) {
            this.resetBall();
        }
        
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
            finalScoreElement.textContent = this.t('final_score', { score: this.score });
        }
        
        this.showScreen('gameOverScreen');
        console.log(`Game over. Final score: ${this.score}`);
    }
    
    restartGame() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.ball.speed = this.settings.initialSpeed; // Use settings instead of hardcoded value
        this.particles = [];
        this.screenShake = 0;
        this.ballLost = false; // Reset ball lost flag
        
        // Recreate bricks
        this.createBricks();
        
        // Update UI
        this.updateUI();
        
        // Start new game
        this.startGame();
    }
    
    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        
        // Use current ball speed (preserve level-based speed) or fallback to initial speed
        const speed = this.ball.speed ?? this.settings.initialSpeed;
        this.ball.speed = speed;
        
        // Random angle between -60 and 60 degrees, but not too vertical
        const angle = (Math.random() - 0.5) * Math.PI / 3;
        
        this.ball.vx = Math.sin(angle) * speed;
        this.ball.vy = Math.cos(angle) * speed;
        
        // Ensure ball moves downward initially
        if (this.ball.vy < 0) this.ball.vy = -this.ball.vy;
        
        this.ball.trail = [];
        this.ballLost = false; // Reset the ball lost flag
    }
    
    createBricks() {
        this.bricks = [];
        
        for (let row = 0; row < this.brickRows; row++) {
            for (let col = 0; col < this.brickCols; col++) {
                const brick = {
                    x: this.brickOffsetLeft + col * (this.brickWidth + this.brickPadding),
                    y: this.brickOffsetTop + row * (this.brickHeight + this.brickPadding),
                    width: this.brickWidth,
                    height: this.brickHeight,
                    color: this.brickColors[row % this.brickColors.length],
                    points: (this.brickRows - row) * 10, // Higher rows worth more points
                    visible: true
                };
                this.bricks.push(brick);
            }
        }
        
        console.log(`Created ${this.bricks.length} bricks in ${this.brickRows} rows`);
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.updatePaddle(deltaTime);
        this.updateBall(deltaTime);
        this.updateParticles(deltaTime);
        this.updateScreenShake(deltaTime);
        // Note: Level progression now handled only by brick clearing in checkLevelComplete
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
        
        // Brick collision
        this.checkBrickCollision();
        
        // Paddle collision
        this.checkPaddleCollision();
        
        // Bottom boundary (game over condition)
        if (this.ball.y - this.ball.radius > this.height && !this.ballLost) {
            this.ballLost = true;
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
    
    checkBrickCollision() {
        for (let i = 0; i < this.bricks.length; i++) {
            const brick = this.bricks[i];
            if (!brick.visible) continue;
            
            // Check collision between ball and brick
            if (this.ball.x + this.ball.radius >= brick.x &&
                this.ball.x - this.ball.radius <= brick.x + brick.width &&
                this.ball.y + this.ball.radius >= brick.y &&
                this.ball.y - this.ball.radius <= brick.y + brick.height) {
                
                // Determine which side of the brick was hit
                const ballCenterX = this.ball.x;
                const ballCenterY = this.ball.y;
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;
                
                const deltaX = ballCenterX - brickCenterX;
                const deltaY = ballCenterY - brickCenterY;
                
                // Determine collision side based on overlap
                if (Math.abs(deltaX / brick.width) > Math.abs(deltaY / brick.height)) {
                    // Hit left or right side
                    this.ball.vx = -this.ball.vx;
                } else {
                    // Hit top or bottom side
                    this.ball.vy = -this.ball.vy;
                }
                
                // Destroy the brick
                brick.visible = false;
                
                // Add score
                this.score += brick.points;
                this.updateUI();
                
                // Visual effects
                this.playSound(this.hitSound);
                this.addParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
                this.screenShake = 6;
                
                // Check if all bricks are destroyed
                this.checkLevelComplete();
                
                console.log(`Brick destroyed! Score: ${this.score}`);
                break; // Only hit one brick per frame
            }
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
    
    // Level progression is now handled exclusively by brick clearing in checkLevelComplete/advanceLevel
    // Score-based leveling disabled to prevent conflicts with Breakout gameplay
    
    checkLevelComplete() {
        const visibleBricks = this.bricks.filter(brick => brick.visible);
        if (visibleBricks.length === 0) {
            // All bricks destroyed - advance to next level
            this.advanceLevel();
        }
    }
    
    advanceLevel() {
        // Increase level
        this.level += 1;
        
        // Increase ball speed for new level
        this.ball.speed = Math.min(this.ball.maxSpeed, this.settings.initialSpeed + (this.level - 1) * this.speedIncrement);
        
        // Create new bricks
        this.createBricks();
        
        // Reset ball position with new speed
        this.resetBall();
        
        // Award bonus points for completing level
        this.score += 100 * this.level;
        
        // Update UI
        this.updateUI();
        
        // Visual effects
        this.addParticles(this.width / 2, this.height / 2, '#FFD700');
        this.screenShake = 10;
        
        console.log(`Level complete! Advanced to level ${this.level}, Speed: ${this.ball.speed}`);
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
        this.renderBricks();
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
    
    renderBricks() {
        for (const brick of this.bricks) {
            if (!brick.visible) continue;
            
            // Brick shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(brick.x + 2, brick.y + 2, brick.width, brick.height);
            
            // Brick gradient
            const brickGradient = this.ctx.createLinearGradient(
                brick.x, brick.y,
                brick.x, brick.y + brick.height
            );
            brickGradient.addColorStop(0, brick.color);
            brickGradient.addColorStop(1, this.darkenColor(brick.color, 0.3));
            
            this.ctx.fillStyle = brickGradient;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            // Brick highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(brick.x, brick.y, brick.width, 3);
            
            // Brick border
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
    }
    
    darkenColor(color, amount) {
        // Simple color darkening function
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
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
        this.ctx.fillText(this.t('speed', { speed: this.ball.speed.toFixed(1) }), this.width - 10, 25);
        
        // FPS counter (for development)
        if (this.lastTime > 0) {
            const fps = Math.round(1000 / (Date.now() - this.lastTime));
            this.ctx.fillText(this.t('fps', { fps: fps }), this.width - 10, 45);
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
        const screens = ['startScreen', 'gameOverScreen', 'pauseScreen', 'settingsScreen'];
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
    
    loadSettings() {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('ballBouncingGameSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            } catch (e) {
                console.log('Error loading settings:', e);
            }
        }
        
        // Apply settings to game objects
        this.applySettings();
    }
    
    saveSettings() {
        localStorage.setItem('ballBouncingGameSettings', JSON.stringify(this.settings));
        console.log('Settings saved:', this.settings);
    }
    
    applySettings() {
        // Apply paddle width
        this.paddle.width = this.settings.paddleWidth;
        
        // Clamp paddle position to new bounds
        this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x));
        
        // Apply initial ball speed only at game start, not during level progression
        if (this.gameState === 'start') {
            this.ball.speed = this.settings.initialSpeed;
        }
        
        // Apply sound setting immediately
        this.soundEnabled = this.settings.soundEnabled;
        if (this.backgroundMusic) {
            if (this.soundEnabled && this.gameState === 'playing') {
                this.backgroundMusic.play().catch(e => console.log('Music play prevented:', e));
            } else {
                this.backgroundMusic.pause();
            }
        }
        
        console.log('Settings applied:', this.settings);
    }
    
    setupSettingsListeners() {
        // Settings button
        const settingsButton = document.getElementById('settingsButton');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // Settings controls
        const paddleWidthSlider = document.getElementById('paddleWidth');
        const ballSpeedSlider = document.getElementById('ballSpeed');
        const soundToggle = document.getElementById('soundToggle');
        const languageSelect = document.getElementById('languageSelect');
        
        if (paddleWidthSlider) {
            paddleWidthSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('paddleWidthValue').textContent = value;
            });
        }
        
        if (ballSpeedSlider) {
            ballSpeedSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById('ballSpeedValue').textContent = value.toFixed(1);
            });
        }

        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                const newLang = e.target.value;
                this.setLanguage(newLang);
            });
        }
        
        // Settings buttons
        const applySettings = document.getElementById('applySettings');
        const resetDefaults = document.getElementById('resetDefaults');
        const closeSettings = document.getElementById('closeSettings');
        
        if (applySettings) {
            applySettings.addEventListener('click', () => {
                this.saveCurrentSettings();
                this.restorePreviousScreen();
            });
        }
        
        if (resetDefaults) {
            resetDefaults.addEventListener('click', () => {
                this.resetDefaultSettings();
            });
        }
        
        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.loadSettingsUI(); // Reset UI to saved values
                this.restorePreviousScreen();
            });
        }
    }
    
    showSettings() {
        // Store current screen state for restoration
        if (this.gameState === 'playing') {
            this.previousScreen = 'playing';
            this.pauseGame();
        } else if (this.gameState === 'start') {
            this.previousScreen = 'start';
        } else if (this.gameState === 'paused') {
            this.previousScreen = 'paused';
        } else {
            this.previousScreen = null;
        }
        
        this.loadSettingsUI();
        this.showScreen('settingsScreen');
    }
    
    loadSettingsUI() {
        // Update UI elements with current settings
        const paddleWidthSlider = document.getElementById('paddleWidth');
        const ballSpeedSlider = document.getElementById('ballSpeed');
        const soundToggle = document.getElementById('soundToggle');
        const languageSelect = document.getElementById('languageSelect');
        
        if (paddleWidthSlider) {
            paddleWidthSlider.value = this.settings.paddleWidth;
            document.getElementById('paddleWidthValue').textContent = this.settings.paddleWidth;
        }
        
        if (ballSpeedSlider) {
            ballSpeedSlider.value = this.settings.initialSpeed;
            document.getElementById('ballSpeedValue').textContent = this.settings.initialSpeed.toFixed(1);
        }
        
        if (soundToggle) {
            soundToggle.checked = this.settings.soundEnabled;
        }

        if (languageSelect) {
            languageSelect.value = this.language;
        }

        // Ensure labels reflect current language when opening settings
        this.applyTranslationsToDOM();
    }
    
    saveCurrentSettings() {
        // Get values from UI
        const paddleWidthSlider = document.getElementById('paddleWidth');
        const ballSpeedSlider = document.getElementById('ballSpeed');
        const soundToggle = document.getElementById('soundToggle');
        const languageSelect = document.getElementById('languageSelect');
        
        if (paddleWidthSlider) {
            this.settings.paddleWidth = parseInt(paddleWidthSlider.value);
        }
        
        if (ballSpeedSlider) {
            this.settings.initialSpeed = parseFloat(ballSpeedSlider.value);
        }
        
        if (soundToggle) {
            this.settings.soundEnabled = soundToggle.checked;
        }

        if (languageSelect) {
            const newLang = languageSelect.value;
            if (this.supportedLanguages.includes(newLang)) {
                this.setLanguage(newLang);
            }
        }
        
        // Apply and save settings
        this.applySettings();
        this.saveSettings();
    }
    
    resetDefaultSettings() {
        this.settings = {
            paddleWidth: 120,
            initialSpeed: 4,
            soundEnabled: true
        };
        
        this.applySettings();
        this.loadSettingsUI();
        console.log('Settings reset to defaults');
    }
    
    restorePreviousScreen() {
        this.hideAllScreens();
        
        if (this.previousScreen === 'playing') {
            // Resume the game
            this.resumeGame();
        } else if (this.previousScreen === 'start') {
            // Return to start screen
            this.showScreen('startScreen');
        } else if (this.previousScreen === 'paused') {
            // Return to pause screen
            this.showScreen('pauseScreen');
        }
        // If previousScreen is null, just hide all screens
        
        this.previousScreen = null;
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    // i18n helpers
    t(key, vars = {}) {
        const dict = this.translations && this.translations[this.language] ? this.translations[this.language] : (this.translations ? this.translations['en'] : {});
        let text = (dict && dict[key]) || key;
        for (const k in vars) {
            text = text.replace(`{${k}}`, vars[k]);
        }
        return text;
    }
    
    loadLanguage() {
        const saved = localStorage.getItem('ballBouncingGameLanguage');
        if (saved && this.supportedLanguages.includes(saved)) return saved;
        const htmlLang = (document.documentElement.getAttribute('lang') || '').trim();
        if (this.supportedLanguages.includes(htmlLang)) return htmlLang;
        const nav = (navigator.language || '').trim();
        if (this.supportedLanguages.includes(nav)) return nav;
        if (nav.startsWith('zh')) return 'zh-TW';
        if (nav.startsWith('ja')) return 'ja';
        return 'en';
    }
    
    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return;
        this.language = lang;
        localStorage.setItem('ballBouncingGameLanguage', lang);
        document.documentElement.setAttribute('lang', lang);
        this.applyTranslationsToDOM();
        this.render();
    }
    
    applyTranslationsToDOM() {
        const map = {
            title: ['pageTitle', 'titleText'],
            score: ['scoreLabel'],
            lives: ['livesLabel'],
            level: ['levelLabel'],
            start_title: ['startTitle'],
            start_tip1: ['startTip1'],
            start_tip2: ['startTip2'],
            start: ['startButton'],
            game_over: ['gameOverTitle'],
            final_score: ['finalScore'],
            play_again: ['restartButton'],
            paused: ['pauseTitle'],
            press_p_to_resume: ['pauseTip'],
            settings_title: ['settingsTitle'],
            paddle_width: ['labelPaddleWidth'],
            initial_ball_speed: ['labelBallSpeed'],
            sound_effects: ['labelSoundEffects'],
            apply_settings: ['applySettings'],
            reset_defaults: ['resetDefaults'],
            close: ['closeSettings'],
            move_paddle: ['descMove'],
            pause_resume: ['descPause'],
            toggle_sound: ['descSound'],
            settings: ['settingsButton'],
            language: ['labelLanguage'],
            lang_en: ['langOptEn'],
            lang_zhTW: ['langOptZhTW'],
            lang_ja: ['langOptJa']
        };
        for (const key in map) {
            const ids = map[key];
            const text = this.t(key, { score: this.score });
            for (const id of ids) {
                const el = document.getElementById(id);
                if (!el) continue;
                const tag = (el.tagName || '').toUpperCase();
                try {
                    if (id === 'finalScore') {
                        el.textContent = this.t('final_score', { score: this.score });
                        continue;
                    }
                    if (tag === 'INPUT') {
                        el.setAttribute('aria-label', text);
                        continue;
                    }
                    if (tag === 'SELECT' || tag === 'OPTION') {
                        el.textContent = text;
                        el.setAttribute('aria-label', text);
                        continue;
                    }
                    if (tag === 'BUTTON') {
                        el.textContent = text;
                        el.setAttribute('title', text);
                        continue;
                    }
                    if (tag === 'SPAN' || tag === 'DIV' || /^H[1-6]$/.test(tag) || tag === 'LABEL' || tag === 'TITLE') {
                        el.textContent = text;
                        continue;
                    }
                } catch (e) {
                    console.warn('i18n apply failed for', id, e);
                }
            }
        }
    }
}

// Export for use in main.js
window.BallBouncingGame = BallBouncingGame;
