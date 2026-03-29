// --- INITIALIZE ICONS ---
lucide.createIcons();

// --- DOM ELEMENTS (Global Navigation) ---
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.view-section');

// --- TAB NAVIGATION ---
function switchTab(targetId) {
    navBtns.forEach(btn => btn.dataset.target === targetId ? btn.classList.add('active') : btn.classList.remove('active'));
    sections.forEach(sec => {
        if (sec.id === targetId) { sec.classList.remove('hidden'); sec.classList.add('active'); }
        else { sec.classList.remove('active'); sec.classList.add('hidden'); }
    });

    if (targetId !== 'breathing' && isBreathing) stopBreathing();
    if (targetId !== 'breathing' && typeof audioPlaying !== 'undefined' && audioPlaying) toggleAmbientSound();

    // Auto-scroll sidebar logic for mobile
    if (window.innerWidth < 850) {
        document.querySelector('.nav-menu').scrollLeft = 0;
    }
}

navBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.target)));

// --- 1. MOOD TRACKER LOGIC ---
const moodBtns = document.querySelectorAll('.mood-btn');
const moodResultBox = document.getElementById('mood-result');
const loggedMoodText = document.getElementById('logged-mood');

moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove selection from all
        moodBtns.forEach(b => b.classList.remove('selected'));
        // Select clicked
        btn.classList.add('selected');
        // Show result
        moodResultBox.classList.remove('hidden');
        loggedMoodText.textContent = btn.getAttribute('data-mood');
    });
});

