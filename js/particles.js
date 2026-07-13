/**
 * Particles - Floating background particles for depth
 * Supports dynamic density changes for zoom-out transition
 */

const Particles = (() => {
    let particles = [];
    let canvas, ctx;
    let baseCount = 80;
    let densityMultiplier = 1;
    let targetDensity = 1;

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        `;
        document.body.prepend(canvas);
        ctx = canvas.getContext('2d');

        resize();
        createParticles(baseCount);
        animate();

        window.addEventListener('resize', resize);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(makeParticle());
        }
    }

    function makeParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.4 + 0.1,
            hue: Math.random() > 0.7 ? 300 : 185
        };
    }

    function setDensity(multiplier) {
        targetDensity = multiplier;
        const targetCount = Math.floor(baseCount * multiplier);

        // Add particles if needed
        while (particles.length < targetCount) {
            particles.push(makeParticle());
        }
        // Remove particles if too many
        while (particles.length > targetCount) {
            particles.pop();
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
            ctx.fill();
        });
    }

    return { init, setDensity };
})();
