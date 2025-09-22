/**
 * Ball Bouncing Game - Main Entry Point
 * Initializes the game and handles UI interactions
 */

let game = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Ball Bouncing Game loading...');
    
    // Get canvas element
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }
    
    // Initialize game
    game = new BallBouncingGame(canvas);
    
    // Setup UI event listeners
    setupUIEvents();
    
    // Initial render
    game.render();
    
    console.log('Ball Bouncing Game loaded successfully!');
});

function setupUIEvents() {
    // Start button
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log('Start button clicked');
            game.startGame();
        });
    }
    
    // Restart button
    const restartButton = document.getElementById('restartButton');
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked');
            game.restartGame();
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    // Handle visibility change (pause when tab is not visible)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.gameState === 'playing') {
            game.pauseGame();
        }
    });
    
    // Prevent context menu on canvas
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
}

function handleResize() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.querySelector('.canvas-container');
    
    if (!canvas || !container) return;
    
    // Get container size
    const containerRect = container.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate maximum size while maintaining aspect ratio
    const aspectRatio = 800 / 600; // Original canvas aspect ratio
    const maxWidth = Math.min(800, windowWidth - 100);
    const maxHeight = Math.min(600, windowHeight - 200);
    
    let newWidth = maxWidth;
    let newHeight = maxWidth / aspectRatio;
    
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = maxHeight * aspectRatio;
    }
    
    // Apply CSS scaling while keeping internal resolution
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
}

// Handle cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    if (game) {
        game.destroy();
    }
});

// Global functions for debugging
window.debugGame = () => {
    if (game) {
        console.log('Game State:', {
            state: game.gameState,
            score: game.score,
            lives: game.lives,
            level: game.level,
            ballPosition: { x: game.ball.x, y: game.ball.y },
            ballVelocity: { vx: game.ball.vx, vy: game.ball.vy },
            ballSpeed: game.ball.speed,
            paddlePosition: { x: game.paddle.x, y: game.paddle.y }
        });
    } else {
        console.log('Game not initialized');
    }
};

// Export for global access
window.game = game;
