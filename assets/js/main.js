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
        // const vw = this.viewportWidth; // Removed unused variable
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

function switchTab(tabName, event) {
    const current = document.querySelector('.page-content.active');
    const next = document.getElementById(tabName);

    // Remove active from all nav-items and nav-links
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Add active to the clicked nav-item and nav-link
    let navItem = null, navLink = null;
    if (event && event.currentTarget) {
        navLink = event.currentTarget;
        navItem = navLink.closest('.nav-item');
    } else if (event && event.target) {
        navLink = event.target.closest('.nav-link');
        navItem = navLink ? navLink.closest('.nav-item') : null;
    }
    if (navItem) navItem.classList.add('active');
    if (navLink) navLink.classList.add('active');

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
            event.preventDefault();
            event.stopPropagation(); // Prevent document click handler from firing
            if (!socialSidebar.classList.contains('fully-expanded-bottom')) {
                socialSidebar.classList.toggle('sidebar-expanded');
            }
        });
    }

    // Logo decoding animation
    const logo = document.querySelector('.logo');
    if (logo) {
        const originalText = logo.textContent;
        const spansInfo = [];

        logo.innerHTML = '';
        const normalFontFamily = window.getComputedStyle(logo).fontFamily;
        const alternaFontFamily = "'alterna', sans-serif";

        // 1. Wrap each char in a span, use nbsp for spaces, and set minWidth for monospace effect
        for (let i = 0; i < originalText.length; i++) {
            const char = originalText[i];
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.verticalAlign = 'bottom';
            // 2. Fix font height jump: set a min-width and min-height based on normal font
            span.style.minWidth = '0.65em';
            span.style.minHeight = '1em';
            span.style.lineHeight = '1em';

            if (char === ' ') {
                span.innerHTML = '&nbsp;';
                span.style.fontFamily = normalFontFamily;
            } else {
                span.textContent = char;
            }
            logo.appendChild(span);
            spansInfo.push({
                element: span,
                originalChar: char === ' ' ? '\u00A0' : char,
                isSpace: (char === ' ')
            });
        }

        function randomChar() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
            return chars[Math.floor(Math.random() * chars.length)];
        }

        let isFastDecoding = false;
        let endlessLoopTimeoutId = null;
        let hoverFastDecodeTimeoutId = null;

        function runFastDecoding(onCompleteCallback) {
            isFastDecoding = true;
            clearTimeout(endlessLoopTimeoutId);
            clearTimeout(hoverFastDecodeTimeoutId);

            let cycles = 0;
            // 1. Reduce maxCycles and randomness for a less "chaotic" initial effect
            const maxCycles = 8;

            function step() {
                cycles++;
                spansInfo.forEach(info => {
                    if (info.isSpace) {
                        info.element.innerHTML = '&nbsp;';
                        info.element.style.fontFamily = normalFontFamily;
                        return;
                    }
                    if (cycles < maxCycles) {
                        // Only scramble a small subset each cycle for a less overwhelming effect
                        if (Math.random() < 0.22) {
                            info.element.textContent = randomChar();
                            info.element.style.fontFamily = alternaFontFamily;
                        } else {
                            info.element.textContent = info.originalChar;
                            info.element.style.fontFamily = normalFontFamily;
                        }
                    } else {
                        info.element.textContent = info.originalChar;
                        info.element.style.fontFamily = normalFontFamily;
                    }
                });

                if (cycles < maxCycles) {
                    setTimeout(step, 38);
                } else {
                    isFastDecoding = false;
                    if (onCompleteCallback) {
                        onCompleteCallback();
                    }
                }
            }
            step();
        }

        function startEndlessScramble() {
            clearTimeout(endlessLoopTimeoutId);

            function scramble() {
                if (isFastDecoding) {
                    endlessLoopTimeoutId = setTimeout(scramble, 200 + Math.random() * 150);
                    return;
                }

                spansInfo.forEach(info => {
                    if (info.isSpace) return;
                    if (Math.random() < 0.08) {
                        info.element.textContent = randomChar();
                        info.element.style.fontFamily = alternaFontFamily;
                        setTimeout(() => {
                            if (!isFastDecoding) {
                                info.element.textContent = info.originalChar;
                                info.element.style.fontFamily = normalFontFamily;
                            }
                        }, 200 + Math.random() * 300);
                    }
                });
                endlessLoopTimeoutId = setTimeout(scramble, 200 + Math.random() * 200);
            }
            scramble();
        }

        runFastDecoding(startEndlessScramble);

        const triggerReDecode = () => {
            clearTimeout(hoverFastDecodeTimeoutId);
            hoverFastDecodeTimeoutId = setTimeout(() => {
                runFastDecoding(startEndlessScramble);
            }, 50);
        };

        logo.addEventListener('mouseenter', triggerReDecode);
        logo.addEventListener('focus', triggerReDecode);
    }
});

// Ensure initial scroll position is at the top after all resources are loaded
window.addEventListener('load', function () {
    document.body.style.opacity = '1'; // Ensure body is visible
    window.scrollTo(0, 0);
});

window.addEventListener('scroll', function () {
    closeNavMenuWithAnimation();

    const socialSidebar = document.getElementById('socialSidebar');
    const socialSidebarToggle = document.getElementById('socialSidebarToggle');

    if (socialSidebar && socialSidebarToggle) {
        const isMobile = window.innerWidth <= 768; 

        if (isMobile) {
            // Close expanded sidebar on scroll
            if (socialSidebar.classList.contains('sidebar-expanded')) {
                socialSidebar.classList.remove('sidebar-expanded');
            }

            const atBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20;

            if (atBottom) {
                socialSidebar.classList.add('fully-expanded-bottom');
                socialSidebar.classList.remove('sidebar-expanded');
            } else {
                socialSidebar.classList.remove('fully-expanded-bottom');
            }
        } else {
            socialSidebar.classList.remove('fully-expanded-bottom');
            socialSidebar.classList.remove('sidebar-expanded');
        }
    }

    // Header blur on scroll
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}, {passive: true});

document.addEventListener('click', function (event) {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.querySelector('.nav-toggle');
    const socialSidebar = document.getElementById('socialSidebar');
    const socialSidebarToggle = document.getElementById('socialSidebarToggle');

    // Close nav menu
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
        closeNavMenuWithAnimation();
    }

    // Close social sidebar if clicking outside of it
    if (socialSidebar && socialSidebarToggle && 
        !socialSidebar.contains(event.target) && 
        socialSidebar.classList.contains('sidebar-expanded')) {
        socialSidebar.classList.remove('sidebar-expanded');
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
