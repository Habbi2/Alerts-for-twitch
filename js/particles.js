/* ============================================
   HABBI3 STREAM ALERTS - PARTICLE SYSTEM
   Neon Cyberpunk Confetti & Sparkle Effects
   ============================================ */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        
        // Neon colors
        this.colors = {
            confetti: [
                '#00f0ff', // Cyan
                '#ff00aa', // Pink
                '#b400ff', // Purple
                '#f0ff00', // Yellow
                '#00ff88', // Green
                '#ff6b00', // Orange
            ],
            sparkle: [
                '#ffffff',
                '#00f0ff',
                '#ff00aa',
                '#f0ff00',
            ]
        };
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    // Create a burst of particles
    burst(type = 'confetti', count = 50) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 3;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (type === 'confetti') {
                    this.createConfetti(centerX, centerY);
                } else if (type === 'sparkle') {
                    this.createSparkle(centerX, centerY);
                }
            }, i * 10); // Stagger particle creation
        }
    }
    
    // Create confetti particle
    createConfetti(x, y) {
        const colors = this.colors.confetti;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.particles.push({
            type: 'confetti',
            x: x + (Math.random() - 0.5) * 200,
            y: y + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.8) * 15 - 5,
            width: Math.random() * 12 + 6,
            height: Math.random() * 8 + 4,
            color: color,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            gravity: 0.3,
            drag: 0.99,
            opacity: 1,
            fadeSpeed: 0.008
        });
    }
    
    // Create sparkle particle
    createSparkle(x, y) {
        const colors = this.colors.sparkle;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        this.particles.push({
            type: 'sparkle',
            x: x + (Math.random() - 0.5) * 300,
            y: y + (Math.random() - 0.5) * 200,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: Math.random() * 4 + 2,
            color: color,
            opacity: 1,
            fadeSpeed: 0.015,
            pulseSpeed: Math.random() * 0.2 + 0.1,
            pulsePhase: Math.random() * Math.PI * 2,
            glow: true
        });
    }
    
    // Update all particles
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.type === 'confetti') {
                // Physics
                p.vy += p.gravity;
                p.vx *= p.drag;
                p.vy *= p.drag;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                
                // Fade out when below canvas
                if (p.y > this.canvas.height * 0.8) {
                    p.opacity -= p.fadeSpeed * 3;
                } else {
                    p.opacity -= p.fadeSpeed;
                }
            } else if (p.type === 'sparkle') {
                // Gentle floating
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.02; // Slight downward drift
                
                // Pulse effect
                p.pulsePhase += p.pulseSpeed;
                
                // Fade out
                p.opacity -= p.fadeSpeed;
            }
            
            // Remove dead particles
            if (p.opacity <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Draw all particles
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const p of this.particles) {
            this.ctx.save();
            
            if (p.type === 'confetti') {
                this.drawConfetti(p);
            } else if (p.type === 'sparkle') {
                this.drawSparkle(p);
            }
            
            this.ctx.restore();
        }
    }
    
    // Draw confetti particle
    drawConfetti(p) {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        
        // Glow effect
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 10;
        
        // Draw rectangle
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        
        // Inner highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(-p.width / 4, -p.height / 2, p.width / 2, p.height / 3);
    }
    
    // Draw sparkle particle
    drawSparkle(p) {
        const pulse = Math.sin(p.pulsePhase) * 0.3 + 0.7;
        const size = p.size * pulse;
        
        this.ctx.translate(p.x, p.y);
        this.ctx.globalAlpha = p.opacity * pulse;
        
        // Glow effect
        if (p.glow) {
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 20;
        }
        
        // Draw star shape
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        
        // 4-pointed star
        const spikes = 4;
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // Center dot
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
    }
    
    // Animation loop
    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // Cleanup
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles = [];
    }
}

// Export for use in main.js
window.ParticleSystem = ParticleSystem;
