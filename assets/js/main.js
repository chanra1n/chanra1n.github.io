if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.maxParticles = 50;
        this.particleTypes = ['particle-small', 'particle-medium'];
        this.isRunning = false;
        this.spawnInterval = null;
        this.particles = [];
        if (!this.container) return;
        this.viewportHeight = window.innerHeight;
        this.viewportWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            this.viewportHeight = window.innerHeight;
            this.viewportWidth = window.innerWidth;
        });
        this.start();
        this.animateParticles = this.animateParticles.bind(this);
        requestAnimationFrame(this.animateParticles);
    }

    spawnParticle() {
        if (this.particles.length >= this.maxParticles) return;
        const type = this.particleTypes[Math.floor(Math.random() * this.particleTypes.length)];
        const el = document.createElement('div');
        el.className = 'particle ' + type;

        // Logical properties for simulation
        const layer = Math.random();
        const baseX = Math.random();
        const baseY = Math.random();
        const speed = 0.0002 + Math.random() * 0.0008;
        const drift = (Math.random() - 0.5) * 0.01;
        const wobbleAmp = 0.003 + Math.random() * 0.008;
        const wobbleFreq = 0.2 + Math.random() * 0.5;
        const twinkleDuration = 1.5 + Math.random() * 2.5;
        const twinkleDelay = Math.random() * 2;

        el.style.animation = `twinkle ${twinkleDuration}s ease-in-out ${twinkleDelay}s infinite`;

        let y = baseY * 1.2;
        let x = baseX;

        el.style.position = 'absolute';
        el.style.opacity = 0;
        this.container.appendChild(el);

        const particle = {
            el,
            layer,
            x,
            y,
            speed,
            drift,
            wobbleAmp,
            wobbleFreq,
            born: performance.now(),
            opacity: 0,
            alive: true,
            removing: false
        };
        this.particles.push(particle);

        // Fade in
        setTimeout(() => {
            el.style.transition = 'opacity 0.7s cubic-bezier(.4,0,.2,1)';
            el.style.opacity = 1;
            particle.opacity = 1;
        }, 10);
    }

    animateParticles() {
        const now = performance.now();
        const vh = this.viewportHeight;
        const vw = this.viewportWidth;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (!p.alive) continue;
            // Move upward, much slower for realistic dust
            p.y -= p.speed * (1 - p.layer * 0.6);
            p.x += p.drift * p.speed * 0.5;
            const wobble = Math.sin((now - p.born) * 0.001 * p.wobbleFreq) * p.wobbleAmp;
            const parallaxY = p.y + window.scrollY / vh * p.layer * 0.5;

            // If particle is out of bounds and not already fading out, start fade out
            if ((parallaxY < -0.05 || p.x < -0.05 || p.x > 1.05) && !p.removing) {
                p.removing = true;
                p.el.style.transition = 'opacity 0.7s cubic-bezier(.4,0,.2,1)';
                p.el.style.opacity = 0;
                setTimeout(() => {
                    p.el.remove();
                    this.particles.splice(i, 1);
                    if (this.isRunning) this.spawnParticle();
                }, 700); // match fade out duration
                continue;
            }
            if (p.removing) continue;

            p.el.style.left = `${p.x * 100}%`;
            p.el.style.top = `${parallaxY * 100}%`;
            p.el.style.transform = `translateX(${wobble * 100}%)`;
        }
        if (this.isRunning && this.particles.length < this.maxParticles) {
            this.spawnParticle();
        }
        requestAnimationFrame(this.animateParticles);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        for (let i = 0; i < this.maxParticles; i++) {
            this.spawnParticle();
        }
    }
    stop() {
        this.isRunning = false;
    }
    cleanup() {
        // Remove all particles
        this.particles.forEach(p => p.el.remove());
        this.particles = [];
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
    if (navMenu.classList.contains('active') && !navMenu.classList.contains('menu-anim-out')) {
        navMenu.classList.add('menu-anim-out');
        navMenu.classList.remove('menu-anim-in');
        // Remove only after animation ends
        navMenu.addEventListener('animationend', function handler(e) {
            if (e.animationName === 'navMenuPopOut') {
                navMenu.classList.remove('active', 'menu-anim-out');
                navMenu.removeEventListener('animationend', handler);
            }
        });
    }
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

    const socialSidebar = document.getElementById('socialSidebar');
    const socialSidebarToggle = document.getElementById('socialSidebarToggle');

    if (socialSidebarToggle && socialSidebar) {
        socialSidebarToggle.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior
            if (!socialSidebar.classList.contains('fully-expanded-bottom')) {
                socialSidebar.classList.toggle('sidebar-expanded');
            }
        });
    }
});

// Ensure initial scroll position is at the top after all resources are loaded
window.addEventListener('load', function () {
    window.scrollTo(0, 0);
});

window.addEventListener('scroll', function () {
    closeNavMenuWithAnimation();

    const socialSidebar = document.getElementById('socialSidebar');
    const socialSidebarToggle = document.getElementById('socialSidebarToggle');

    if (socialSidebar && socialSidebarToggle) {
        // Check if on mobile (e.g., by checking viewport width or a CSS-driven class)
        const isMobile = window.innerWidth <= 768; 

        if (isMobile) {
            const atBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20; // 20px buffer

            if (atBottom) {
                socialSidebar.classList.add('fully-expanded-bottom');
                socialSidebar.classList.remove('sidebar-expanded'); // Ensure tap expansion is off
            } else {
                socialSidebar.classList.remove('fully-expanded-bottom');
            }
        } else {
            // On desktop, ensure it's not in mobile-specific expansion states
            socialSidebar.classList.remove('fully-expanded-bottom');
            socialSidebar.classList.remove('sidebar-expanded');
        }
    }
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

// Wii U style: no color shifting, just twinkling/sparkling particles
(function () {
    // Remove any previous gradient/brightness animation logic
    const styleId = 'rgb-gradient-bright-style';
    let style = document.getElementById(styleId);
    if (style) style.remove();
})();
