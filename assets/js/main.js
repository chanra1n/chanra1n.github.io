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
