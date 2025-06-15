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
        placement: 'right',
        duration: 300,
        delay: [500, 200],
        offset: [0, 15],
        animation: 'scale'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    particleSystem = new ParticleSystem();
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

// Rainbow gradient color shifting on scroll and device tilt (fluid & dynamic)
(function () {
    let tiltX = 0, tiltY = 0;
    let lastHue = 0, lastSat = 1;
    let lastScrollY = window.scrollY;

    function setGradientHue(hue = 0, sat = 1) {
        hue = Math.round(hue) % 360;
        sat = Math.max(0.7, Math.min(1.3, sat));
        if (hue === lastHue && sat === lastSat) return;
        lastHue = hue; lastSat = sat;
        const styleId = 'rainbow-gradient-hue-style';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        style.textContent = `
            body::before {
                filter: hue-rotate(${hue}deg) saturate(${sat});
                transition: filter 0.12s cubic-bezier(.4,0,.2,1);
            }
        `;
    }

    // Make color shift fluid and dynamic to scroll velocity and direction
    let lastFrame = performance.now();
    let velocity = 0;
    let lastScroll = window.scrollY;

    function animate() {
        const now = performance.now();
        const scrollY = window.scrollY;
        const dt = Math.max(1, now - lastFrame);
        // Calculate velocity (pixels/ms)
        velocity = (scrollY - lastScroll) / dt;
        lastScroll = scrollY;
        lastFrame = now;

        // Use velocity and tilt for hue/sat
        const baseHue = (scrollY * 0.25 + tiltX * 1.5 + tiltY * 0.5) % 360;
        // Add a velocity-based offset for dynamic color shifting
        const hue = (baseHue + velocity * 180) % 360;
        const sat = 1 + Math.min(0.3, Math.abs(velocity) * 2) + Math.abs(tiltY) / 120;

        setGradientHue(hue, sat);

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    // Device tilt: shift hue and saturation based on device orientation
    window.addEventListener('deviceorientation', function (event) {
        const gamma = event.gamma || 0;
        const beta = event.beta || 0;
        tiltX = Math.max(-30, Math.min(30, gamma));
        tiltY = Math.max(-30, Math.min(30, beta - 45));
    }, true);

    setGradientHue(0, 1);
})();
