/**
 * Instagram Requested-List Cleaner
 * Automatically navigates through a list of profiles and cancels "Requested" follow requests.
 */

(async function() {
    // --- CONFIGURATION ---
    const CONFIG = {
        STORAGE_KEY: 'ig_cleanup_queue',
        WAIT_PAGE_LOAD: 4000,   // ms
        WAIT_CONFIRM_POPUP: 1500, // ms
        MIN_DELAY: 7000,        // ms (Human-like delay)
        MAX_DELAY: 12000        // ms
    };

    // --- DATA INITIALIZATION ---
    // In a GitHub repo, leave this empty or with placeholders for users to paste their own
    const defaultList = [
        'https://www.instagram.com/username1',
        'https://www.instagram.com/username2'
    ];

    let queue = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || defaultList;

    function saveQueue() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(queue));
    }

    function getRandomDelay() {
        return Math.floor(Math.random() * (CONFIG.MAX_DELAY - CONFIG.MIN_DELAY + 1)) + CONFIG.MIN_DELAY;
    }

    async function processNext() {
        if (queue.length === 0) {
            console.log("✅ Cleanup complete! Queue is empty.");
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            return;
        }

        const nextUrl = queue.shift();
        saveQueue();
        
        console.log(`🚀 Navigating to: ${nextUrl} (${queue.length} left)`);
        window.location.href = nextUrl;
    }

    async function clickRequested() {
        console.log("🔍 Looking for 'Requested' button...");
        
        setTimeout(() => {
            const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
            
            // Look for buttons containing "Requested" (case-insensitive)
            const reqButton = buttons.find(b => 
                b.innerText && b.innerText.toLowerCase().includes('requested')
            );

            if (reqButton) {
                reqButton.click();
                console.log("🖱️ Clicked 'Requested'. Waiting for confirmation...");

                setTimeout(() => {
                    // Confirmation dialog button (Unfollow or Cancel Request)
                    const confirmButton = Array.from(document.querySelectorAll('button'))
                        .find(b => {
                            const txt = b.innerText.toLowerCase();
                            return txt === 'unfollow' || txt === 'cancel request';
                        });

                    if (confirmButton) {
                        confirmButton.click();
                        console.log("✅ Request Cancelled.");
                    }

                    const delay = getRandomDelay();
                    console.log(`⏳ Waiting ${delay/1000}s before next...`);
                    setTimeout(processNext, delay);
                }, CONFIG.WAIT_CONFIRM_POPUP);
                
            } else {
                console.log("⚠️ Button not found. Skipping profile...");
                processNext();
            }
        }, CONFIG.WAIT_PAGE_LOAD);
    }

    // --- EXECUTION LOGIC ---
    const currentPath = window.location.pathname.split('/').filter(p => p);
    
    // If we are on a specific profile (not the feed/explore)
    if (currentPath.length === 1 && !['explore', 'reels', 'direct'].includes(currentPath[0])) {
        clickRequested();
    } else {
        processNext();
    }
})();
