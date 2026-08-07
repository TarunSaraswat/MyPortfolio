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
    let glowMeshes = [];

    const CONFIG = {
        radius: 2.5,           // Wider helix
        turns: 4,
        pointsPerTurn: 70,     // Reduced for performance
        strandThickness: 0.35, // Thicker particle spread
        particlesPerPoint: 9,  // Reduced for performance
        rungInterval: 8,
        rungParticles: 35,     // Reduced for performance
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
        const pixelRatioCap = window.innerWidth <= 768 ? 1 : 1.5;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));

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

        // Add node sprites with shader-based radial glow
        const glowVertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const glowFragmentShader = `
            uniform vec3 uColor;
            varying vec2 vUv;
            void main() {
                float dist = length(vUv - vec2(0.5)) * 2.0; // 0 at center, 1 at edge
                if (dist > 1.0) discard;

                // Smooth radial falloff: bright core, gradually fades to 0
                float glow = pow(1.0 - dist, 3.0);

                // Bright solid core in the center 25%
                float core = smoothstep(0.3, 0.0, dist);
                glow = max(glow, core);

                gl_FragColor = vec4(uColor, glow);
            }
        `;

        skillNodePositions.forEach((node) => {
            const isStrandA = node.side === 'left';
            const color = isStrandA ? new THREE.Vector3(0, 0.94, 1) : new THREE.Vector3(1, 0, 0.67);

            const spriteMat = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: color }
                },
                vertexShader: glowVertexShader,
                fragmentShader: glowFragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const spriteGeom = new THREE.PlaneGeometry(0.7, 0.7);
            const sprite = new THREE.Mesh(spriteGeom, spriteMat);
            sprite.position.copy(node.position);
            sprite.lookAt(camera.position);
            dnaGroup.add(sprite);
            glowMeshes.push(sprite);
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
                    float pSize = size * uSizeMultiplier * (300.0 / -mvPosition.z);
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
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;

                    float alpha = (1.0 - dist * 2.0) * vOpacity;
                    alpha *= clamp(1.0 - (vDist - 5.0) / 15.0, 0.3, 1.0);

                    gl_FragColor = vec4(uColor, alpha);
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

    let isVisible = true;
    let isPaused = false;

    function animate() {
        requestAnimationFrame(animate);

        // Skip rendering entirely when DNA is hidden
        if (!isVisible || isPaused || document.hidden) return;

        time += 0.016;

        particleSystems.forEach(system => {
            system.material.uniforms.uTime.value = time;
        });

        glowMeshes.forEach(mesh => {
            mesh.lookAt(camera.position);
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

    function setCameraZ(z) {
        if (camera) camera.position.z = z;
    }

    function setOpacity(opacity) {
        if (!dnaGroup) return;
        const visible = opacity > 0.01;
        dnaGroup.visible = visible;
        isVisible = visible;
        // Hide the canvas element entirely when DNA is gone
        const canvas = document.getElementById('dna-canvas');
        if (canvas) canvas.style.display = visible ? '' : 'none';
    }

    function getRenderer() {
        return renderer;
    }

    function setPaused(paused) {
        isPaused = paused;
    }

    return {
        init,
        getGroup,
        getCamera,
        getRenderer,
        getSkillNodePositions,
        setRotationY,
        setPositionY,
        setPositionX,
        setCameraZ,
        setOpacity,
        setPaused
    };
})();
