/* ============================================
   HABBI3 STREAM ALERTS - MAIN APPLICATION
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    alertDuration: 7000,        // 7 seconds display time
    entranceDuration: 800,      // 0.8s entrance animation
    exitDuration: 600,          // 0.6s exit animation
    queueDelay: 500,            // Delay between alerts
    socketUrl: 'https://sockets.streamlabs.com',
    
    // Alert priority (higher = more important)
    priority: {
        donation: 100,
        bits: 95,
        raid: 90,
        subscription: 80,
        resub: 75,
        host: 60,
        follow: 50
    },
    
    // Icons for each alert type
    icons: {
        donation: '💰',
        bits: '💎',
        subscription: '⭐',
        resub: '🌟',
        raid: '⚔️',
        host: '🏠',
        follow: '❤️'
    },
    
    // Labels for each alert type
    labels: {
        donation: 'NEW DONATION',
        bits: 'BITS CHEERED',
        subscription: 'NEW SUBSCRIBER',
        resub: 'RESUBSCRIBED',
        raid: 'INCOMING RAID',
        host: 'NOW HOSTING',
        follow: 'NEW FOLLOWER'
    }
};

// ============================================
// EMBEDDED AUDIO (Base64 - Simple Synth Tones)
// ============================================
const SOUNDS = {
    // Simple notification beep for follows
    follow: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1sbJuYmIFtXWBvmpqaiHFhXmh4jZGQinRramyAiImFfXZ0dHl/gIF/fHl3eHp8fn59fHt6e3x9fn5+fXx7e3x9fn9/fn18fHx9fX5+fn59fX19fX5+fn5+fn19fX19fn5+fn5+fX19fX1+fn5+fn59fX19fX5+fn5+fn19fX19fn5+',
    
    // Richer tone for subscriptions
    subscription: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB4jKWwpYx4T0VXdJixtKOCXEREWHuYqa6hhWZTU2F/l6WooYhvX1xld4qaoZ2Qf3JtcHqHkZeXkoh+d3V3foaLjo6LhYB8e3x/g4eJiYeFgn9+foCChIaHhoSCgH9+f4GDhYaGhYOBf39/gYKEhYWFg4KAgICBgoOEhYSEgoGAgICBgoOEhISEgoGAgICBgoODhISEgoGAgICBgoODhISEgoGAgA==',
    
    // Epic sound for donations
    donation: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAABMdqjI2867h1MzMFB9rdDdzrN+TzY2RW2Xxc/NvZRqSz9GXYCitLmxm3xjUU9ZbIGPmpqRgnBlXl1iaXN7gYOBfHZwbGprbXF1eHp5dnNwbm1ucHN2eHl4dnRxb29wcnR2eHh3dnRycHBxcnR1d3d3dnVzcnFxcnN0dXZ3dnZ1dHNycnJzdHV2dnZ2dXRzcnJyc3R1dnZ2dnV0c3JycnNzdHV1dnZ1dXRzc3NzdHR1dXV1dXR0c3NzdHR1dXV1dXR0c3Nz',
    
    // Bits sound
    bits: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAABbgKS3spl2UDw/WHyerLKlhF5FQE9sj6ivqpN2X05OX3aLm6Sfi3hrXltkcH6JkZGKfnNqZ2lwd4CGiIaAeXNubW9zdnyAgoF9eHRxcHJ1eX1/f3x4dXJxcnR3en1+fXt4dXNycnR2eXt9fHt5dnRzc3R2eHp7e3p4dnRzc3R1d3l6e3p5d3VzdHR1dnh5ent5eHZ0c3R0dXd4eXp5eHd1dHR0dXZ4eXl5eHd2dXR0dXZ3eHl5eHd2dXR0dXZ3eHl5eHd2dXR0',
    
    // Raid sound
    raid: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAA8aZq4yrqRYjsuOFh6oLjCuJdqQzM1TXSbrbe0oHxbR0NRaISbo6OXgmtbU1Vkd4mWm5eNfm9lYGNsdoCKjo2GfHJqZmhsdHyDh4eCe3RubGxvdHp/goF9d3FubW5xdXt/gH98d3Jvbm9ydnp9fn17d3NwcHFzdnl8fXx6dnNwcHFzdXl7fHt5dnNxcXJzdnh6e3t5d3RycnJzdXd5e3t5d3VzcnJzdHZ4ent6eHZ0cnJyc3V3eXp6eXd1c3JycnR2eHp6eXh2dHNy'
};

// ============================================
// STATE MANAGEMENT
// ============================================
let socket = null;
let alertQueue = [];
let isShowingAlert = false;
let particles = null;

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    alertBox: document.getElementById('alert-box'),
    alertType: document.querySelector('.alert-type'),
    alertUsername: document.querySelector('.alert-username'),
    alertMessage: document.querySelector('.alert-message'),
    alertAmount: document.querySelector('.alert-amount'),
    alertIcon: document.querySelector('.alert-icon'),
    errorMessage: document.getElementById('error-message'),
    connectionStatus: document.getElementById('connection-status'),
    statusText: document.querySelector('.status-text'),
    sounds: {
        follow: document.getElementById('sound-follow'),
        subscription: document.getElementById('sound-subscription'),
        donation: document.getElementById('sound-donation'),
        bits: document.getElementById('sound-bits'),
        raid: document.getElementById('sound-raid')
    }
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showError();
        return;
    }
    
    // Initialize sounds
    initSounds();
    
    // Initialize particles
    if (typeof ParticleSystem !== 'undefined') {
        particles = new ParticleSystem('particles');
    }
    
    // Connect to Streamlabs
    connectToStreamlabs(token);
}

// ============================================
// SOUND INITIALIZATION
// ============================================
function initSounds() {
    elements.sounds.follow.src = SOUNDS.follow;
    elements.sounds.subscription.src = SOUNDS.subscription;
    elements.sounds.donation.src = SOUNDS.donation;
    elements.sounds.bits.src = SOUNDS.bits;
    elements.sounds.raid.src = SOUNDS.raid;
    
    // Set volume
    Object.values(elements.sounds).forEach(sound => {
        sound.volume = 0.5;
    });
}

// ============================================
// STREAMLABS CONNECTION
// ============================================
function connectToStreamlabs(token) {
    showConnectionStatus('Connecting...');
    
    socket = io(CONFIG.socketUrl, {
        query: { token },
        transports: ['websocket']
    });
    
    socket.on('connect', () => {
        console.log('✅ Connected to Streamlabs');
        showConnectionStatus('Connected', true);
        
        // Hide status after 3 seconds
        setTimeout(() => {
            elements.connectionStatus.classList.add('hidden');
        }, 3000);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Disconnected from Streamlabs');
        showConnectionStatus('Disconnected');
    });
    
    socket.on('event', (eventData) => {
        handleEvent(eventData);
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        showConnectionStatus('Error');
    });
}

// ============================================
// EVENT HANDLING
// ============================================
function handleEvent(eventData) {
    console.log('📨 Event received:', eventData);
    
    const { type, message, for: platform } = eventData;
    
    if (!message || message.length === 0) return;
    
    message.forEach(data => {
        let alertData = null;
        
        switch (type) {
            case 'donation':
                alertData = {
                    type: 'donation',
                    username: data.from || data.name,
                    message: data.message,
                    amount: data.formatted_amount || `$${data.amount}`,
                    priority: CONFIG.priority.donation
                };
                break;
                
            case 'bits':
                alertData = {
                    type: 'bits',
                    username: data.name,
                    message: data.message,
                    amount: `${data.amount} bits`,
                    priority: CONFIG.priority.bits
                };
                break;
                
            case 'follow':
                alertData = {
                    type: 'follow',
                    username: data.name,
                    message: '',
                    amount: '',
                    priority: CONFIG.priority.follow
                };
                break;
                
            case 'subscription':
                const isResub = data.months && data.months > 1;
                alertData = {
                    type: isResub ? 'resub' : 'subscription',
                    username: data.name,
                    message: data.message || '',
                    amount: isResub ? `${data.months} months` : '',
                    priority: isResub ? CONFIG.priority.resub : CONFIG.priority.subscription
                };
                break;
                
            case 'host':
                alertData = {
                    type: 'host',
                    username: data.name,
                    message: '',
                    amount: data.viewers ? `${data.viewers} viewers` : '',
                    priority: CONFIG.priority.host
                };
                break;
                
            case 'raid':
                alertData = {
                    type: 'raid',
                    username: data.name || data.raider,
                    message: '',
                    amount: `${data.viewers || data.raiders} raiders`,
                    priority: CONFIG.priority.raid
                };
                break;
        }
        
        if (alertData) {
            queueAlert(alertData);
        }
    });
}

// ============================================
// ALERT QUEUE SYSTEM
// ============================================
function queueAlert(alertData) {
    // Add to queue
    alertQueue.push(alertData);
    
    // Sort by priority (highest first)
    alertQueue.sort((a, b) => b.priority - a.priority);
    
    // Process queue if not already showing
    if (!isShowingAlert) {
        processQueue();
    }
}

function processQueue() {
    if (alertQueue.length === 0) {
        isShowingAlert = false;
        return;
    }
    
    isShowingAlert = true;
    const alertData = alertQueue.shift();
    showAlert(alertData);
}

// ============================================
// ALERT DISPLAY
// ============================================
function showAlert(alertData) {
    const { type, username, message, amount } = alertData;
    
    // Update content
    elements.alertType.textContent = CONFIG.labels[type] || type.toUpperCase();
    elements.alertUsername.textContent = username;
    elements.alertMessage.textContent = message || '';
    elements.alertAmount.textContent = amount || '';
    elements.alertIcon.textContent = CONFIG.icons[type] || '🎉';
    
    // Show/hide message and amount
    elements.alertMessage.style.display = message ? 'block' : 'none';
    elements.alertAmount.style.display = amount ? 'block' : 'none';
    
    // Remove all type classes
    elements.alertBox.className = '';
    
    // Add type class
    elements.alertBox.classList.add(type === 'resub' ? 'subscription' : type);
    
    // Add chromatic effect for high-tier alerts
    if (['donation', 'bits', 'raid'].includes(type)) {
        elements.alertBox.classList.add('chromatic');
    }
    
    // Show alert with entrance animation
    elements.alertBox.classList.remove('hidden');
    elements.alertBox.classList.add('entrance');
    
    // Play sound
    playSound(type);
    
    // Trigger particles for high-tier alerts
    triggerParticles(type);
    
    // Remove entrance class after animation
    setTimeout(() => {
        elements.alertBox.classList.remove('entrance');
    }, CONFIG.entranceDuration);
    
    // Hide alert after duration
    setTimeout(() => {
        hideAlert();
    }, CONFIG.alertDuration);
}

function hideAlert() {
    elements.alertBox.classList.add('exit');
    
    setTimeout(() => {
        elements.alertBox.classList.add('hidden');
        elements.alertBox.classList.remove('exit', 'chromatic');
        
        // Process next alert in queue
        setTimeout(() => {
            processQueue();
        }, CONFIG.queueDelay);
    }, CONFIG.exitDuration);
}

// ============================================
// SOUND PLAYBACK
// ============================================
function playSound(type) {
    let soundType = type;
    
    // Map resub to subscription sound
    if (type === 'resub') soundType = 'subscription';
    if (type === 'host') soundType = 'follow';
    
    const sound = elements.sounds[soundType];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// ============================================
// PARTICLE EFFECTS
// ============================================
function triggerParticles(type) {
    if (!particles) return;
    
    switch (type) {
        case 'donation':
            particles.burst('confetti', 100);
            break;
        case 'bits':
            particles.burst('sparkle', 80);
            break;
        case 'raid':
            particles.burst('confetti', 120);
            break;
        case 'subscription':
        case 'resub':
            particles.burst('sparkle', 50);
            break;
        case 'follow':
            particles.burst('sparkle', 20);
            break;
    }
}

// ============================================
// UI HELPERS
// ============================================
function showError() {
    elements.errorMessage.classList.remove('hidden');
}

function showConnectionStatus(text, connected = false) {
    elements.connectionStatus.classList.remove('hidden', 'connected');
    elements.statusText.textContent = text;
    
    if (connected) {
        elements.connectionStatus.classList.add('connected');
    }
}

// ============================================
// TEST FUNCTION (for debugging)
// ============================================
window.testAlert = function(type = 'donation') {
    const testData = {
        donation: {
            type: 'donation',
            username: 'TestUser123',
            message: 'Great stream! Keep it up! 🎉',
            amount: '$25.00',
            priority: CONFIG.priority.donation
        },
        bits: {
            type: 'bits',
            username: 'BitCheerer',
            message: 'Cheer100 Amazing gameplay!',
            amount: '500 bits',
            priority: CONFIG.priority.bits
        },
        subscription: {
            type: 'subscription',
            username: 'NewSubscriber',
            message: 'Finally subbed! Love the content!',
            amount: '',
            priority: CONFIG.priority.subscription
        },
        resub: {
            type: 'resub',
            username: 'LoyalViewer',
            message: 'Been here since day 1!',
            amount: '12 months',
            priority: CONFIG.priority.resub
        },
        raid: {
            type: 'raid',
            username: 'FriendlyStreamer',
            message: '',
            amount: '150 raiders',
            priority: CONFIG.priority.raid
        },
        follow: {
            type: 'follow',
            username: 'NewFollower',
            message: '',
            amount: '',
            priority: CONFIG.priority.follow
        }
    };
    
    queueAlert(testData[type] || testData.donation);
};

// ============================================
// START APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', init);