// --- 2. ASSESSMENT & CHART LOGIC ---
const quizData = [
    { cat: 'E', q: "1. How often have you been feeling down, depressed, or hopeless?", opts: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { cat: 'E', q: "2. How often do you feel nervous, anxious, or unable to control your worrying?", opts: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { cat: 'P', q: "3. How have your physical energy levels been recently?", opts: ["Well-rested", "Slightly tired", "Frequently fatigued", "Severely exhausted"] },
    { cat: 'P', q: "4. How has your sleep pattern been?", opts: ["Consistent/Restful", "Occasionally interrupted", "Poor sleep/Insomnia", "Very disruptive/Barely sleeping"] },
    { cat: 'P', q: "5. Have you noticed significant changes in your appetite or eating habits?", opts: ["No changes", "Slight changes", "Eating much more/less", "Drastic uncharacteristic changes"] },
    { cat: 'C', q: "6. How easily can you concentrate on tasks (like reading or working)?", opts: ["Easily", "Takes some effort", "Often distracted", "Cannot focus at all"] },
    { cat: 'C', q: "7. Do you feel overwhelmed by your daily responsibilities right now?", opts: ["No, managing well", "A little, but functional", "Yes, it is a struggle", "Completely overwhelmed"] },
    { cat: 'E', q: "8. How often are you easily annoyed or irritable?", opts: ["Rarely", "Sometimes", "Often", "Almost constantly"] },
    { cat: 'E', q: "9. How often do you feel you have little interest or pleasure in doing things you usually enjoy?", opts: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { cat: 'C', q: "10. How often do you feel bad about yourself — or that you are a failure?", opts: ["Not at all", "Sometimes", "Often", "Almost constantly"] }
];

let currentQuestionIndex = 0;
let categoryScores = { E: 0, P: 0, C: 0 };
let totalScore = 0;
let chartInstance = null;

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressBar = document.getElementById('quiz-progress');
const questionCounter = document.getElementById('question-counter');
const insightsEmpty = document.getElementById('insights-empty');
const insightsResult = document.getElementById('insights-result');
const resultBadge = document.getElementById('result-badge');
const resultStatus = document.getElementById('result-status');
const resultTitle = document.getElementById('result-title');
const resultDesc = document.getElementById('result-desc');
const actionItems = document.getElementById('action-items');

function renderQuestion() {
    const currentQ = quizData[currentQuestionIndex];
    questionText.textContent = currentQ.q;
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of 10`;
    optionsContainer.innerHTML = '';

    currentQ.opts.forEach((text, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = text;
        btn.onclick = () => selectOption(currentQ.cat, index);
        optionsContainer.appendChild(btn);
    });

    progressBar.style.width = `${(currentQuestionIndex / quizData.length) * 100}%`;
}

function selectOption(category, score) {
    categoryScores[category] += score;
    totalScore += score;
    currentQuestionIndex++;

    if (currentQuestionIndex < quizData.length) {
        renderQuestion();
    } else {
        progressBar.style.width = '100%';
        setTimeout(generateInsights, 600);
    }
}

function generateInsights() {
    switchTab('insights');
    insightsEmpty.classList.add('hidden');
    insightsResult.classList.remove('hidden');

    let title = "", desc = "", guidance = [], badgeColor = "", statusText = "";

    if (totalScore <= 8) {
        badgeColor = "var(--status-good)"; statusText = "Low Distress"; title = "Healthy Emotional Balance";
        desc = "Your responses indicate good emotional and physical balance. Continue practicing your current healthy habits.";
        guidance = ["Maintain your healthy routines.", "Keep engaging in hobbies that bring you joy."];
    } else if (totalScore <= 18) {
        badgeColor = "var(--status-warn)"; statusText = "Moderate Distress"; title = "Elevated Stress Detected";
        desc = "Your results suggest a moderate level of stress or anxiety. Please utilize our Breathing and Games tools today.";
        guidance = ["Try the 4-7-8 method in our Breathing tab.", "Pop some bubbles in the Relaxation Games tab.", "Discuss your feelings with a trusted friend."];
    } else {
        badgeColor = "var(--status-err)"; statusText = "High Distress"; title = "Significant Distress Detected";
        desc = "Your assessment indicates a heavy emotional load. Please remember that clinical help is highly effective.";
        guidance = ["Schedule a consultation in the 'Book Counselor' tab.", "Refer to the 'Emergency' tab for immediate clinical contacts.", "Focus strictly on basic physiological needs."];
    }

    resultBadge.style.backgroundColor = badgeColor + "20";
    resultBadge.style.color = badgeColor;
    resultBadge.style.border = `1px solid ${badgeColor}`;
    resultStatus.textContent = statusText;
    resultTitle.textContent = title;
    resultDesc.textContent = desc;

    actionItems.innerHTML = '';
    guidance.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        actionItems.appendChild(li);
    });

    renderChart();
    currentQuestionIndex = 0; totalScore = 0; categoryScores = { E: 0, P: 0, C: 0 };
    setTimeout(renderQuestion, 1000);
}

function renderChart() {
    const ctx = document.getElementById('wellnessChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Emotional Stress', 'Physical Fatigue', 'Cognitive Overload'],
            datasets: [{
                label: 'Distress Level (Lower is Better)',
                data: [categoryScores.E, categoryScores.P, categoryScores.C],
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            scales: { r: { angleLines: { color: 'rgba(0,0,0,0.1)' }, grid: { color: 'rgba(0,0,0,0.1)' }, pointLabels: { font: { family: 'Inter', size: 13 }, color: '#64748b' }, ticks: { beginAtZero: true, max: 12, stepSize: 3, display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

// --- 3. EXERCISES (3D CSS Cards) ---
function toggleFlip(cubeId) { document.getElementById(cubeId).classList.toggle('is-flipped'); }

// --- 4. BREATHING (WITH AUDIO) ---
let isBreathing = false;
let breathingTimeout;
const breatheContainer = document.querySelector('.breathe-container');
const breatheText = document.getElementById('breathe-text');
const breatheSubtext = document.getElementById('breathe-subtext');
const breatheTimer = document.getElementById('breathe-timer');
const stopBreatheBtn = document.getElementById('stop-breathe-btn');
const audioObject = document.getElementById('ambient-audio');
const toggleAudioBtn = document.getElementById('toggle-audio-btn');
let audioPlaying = false;

function toggleAmbientSound() {
    if (audioPlaying) { audioObject.pause(); toggleAudioBtn.innerHTML = '<i data-lucide="volume-x"></i> Enable Peaceful Rain'; audioPlaying = false; }
    else { audioObject.play().catch(e => console.log("Audio play prevented", e)); toggleAudioBtn.innerHTML = '<i data-lucide="volume-2"></i> Stop Audio'; audioPlaying = true; }
    lucide.createIcons();
}

function breathingCycle() {
    if (!isBreathing) return;
    breatheContainer.className = 'breathe-container inhale'; breatheText.textContent = "Inhale Deeply..."; breatheSubtext.textContent = "Breathe in through nose for 4s"; breatheTimer.textContent = "Inhale";
    breathingTimeout = setTimeout(() => {
        if (!isBreathing) return;
        breatheContainer.className = 'breathe-container hold'; breatheText.textContent = "Hold It..."; breatheSubtext.textContent = "Hold for 7s"; breatheTimer.textContent = "Hold";
        breathingTimeout = setTimeout(() => {
            if (!isBreathing) return;
            breatheContainer.className = 'breathe-container exhale'; breatheText.textContent = "Exhale Slowly..."; breatheSubtext.textContent = "Exhale through mouth for 8s"; breatheTimer.textContent = "Exhale";
            breathingTimeout = setTimeout(() => { if (isBreathing) breathingCycle(); }, 8000);
        }, 7000);
    }, 4000);
}

function startBreathing() { if (!isBreathing) { isBreathing = true; stopBreatheBtn.style.display = 'inline-block'; if (!audioPlaying) toggleAmbientSound(); breathingCycle(); } }
function stopBreathing() { clearTimeout(breathingTimeout); isBreathing = false; breatheContainer.className = 'breathe-container'; breatheText.textContent = "Ready to begin?"; breatheSubtext.textContent = "Click the core to start."; breatheTimer.textContent = "Start"; stopBreatheBtn.style.display = 'none'; if (audioPlaying) toggleAmbientSound(); }


// --- 5. RELAXATION GAMES (BUBBLE WRAP) ---
const bubbleGrid = document.getElementById('bubble-grid');
function initBubbles() {
    bubbleGrid.innerHTML = '';
    let poppedCount = 0;
    const totalBubbles = 28;

    for (let i = 0; i < totalBubbles; i++) {
        let b = document.createElement('div');
        b.className = 'bubble';
        b.onclick = function () {
            if (!this.classList.contains('popped')) {
                this.classList.add('popped');

                // Play pop sound
                const popSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                popSound.volume = 0.5;
                popSound.play().catch(e => console.log('Audio disabled:', e));

                poppedCount++;

                // Automatically generate new sheet after a short delay
                if (poppedCount === totalBubbles) {
                    setTimeout(() => {
                        initBubbles();
                    }, 600);
                }
            }
        };
        bubbleGrid.appendChild(b);
    }
}
initBubbles();


// --- 6. INSPIRATION QUOTES ---
const quotes = [{ text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" }, { text: "Mental health...is not a destination, but a process.", author: "Noam Shpancer" }, { text: "Focus on the step in front of you, not the whole staircase.", author: "Unknown" }];
document.getElementById('new-quote-btn').addEventListener('click', () => {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const qt = document.getElementById('daily-quote');
    const qa = document.getElementById('quote-author');
    qt.style.opacity = 0; qa.style.opacity = 0;
    setTimeout(() => { qt.textContent = `"${q.text}"`; qa.textContent = `- ${q.author}`; qt.style.opacity = 1; qa.style.opacity = 1; }, 300);
});


// --- 7. PEER CHAT LOGIC ---
const peerChatFeed = document.getElementById('peer-chat-feed');
const peerInput = document.getElementById('peer-input');
const peerNames = ['Anonymous_2Lq', 'Anonymous_9Bk', 'Anonymous_User', 'Anonymous_Platypus'];
const peerResponses = [
    "I totally understand how you feel. You're not alone in this.",
    "Thank you for sharing that. It takes courage to speak up here.",
    "Sending positive energy your way. Take it one day at a time.",
    "I've been there too. Deep breaths. We are all rooting for you."
];

function handlePeerKey(e) { if (e.key === 'Enter') sendPeerMessage(); }
function sendPeerMessage() {
    const text = peerInput.value.trim();
    if (!text) return;

    // Add user message to feed
    const msgDiv = document.createElement('div');
    msgDiv.className = 'peer-msg outgoing';
    msgDiv.innerHTML = `<span class="peer-id">You (Anonymous)</span><div class="peer-text">${text}</div>`;
    peerChatFeed.appendChild(msgDiv);
    peerChatFeed.scrollTop = peerChatFeed.scrollHeight;
    peerInput.value = '';

    // Simulate reply
    setTimeout(() => {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'peer-msg incoming';
        const randomName = peerNames[Math.floor(Math.random() * peerNames.length)];
        const randomReply = peerResponses[Math.floor(Math.random() * peerResponses.length)];
        replyDiv.innerHTML = `<span class="peer-id">${randomName}</span><div class="peer-text">${randomReply}</div>`;
        peerChatFeed.appendChild(replyDiv);
        peerChatFeed.scrollTop = peerChatFeed.scrollHeight;
    }, 1500 + Math.random() * 2000);
}


// --- 8. MESSAGE BOARD LOGIC ---
const boardGrid = document.getElementById('board-grid');
const boardTextarea = document.getElementById('board-textarea');
const boardStyles = ['board-note', 'board-note note-alt', 'board-note note-warn'];

function postToBoard() {
    const text = boardTextarea.value.trim();
    if (!text) return;
    const note = document.createElement('div');
    note.className = boardStyles[Math.floor(Math.random() * boardStyles.length)];
    note.textContent = `"${text}"`;
    // Prepend to top of grid
    boardGrid.insertBefore(note, boardGrid.firstChild);
    boardTextarea.value = '';
}


// --- 9. COUNSELOR BOOKING LOGIC ---
let selectedTime = null;
const bookDate = document.getElementById('book-date');
// Set min date to today
bookDate.min = new Date().toISOString().split("T")[0];

function selectTime(btn) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedTime = btn.textContent;
    document.getElementById('booking-error').classList.add('hidden');
}

function confirmBooking() {
    const err = document.getElementById('booking-error');
    if (!bookDate.value || !selectedTime) {
        err.classList.remove('hidden');
        return;
    }

    // Get radio checked value
    const counselor = document.querySelector('input[name="counselor"]:checked').value;

    // Show Modal
    const modal = document.getElementById('booking-modal');
    const details = document.getElementById('booking-details-text');
    details.innerHTML = `You are securely booked with <strong>${counselor}</strong><br>on <strong>${bookDate.value}</strong> at <strong>${selectedTime}</strong>.<br><br>The clinic will email your secure video link shortly.`;

    modal.classList.remove('hidden');

    // Reset selection locally
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    selectedTime = null;
    bookDate.value = '';
}


// --- 10. AI CHATBOT LOGIC ---
const chatBody = document.getElementById('chat-body');
const chatChevron = document.getElementById('chat-chevron');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
let chatOpen = false;

function toggleChat() {
    chatOpen = !chatOpen;
    if (chatOpen) {
        chatBody.style.display = 'flex';
        chatChevron.style.transform = 'rotate(0deg)';
        chatInput.focus();
    } else {
        chatBody.style.display = 'none';
        chatChevron.style.transform = 'rotate(180deg)';
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter') sendMessage();
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    createMessage(text, 'user-message');
    chatInput.value = '';

    generateBotResponse(text);
}

function createMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', className);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 🔥 FINAL BOT RESPONSE FUNCTION (CONNECTED TO YOUR API)
async function generateBotResponse(input) {
    const lowerInput = input.toLowerCase();

    // 🚨 Safety fallback
    if (lowerInput.includes('suicide') || lowerInput.includes('die') || lowerInput.includes('kill')) {
        createMessage(
            "Please know your life matters. If you're in crisis, please go to the Emergency tab or call 988 immediately.",
            'bot-message'
        );
        return;
    }

    // ⏳ Typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message';
    typingIndicator.innerHTML = '<i>Thinking...</i>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
        });

        const data = await response.json();

        // Remove typing
        if (chatMessages.contains(typingIndicator)) {
            chatMessages.removeChild(typingIndicator);
        }

        // ❌ Handle API error properly
        if (!response.ok || data.error) {
            console.error('API Error:', data.error);
            createMessage("⚠️ Server error. Please try again later.", 'bot-message');
            return;
        }

        // ✅ Show AI reply
        createMessage(data.reply || "I'm here for you 💙", 'bot-message');

    } catch (error) {
        console.error('Network Error:', error);

        if (chatMessages.contains(typingIndicator)) {
            chatMessages.removeChild(typingIndicator);
        }

        createMessage("🌐 Network error. Please check your connection.", 'bot-message');
    }
}

// --- INITIAL LOAD ---
renderQuestion();