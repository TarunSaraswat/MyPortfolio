/**
 * Main - Entry point, initializes all modules
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize in order
    Particles.init();
    Atoms.init();
    DNAStrand.init();
    SkillNodes.init();
    ARFrame.init();
    ScrollController.init();

    // Typewriter effect for hero title
    typewriterEffect();

    // Scroll animations for new sections
    initSectionAnimations();

    // Counter animation for metrics
    initCounters();

    // Impact detail popup
    initImpactDetail();

    // Copy email on click
    document.getElementById('copy-email').addEventListener('click', function () {
        const text = this.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
            const toast = this.querySelector('.copy-toast');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 1500);
        });
    });
});

function typewriterEffect() {
    const titleEl = document.querySelector('.title-text');
    const text = titleEl.textContent;
    titleEl.textContent = '';
    titleEl.style.visibility = 'visible';

    let i = 0;
    const interval = setInterval(() => {
        titleEl.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(interval);
        }
    }, 100);
}

function initSectionAnimations() {
    // About section fade-in
    ScrollTrigger.create({
        trigger: '#about',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            document.querySelector('.about-content').classList.add('animate-in');
        }
    });

    // Timeline entries are animated by scroll-controller zoom transition

    // Project cards stagger in
    document.querySelectorAll('.project-card').forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                setTimeout(() => card.classList.add('animate-in'), i * 100);
            }
        });
    });

    // Metric cards
    let metricsHintShown = false;
    document.querySelectorAll('.metric-card').forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                setTimeout(() => card.classList.add('animate-in'), i * 100);
                // Show metrics hint on first card enter
                if (!metricsHintShown) {
                    metricsHintShown = true;
                    const hint = document.getElementById('metrics-hint');
                    hint.classList.add('visible');
                    setTimeout(() => hint.classList.remove('visible'), 4000);
                }
            }
        });
    });
}

function initImpactDetail() {
    const detail = document.getElementById('impact-detail');
    const titleEl = document.getElementById('impact-detail-title');
    const textEl = document.getElementById('impact-detail-text');
    const closeBtn = document.getElementById('impact-detail-close');

    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('click', () => {
            const label = card.querySelector('.metric-label').textContent;
            const text = card.dataset.detail;
            titleEl.textContent = label;
            textEl.textContent = text;
            detail.classList.add('visible');
        });
    });

    closeBtn.addEventListener('click', () => {
        detail.classList.remove('visible');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (detail.classList.contains('visible') &&
            !detail.contains(e.target) &&
            !e.target.closest('.metric-card')) {
            detail.classList.remove('visible');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') detail.classList.remove('visible');
    });
}

function initCounters() {
    const counters = document.querySelectorAll('.counter');
    let animated = false;

    ScrollTrigger.create({
        trigger: '#metrics',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (animated) return;
            animated = true;
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const start = performance.now();

                function updateCounter(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    counter.textContent = Math.round(target * eased);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
            });
        }
    });
}
