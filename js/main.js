/**
 * Main - Entry point, initializes all modules
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize in order
    Particles.init();
    DNAStrand.init();
    SkillNodes.init();
    ARFrame.init();
    ScrollController.init();

    // Typewriter effect for hero title
    typewriterEffect();
});

function typewriterEffect() {
    const titleEl = document.querySelector('.title-text');
    const text = titleEl.textContent;
    titleEl.textContent = '';
    titleEl.style.visibility = 'visible';

    let i = 0;
    const interval = setInterval(() => {
        titleEl.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(interval);
        }
    }, 100);
}
