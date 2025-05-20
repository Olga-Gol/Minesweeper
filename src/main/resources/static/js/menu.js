document.addEventListener('DOMContentLoaded', function() {
    // Title animation
    const animatedTexts = document.querySelectorAll('.animated-text');
    animatedTexts.forEach((text, index) => {
        const letters = text.textContent.split('');
        text.textContent = '';
        
        letters.forEach((letter, i) => {
            const span = document.createElement('span');
            span.textContent = letter;
            span.style.animationDelay = `${(i * 0.1) + (index * 0.5)}s`;
            text.appendChild(span);
        });
    });
    
    // Kitten animation
    const kittenElement = document.querySelector('.animated-kitten');
    let kittenPosition = -32;
    let kittenFrame = 0;
    let frameCounter = 0;
    
    function updateKitten() {
        kittenPosition += 1.5;
        if (kittenPosition > window.innerWidth + 64) {
            kittenPosition = -64;
        }
        
        kittenElement.style.left = `${kittenPosition}px`;
        
        // Update animation frame
        frameCounter++;
        if (frameCounter % 10 === 0) {
            kittenFrame = (kittenFrame + 1) % 4; // Assuming 8 frames
            // Update sprite sheet position (each frame is 32px wide)
            kittenElement.style.backgroundPosition = `-${kittenFrame * 32}px 0`;
        }
        
        requestAnimationFrame(updateKitten);
    }
    
    // Start animation
    updateKitten();
});