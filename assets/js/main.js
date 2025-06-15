class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.maxParticles = 40;
        this.particleTypes = ['particle-small', 'particle-medium', 'particle-large', 'particle-glow'];
        this.isRunning = false;
        this.spawnInterval = null;
        if (!this.container) return;
        this.start();
    }
    spawnParticle() {
        if (this.container.childElementCount >= this.maxParticles) return;
        const particle = document.createElement('div');
        particle.className = 'particle ' + this.particleTypes[Math.floor(Math.random() * this.particleTypes.length)];
        const startX = Math.random() * 100;
        const drift = (Math.random() - 0.5) * 120;
        const duration = Math.random() * 8 + 10;
        const delay = Math.random() * 2;
        particle.style.left = `${startX}%`;
        particle.style.bottom = '0px';
        particle.style.setProperty('--drift', `${drift}px`);
        particle.style.animation = `particleRise ${duration}s linear ${delay}s 1 both`;
        this.container.appendChild(particle);
        setTimeout(() => {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, (duration + delay) * 1000);
    }
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        for (let i = 0; i < this.maxParticles; i++) {
            setTimeout(() => this.spawnParticle(), i * 200);
        }
        this.spawnInterval = setInterval(() => {
            if (this.container.childElementCount < this.maxParticles) {
                this.spawnParticle();
            }
        }, 700);
    }
    stop() {
        this.isRunning = false;
        if (this.spawnInterval) clearInterval(this.spawnInterval);
    }
    cleanup() {
        // No-op for now, kept for compatibility
    }
}

let particleSystem = null;

function switchTab(tabName) {
    const current = document.querySelector('.page-content.active');
    const next = document.getElementById(tabName);
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    if (current && current !== next) {
        current.classList.remove('active');
        current.classList.add('out');
        setTimeout(() => current.classList.remove('out'), 350);
    }
    if (next && !next.classList.contains('active')) {
        setTimeout(() => next.classList.add('active'), current && current !== next ? 350 : 0);
    }
    closeNavMenuWithAnimation();
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu.classList.contains('active')) {
        closeNavMenuWithAnimation();
    } else {
        navMenu.classList.add('active', 'menu-anim-in');
        navMenu.classList.remove('menu-anim-out');
        setTimeout(() => navMenu.classList.remove('menu-anim-in'), 450);
    }
}

function closeNavMenuWithAnimation() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu.classList.contains('active')) {
        navMenu.classList.add('menu-anim-out');
        navMenu.classList.remove('menu-anim-in');
        setTimeout(() => navMenu.classList.remove('active', 'menu-anim-out'), 350);
    }
}

function initTooltips() {
    tippy('[data-tippy-content]', {
        placement: 'right',
        duration: 300,
        delay: [500, 200],
        offset: [0, 15],
        animation: 'scale'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    particleSystem = new ParticleSystem();
    initTooltips();
    setInterval(() => {
        if (particleSystem) particleSystem.cleanup();
    }, 20000);
    document.addEventListener('visibilitychange', function () {
        if (particleSystem) {
            if (document.hidden) particleSystem.stop();
            else particleSystem.start();
        }
    });
});

window.addEventListener('scroll', function () {
    closeNavMenuWithAnimation();
});

document.addEventListener('click', function (event) {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.querySelector('.nav-toggle');
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        closeNavMenuWithAnimation();
    }
});

window.addEventListener('focus', function () {
    setTimeout(() => {
        if (particleSystem && document.getElementById('particles').childElementCount === 0 && !document.hidden) {
            particleSystem.start();
        }
    }, 1000);
});

window.addEventListener('beforeunload', function () {
    if (particleSystem) particleSystem.stop();
});

// Holographic shimmer effect on scroll and device tilt
(function () {
    let lastScrollY = window.scrollY;
    let ticking = false;
    let shimmerTimeout = null;

    function setShimmerTransform(x = 0, y = 0) {
        document.body.style.setProperty('--shimmer-x', x + 'deg');
        document.body.style.setProperty('--shimmer-y', y + 'deg');
        document.body.style.setProperty('--shimmer-translate-x', x + 'px');
        document.body.style.setProperty('--shimmer-translate-y', y + 'px');
        document.body.style.setProperty('--shimmer-opacity', '0.95');
        document.body.classList.add('shimmer-active');
        // Remove shimmer after a short delay
        if (shimmerTimeout) clearTimeout(shimmerTimeout);
        shimmerTimeout = setTimeout(() => {
            document.body.classList.remove('shimmer-active');
            document.body.style.setProperty('--shimmer-opacity', '0.7');
        }, 400);
    }

    // Scroll shimmer
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                const scrollY = window.scrollY;
                const dx = 0;
                const dy = (scrollY - lastScrollY) * 0.7;
                setShimmerTransform(dx, dy);
                lastScrollY = scrollY;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Device tilt shimmer
    window.addEventListener('deviceorientation', function (event) {
        // gamma: left/right, beta: front/back
        const gamma = event.gamma || 0;
        const beta = event.beta || 0;
        // Clamp for effect
        const x = Math.max(-30, Math.min(30, gamma)) * 1.5;
        const y = Math.max(-30, Math.min(30, beta - 45)) * 1.5;
        setShimmerTransform(x, y);
    }, true);

    // Apply shimmer effect to body::after
    function updateShimmerCSS() {
        const styleId = 'holo-shimmer-style';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        style.textContent = `
            body::after {
                opacity: var(--shimmer-opacity, 0.7);
                transform:
                    translateX(var(--shimmer-translate-x, 0px))
                    translateY(var(--shimmer-translate-y, 0px))
                    rotateX(var(--shimmer-x, 0deg))
                    rotateY(var(--shimmer-y, 0deg));
                transition:
                    opacity 0.2s,
                    transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
            }
            body.shimmer-active::after {
                opacity: var(--shimmer-opacity, 0.95);
            }
        `;
    }
    updateShimmerCSS();
})();
