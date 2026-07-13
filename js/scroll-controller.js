/**
 * Scroll Controller - GSAP ScrollTrigger integration
 * Drives DNA rotation and vertical translation on scroll
 */

const ScrollController = (() => {
    let scrollTriggerInstance = null;
    let isInDNASection = false;

    function init() {
        gsap.registerPlugin(ScrollTrigger);

        // Smooth scroll with Lenis
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
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
    let hintTimeout = null;

    function setupDNAScrollTrigger() {
        scrollTriggerInstance = ScrollTrigger.create({
            trigger: '#dna-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onEnter: () => {
                isInDNASection = true;
                document.getElementById('skills-container').classList.add('active');
                // Show click hint only on first scroll-down
                if (!hintShown) {
                    hintShown = true;
                    const hint = document.getElementById('click-hint');
                    hint.classList.add('visible');
                    hintTimeout = setTimeout(() => {
                        hint.classList.remove('visible');
                    }, 4000);
                }
            },
            onLeave: () => {
                isInDNASection = false;
                document.getElementById('skills-container').classList.remove('active');
                document.getElementById('click-hint').classList.remove('visible');
            },
            onEnterBack: () => {
                isInDNASection = true;
                document.getElementById('skills-container').classList.add('active');
            },
            onLeaveBack: () => {
                isInDNASection = false;
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

        // About: 70% blur → 0 by end of about section
        gsap.to('#dna-blur-overlay', {
            scrollTrigger: {
                trigger: '#about',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            opacity: 0
        });
    }

    function setupZoomOutTransition() {
        const baseCameraZ = 12; // Normal camera Z
        const zoomedInZ = 1.5; // Very close = zooming INTO the DNA

        ScrollTrigger.create({
            trigger: '#dna-transition',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            onUpdate: (self) => {
                const progress = self.progress;

                // Zoom IN camera (DNA gets huge, we fly into it)
                const newZ = baseCameraZ - (baseCameraZ - zoomedInZ) * progress;
                DNAStrand.setCameraZ(newZ);

                // Keep rotating during zoom-in
                DNAStrand.setRotationY(Math.PI * 6 + progress * Math.PI * 2);

                // Increase particle density as we zoom in (1x → 2.85x)
                Particles.setDensity(1 + progress * 2.1);

                // Fade out DNA in the last 40% (particles engulf the view)
                if (progress > 0.6) {
                    const fadeProgress = (progress - 0.6) / 0.4;
                    DNAStrand.setOpacity(1 - fadeProgress);
                } else {
                    DNAStrand.setOpacity(1);
                }
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
        gsap.fromTo('.timeline::before', {
            opacity: 0
        }, {
            opacity: 1,
            scrollTrigger: {
                trigger: '#dna-transition',
                start: '55% top',
                end: '80% top',
                scrub: 1.5
            }
        });
        // Use the timeline element itself since pseudo-elements can't be targeted by GSAP
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

    function setupAtomTransition() {
        // Shooting star effect: particles fly outward during projects end
        ScrollTrigger.create({
            trigger: '#projects',
            start: '60% center',
            end: 'bottom top',
            scrub: 0.5,
            onUpdate: (self) => {
                const progress = self.progress;
                // Particles shoot outward like stars
                Particles.setShootMode(progress);
                // Fade out particles
                Particles.setParticleOpacity(1 - progress);
            },
            onLeaveBack: () => {
                // Reset when scrolling back up
                Particles.setShootMode(0);
                Particles.setParticleOpacity(1);
            }
        });

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

    function getIsInDNASection() {
        return isInDNASection;
    }

    return { init, getIsInDNASection };
})();
