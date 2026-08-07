/**
 * Main entry point. Content remains usable when animation libraries are missing.
 */

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animationLibrariesReady = [window.THREE, window.gsap, window.ScrollTrigger].every(Boolean);
    const animationReady = !reducedMotion && animationLibrariesReady;

    root.classList.add(animationReady ? 'motion-ok' : 'no-motion');

    SkillNodes.init();
    ARFrame.init();
    initImpactDetail();
    initCopyEmail();

    if (animationReady) {
        try {
            Particles.init();
            Atoms.init();
            DNAStrand.init();
            ScrollController.init();
            typewriterEffect();
            initSectionAnimations();
            initCounters();
        } catch (error) {
            console.error('Enhanced presentation could not start; showing the accessible static version.', error);
            root.classList.remove('motion-ok');
            root.classList.add('no-motion');
            revealAllContent();
        }
    } else {
        revealAllContent();
    }

    document.addEventListener('visibilitychange', () => {
        const paused = document.hidden;
        [DNAStrand, Particles, Atoms].forEach(module => {
            if (module && typeof module.setPaused === 'function') module.setPaused(paused);
        });
    });
});

function revealAllContent() {
    document.querySelector('.about-content')?.classList.add('animate-in');
    document.querySelectorAll('.project-card, .metric-card').forEach(element => element.classList.add('animate-in'));
    document.querySelectorAll('.counter').forEach(counter => {
        counter.textContent = counter.dataset.target;
    });
}

function typewriterEffect() {
    const titleEl = document.querySelector('.title-text');
    if (!titleEl) return;
    const text = titleEl.textContent;
    titleEl.textContent = '';

    let index = 0;
    const interval = window.setInterval(() => {
        titleEl.textContent += text[index];
        index += 1;
        if (index >= text.length) window.clearInterval(interval);
    }, 42);
}

function initSectionAnimations() {
    ScrollTrigger.create({
        trigger: '#about',
        start: 'top 80%',
        once: true,
        onEnter: () => document.querySelector('.about-content')?.classList.add('animate-in')
    });

    document.querySelectorAll('.project-card').forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 88%',
            once: true,
            onEnter: () => window.setTimeout(() => card.classList.add('animate-in'), index * 90)
        });
    });

    let metricsHintShown = false;
    document.querySelectorAll('.metric-card').forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                window.setTimeout(() => card.classList.add('animate-in'), index * 90);
                if (!metricsHintShown) {
                    metricsHintShown = true;
                    const hint = document.getElementById('metrics-hint');
                    hint?.classList.add('visible');
                    window.setTimeout(() => hint?.classList.remove('visible'), 3500);
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
    let returnFocus = null;

    const close = () => {
        if (!detail.classList.contains('visible')) return;
        detail.classList.remove('visible');
        detail.setAttribute('aria-hidden', 'true');
        returnFocus?.focus();
    };

    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('click', () => {
            returnFocus = card;
            titleEl.textContent = card.querySelector('.metric-label').textContent;
            textEl.textContent = card.dataset.detail;
            detail.classList.add('visible');
            detail.setAttribute('aria-hidden', 'false');
            closeBtn.focus();
        });
    });

    closeBtn.addEventListener('click', close);
    document.addEventListener('pointerdown', event => {
        if (detail.classList.contains('visible') && !detail.contains(event.target) && !event.target.closest('.metric-card')) close();
    });
    document.addEventListener('keydown', event => {
        if (!detail.classList.contains('visible')) return;
        if (event.key === 'Escape') close();
        if (event.key === 'Tab') trapFocus(event, detail);
    });
}

function trapFocus(event, container) {
    const focusable = [...container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function initCounters() {
    const counters = [...document.querySelectorAll('.counter')];
    counters.forEach(counter => { counter.textContent = '0'; });
    let animated = false;

    ScrollTrigger.create({
        trigger: '#metrics',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            if (animated) return;
            animated = true;
            counters.forEach(counter => animateCounter(counter, Number.parseInt(counter.dataset.target, 10)));
        }
    });
}

function animateCounter(counter, target) {
    const duration = 1600;
    const start = performance.now();
    const update = now => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}

function initCopyEmail() {
    const button = document.getElementById('copy-email');
    const toast = button.querySelector('.copy-toast');
    button.addEventListener('click', async () => {
        const text = button.dataset.copy;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const input = document.createElement('textarea');
                input.value = text;
                input.setAttribute('readonly', '');
                input.style.position = 'fixed';
                input.style.opacity = '0';
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                input.remove();
            }
            toast.textContent = 'Copied';
        } catch (error) {
            toast.textContent = 'Copy failed';
        }
        toast.classList.add('show');
        window.setTimeout(() => {
            toast.classList.remove('show');
            toast.textContent = '';
        }, 1600);
    });
}
