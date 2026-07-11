/**
 * DNA Strand - Three.js WebGL Helix Renderer
 * Creates a glowing double helix with connecting rungs
 * Uses emissive materials for glow effect (no post-processing needed)
 */

const DNAStrand = (() => {
    let scene, camera, renderer;
    let dnaGroup;
    let skillNodePositions = [];
    let time = 0;
    let glowMeshes = [];

    const CONFIG = {
        radius: 1.6,
        turns: 5,
        pointsPerTurn: 50,
        verticalSpacing: 0.9,
        rungInterval: 5,
        tubeRadius: 0.045,
        rungRadius: 0.02,
        colors: {
            strandA: 0x00f0ff,
            strandB: 0xff00aa,
            rung: 0x00f0ff,
            node: 0x00f0ff
        }
    };

    function init() {
        const canvas = document.getElementById('dna-canvas');

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Build DNA
        dnaGroup = new THREE.Group();
        buildHelix();
        scene.add(dnaGroup);

        // Lighting for glow effect
        const ambientLight = new THREE.AmbientLight(0x111133, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00f0ff, 2, 20);
        pointLight1.position.set(3, 5, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff00aa, 1.5, 20);
        pointLight2.position.set(-3, -5, 5);
        scene.add(pointLight2);

        // Handle resize
        window.addEventListener('resize', onResize);

        // Start render loop
        animate();
    }

    function buildHelix() {
        const totalPoints = CONFIG.turns * CONFIG.pointsPerTurn;
        const totalHeight = CONFIG.turns * CONFIG.verticalSpacing * CONFIG.pointsPerTurn;

        // Generate helix points
        const pointsA = [];
        const pointsB = [];

        for (let i = 0; i <= totalPoints; i++) {
            const t = (i / totalPoints) * Math.PI * 2 * CONFIG.turns;
            const y = (i / totalPoints) * totalHeight - totalHeight / 2;

            pointsA.push(new THREE.Vector3(
                CONFIG.radius * Math.cos(t),
                y,
                CONFIG.radius * Math.sin(t)
            ));

            pointsB.push(new THREE.Vector3(
                CONFIG.radius * Math.cos(t + Math.PI),
                y,
                CONFIG.radius * Math.sin(t + Math.PI)
            ));
        }

        // Strand A - Cyan
        const curveA = new THREE.CatmullRomCurve3(pointsA);
        const tubeGeomA = new THREE.TubeGeometry(curveA, totalPoints * 2, CONFIG.tubeRadius, 8, false);
        const matA = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.strandA,
            emissive: CONFIG.colors.strandA,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.95,
            roughness: 0.2,
            metalness: 0.8
        });
        const strandA = new THREE.Mesh(tubeGeomA, matA);
        dnaGroup.add(strandA);
        glowMeshes.push(strandA);

        // Strand B - Magenta
        const curveB = new THREE.CatmullRomCurve3(pointsB);
        const tubeGeomB = new THREE.TubeGeometry(curveB, totalPoints * 2, CONFIG.tubeRadius, 8, false);
        const matB = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.strandB,
            emissive: CONFIG.colors.strandB,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.95,
            roughness: 0.2,
            metalness: 0.8
        });
        const strandB = new THREE.Mesh(tubeGeomB, matB);
        dnaGroup.add(strandB);
        glowMeshes.push(strandB);

        // Rungs + Skill Nodes
        let nodeIndex = 0;
        for (let i = 0; i < totalPoints; i += CONFIG.rungInterval) {
            const t = (i / totalPoints) * Math.PI * 2 * CONFIG.turns;
            const y = (i / totalPoints) * totalHeight - totalHeight / 2;

            const startPoint = new THREE.Vector3(
                CONFIG.radius * Math.cos(t),
                y,
                CONFIG.radius * Math.sin(t)
            );
            const endPoint = new THREE.Vector3(
                CONFIG.radius * Math.cos(t + Math.PI),
                y,
                CONFIG.radius * Math.sin(t + Math.PI)
            );

            // Rung
            const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
            const rungLength = direction.length();
            const rungGeom = new THREE.CylinderGeometry(CONFIG.rungRadius, CONFIG.rungRadius, rungLength, 6);
            const rungMat = new THREE.MeshStandardMaterial({
                color: CONFIG.colors.rung,
                emissive: CONFIG.colors.rung,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.5,
                roughness: 0.5,
                metalness: 0.5
            });
            const rung = new THREE.Mesh(rungGeom, rungMat);

            // Position and orient rung
            const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
            rung.position.copy(midPoint);
            rung.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.normalize()
            );
            dnaGroup.add(rung);

            // Skill node (glowing sphere at alternating ends)
            const side = nodeIndex % 2 === 0 ? startPoint : endPoint;
            const nodeGeom = new THREE.SphereGeometry(0.08, 16, 16);
            const nodeMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: CONFIG.colors.node,
                emissiveIntensity: 1.2,
                transparent: true,
                opacity: 0.9,
                roughness: 0.1,
                metalness: 1.0
            });
            const node = new THREE.Mesh(nodeGeom, nodeMat);
            node.position.copy(side);
            dnaGroup.add(node);
            glowMeshes.push(node);

            // Store node position for label projection
            skillNodePositions.push({
                position: side.clone(),
                side: nodeIndex % 2 === 0 ? 'left' : 'right',
                index: nodeIndex
            });

            nodeIndex++;
        }
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Subtle idle animation - gentle pulsing of emissive intensity
        glowMeshes.forEach((mesh, i) => {
            if (mesh.material.emissiveIntensity !== undefined) {
                const base = mesh.geometry.type === 'SphereGeometry' ? 1.2 : 0.8;
                mesh.material.emissiveIntensity = base + Math.sin(time * 2 + i * 0.5) * 0.15;
            }
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
