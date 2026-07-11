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
    }

    function setupDNAScrollTrigger() {
        scrollTriggerInstance = ScrollTrigger.create({
            trigger: '#dna-section',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onEnter: () => {
                isInDNASection = true;
                document.getElementById('skills-container').classList.add('active');
            },
            onLeave: () => {
                isInDNASection = false;
                document.getElementById('skills-container').classList.remove('active');
            },
            onEnterBack: () => {
                isInDNASection = true;
                document.getElementById('skills-container').classList.add('active');
            },
            onLeaveBack: () => {
                isInDNASection = false;
                document.getElementById('skills-container').classList.remove('active');
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

        // Fade out blur overlay as user scrolls past hero
        gsap.to('#dna-blur-overlay', {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            opacity: 0
        });
    }

    function getIsInDNASection() {
        return isInDNASection;
    }

    return { init, getIsInDNASection };
})();
