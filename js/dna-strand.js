/**
 * DNA Strand - Particle-based Double Helix
 * Creates a volumetric, glowing particle DNA inspired by 3D renders
 */

const DNAStrand = (() => {
    let scene, camera, renderer;
    let dnaGroup;
    let skillNodePositions = [];
    let time = 0;
    let particleSystems = [];

    const CONFIG = {
        radius: 2.5,           // Wider helix
        turns: 4,
        pointsPerTurn: 120,    // More points for density
        strandThickness: 0.35, // Thicker particle spread
        particlesPerPoint: 14, // More particles per cross-section
        rungInterval: 8,
        rungParticles: 60,     // Denser rungs
        colors: {
            strandA: [0, 0.94, 1],    // Cyan RGB
            strandB: [1, 0, 0.67],    // Magenta RGB
            rung: [0, 0.8, 1],
            node: [1, 1, 1]
        }
    };

    function init() {
        const canvas = document.getElementById('dna-canvas');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 12);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Build particle DNA
        dnaGroup = new THREE.Group();
        buildParticleHelix();
        scene.add(dnaGroup);

        window.addEventListener('resize', onResize);
        animate();
    }

    function buildParticleHelix() {
        const totalPoints = CONFIG.turns * CONFIG.pointsPerTurn;
        const totalHeight = CONFIG.turns * 8; // Total vertical extent

        // --- Strand A (Cyan) particles ---
        const strandAPositions = [];
        const strandASizes = [];
        const strandAOpacities = [];

        // --- Strand B (Magenta) particles ---
        const strandBPositions = [];
        const strandBSizes = [];
        const strandBOpacities = [];

        // --- Rung particles ---
        const rungPositions = [];
        const rungSizes = [];
        const rungOpacities = [];

        let nodeIndex = 0;

        for (let i = 0; i <= totalPoints; i++) {
            const t = (i / totalPoints) * Math.PI * 2 * CONFIG.turns;
            const y = (i / totalPoints) * totalHeight - totalHeight / 2;

            const ax = CONFIG.radius * Math.cos(t);
            const az = CONFIG.radius * Math.sin(t);
            const bx = CONFIG.radius * Math.cos(t + Math.PI);
            const bz = CONFIG.radius * Math.sin(t + Math.PI);

            // Generate particles with volume around the helix path
            for (let p = 0; p < CONFIG.particlesPerPoint; p++) {
                const angle = (p / CONFIG.particlesPerPoint) * Math.PI * 2;
                const spread = CONFIG.strandThickness * (0.3 + Math.random() * 0.7);

                // Strand A
                const offsetAx = Math.cos(angle) * spread * Math.cos(t);
                const offsetAy = (Math.random() - 0.5) * CONFIG.strandThickness * 0.5;
                const offsetAz = Math.cos(angle) * spread * Math.sin(t);

                strandAPositions.push(
                    ax + offsetAx + (Math.random() - 0.5) * 0.1,
                    y + offsetAy,
                    az + offsetAz + (Math.random() - 0.5) * 0.1
                );
                strandASizes.push(0.06 + Math.random() * 0.1);
                strandAOpacities.push(0.5 + Math.random() * 0.5);

                // Strand B
                const offsetBx = Math.cos(angle) * spread * Math.cos(t + Math.PI);
                const offsetBy = (Math.random() - 0.5) * CONFIG.strandThickness * 0.5;
                const offsetBz = Math.cos(angle) * spread * Math.sin(t + Math.PI);

                strandBPositions.push(
                    bx + offsetBx + (Math.random() - 0.5) * 0.1,
                    y + offsetBy,
                    bz + offsetBz + (Math.random() - 0.5) * 0.1
                );
                strandBSizes.push(0.06 + Math.random() * 0.1);
                strandBOpacities.push(0.5 + Math.random() * 0.5);
            }

            // Rungs
            if (i % CONFIG.rungInterval === 0 && i > 0) {
                for (let r = 0; r < CONFIG.rungParticles; r++) {
                    const lerp = r / (CONFIG.rungParticles - 1);
                    const rx = ax + (bx - ax) * lerp;
                    const rz = az + (bz - az) * lerp;

                    rungPositions.push(
                        rx + (Math.random() - 0.5) * 0.08,
                        y + (Math.random() - 0.5) * 0.08,
                        rz + (Math.random() - 0.5) * 0.08
                    );
                    rungSizes.push(0.05 + Math.random() * 0.08);
                    rungOpacities.push(0.5 + Math.random() * 0.5);
                }

                // Skill node positions (at ends of rungs)
                const side = nodeIndex % 2 === 0 ? 'left' : 'right';
                const nodePos = side === 'left'
                    ? new THREE.Vector3(ax, y, az)
                    : new THREE.Vector3(bx, y, bz);

                skillNodePositions.push({
                    position: nodePos,
                    side: side,
                    index: nodeIndex
                });
                nodeIndex++;
            }
        }

        // Create strand A particle system
        const strandASystem = createParticleSystem(
            strandAPositions, strandASizes, strandAOpacities,
            CONFIG.colors.strandA, 2.8
        );
        dnaGroup.add(strandASystem);
        particleSystems.push(strandASystem);

        // Create strand B particle system
        const strandBSystem = createParticleSystem(
            strandBPositions, strandBSizes, strandBOpacities,
            CONFIG.colors.strandB, 2.8
        );
        dnaGroup.add(strandBSystem);
        particleSystems.push(strandBSystem);

        // Create rung particle system
        const rungSystem = createParticleSystem(
            rungPositions, rungSizes, rungOpacities,
            CONFIG.colors.rung, 2.5
        );
        dnaGroup.add(rungSystem);
        particleSystems.push(rungSystem);

        // Add bright node spheres at skill positions
        skillNodePositions.forEach((node) => {
            const nodeGeom = new THREE.SphereGeometry(0.12, 16, 16);
            const nodeMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.9
            });
            const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
            nodeMesh.position.copy(node.position);
            dnaGroup.add(nodeMesh);
        });
    }

    function createParticleSystem(positions, sizes, opacities, color, sizeMultiplier) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.Float32BufferAttribute(opacities, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Vector3(color[0], color[1], color[2]) },
                uTime: { value: 0 },
                uSizeMultiplier: { value: sizeMultiplier * window.devicePixelRatio }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                varying float vOpacity;
                varying float vDist;
                uniform float uTime;
                uniform float uSizeMultiplier;

                void main() {
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vDist = -mvPosition.z;

                    // Size attenuation for depth
                    float pSize = size * uSizeMultiplier * (300.0 / -mvPosition.z);

                    // Subtle size pulsing
                    pSize *= 1.0 + 0.15 * sin(uTime * 2.0 + position.y * 0.5);

                    gl_PointSize = pSize;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vOpacity;
                varying float vDist;

                void main() {
                    // Circular soft particle
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;

                    // Soft glow falloff
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= vOpacity;

                    // Depth fade
                    float depthFade = clamp(1.0 - (vDist - 5.0) / 15.0, 0.3, 1.0);
                    alpha *= depthFade;

                    // Brighter core
                    vec3 finalColor = uColor + vec3(0.3) * (1.0 - smoothstep(0.0, 0.15, dist));

                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Points(geometry, material);
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        // Update shader time uniform for pulsing
        particleSystems.forEach(system => {
            system.material.uniforms.uTime.value = time;
        });

        renderer.render(scene, camera);
    }

    function getGroup() {
        return dnaGroup;
    }

    function getCamera() {
        return camera;
    }

    function getSkillNodePositions() {
        return skillNodePositions;
    }

    function setRotationY(angle) {
        if (dnaGroup) dnaGroup.rotation.y = angle;
    }

    function setPositionY(y) {
        if (dnaGroup) dnaGroup.position.y = y;
    }

    function setPositionX(x) {
        if (dnaGroup) dnaGroup.position.x = x;
    }

    function getRenderer() {
        return renderer;
    }

    return {
        init,
        getGroup,
        getCamera,
        getRenderer,
        getSkillNodePositions,
        setRotationY,
        setPositionY,
        setPositionX
    };
})();
