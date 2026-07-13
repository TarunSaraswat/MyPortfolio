/**
 * Scroll Controller - GSAP ScrollTrigger integration
 * Drives DNA rotation and vertical translation on scroll
 */

const ScrollController = (() => {
    let lenis = null;

    function init() {
        gsap.registerPlugin(ScrollTrigger);

        // Smooth scroll with Lenis
        lenis = new Lenis({
            duration: 1.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.9,
            lerp: 0.07
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // DNA Section scroll trigger
        setupDNAScrollTrigger();

        // Hero fade out on scroll
        setupHeroFade();

        // DNA zoom-out transition to experience
        setupZoomOutTransition();

        // Particle-to-atom transition after projects
        setupAtomTransition();
    }

    let hintShown = false;

    function setupDNAScrollTrigger() {
        ScrollTrigger.create({
            trigger: '#dna-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onEnter: () => {
                document.getElementById('skills-container').classList.add('active');
                // Show click hint only on first scroll-down
                if (!hintShown) {
                    hintShown = true;
                    const hint = document.getElementById('click-hint');
                    hint.classList.add('visible');
                    setTimeout(() => hint.classList.remove('visible'), 4000);
                }
            },
            onLeave: () => {
                document.getElementById('skills-container').classList.remove('active');
                document.getElementById('click-hint').classList.remove('visible');
            },
            onEnterBack: () => {
                document.getElementById('skills-container').classList.add('active');
            },
            onLeaveBack: () => {
                document.getElementById('skills-container').classList.remove('active');
                document.getElementById('click-hint').classList.remove('visible');
            },
            onUpdate: (self) => {
                const progress = self.progress;

                // Rotate DNA based on scroll (3 full rotations over the section)
                DNAStrand.setRotationY(progress * Math.PI * 6);

                // Gentle vertical drift to show different parts of the helix
                DNAStrand.setPositionY(-progress * 4 + 2);

                // Update skill label visibility
                if (typeof SkillNodes !== 'undefined') {
                    SkillNodes.updateVisibility(progress);
                }
            }
        });
    }

    function setupHeroFade() {
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'center top',
                scrub: true
            },
            opacity: 0,
            y: -50
        });

        gsap.to('.scroll-indicator', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '20% top',
                scrub: true
            },
            opacity: 0
        });

        // Hero: full blur (1) → 70% blur (0.7) by end of hero
        gsap.to('#dna-blur-overlay', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            opacity: 0.7
        });

        // About: 70% blur → 0 by end of about section, then hide element
        gsap.to('#dna-blur-overlay', {
            scrollTrigger: {
                trigger: '#about',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                onLeave: () => {
                    document.getElementById('dna-blur-overlay').style.display = 'none';
                },
                onEnterBack: () => {
                    document.getElementById('dna-blur-overlay').style.display = '';
                }
            },
            opacity: 0
        });
    }

    function setupZoomOutTransition() {
        const baseCameraZ = 12;
        const zoomedInZ = 1.5;
        const cameraRange = baseCameraZ - zoomedInZ;
        const PI6 = Math.PI * 6;
        const PI2 = Math.PI * 2;

        ScrollTrigger.create({
            trigger: '#dna-transition',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            onUpdate: (self) => {
                const progress = self.progress;

                DNAStrand.setCameraZ(baseCameraZ - cameraRange * progress);
                DNAStrand.setRotationY(PI6 + progress * PI2);
                Particles.setDensity(1 + progress * 2.1);

                // Fade out DNA in the last 40%
                DNAStrand.setOpacity(progress > 0.6 ? 1 - (progress - 0.6) * 2.5 : 1);
            }
        });

        // Experience heading fades in
        gsap.fromTo('.experience-heading', {
            opacity: 0,
            scale: 0.5
        }, {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
                trigger: '#dna-transition',
                start: '60% top',
                end: '85% top',
                scrub: 1.5
            }
        });

        // Timeline vertical line fades in as DNA fades out
        gsap.fromTo('.timeline', {
            '--line-opacity': 0
        }, {
            '--line-opacity': 1,
            scrollTrigger: {
                trigger: '#dna-transition',
                start: '55% top',
                end: '80% top',
                scrub: 1.5
            }
        });

        // Experience entries slide in from far off-screen sides
        const vw = window.innerWidth;
        document.querySelectorAll('.timeline-entry').forEach((entry, i) => {
            const isLeft = i % 2 === 0;
            gsap.fromTo(entry, {
                opacity: 0,
                x: isLeft ? -vw : vw,
                scale: 0.6
            }, {
                opacity: 1,
                x: 0,
                scale: 1,
                scrollTrigger: {
                    trigger: '#dna-transition',
                    start: `${55 + i * 8}% top`,
                    end: `${80 + i * 5}% top`,
                    scrub: 1.5
                }
            });
        });

        // Make experience section visible (remove initial hidden state)
        gsap.to('#experience', {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
                trigger: '#dna-transition',
                start: '50% top',
                end: '55% top',
                scrub: true
            }
        });
    }

    let isSnapping = false;

    function setupAtomTransition() {
        // Shooting star effect: particles fly outward during projects end
        ScrollTrigger.create({
            trigger: '#projects',
            start: '60% center',
            end: 'bottom top',
            scrub: 0.5,
            onUpdate: (self) => {
                const progress = self.progress;
                Particles.setShootMode(progress);
                Particles.setParticleOpacity(1 - progress);
            },
            onLeaveBack: () => {
                Particles.setShootMode(0);
                Particles.setParticleOpacity(1);
            }
        });

        // Snap logic between projects and metrics
        const projectsEl = document.getElementById('projects');
        const metricsEl = document.getElementById('metrics');
        const vh = window.innerHeight;
        let prevScrollY = window.pageYOffset;
        let scrollDir = 1;

        function snapCheck() {
            if (isSnapping) return;

            const currentScroll = window.pageYOffset;
            scrollDir = currentScroll > prevScrollY ? 1 : -1;
            prevScrollY = currentScroll;

            const projectsRect = projectsEl.getBoundingClientRect();
            const metricsRect = metricsEl.getBoundingClientRect();

            // Scrolling DOWN: if projects bottom goes above 75% of viewport
            if (scrollDir > 0 && projectsRect.bottom < vh * 0.75 && projectsRect.bottom > 0) {
                isSnapping = true;
                lenis.stop();
                const targetY = metricsEl.offsetTop - (vh / 2) + (metricsEl.offsetHeight / 2);
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                setTimeout(() => { lenis.start(); isSnapping = false; }, 1200);
            }

            // Scrolling UP: if metrics top goes below 25% of viewport (into bottom 75%)
            if (scrollDir < 0 && metricsRect.top > vh * 0.25 && metricsRect.top < vh) {
                isSnapping = true;
                lenis.stop();
                const targetY = projectsEl.offsetTop - (vh / 2) + (projectsEl.offsetHeight / 2);
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                setTimeout(() => { lenis.start(); isSnapping = false; }, 1200);
            }
        }

        window.addEventListener('scroll', snapCheck);

        // Metrics: fade from 20% → 100% as particles vanish
        gsap.fromTo('#metrics', {
            opacity: 0.2
        }, {
            opacity: 1,
            scrollTrigger: {
                trigger: '#metrics',
                start: 'top bottom',
                end: 'top center',
                scrub: 1
            }
        });

        // Atoms fade in during metrics section
        ScrollTrigger.create({
            trigger: '#metrics',
            start: 'top bottom',
            end: 'top center',
            scrub: 1,
            onUpdate: (self) => {
                Atoms.setOpacity(self.progress);
            },
            onLeaveBack: () => {
                Atoms.setOpacity(0);
            }
        });
    }

    return { init };
})();
