let player;
let playerInitialised = false;

// Called by the YouTube IFrame API once it has loaded (must be a global function).
function onYouTubeIframeAPIReady() {
    if (playerInitialised || !document.getElementById('youtube-player')) return;
    if (!window.YT || typeof YT.Player !== 'function') return;
    playerInitialised = true;

    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: 'fB05c5ygbFM', // Actual Video ID
        playerVars: {
            'autoplay': 1,
            'controls': 1, // Enable controls for zooming
            'disablekb': 1, // Disable keyboard controls
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0,
            'fs': 1, // Enable full screen button in iframe logic
            'iv_load_policy': 3
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

// Load the IFrame API only on pages that have a player, after the callback above
// is defined (avoids the race where the API fires before the callback exists).
if (document.getElementById('youtube-player')) {
    if (window.YT && typeof YT.Player === 'function') {
        onYouTubeIframeAPIReady();
    } else {
        var ytTag = document.createElement('script');
        ytTag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(ytTag);
    }
}

// --- Countdown Timer & Reveal Logic ---
let countdownInterval;

function startCountdownTimer() {
    if (!document.getElementById('timer-days')) return;
    
    // Set a 7-day evergreen deadline for each visitor
    let endTime = localStorage.getItem('webinar3_deadline_reset1');
    if (!endTime) {
        endTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
        localStorage.setItem('webinar3_deadline_reset1', endTime);
    } else {
        endTime = parseInt(endTime, 10);
    }
    
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    if(countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const now = Date.now();
        let remaining = endTime - now;
        
        if (remaining < 0) remaining = 0;
        
        let d = Math.floor(remaining / (1000 * 60 * 60 * 24));
        let h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((remaining % (1000 * 60)) / 1000);
        
        if(daysEl) daysEl.textContent = d.toString().padStart(2, '0');
        if(hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
        if(minutesEl) minutesEl.textContent = m.toString().padStart(2, '0');
        if(secondsEl) secondsEl.textContent = s.toString().padStart(2, '0');
        
        if (remaining <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

// Copy UPI Function
function copyUPI() {
    const upiText = document.getElementById('upi-text-to-copy').innerText;
    
    function showTooltip() {
        const tooltip = document.getElementById('copy-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'scale(1.1)';
            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'scale(0)';
            }, 2000);
        }
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(upiText).then(showTooltip).catch(err => console.error('Copy failed: ', err));
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = upiText;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showTooltip();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        textArea.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Start timer immediately since it is always visible
    startCountdownTimer();

    const revealBtn = document.getElementById('reveal-qr-btn');
    const offerSection = document.getElementById('offer-section');
    
    if(revealBtn && offerSection) {
        revealBtn.addEventListener('click', () => {
            // Hide the reveal button
            revealBtn.style.display = 'none';
            // Show the actual payment details
            offerSection.classList.remove('hidden');
        });
    }
});
