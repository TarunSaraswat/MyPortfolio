/**
 * Atoms - Floating graphite-like atomic structures
 * Hexagonal lattice atoms that drift like particles
 */

const Atoms = (() => {
    let canvas, ctx;
    let atoms = [];
    let opacity = 0;
    let targetOpacity = 0;
    const ATOM_COUNT = 8;

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'atom-canvas';
        document.body.prepend(canvas);
        ctx = canvas.getContext('2d');

        resize();
        createAtoms();
        animate();

        window.addEventListener('resize', resize);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createAtoms() {
        atoms = [];
        for (let i = 0; i < ATOM_COUNT; i++) {
            atoms.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.005,
                scale: 1.8 + Math.random() * 1.5,
                hue: Math.random() > 0.5 ? 185 : 300, // cyan or magenta
                rings: 2 + Math.floor(Math.random() * 2) // 2-3 electron rings
            });
        }
    }

    function setOpacity(val) {
        targetOpacity = val;
        canvas.style.opacity = val;
    }

    function drawAtom(atom) {
        ctx.save();
        ctx.translate(atom.x, atom.y);
        ctx.rotate(atom.rotation);

        const baseRadius = 50 * atom.scale;
        const color = atom.hue === 185 ? '0, 240, 255' : '255, 0, 170';

        // Nucleus - glowing core
        const nucleusGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.25);
        nucleusGrad.addColorStop(0, `rgba(${color}, 0.9)`);
        nucleusGrad.addColorStop(0.5, `rgba(${color}, 0.3)`);
        nucleusGrad.addColorStop(1, `rgba(${color}, 0)`);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = nucleusGrad;
        ctx.fill();

        // Inner nucleus dot
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 1)`;
        ctx.fill();

        // Electron orbits (hexagonal bonds / rings)
        for (let r = 0; r < atom.rings; r++) {
            const orbitRadius = baseRadius * (0.5 + r * 0.35);
            const tilt = (r * Math.PI / atom.rings) + atom.rotation * 0.5;

            ctx.save();
            ctx.rotate(tilt);
            ctx.scale(1, 0.4); // Ellipse for 3D perspective

            // Orbit path
            ctx.beginPath();
            ctx.arc(0, 0, orbitRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${color}, ${0.25 - r * 0.05})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Electron on orbit
            const electronAngle = atom.rotation * (2 + r) + r * Math.PI * 0.7;
            const ex = Math.cos(electronAngle) * orbitRadius;
            const ey = Math.sin(electronAngle) * orbitRadius;

            // Electron glow
            const elGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, baseRadius * 0.1);
            elGrad.addColorStop(0, `rgba(${color}, 0.8)`);
            elGrad.addColorStop(1, `rgba(${color}, 0)`);
            ctx.beginPath();
            ctx.arc(ex, ey, baseRadius * 0.1, 0, Math.PI * 2);
            ctx.fillStyle = elGrad;
            ctx.fill();

            // Electron core
            ctx.beginPath();
            ctx.arc(ex, ey, baseRadius * 0.035, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, 1)`;
            ctx.fill();

            ctx.restore();
        }

        // Hexagonal bond lines (graphite-like)
        const hexRadius = baseRadius * 0.7;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = Math.cos(angle) * hexRadius;
            const hy = Math.sin(angle) * hexRadius;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${color}, 0.12)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Connect hex vertices to center
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = Math.cos(angle) * hexRadius;
            const hy = Math.sin(angle) * hexRadius;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(hx, hy);
            ctx.strokeStyle = `rgba(${color}, 0.06)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    function animate() {
        requestAnimationFrame(animate);

        if (opacity < 0.01 && targetOpacity < 0.01) return;

        // Smooth opacity transition
        opacity += (targetOpacity - opacity) * 0.05;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        atoms.forEach(atom => {
            atom.x += atom.speedX;
            atom.y += atom.speedY;
            atom.rotation += atom.rotSpeed;

            // Bounce off edges (keep inside viewport)
            const margin = 80 * atom.scale;
            if (atom.x < margin || atom.x > canvas.width - margin) {
                atom.speedX *= -1;
                atom.x = Math.max(margin, Math.min(canvas.width - margin, atom.x));
            }
            if (atom.y < margin || atom.y > canvas.height - margin) {
                atom.speedY *= -1;
                atom.y = Math.max(margin, Math.min(canvas.height - margin, atom.y));
            }

            drawAtom(atom);
        });
    }

    return { init, setOpacity };
})();
