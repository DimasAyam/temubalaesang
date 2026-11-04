/* 
  ========================================
  TEMUBALAESANG.ME - MAIN HOMEPAGE JAVASCRIPT
  ========================================
  Features:
  1. Fullscreen Underwater Bubble Canvas Particle System (Zero external assets)
  2. The Swimming Turtle Easter Egg:
     - Multi-click activation on #header-logo
     - Big massive red arrow with bounce & text tip
     - getBoundingClientRect() coordinate tracking & smooth logo morph
     - Pop animation & radial bubble burst
     - Smooth LERP chasing physics (0.04 factor) with Math.atan2 rotation & swim wobble
     - Bubble trails from swimming flippers
     - Click-to-return / reset feature
  3. Light / Dark Theme toggle with automatic logo-placeholder swap
  ========================================
*/

(function () {
    'use strict';

    // ========================================
    // 1. THEME MANAGEMENT & LOGO SWAP
    // ========================================
    const THEME_STORAGE_KEY = 'temubalaesang_theme';
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const headerLogoImg = document.getElementById('header-logo-img');

    // Logo filenames
    const LOGO_LIGHT = 'logo-placeholder.png';   // Soft white contour for light theme
    const LOGO_DARK = 'logo-placeholder2.png';  // Vivid logo for dark theme

    function updateLogoForTheme(isLight) {
        if (!headerLogoImg) return;
        headerLogoImg.src = isLight ? LOGO_LIGHT : LOGO_DARK;
    }

    function setTheme(theme) {
        const isLight = theme === 'light';
        if (isLight) {
            body.classList.add('light-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
        } else {
            body.classList.remove('light-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
        }
        updateLogoForTheme(isLight);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    // Update Year in Footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }


    // ========================================
    // 2. UNDERWATER BUBBLE CANVAS ENGINE
    // ========================================
    const canvas = document.getElementById('underwater-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    let width = 0;
    let height = 0;
    let bubbles = [];
    let isUnderwaterDense = false;
    let targetBubbleCount = 35; // Ambient count

    function resizeCanvas() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Bubble {
        constructor(initialSpawn = false) {
            this.reset(initialSpawn);
        }

        reset(initialSpawn = false) {
            this.x = Math.random() * (width || window.innerWidth);
            this.y = initialSpawn ? Math.random() * (height || window.innerHeight) : (height || window.innerHeight) + Math.random() * 50;
            this.radius = 2.5 + Math.random() * 9;
            this.speedY = 0.6 + Math.random() * 1.6;
            this.wobbleAmp = 0.5 + Math.random() * 1.5;
            this.wobbleSpeed = 0.02 + Math.random() * 0.03;
            this.wobbleOffset = Math.random() * Math.PI * 2;
            this.opacity = 0.2 + Math.random() * 0.45;
        }

        update() {
            this.y -= this.speedY;
            this.wobbleOffset += this.wobbleSpeed;
            this.x += Math.sin(this.wobbleOffset) * this.wobbleAmp;

            if (this.y < -this.radius * 2) {
                this.reset(false);
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Outer translucent bubble
            ctx.fillStyle = `rgba(186, 230, 253, ${this.opacity * 0.2})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.75})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Inner light reflection gleam
            ctx.beginPath();
            ctx.arc(
                this.x - this.radius * 0.35,
                this.y - this.radius * 0.35,
                this.radius * 0.25,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.85})`;
            ctx.fill();
        }
    }

    function initBubbles() {
        resizeCanvas();
        bubbles = [];
        for (let i = 0; i < targetBubbleCount; i++) {
            bubbles.push(new Bubble(true));
        }
    }

    function setBubbleDensity(dense) {
        isUnderwaterDense = dense;
        targetBubbleCount = dense ? 105 : 35;
        // Gradually expand or prune
        while (bubbles.length < targetBubbleCount) {
            bubbles.push(new Bubble(true));
        }
    }

    function animateCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // If easter egg is active, draw a subtle deep ocean light shimmer
        if (isUnderwaterDense) {
            const grad = ctx.createRadialGradient(
                width / 2, height * 0.2, 50,
                width / 2, height / 2, Math.max(width, height)
            );
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
            grad.addColorStop(1, 'rgba(2, 43, 66, 0.18)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
        }

        for (let i = 0; i < bubbles.length; i++) {
            bubbles[i].update();
            bubbles[i].draw(ctx);
        }

        // If bubble count exceeds target, slowly shrink
        if (bubbles.length > targetBubbleCount) {
            bubbles.pop();
        }

        requestAnimationFrame(animateCanvas);
    }

    if (canvas && ctx) {
        window.addEventListener('resize', resizeCanvas);
        initBubbles();
        requestAnimationFrame(animateCanvas);
    }


    // ========================================
    // 3. SYNTHESIZED SOUND EFFECTS (WEB AUDIO)
    // ========================================
    // Zero audio file dependencies! Pure browser web audio synth
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playBloopSound() {
        try {
            const actx = getAudioContext();
            if (!actx) return;
            const osc = actx.createOscillator();
            const gain = actx.createGain();

            osc.type = 'sine';
            const now = actx.currentTime;
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(actx.destination);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {
            // Audio policy fallback
        }
    }

    function playTickSound() {
        try {
            const actx = getAudioContext();
            if (!actx) return;
            const osc = actx.createOscillator();
            const gain = actx.createGain();

            osc.type = 'triangle';
            const now = actx.currentTime;
            osc.frequency.setValueAtTime(540, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(actx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }


    // ========================================
    // 4. EASTER EGG: MASSIVE RED ARROW & TURTLE
    // ========================================
    const headerLogo = document.getElementById('header-logo');
    const arrowTip = document.getElementById('easter-egg-arrow-tip');
    const arrowText = document.getElementById('arrow-tip-text');
    const turtleContainer = document.getElementById('easter-egg-turtle');
    const turtleStatusPill = document.getElementById('turtle-status-pill');

    let clickCount = 0;
    let clickResetTimer = null;
    let isEasterEggActive = false;

    // Turtle Physics & LERP
    let turtleX = 0;
    let turtleY = 0;
    let targetMouseX = window.innerWidth / 2;
    let targetMouseY = window.innerHeight / 2;
    let turtleAngle = 0;
    let animFrameId = null;
    let lastTrailTime = 0;

    // Track mouse / touch position
    function onPointerMove(e) {
        if (!isEasterEggActive) return;
        if (e.touches && e.touches.length > 0) {
            targetMouseX = e.touches[0].clientX;
            targetMouseY = e.touches[0].clientY;
        } else {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        }
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    // Position the Massive Red Arrow right under / pointing at the logo
    function showRedArrow(textMessage) {
        if (!arrowTip || !headerLogo) return;

        const rect = headerLogo.getBoundingClientRect();
        // Position below the logo pointing up towards it
        const arrowX = rect.left + rect.width / 2;
        const arrowY = rect.bottom + 12;

        arrowTip.style.left = `${arrowX}px`;
        arrowTip.style.top = `${arrowY}px`;
        arrowTip.style.transform = `translateX(-50%)`;

        if (arrowText) {
            arrowText.textContent = textMessage;
        }

        arrowTip.classList.add('is-active');
    }

    function hideRedArrow() {
        if (!arrowTip) return;
        arrowTip.classList.remove('is-active');
    }

    // Radial bubble burst particles on transformation
    function spawnBubbleBurst(originX, originY) {
        const particleCount = 24;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'bubble-burst-particle';

            const size = 8 + Math.random() * 16;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${originX}px`;
            particle.style.top = `${originY}px`;
            particle.style.transform = `translate(-50%, -50%) scale(0.2)`;

            document.body.appendChild(particle);

            // Radial velocity
            const angle = (Math.PI * 2 / particleCount) * i + (Math.random() * 0.4 - 0.2);
            const distance = 40 + Math.random() * 95;
            const destX = Math.cos(angle) * distance;
            const destY = Math.sin(angle) * distance;

            const duration = 500 + Math.random() * 350;

            const animation = particle.animate([
                {
                    transform: `translate(-50%, -50%) scale(0.2)`,
                    opacity: 1
                },
                {
                    transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.1)`,
                    opacity: 0.8,
                    offset: 0.6
                },
                {
                    transform: `translate(calc(-50% + ${destX * 1.2}px), calc(-50% + ${destY * 1.2 - 25}px)) scale(0.4)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            });

            animation.onfinish = () => particle.remove();
        }
    }

    // Spawns a soft trailing bubble behind the swimming turtle
    function spawnFlipperBubble(x, y) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-burst-particle';
        const size = 6 + Math.random() * 8;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;
        bubble.style.transform = `translate(-50%, -50%) scale(0.8)`;

        document.body.appendChild(bubble);

        const driftY = -(20 + Math.random() * 30);
        const driftX = (Math.random() - 0.5) * 16;

        const anim = bubble.animate([
            { transform: 'translate(-50%, -50%) scale(0.8)', opacity: 0.7 },
            { transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1.2)`, opacity: 0 }
        ], {
            duration: 700 + Math.random() * 300,
            easing: 'ease-out'
        });

        anim.onfinish = () => bubble.remove();
    }

    // Main LERP Physics Loop for the Turtle
    function updateTurtlePhysics() {
        if (!isEasterEggActive || !turtleContainer) return;

        const deltaX = targetMouseX - turtleX;
        const deltaY = targetMouseY - turtleY;
        const distance = Math.hypot(deltaX, deltaY);

        // LERP movement (0.04 factor as requested for realistic swimming momentum)
        turtleX += deltaX * 0.04;
        turtleY += deltaY * 0.04;

        // Rotation towards movement target
        // Since the turtle sprite naturally points UP, add 90 degrees
        if (distance > 3) {
            const targetAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
            let diff = (targetAngle - turtleAngle) % 360;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            turtleAngle += diff * 0.08;
        }

        // Natural swimming paddle wiggle
        const now = Date.now();
        const swimWobble = Math.sin(now * 0.008) * (distance > 10 ? 8 : 2.5);
        const renderAngle = turtleAngle + swimWobble;

        turtleContainer.style.left = `${turtleX}px`;
        turtleContainer.style.top = `${turtleY}px`;
        turtleContainer.style.transform = `translate(-50%, -50%) rotate(${renderAngle}deg)`;

        // Emit trail bubbles behind turtle when swimming
        if (distance > 15 && now - lastTrailTime > 140) {
            lastTrailTime = now;
            // Spawn slightly behind the turtle based on opposite of angle
            const rad = (turtleAngle - 90) * (Math.PI / 180);
            const tailX = turtleX - Math.cos(rad) * 32;
            const tailY = turtleY - Math.sin(rad) * 32;
            spawnFlipperBubble(tailX, tailY);
        }

        animFrameId = requestAnimationFrame(updateTurtlePhysics);
    }

    // Activate the Turtle Transformation
    function triggerEasterEggTransformation() {
        if (isEasterEggActive || !headerLogo || !turtleContainer) return;
        isEasterEggActive = true;
        hideRedArrow();

        // Step 1: Exact position coordinates via getBoundingClientRect()
        const rect = headerLogo.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        turtleX = startX;
        turtleY = startY;
        targetMouseX = window.innerWidth / 2;
        targetMouseY = window.innerHeight / 2;
        turtleAngle = 0;

        // Step 2: Hide static header logo with scale-down / fade-out effect
        headerLogo.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        headerLogo.style.transform = 'scale(0.1) rotate(-60deg)';
        headerLogo.style.opacity = '0';
        headerLogo.style.pointerEvents = 'none';

        // Step 3: Spawn turtle at exact coordinates
        turtleContainer.style.display = 'block';
        turtleContainer.style.left = `${startX}px`;
        turtleContainer.style.top = `${startY}px`;
        turtleContainer.style.transform = `translate(-50%, -50%) scale(1)`;
        turtleContainer.classList.add('turtle-spawn-anim');

        // Step 4: Bubble burst effect & sound
        spawnBubbleBurst(startX, startY);
        playBloopSound();

        // Increase underwater canvas bubble density
        setBubbleDensity(true);

        // Show status badge
        if (turtleStatusPill) {
            turtleStatusPill.classList.add('is-visible');
        }

        // Once the 0.6s pop animation completes, start smooth chasing physics
        setTimeout(() => {
            turtleContainer.classList.remove('turtle-spawn-anim');
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(updateTurtlePhysics);
        }, 600);
    }

    // Deactivate / Reset the Turtle back to the Header
    function resetTurtleToHeader() {
        if (!isEasterEggActive || !headerLogo || !turtleContainer) return;

        if (animFrameId) cancelAnimationFrame(animFrameId);

        // Move turtle smoothly back to header logo position
        const rect = headerLogo.getBoundingClientRect();
        const destX = rect.left + rect.width / 2;
        const destY = rect.top + rect.height / 2;

        turtleContainer.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        turtleContainer.style.left = `${destX}px`;
        turtleContainer.style.top = `${destY}px`;
        turtleContainer.style.transform = `translate(-50%, -50%) scale(0.1) rotate(180deg)`;
        turtleContainer.style.opacity = '0';

        if (turtleStatusPill) {
            turtleStatusPill.classList.remove('is-visible');
        }

        playBloopSound();

        setTimeout(() => {
            turtleContainer.style.display = 'none';
            turtleContainer.style.transition = '';
            turtleContainer.style.opacity = '1';

            // Restore header logo
            headerLogo.style.pointerEvents = 'auto';
            headerLogo.style.transform = 'scale(1) rotate(0deg)';
            headerLogo.style.opacity = '1';

            setBubbleDensity(false);
            isEasterEggActive = false;
            clickCount = 0;
        }, 600);
    }

    // Header Logo Click Listener
    if (headerLogo) {
        headerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            if (isEasterEggActive) return;

            clickCount++;
            clearTimeout(clickResetTimer);

            if (clickCount === 1) {
                // Click 1: Massive Red Arrow pops up pointing at logo
                playTickSound();
                showRedArrow('KLIK SEKALI LAGI! 🎯');
                clickResetTimer = setTimeout(() => {
                    hideRedArrow();
                    clickCount = 0;
                }, 3800);
            } else if (clickCount === 2) {
                // Click 2: Alert text updates eagerly
                playTickSound();
                showRedArrow('SATU KLIK LAGI! 🐢🌊');
                clickResetTimer = setTimeout(() => {
                    hideRedArrow();
                    clickCount = 0;
                }, 3000);
            } else if (clickCount >= 3) {
                // Click 3: Transformed!
                clearTimeout(clickResetTimer);
                triggerEasterEggTransformation();
            }
        });
    }

    // Reset turtle on clicking the swimming turtle or status pill
    if (turtleContainer) {
        turtleContainer.addEventListener('click', () => {
            resetTurtleToHeader();
        });
    }

    if (turtleStatusPill) {
        turtleStatusPill.addEventListener('click', () => {
            resetTurtleToHeader();
        });
    }

})();

