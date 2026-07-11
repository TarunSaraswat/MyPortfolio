/**
 * AR Frame - Holographic skill detail panel
 * Reveals on skill click with sci-fi animation
 */

const ARFrame = (() => {
    let isOpen = false;
    let currentTimeline = null;

    function init() {
        document.getElementById('ar-close').addEventListener('click', hide);

        // Close on overlay click (outside frame)
        document.getElementById('ar-frame-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'ar-frame-overlay') hide();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) hide();
        });
    }

    function show(skill, side) {
        if (isOpen) {
            hide(() => showFrame(skill, side));
            return;
        }
        showFrame(skill, side);
    }

    function showFrame(skill, side) {
        isOpen = true;

        const overlay = document.getElementById('ar-frame-overlay');
        const frame = document.getElementById('ar-frame');

        // Set side class for positioning
        overlay.classList.remove('side-left', 'side-right');
        overlay.classList.add(`side-${side === 'left' ? 'right' : 'left'}`);

        // Populate content
        document.getElementById('ar-skill-name').textContent = skill.name;
        document.getElementById('ar-category').textContent = skill.category;
        document.getElementById('ar-experience').textContent = skill.experience;
        document.getElementById('ar-context').textContent = skill.context;
        document.getElementById('ar-related').textContent = skill.related;

        // Shift DNA to opposite side
        const dnaShift = side === 'left' ? 3 : -3;

        // Kill previous timeline
        if (currentTimeline) currentTimeline.kill();

        // Animation timeline
        currentTimeline = gsap.timeline();

        currentTimeline
            // Shift DNA
            .to({}, {
                duration: 0.8,
                ease: 'power3.inOut',
                onUpdate: function () {
                    DNAStrand.setPositionX(dnaShift * this.progress());
                }
            })
            // Show overlay
            .set(overlay, { visibility: 'visible' })
            .to(overlay, {
                opacity: 1,
                duration: 0.3
            }, '-=0.5')
            // Animate frame in
            .fromTo(frame, {
                opacity: 0,
                scale: 0.85,
                rotateY: side === 'left' ? 10 : -10
            }, {
                opacity: 1,
                scale: 1,
                rotateY: 0,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.3')
            // Corners flash in
            .fromTo('.ar-corner', {
                opacity: 0,
                scale: 0
            }, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                stagger: 0.05,
                ease: 'back.out(2)'
            }, '-=0.3')
            // Scanline
            .to('.ar-scanline', {
                opacity: 1,
                duration: 0.2
            }, '-=0.2')
            // Content reveal
            .to('.ar-frame-content', {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.1');

        overlay.classList.add('active');
    }

    function hide(callback) {
        if (!isOpen) {
            if (callback) callback();
            return;
        }

        isOpen = false;

        const overlay = document.getElementById('ar-frame-overlay');

        if (currentTimeline) currentTimeline.kill();

        currentTimeline = gsap.timeline({
            onComplete: () => {
                overlay.classList.remove('active');
                overlay.style.visibility = 'hidden';
                overlay.style.opacity = 0;
                // Reset content for next open
                gsap.set('.ar-frame-content', { opacity: 0, y: 10 });
                gsap.set('.ar-corner', { opacity: 0 });
                gsap.set('.ar-scanline', { opacity: 0 });
                if (callback) callback();
            }
        });

        currentTimeline
            .to('.ar-frame-content', {
                opacity: 0,
                y: -10,
                duration: 0.2
            })
            .to('#ar-frame', {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                ease: 'power2.in'
            }, '-=0.1')
            .to(overlay, {
                opacity: 0,
                duration: 0.3
            }, '-=0.2')
            // Return DNA to center
            .to({}, {
                duration: 0.6,
                ease: 'power3.inOut',
                onUpdate: function () {
                    const currentX = DNAStrand.getGroup().position.x;
                    DNAStrand.setPositionX(currentX * (1 - this.progress()));
                }
            }, '-=0.3');
    }

    return { init, show, hide };
})();
