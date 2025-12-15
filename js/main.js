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
// SOUND MANAGER (Web Audio API)
// ============================================
let soundManager = null;

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
    statusText: document.querySelector('.status-text')
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
    if (typeof SoundManager !== 'undefined') {
        soundManager = new SoundManager();
        console.log('🔊 Sound Manager ready');
    }
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
    if (soundManager) {
        soundManager.play(type);
    }
}

// ============================================
// PARTICLE EFFECTS
// ============================================
function triggerParticles(type) {
    if (!particles) return;
    
    switch (type) {
        case 'donation':
            // Epic donation explosion!
            particles.donationExplosion();
            break;
        case 'bits':
            // Purple sparkle magic
            particles.burst('bits', 150);
            particles.shake(12, 400);
            particles.flashScreen('#b400ff', 200);
            break;
        case 'raid':
            // Raid invasion!
            particles.raidInvasion();
            break;
        case 'subscription':
        case 'resub':
            // Sparkle shower for subs
            particles.burst('sparkle', 100);
            particles.shake(6, 300);
            particles.flashScreen('#ff00aa', 150);
            break;
        case 'follow':
            // Nice sparkle burst for follows
            particles.burst('sparkle', 60);
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
