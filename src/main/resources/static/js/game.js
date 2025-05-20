document.addEventListener('DOMContentLoaded', function () {
    // Game state variables
    let gameData = null;
    let lastTimestamp = 0;
    let cameraShake = false;
    let cameraX = 0;
    let cameraY = 0;
    let cameraVelocityX = 0;
    let cameraVelocityY = 0;
    let kittenAnimationFrame = 0;
    let animationCounter = 0;

    // Constants
    const TILE_SIZE = 32;
    const SHAKE_STRENGTH = 2.0;
    const SHAKE_DAMPING = 0.85;
    const SHAKE_VELOCITY = 0.15;

    // Tile type constants 
    const WALL = 0;
    const UNREVEALED = -1;
    const EMPTY = -2;
    const UNREVEALED_KITTEN = -3;
    const REVEALED_KITTEN = -4;

    // Sprite position definitions
    const tileSprites = {
        'wall': { x: 0, y: 2 },       // Wall tile is at column 0, row 2
        'unrevealed': { x: 2, y: 0 },  // Unrevealed tile at column 2, row 0
        'empty': { x: 5, y: 0 },      // Empty tile at column 5, row 0
        'flag': { x: 1, y: 0 },       // Flag tile at column 1, row 0
        1: { x: 0, y: 1 },           // Number 1 at column 0, row 1
        2: { x: 1, y: 1 },           // Number 2 at column 1, row 1
        3: { x: 2, y: 1 },           // And so on...
        4: { x: 3, y: 1 },
        5: { x: 4, y: 1 },
        6: { x: 5, y: 1 },
        7: { x: 6, y: 1 },
        8: { x: 7, y: 1 }
    };

    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const timer = document.getElementById('timer');
    const kittenCounter = document.getElementById('kitten-counter');
    const gameOverlay = document.getElementById('game-overlay');
    const gameResult = document.getElementById('game-result');
    const playAgainButton = document.getElementById('play-again');

    // Audio elements
    const meowSounds = [];
    for (let i = 1; i <= 4; i++) {
        const meow = new Audio(`/audio/cat-meow-${i}.mp3`);
        meowSounds.push(meow);
    }
    const gameMusic = new Audio('/audio/game_soundtrack.mp3');
    gameMusic.loop = true;
    const gameOverMusic = new Audio('/audio/gameover_soundtrack.mp3');
    gameOverMusic.loop = true;

    // Load initial game state
    fetchGameState();

    // Set up event listeners
    gameBoard.addEventListener('click', handleBoardClick);
    document.addEventListener('keydown', handleKeyPress);
    playAgainButton.addEventListener('click', resetGame);

    // Start game loop and music
    gameMusic.play();
    requestAnimationFrame(gameLoop);

    // Game loop
    function gameLoop(timestamp) {
        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        const elapsed = timestamp - lastTimestamp;

        // Update game every second for timer
        if (elapsed > 1000) {
            lastTimestamp = timestamp;
            updateGameTime(1); // 1 second elapsed
        }

        // Update camera shake if needed
        if (cameraShake) {
            updateCameraShake();
        }

        // Update kitten animation frames
        animationCounter++;
        if (animationCounter % 15 === 0) {
            //kittenAnimationFrame = (kittenAnimationFrame + 1) % 4;
            updateKittenAnimations(); // Only update kittens instead of re-rendering everything
        }

        requestAnimationFrame(gameLoop);
    }

    // Update kitten animations without re-rendering the whole board
    function updateKittenAnimations() {
        const kittenElements = gameBoard.querySelectorAll('.kitten');
        kittenElements.forEach(kitten => {
            const kittenValue = parseInt(kitten.dataset.kittenValue);
            let maxFrames;
            // Determine max frames based on kitten value
            if (kittenValue <= 3 || kittenValue === 6) {
                maxFrames = 4; // First 4 frames only
            } else if (kittenValue === 4 || kittenValue === 5) {
                maxFrames = 8; // First 8 frames only
            } else {
                maxFrames = 6; // First 6 frames only
            }
            // Calculate current frame
            const baseFrame = Math.floor(animationCounter / 15) % maxFrames;

            // Calculate position based on your sprite sheet layout
            let frameX, frameY;

            // Map kittenValue to the correct row and calculate x position
            if (kittenValue <= 3) {
                // Rows 1-4 have 4 columns
                frameY = kittenValue;
                frameX = baseFrame; // 0 to 3
            } else if (kittenValue <= 5) {
                // Rows 5-6 have 8 columns
                frameY = kittenValue;
                frameX = baseFrame; // 0 to 7
            } else if (kittenValue === 6) {
                // Row 7 has 4 columns
                frameY = kittenValue;
                frameX = baseFrame; // 0 to 3
            } else if (kittenValue === 7) {
                // Row 8 has 6 columns
                frameY = kittenValue;
                frameX = baseFrame; // 0 to 5
            } else if (kittenValue === 8) {
                // Row 9 has 7 columns
                frameY = kittenValue;
                frameX = baseFrame; // 0 to 6
            } else if (kittenValue === 9) {
                // Row 10 has 8 columns
                frameY = kittenValue;
                frameX = baseFrame; // 0 to 7
            } else {
                // Default if out of range
                frameY = 0;
                frameX = baseFrame % 4;
            }
            // Set the background position
            kitten.style.backgroundPosition = `-${frameX * 32}px -${frameY * 32}px`;
            kitten.style.backgroundSize = '256px 320px';
        });
    }

    // Fetch the current game state from the server
    function fetchGameState() {
        fetch(`/game/${gameId}`)
            .then(response => response.json())
            .then(data => {
                gameData = data;
                renderBoard();
                updateUI();
            })
            .catch(error => console.error('Error fetching game state:', error));
    }

    // Update the game timer on the server
    function updateGameTime(seconds) {
        if (!gameData || !gameData.gameActive) return;

        fetch(`/game/${gameId}/time`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `seconds=${seconds}`
        })
            .then(response => response.json())
            .then(data => {
                gameData = data;
                updateUI();

                // Check if game is over due to time
                if (!gameData.gameActive && !gameData.board.gameOver) {
                    handleGameOver(false);
                }
            })
            .catch(error => console.error('Error updating game time:', error));
    }

    // Handle click on the game board
    function handleBoardClick(event) {
        if (!gameData || !gameData.gameActive) return;
        // Calculate tile coordinates from click position
        const rect = gameBoard.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        const tileX = Math.floor(clickX / TILE_SIZE);
        const tileY = Math.floor(clickY / TILE_SIZE);
        console.log(`Click at pixel (${clickX}, ${clickY}) => Tile (${tileX}, ${tileY})`);

        // Check if the calculated position is valid
        const board = gameData.board;
        if (tileX < 0 || tileX >= board.width || tileY < 0 || tileY >= board.height) {
            console.warn(`Invalid tile position: (${tileX}, ${tileY})`);
            return;
        }

        // Send reveal request to server
        fetch(`/game/${gameId}/reveal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `x=${tileX}&y=${tileY}`
        })
            .then(response => {
                console.log(`Response status: ${response.status}`);
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error(`Server error: ${text}`);
                        throw new Error(`Server responded with status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Check if the tile was a kitten
                try {
                    const clickedTile = data.board.tiles[tileX][tileY];
                    console.log(`Clicked tile data:`, clickedTile);

                    // If this is a kitten, explicitly handle it
                    if (clickedTile.type === REVEALED_KITTEN ||
                        (clickedTile.type === UNREVEALED_KITTEN && clickedTile.kitten === true)) {
                        console.log("KITTEN CLICKED! Game should end.");
                        // Force the tile to be revealed kitten
                        clickedTile.type = REVEALED_KITTEN;
                        clickedTile.revealed = true;
                        // Force game over state
                        data.board.gameOver = true;
                        data.gameActive = false;
                    }
                } catch (e) {
                    console.error('Error accessing tile data:', e);
                }

                const wasGameActive = gameData.gameActive;
                gameData = data;
                renderBoard();
                updateUI();

                // Check if this click caused game over
                if (wasGameActive && !gameData.gameActive) {
                    console.log('Game over detected, handling game over...');
                    handleGameOver(gameData.board.hasWon);
                }
            })
            .catch(error => {
                console.error(`Error revealing tile (${tileX}, ${tileY}):`, error);
            });
    }

    // Handle keyboard input (for flagging)
    function handleKeyPress(event) {
        if (!gameData || !gameData.gameActive) return;

        // Space bar for flagging
        if (event.code === 'Space') {
            // Get mouse position over board
            const rect = gameBoard.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
            const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);

            // Send flag toggle request
            fetch(`/game/${gameId}/flag`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `x=${x}&y=${y}`
            })
                .then(response => response.json())
                .then(data => {
                    gameData = data;
                    renderBoard();
                    updateUI();
                })
                .catch(error => console.error('Error toggling flag:', error));
        }
    }

    // Reset the game
    function resetGame() {
        fetch(`/game/${gameId}/reset`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                gameData = data;
                renderBoard();
                updateUI();

                // Reset camera and overlay
                cameraShake = false;
                cameraX = 0;
                cameraY = 0;
                cameraVelocityX = 0;
                cameraVelocityY = 0;

                gameOverlay.style.display = 'none';

                // Reset music
                gameOverMusic.pause();
                gameOverMusic.currentTime = 0;
                gameMusic.play();
            })
            .catch(error => console.error('Error resetting game:', error));
    }

    // Handle game over
    function handleGameOver(hasWon) {
        // Start camera shake
        cameraShake = true;

        // Play appropriate sounds
        gameMusic.pause();

        if (!hasWon) {
            // Play meows when losing
            meowSounds.forEach(sound => {
                sound.play();
            });

            // Play game over music
            gameOverMusic.play();
        }

        // Show game over overlay after a delay
        setTimeout(() => {
            gameResult.textContent = hasWon ? 'You Won!' : 'You Lost!';
            gameOverlay.style.display = 'flex';
        }, 2000);
    }

    // Update camera shake effect
    function updateCameraShake() {
        if (!gameData || gameData.gameActive) {
            cameraShake = false;
            return;
        }

        const targetX = 0;
        const targetY = 0;

        // Random initial shake on first frame
        if (cameraX === 0 && cameraY === 0 && cameraVelocityX === 0 && cameraVelocityY === 0) {
            const angle = Math.random() * 2 * Math.PI;
            cameraVelocityX = SHAKE_VELOCITY * Math.cos(angle);
            cameraVelocityY = SHAKE_VELOCITY * Math.sin(angle);
            cameraX = 0.15 * Math.cos(angle);
            cameraY = 0.15 * Math.sin(angle);
        }

        const dx = targetX - cameraX;
        const dy = targetY - cameraY;

        // Apply spring physics
        cameraVelocityX = (cameraVelocityX + dx * SHAKE_STRENGTH) * SHAKE_DAMPING;
        cameraVelocityY = (cameraVelocityY + dy * SHAKE_STRENGTH) * SHAKE_DAMPING;

        cameraX += cameraVelocityX;
        cameraY += cameraVelocityY;

        // Stop tiny movements
        if (Math.abs(cameraVelocityX) < 0.001 && Math.abs(cameraVelocityY) < 0.001 &&
            Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
            cameraX = targetX;
            cameraY = targetY;
            cameraVelocityX = 0;
            cameraVelocityY = 0;
            cameraShake = false;
        }

        // Apply shake to board position
        const shakeX = cameraX * TILE_SIZE;
        const shakeY = cameraY * TILE_SIZE;
        gameBoard.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
    }

    // Render the game board
    function renderBoard() {
        if (!gameData) return;
        // Debug info
        console.log("Difficulty:", difficulty);
        console.log("Board dimensions from server:", gameData.board.width, "×", gameData.board.height);
        console.log("TILE_SIZE constant:", TILE_SIZE);

        // Clear existing board
        gameBoard.innerHTML = '';

        const board = gameData.board;

        // Calculate and log board pixel dimensions
        const boardWidthPx = board.width * TILE_SIZE;
        const boardHeightPx = board.height * TILE_SIZE;
        console.log("Setting board size to:", boardWidthPx, "×", boardHeightPx, "px");

        // Set board dimensions
        gameBoard.style.width = `${board.width * TILE_SIZE}px`;
        gameBoard.style.height = `${board.height * TILE_SIZE}px`;

        // Log actual dimensions after render
        setTimeout(() => {
            console.log("Actual board size:", gameBoard.offsetWidth, "×", gameBoard.offsetHeight, "px");
            console.log("Viewport size:", window.innerWidth, "×", window.innerHeight, "px");
        }, 100);

        // Create tile elements
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.style.left = `${x * TILE_SIZE}px`;
                tile.style.top = `${y * TILE_SIZE}px`;
                tile.style.width = `${TILE_SIZE}px`;
                tile.style.height = `${TILE_SIZE}px`;

                // Get tile data and render it
                const tileData = board.tiles[x][y];
                renderTile(tile, tileData);

                gameBoard.appendChild(tile);
            }
        }
    }

    // Render a single tile using sprite sheet positioning
    function renderTile(tileElement, tileData) {
        const type = tileData.type;
        const flagged = tileData.flagged;

        // Base sprite for the tile
        let spriteKey = '';

        if (type === WALL) {
            spriteKey = 'wall';
            // Special handling for wall tiles
            const sprite = tileSprites[spriteKey];
            tileElement.style.backgroundImage = 'url("/images/MinesweeperTiles.png")';
            // Use exact pixel positions for wall
            tileElement.style.backgroundPosition = `-${sprite.x * 16 * 2}px -${sprite.y * 16 * 2}px`;

        } else if (type === UNREVEALED || type === UNREVEALED_KITTEN) {
            spriteKey = 'unrevealed';
            // Special handling for unrevealed tiles
            const sprite = tileSprites[spriteKey];
            tileElement.style.backgroundImage = 'url("/images/MinesweeperTiles.png")';
            // Use exact pixel positions for unrevealed
            tileElement.style.backgroundPosition = `-${sprite.x * 16 * 2}px -${sprite.y * 16 * 2}px`;

        } else if (type === EMPTY) {
            spriteKey = 'empty';
            // Special handling for empty tiles
            const sprite = tileSprites[spriteKey];
            tileElement.style.backgroundImage = 'url("/images/MinesweeperTiles.png")';
            // Use exact pixel positions for empty
            tileElement.style.backgroundPosition = `-${sprite.x * 16 * 2}px -${sprite.y * 16 * 2}px`;

        } else if (type >= 1 && type <= 8) {
            // For numbered tiles, we'll use both a base (empty) and the number
            tileElement.style.backgroundImage = 'url("/images/MinesweeperTiles.png")';
            const emptySprite = tileSprites['empty'];
            tileElement.style.backgroundPosition = `-${emptySprite.x * 16 * 2}px -${emptySprite.y * 16 * 2}px`;

            // Add number overlay
            const numberSprite = tileSprites[type];
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.style.backgroundImage = 'url("/images/MinesweeperTiles.png")';
            overlay.style.backgroundPosition = `-${numberSprite.x * 16 * 2}px -${numberSprite.y * 16 * 2}px`;
            overlay.style.width = '32px';
            overlay.style.height = '32px';
            overlay.style.backgroundSize = '320px auto';
            tileElement.appendChild(overlay);

        } else if (type === REVEALED_KITTEN) {
            // For revealed kitten, use empty tile as base
            tileElement.style.backgroundImage = 'url("/images/MinesweeperTiles.png")';
            const emptySprite = tileSprites['empty'];
            tileElement.style.backgroundPosition = `-${emptySprite.x * 16 * 2}px -${emptySprite.y * 16 * 2}px`;

            // Add kitten animation
            const kittenValue = tileData.kittenValue || 0;
            const kittenImg = document.createElement('div');
            kittenImg.className = 'kitten';
            kittenImg.dataset.kittenValue = kittenValue; // Store for animation updates
            kittenImg.style.backgroundImage = 'url("/images/kittens.png")';
            kittenImg.style.backgroundPosition = `-${kittenAnimationFrame * 16 * 2}px -${kittenValue * 16 * 2}px`;
            tileElement.appendChild(kittenImg);

        }


        // Add flag if needed
        if (flagged) {
            const flag = document.createElement('div');
            flag.className = 'flag';
            flag.style.backgroundImage = 'url("/images/MinesweeperTiles.png")';
            const flagSprite = tileSprites['flag'];
            flag.style.backgroundPosition = `-${flagSprite.x * 16 * 2}px -${flagSprite.y * 16 * 2}px`;
            tileElement.appendChild(flag);
        }
    }

    // Update UI elements (timer, kitten counter)
    function updateUI() {
        if (!gameData) return;

        // Update timer
        timer.textContent = gameData.formattedTime;
        if (gameData.timeRemaining <= 10) {
            timer.classList.add('warning');
        } else {
            timer.classList.remove('warning');
        }

        // Update kitten counter
        kittenCounter.textContent = `${gameData.board.numKittens} kittens`;
    }
});