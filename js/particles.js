/**
 * Particles - Floating background particles for depth
 * Supports dynamic density changes for zoom-out transition
 */

const Particles = (() => {
    let particles = [];
    let canvas, ctx;
    let baseCount = window.innerWidth <= 768 ? 45 : 80;
    let isPaused = false;

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

    let sizeMultiplier = 1;
    let glowIntensity = 0;
    let shootMode = 0; // 0 = normal, 0→1 = shooting stars intensity
    let particleOpacity = 1;

    function setDensity(multiplier) {
        const targetCount = Math.max(0, Math.floor(baseCount * multiplier));

        // Particles grow bigger as we "zoom in"
        sizeMultiplier = 1 + (Math.max(0, multiplier - 1)) * 0.8;

        // Glow increases with density
        glowIntensity = Math.min(1, Math.max(0, multiplier - 1) / 3);

        // Add particles if needed
        while (particles.length < targetCount) {
            particles.push(makeParticle());
        }
        // Remove particles if too many
        while (particles.length > targetCount) {
            particles.pop();
        }
    }

    function setShootMode(intensity) {
        shootMode = intensity;
    }

    function setParticleOpacity(val) {
        particleOpacity = val;
    }

    // Pre-computed colors
    const CYAN_COLOR = 'hsl(185, 100%, 70%)';
    const MAGENTA_COLOR = 'hsl(300, 100%, 70%)';

    function animate() {
        requestAnimationFrame(animate);

        if (isPaused || document.hidden) return;

        if (particleOpacity <= 0 && shootMode <= 0) {
            if (canvas.style.display !== 'none') canvas.style.display = 'none';
            return;
        }
        if (canvas.style.display === 'none') canvas.style.display = '';

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Set shadow for glow effect (applied once, not per particle)
        if (glowIntensity > 0.1) {
            ctx.shadowBlur = 8 * glowIntensity;
        } else {
            ctx.shadowBlur = 0;
        }

        particles.forEach(p => {
            if (shootMode > 0) {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const dirX = dx / dist;
                const dirY = dy / dist;

                const speed = 3 + shootMode * 12;
                p.x += dirX * speed;
                p.y += dirY * speed;

                if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * 50;
                    p.x = centerX + Math.cos(angle) * r;
                    p.y = centerY + Math.sin(angle) * r;
                }
            } else {
                p.x += p.speedX * sizeMultiplier;
                p.y += p.speedY * sizeMultiplier;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
            }

            const size = p.size * sizeMultiplier;
            const opacity = Math.min(1, p.opacity + glowIntensity * 0.3) * particleOpacity;
            const color = p.hue === 185 ? CYAN_COLOR : MAGENTA_COLOR;

            // Trail when shooting
            if (shootMode > 0.3) {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const trailLen = Math.min(20, shootMode * 15);

                ctx.globalAlpha = opacity * 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x - (dx / dist) * trailLen, p.y - (dy / dist) * trailLen);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = color;
                ctx.lineWidth = size * 0.8;
                ctx.stroke();
            }

            // Core particle with shadow-based glow
            ctx.globalAlpha = opacity;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });

        // Reset
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }

    function setPaused(paused) {
        isPaused = paused;
    }

    return { init, setDensity, setShootMode, setParticleOpacity, setPaused };
})();
