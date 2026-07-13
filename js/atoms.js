/**
 * Atoms - Floating graphite-like atomic structures
 * Pre-rendered to offscreen canvases for performance
 */

const Atoms = (() => {
    let canvas, ctx;
    let atoms = [];
    let atomTextures = []; // Pre-rendered atom images
    let opacity = 0;
    let targetOpacity = 0;
    const ATOM_COUNT = 8;

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'atom-canvas';
        document.body.prepend(canvas);
        ctx = canvas.getContext('2d');

        resize();
        createAtomTextures();
        createAtoms();
        animate();

        window.addEventListener('resize', resize);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Pre-render atom textures (one cyan, one magenta) at 4x resolution for clarity
    function createAtomTextures() {
        const colors = ['0, 240, 255', '255, 0, 170'];
        const ringCounts = [2, 3];

        colors.forEach(color => {
            ringCounts.forEach(rings => {
                const size = 800;
                const offscreen = document.createElement('canvas');
                offscreen.width = size;
                offscreen.height = size;
                const octx = offscreen.getContext('2d');
                const cx = size / 2;
                const cy = size / 2;
                const baseRadius = size * 0.4;

                // Nucleus glow
                octx.shadowBlur = 15;
                octx.shadowColor = `rgba(${color}, 0.8)`;
                octx.beginPath();
                octx.arc(cx, cy, baseRadius * 0.08, 0, Math.PI * 2);
                octx.fillStyle = `rgba(${color}, 1)`;
                octx.fill();
                octx.shadowBlur = 0;

                // Nucleus outer
                octx.globalAlpha = 0.4;
                octx.beginPath();
                octx.arc(cx, cy, baseRadius * 0.18, 0, Math.PI * 2);
                octx.fillStyle = `rgba(${color}, 0.3)`;
                octx.fill();
                octx.globalAlpha = 1;

                // Electron orbits
                for (let r = 0; r < rings; r++) {
                    const orbitRadius = baseRadius * (0.4 + r * 0.3);
                    const tilt = r * Math.PI / rings;

                    octx.save();
                    octx.translate(cx, cy);
                    octx.rotate(tilt);
                    octx.scale(1, 0.4);

                    octx.beginPath();
                    octx.arc(0, 0, orbitRadius, 0, Math.PI * 2);
                    octx.strokeStyle = `rgba(${color}, ${0.6 - r * 0.1})`;
                    octx.lineWidth = 3;
                    octx.stroke();

                    // Electron
                    const eAngle = r * 2.5;
                    const ex = Math.cos(eAngle) * orbitRadius;
                    const ey = Math.sin(eAngle) * orbitRadius;
                    octx.shadowBlur = 8;
                    octx.shadowColor = `rgba(${color}, 0.8)`;
                    octx.beginPath();
                    octx.arc(ex, ey, baseRadius * 0.035, 0, Math.PI * 2);
                    octx.fillStyle = `rgba(${color}, 1)`;
                    octx.fill();
                    octx.shadowBlur = 0;

                    octx.restore();
                }

                // Hexagonal bonds
                octx.save();
                octx.translate(cx, cy);
                const hexRadius = baseRadius * 0.6;
                octx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const hx = Math.cos(angle) * hexRadius;
                    const hy = Math.sin(angle) * hexRadius;
                    if (i === 0) octx.moveTo(hx, hy);
                    else octx.lineTo(hx, hy);
                }
                octx.closePath();
                octx.strokeStyle = `rgba(${color}, 0.35)`;
                octx.lineWidth = 2.5;
                octx.stroke();

                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    octx.beginPath();
                    octx.moveTo(0, 0);
                    octx.lineTo(Math.cos(angle) * hexRadius, Math.sin(angle) * hexRadius);
                    octx.strokeStyle = `rgba(${color}, 0.2)`;
                    octx.lineWidth = 2;
                    octx.stroke();
                }
                octx.restore();

                atomTextures.push(offscreen);
            });
        });
    }

    function createAtoms() {
        atoms = [];
        for (let i = 0; i < ATOM_COUNT; i++) {
            atoms.push({
                x: 100 + Math.random() * (canvas.width - 200),
                y: 100 + Math.random() * (canvas.height - 200),
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.005,
                scale: 1.8 + Math.random() * 1.5,
                textureIndex: Math.floor(Math.random() * atomTextures.length)
            });
        }
    }

    function setOpacity(val) {
        targetOpacity = val;
        canvas.style.opacity = val;
    }

    function animate() {
        requestAnimationFrame(animate);

        if (opacity < 0.01 && targetOpacity < 0.01) return;
        opacity += (targetOpacity - opacity) * 0.05;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        atoms.forEach(atom => {
            atom.x += atom.speedX;
            atom.y += atom.speedY;
            atom.rotation += atom.rotSpeed;

            // Bounce off edges
            const margin = 80 * atom.scale;
            if (atom.x < margin || atom.x > canvas.width - margin) {
                atom.speedX *= -1;
                atom.x = Math.max(margin, Math.min(canvas.width - margin, atom.x));
            }
            if (atom.y < margin || atom.y > canvas.height - margin) {
                atom.speedY *= -1;
                atom.y = Math.max(margin, Math.min(canvas.height - margin, atom.y));
            }

            // Draw pre-rendered texture with rotation and scale
            const tex = atomTextures[atom.textureIndex];
            const drawSize = 200 * atom.scale; // Base visual size regardless of texture resolution

            ctx.save();
            ctx.translate(atom.x, atom.y);
            ctx.rotate(atom.rotation);
            ctx.drawImage(tex, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
            ctx.restore();
        });
    }

    return { init, setOpacity };
})();
