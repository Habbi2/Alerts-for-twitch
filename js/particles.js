/* ============================================
   HABBI3 STREAM ALERTS - PARTICLE SYSTEM V2
   FPS-Safe Dark Souls Gothic Theme
   ============================================ */

// FPS-Safe Constants
const MAX_PARTICLES = 150;
const BATCH_SIZE = 30;

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.trails = [];
        this.screenShake = { x: 0, y: 0, intensity: 0 };
        this.flash = { opacity: 0, color: '#ffffff' };
        this.animationId = null;
        this.isRunning = false;
        
        // Gothic Dark Souls color palette
        this.colors = {
            confetti: [
                '#8b0000', // Blood red
                '#e8e4d9', // Bone white
                '#5c3a21', // Rust brown
                '#a89f8f', // Muted tan
                '#5a524a', // Dark brown
                '#7a9b8c', // Faded cyan
                '#4a3728', // Dark rust
                '#b8860b', // Dark gold
            ],
            sparkle: [
                '#e8e4d9', // Bone white
                '#8b0000', // Blood red
                '#a89f8f', // Muted
                '#5c3a21', // Rust
            ],
            donation: [
                '#e8e4d9', // Bone white (primary)
                '#f5f1e6', // Bright bone
                '#a89f8f', // Muted tan
                '#8b0000', // Blood accent
            ],
            bits: [
                '#5c3a21', // Rust brown
                '#8b0000', // Blood red
                '#4a3728', // Dark rust
                '#e8e4d9', // Bone white
            ],
            raid: [
                '#7a9b8c', // Faded cyan
                '#e8e4d9', // Bone white
                '#5a524a', // Dark brown
                '#8b0000', // Blood accent
            ]
        };
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        // Don't auto-start - will start when particles are added
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    // Start animation loop if not running
    startLoop() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    // ============================================
    // SCREEN EFFECTS
    // ============================================
    
    shake(intensity = 10, duration = 500) {
        this.screenShake.intensity = intensity;
        const startTime = performance.now();
        
        const doShake = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const currentIntensity = intensity * (1 - progress);
                this.screenShake.x = (Math.random() - 0.5) * currentIntensity;
                this.screenShake.y = (Math.random() - 0.5) * currentIntensity;
                requestAnimationFrame(doShake);
            } else {
                this.screenShake.x = 0;
                this.screenShake.y = 0;
                this.screenShake.intensity = 0;
            }
        };
        doShake();
    }
    
    flashScreen(color = '#ffffff', duration = 200) {
        this.flash.color = color;
        this.flash.opacity = 0.4;
        
        const fadeOut = () => {
            this.flash.opacity -= 0.02;
            if (this.flash.opacity > 0) {
                requestAnimationFrame(fadeOut);
            }
        };
        
        setTimeout(fadeOut, 50);
    }
    
    // ============================================
    // BURST PATTERNS
    // ============================================
    
    burst(type = 'confetti', count = 50, options = {}) {
        const centerX = options.x || this.canvas.width / 2;
        const centerY = options.y || this.canvas.height / 3;
        const colors = this.colors[type] || this.colors.confetti;
        
        // Reduced screen effects for FPS safety
        if (count >= 80) {
            this.shake(count >= 150 ? 8 : 5, 300);
            this.flashScreen(colors[0], 150);
        }
        
        // Batch particle creation (no staggered setTimeout)
        const actualCount = Math.min(count, BATCH_SIZE);
        for (let i = 0; i < actualCount; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;
            
            if (type === 'confetti' || type === 'donation' || type === 'raid') {
                this.createConfetti(centerX, centerY, colors);
            } else if (type === 'sparkle' || type === 'bits') {
                this.createSparkle(centerX, centerY, colors);
            }
        }
        
        // Add a few ambient particles
        this.createAmbientBurst(centerX, centerY, Math.min(Math.floor(count / 5), 10), colors);
        
        // Start animation loop
        this.startLoop();
    }
    
    // Special donation explosion - FPS optimized
    donationExplosion(amount = 10) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 3;
        const colors = this.colors.donation;
        
        // Reduced screen effects
        this.shake(10, 400);
        this.flashScreen('#e8e4d9', 200);
        
        // Batch create particles (no setTimeout spam)
        const confettiCount = Math.min(50, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < confettiCount; i++) {
            this.createConfetti(centerX, centerY, colors);
        }
        
        // Add 2-3 expanding rings
        for (let i = 0; i < 3; i++) {
            if (this.particles.length < MAX_PARTICLES) {
                this.createExpandingRing(centerX, centerY, colors[i % colors.length]);
            }
        }
        
        // Add some sparkles
        const sparkleCount = Math.min(20, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < sparkleCount; i++) {
            this.createSparkle(
                centerX + (Math.random() - 0.5) * 300,
                centerY + (Math.random() - 0.5) * 150,
                colors
            );
        }
        
        // Start animation loop
        this.startLoop();
    }
    
    // Raid invasion effect - FPS optimized
    raidInvasion() {
        const colors = this.colors.raid;
        
        this.shake(12, 500);
        this.flashScreen('#7a9b8c', 250);
        
        // Single wave of particles from top
        const raidCount = Math.min(40, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < raidCount; i++) {
            const x = Math.random() * this.canvas.width;
            this.createRaider(x, -50, colors);
        }
        
        // Central burst
        const burstCount = Math.min(30, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < burstCount; i++) {
            this.createConfetti(this.canvas.width / 2, this.canvas.height / 2, colors);
        }
        
        // Start animation loop
        this.startLoop();
    }
    
    // ============================================
    // PARTICLE TYPES
    // ============================================
    
    createConfetti(x, y, colors) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = 8 + Math.random() * 12;
        
        this.particles.push({
            type: 'confetti',
            x: x + (Math.random() - 0.5) * 100,
            y: y + (Math.random() - 0.5) * 50,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 8,
            width: Math.random() * 14 + 8,
            height: Math.random() * 10 + 5,
            color: color,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 20,
            gravity: 0.35,
            drag: 0.98,
            opacity: 1,
            fadeSpeed: 0.006,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.3 + 0.1
        });
    }
    
    createSparkle(x, y, colors) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.particles.push({
            type: 'sparkle',
            x: x + (Math.random() - 0.5) * 400,
            y: y + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 + 1,
            size: Math.random() * 6 + 3,
            maxSize: Math.random() * 8 + 4,
            color: color,
            opacity: 1,
            fadeSpeed: 0.012,
            pulseSpeed: Math.random() * 0.3 + 0.15,
            pulsePhase: Math.random() * Math.PI * 2,
            twinkle: Math.random() > 0.5,
            trail: []
        });
    }
    
    createGlowOrb(x, y, colors) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = 3 + Math.random() * 5;
        
        this.particles.push({
            type: 'glow',
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 2,
            size: Math.random() * 20 + 15,
            color: color,
            opacity: 0.8,
            fadeSpeed: 0.008,
            gravity: -0.05,
            drag: 0.98
        });
    }
    
    createRing(x, y, colors) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.particles.push({
            type: 'ring',
            x: x + (Math.random() - 0.5) * 200,
            y: y + (Math.random() - 0.5) * 100,
            size: 5,
            maxSize: 60 + Math.random() * 40,
            growSpeed: 2 + Math.random() * 2,
            color: color,
            opacity: 0.8,
            fadeSpeed: 0.015
        });
    }
    
    createExpandingRing(x, y, color) {
        this.particles.push({
            type: 'expandingRing',
            x: x,
            y: y,
            size: 10,
            maxSize: 300,
            growSpeed: 8,
            color: color,
            opacity: 0.6,
            fadeSpeed: 0.012,
            lineWidth: 4
        });
    }
    
    createRaider(x, y, colors) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.particles.push({
            type: 'raider',
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 3,
            vy: 8 + Math.random() * 6,
            size: Math.random() * 8 + 4,
            color: color,
            opacity: 1,
            fadeSpeed: 0.005,
            trail: []
        });
    }
    
    createFirework(x, y, colors) {
        // Create explosion particles
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const velocity = 6 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                type: 'firework',
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 4 + 2,
                color: color,
                opacity: 1,
                fadeSpeed: 0.02,
                gravity: 0.15,
                trail: []
            });
        }
    }
    
    createAmbientBurst(x, y, count, colors) {
        // Batch create - no setTimeout for FPS safety
        const actualCount = Math.min(count, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < actualCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push({
                type: 'ambient',
                x: x + (Math.random() - 0.5) * 400,
                y: y + (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -0.5 - Math.random() * 1.5,
                size: Math.random() * 3 + 2,
                color: color,
                opacity: 0.5,
                fadeSpeed: 0.012
            });
        }
    }
    
    // ============================================
    // UPDATE
    // ============================================
    
    update() {
        // Enforce particle cap
        while (this.particles.length > MAX_PARTICLES) {
            this.particles.shift();
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            switch (p.type) {
                case 'confetti':
                    p.vy += p.gravity;
                    p.vx *= p.drag;
                    p.vy *= p.drag;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rotation += p.rotationSpeed;
                    p.wobble += p.wobbleSpeed;
                    p.x += Math.sin(p.wobble) * 0.5;
                    
                    if (p.y > this.canvas.height * 0.8) {
                        p.opacity -= p.fadeSpeed * 4;
                    } else {
                        p.opacity -= p.fadeSpeed;
                    }
                    break;
                    
                case 'sparkle':
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.03;
                    p.pulsePhase += p.pulseSpeed;
                    
                    // Trail
                    if (p.trail.length < 8) {
                        p.trail.push({ x: p.x, y: p.y, opacity: p.opacity * 0.5 });
                    } else {
                        p.trail.shift();
                        p.trail.push({ x: p.x, y: p.y, opacity: p.opacity * 0.5 });
                    }
                    
                    if (p.twinkle && Math.random() > 0.95) {
                        p.opacity = Math.min(1, p.opacity + 0.3);
                    }
                    
                    p.opacity -= p.fadeSpeed;
                    break;
                    
                case 'glow':
                    p.vy += p.gravity;
                    p.vx *= p.drag;
                    p.vy *= p.drag;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.opacity -= p.fadeSpeed;
                    break;
                    
                case 'ring':
                    p.size += p.growSpeed;
                    if (p.size >= p.maxSize) {
                        p.opacity -= p.fadeSpeed * 2;
                    }
                    break;
                    
                case 'expandingRing':
                    p.size += p.growSpeed;
                    p.opacity -= p.fadeSpeed;
                    p.lineWidth = Math.max(1, p.lineWidth - 0.05);
                    break;
                    
                case 'raider':
                    p.x += p.vx;
                    p.y += p.vy;
                    
                    // Trail
                    p.trail.push({ x: p.x, y: p.y, opacity: p.opacity });
                    if (p.trail.length > 15) p.trail.shift();
                    
                    if (p.y > this.canvas.height) {
                        p.opacity = 0;
                    }
                    p.opacity -= p.fadeSpeed;
                    break;
                    
                case 'firework':
                    p.vy += p.gravity;
                    p.x += p.vx;
                    p.y += p.vy;
                    
                    p.trail.push({ x: p.x, y: p.y, opacity: p.opacity * 0.7 });
                    if (p.trail.length > 6) p.trail.shift();
                    
                    p.opacity -= p.fadeSpeed;
                    break;
                    
                case 'ambient':
                    p.x += p.vx;
                    p.y += p.vy;
                    p.opacity -= p.fadeSpeed;
                    break;
            }
            
            // Remove dead particles
            if (p.opacity <= 0 || p.size > 500) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // ============================================
    // DRAW
    // ============================================
    
    draw() {
        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.screenShake.x, this.screenShake.y);
        
        // Clear with optional flash
        this.ctx.clearRect(-50, -50, this.canvas.width + 100, this.canvas.height + 100);
        
        // Draw flash overlay
        if (this.flash.opacity > 0) {
            this.ctx.fillStyle = this.flash.color;
            this.ctx.globalAlpha = this.flash.opacity;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
        }
        
        // Draw particles
        for (const p of this.particles) {
            this.ctx.save();
            
            switch (p.type) {
                case 'confetti':
                    this.drawConfetti(p);
                    break;
                case 'sparkle':
                    this.drawSparkle(p);
                    break;
                case 'glow':
                    this.drawGlow(p);
                    break;
                case 'ring':
                case 'expandingRing':
                    this.drawRing(p);
                    break;
                case 'raider':
                    this.drawRaider(p);
                    break;
                case 'firework':
                    this.drawFirework(p);
                    break;
                case 'ambient':
                    this.drawAmbient(p);
                    break;
            }
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    drawConfetti(p) {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        
        // Simple solid color (no shadow for FPS)
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        
        // Pixel-style highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width / 2, p.height / 2);
    }
    
    drawSparkle(p) {
        // Draw trail (simplified)
        for (let i = 0; i < p.trail.length; i++) {
            const t = p.trail[i];
            const trailOpacity = (i / p.trail.length) * t.opacity * 0.4;
            this.ctx.globalAlpha = trailOpacity;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(t.x - 1, t.y - 1, 3, 3);
        }
        
        const pulse = Math.sin(p.pulsePhase) * 0.4 + 0.6;
        const size = p.size * pulse;
        
        this.ctx.translate(p.x, p.y);
        this.ctx.globalAlpha = p.opacity * pulse;
        
        // Simple star shape (no shadow)
        this.ctx.fillStyle = p.color;
        this.drawStar(0, 0, 4, size, size * 0.4);
        
        // Center bright spot
        this.ctx.fillStyle = '#e8e4d9';
        this.ctx.fillRect(-1, -1, 3, 3);
    }
    
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawGlow(p) {
        this.ctx.globalAlpha = p.opacity * 0.6;
        
        // Simple layered circles (no gradient for FPS)
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.globalAlpha = p.opacity * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawRing(p) {
        this.ctx.globalAlpha = p.opacity;
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = p.lineWidth || 2;
        
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawRaider(p) {
        // Draw trail (simplified)
        for (let i = 0; i < p.trail.length; i++) {
            const t = p.trail[i];
            const trailOpacity = (i / p.trail.length) * p.opacity * 0.5;
            this.ctx.globalAlpha = trailOpacity;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(t.x - p.size * 0.25, t.y - p.size * 0.25, p.size * 0.5, p.size * 0.5);
        }
        
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawFirework(p) {
        // Trail (simplified)
        for (let i = 0; i < p.trail.length; i++) {
            const t = p.trail[i];
            const trailOpacity = (i / p.trail.length) * t.opacity;
            this.ctx.globalAlpha = trailOpacity;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(t.x - p.size * 0.3, t.y - p.size * 0.3, p.size * 0.6, p.size * 0.6);
        }
        
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawAmbient(p) {
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        // Pixel-style square instead of circle
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    
    // ============================================
    // ANIMATION LOOP - FPS Safe
    // ============================================
    
    animate() {
        // Stop loop if nothing to render
        if (this.particles.length === 0 && this.flash.opacity <= 0 && this.screenShake.intensity <= 0) {
            this.isRunning = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles = [];
    }
}

// Export
window.ParticleSystem = ParticleSystem;
