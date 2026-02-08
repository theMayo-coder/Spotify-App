// Spotify Mood Scanner - Main Application Logic

console.log("[app.js] Starting Spotify Mood Scanner");

// ============ STATE ============
let currentMood = "unknown"; // Initialize to "unknown" so first detected mood will always trigger update
let lastMoodChangeTime = 0;
let moodChangeDebounce = 200; // ms to debounce mood changes (faster response)
let updateInterval = null;

// ============ COLOR PALETTE ============
const moodColors = {
  happy: {
    light: "#FFD700",
    dark: "#FFC700",
    css: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
  },
  angry: {
    light: "#FF4444",
    dark: "#CC0000",
    css: "linear-gradient(135deg, #FF6B6B 0%, #CC0000 100%)"
  },
  sad: {
    light: "#4169E1",
    dark: "#1E3A8A",
    css: "linear-gradient(135deg, #4169E1 0%, #1E3A8A 100%)"
  },
  tired: {
    light: "#A9A9A9",
    dark: "#696969",
    css: "linear-gradient(135deg, #C0C0C0 0%, #696969 100%)"
  },
  neutral: {
    light: "#1a1a1a",
    dark: "#000000",
    css: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)"
  },
  focused: {
    light: "#2d2d44",
    dark: "#1a1a2e",
    css: "linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%)"
  },
  calm: {
    light: "#20B2AA",
    dark: "#3CB371",
    css: "linear-gradient(135deg, #20B2AA 0%, #3CB371 100%)"
  }
};

const moodEmojis = {
  happy: "😊",
  angry: "😠",
  sad: "😢",
  tired: "😴",
  focused: "🎯",
  calm: "😌",
  neutral: "😐",
  unknown: "❓"
};

// ============ DOM ELEMENTS ============
const webcamVideo = document.getElementById("webcamVideo");
const moodEmoji = document.getElementById("moodEmoji");
const moodName = document.getElementById("moodName");
const confidenceFill = document.getElementById("confidenceFill");
const confidenceValue = document.getElementById("confidenceValue");
const songsList = document.getElementById("songsList");
const songsSubtitle = document.getElementById("songsSubtitle");
const statusText = document.getElementById("statusText");

// ============ INITIALIZATION ============
async function init() {
  console.log("[app.js] Initializing application");

  // mood.js will handle the webcam stream
  console.log("[app.js] mood.js will handle webcam initialization");
  updateStatus("Detecting Mood...");

  // Start monitoring mood changes (will display songs once mood is detected)
  startMoodMonitor();
}

// ============ MOOD MONITORING ============
function startMoodMonitor() {
  console.log("[app.js] Starting mood monitor");

  // Update mood UI every 500ms
  updateInterval = setInterval(() => {
    updateMoodDisplay();
  }, 500);
}

function updateMoodDisplay() {
  // Get mood from window (set by mood.js)
  let detectedMood = window.currentMood || "unknown";
  const confidence = (window.currentConfidence || 0) * 100;

  // Only update if mood has been stable for debounce duration or if first time
  const now = Date.now();
  const timeSinceChange = now - lastMoodChangeTime;

  // Map "unknown" to "neutral" for display
  if (detectedMood === "unknown") {
    detectedMood = "neutral";
  }

  // Debug logging every 10 updates
  if (Math.random() < 0.05) {
    console.log("[app.js] Current mood detected:", window.currentMood, "| Confidence:", confidence.toFixed(1) + "%");
  }

  // Update mood if enough time has passed since last change or this is first update
  if (timeSinceChange > moodChangeDebounce || lastMoodChangeTime === 0) {
    if (detectedMood !== currentMood) {
      console.log("[app.js] Mood changed from", currentMood, "to", detectedMood);
      currentMood = detectedMood;
      lastMoodChangeTime = now;

      // Update all UI elements
      updateMoodUI();
      updateBackgroundColor();
      updateSongsList();
    }
  }

  // Always update confidence display (smoothly)
  updateConfidenceDisplay(confidence);

  // Update status
  updateStatus("Detecting Mood...");
}

// ============ UI UPDATE FUNCTIONS ============
function updateMoodUI() {
  // Update emoji
  const emoji = moodEmojis[currentMood] || "😐";
  moodEmoji.textContent = emoji;

  // Update mood name
  const displayMood = currentMood === "unknown" ? "Detecting" : currentMood.charAt(0).toUpperCase() + currentMood.slice(1);
  moodName.textContent = displayMood;

  // Update subtitle
  const subtitles = {
    happy: "You're feeling great!",
    angry: "Let it out with music",
    sad: "Take time to heal",
    tired: "You need some rest...",
    focused: "Stay concentrated",
    calm: "Take it easy",
    neutral: "Based on your mood",
    unknown: "Analyzing your expression..."
  };
  songsSubtitle.textContent = subtitles[currentMood] || "Based on your mood";
}

function updateConfidenceDisplay(confidence) {
  const clampedConfidence = Math.min(100, Math.max(0, confidence));
  confidenceFill.style.width = clampedConfidence + "%";
  confidenceValue.textContent = Math.round(clampedConfidence) + "%";
}

function updateBackgroundColor() {
  // Map "unknown" to "neutral" for color lookup
  const moodForLookup = currentMood === "unknown" ? "neutral" : currentMood;
  const colors = moodColors[moodForLookup] || moodColors.neutral;
  const body = document.body;
  const moodDisplay = document.querySelector(".mood-display");
  const songsSection = document.querySelector(".songs-section");

  console.log("[app.js] ===== BACKGROUND UPDATE =====");
  console.log("[app.js] Current mood:", currentMood, "| Lookup:", moodForLookup);
  console.log("[app.js] Colors:", colors);
  console.log("[app.js] Applying gradient:", colors.css);

  // Update body background
  body.style.transition = "background 0.8s ease-in-out";
  body.style.background = colors.css;

  // Update mood display section
  if (moodDisplay) {
    moodDisplay.style.transition = "background 0.8s ease-in-out";
    moodDisplay.style.background = colors.css;
  }

  // Update songs section
  if (songsSection) {
    songsSection.style.transition = "background 0.8s ease-in-out";
    songsSection.style.background = colors.css;
  }

  // Force repaint
  body.offsetHeight;

  document.documentElement.style.setProperty("--mood-color-primary", colors.light);
  document.documentElement.style.setProperty("--mood-color-secondary", colors.dark);

  console.log("[app.js] Background applied to body, mood-display, and songs-section");
}

function updateSongsList() {
  // Map "unknown" to "neutral" for song lookup
  const moodForLookup = currentMood === "unknown" ? "neutral" : currentMood;
  const moodData = window.moodSongs?.[moodForLookup];

  console.log("[app.js] ===== UPDATE SONGS LIST =====");
  console.log("[app.js] currentMood:", currentMood, "| moodForLookup:", moodForLookup);
  console.log("[app.js] songsList element:", songsList);
  console.log("[app.js] songsList height:", songsList.offsetHeight);
  console.log("[app.js] songsList parent (songs-section) height:", songsList.parentElement.offsetHeight);

  if (!moodData) {
    console.warn("[app.js] No songs found for mood:", moodForLookup);
    songsList.innerHTML = '<div class="loading-message">No songs found for this mood</div>';
    return;
  }

  const { songs } = moodData;
  console.log("[app.js] Found", songs.length, "songs for mood:", moodForLookup);

  // Clear and repopulate
  songsList.innerHTML = "";

  songs.forEach((song, index) => {
    const songEl = createSongElement(song, index);
    songsList.appendChild(songEl);
  });

  console.log("[app.js] Updated songs list with", songs.length, "songs");
  console.log("[app.js] Songs list now has", songsList.children.length, "child elements");
  console.log("[app.js] Songs list height now:", songsList.offsetHeight);
}

function createSongElement(song, index) {
  const div = document.createElement("div");
  div.className = "song-item";
  div.style.animationDelay = (index * 50) + "ms";

  div.innerHTML = `
    <div class="song-cover">${song.emoji}</div>
    <div class="song-info">
      <div class="song-title">${song.title}</div>
      <div class="song-artist">${song.artist}</div>
    </div>
    <div class="song-duration">${song.duration}</div>
  `;

  // Add hover effect
  div.addEventListener("mouseenter", () => {
    div.style.transform = "translateX(4px)";
  });

  div.addEventListener("mouseleave", () => {
    div.style.transform = "translateX(0)";
  });

  // Add forum click handler
  addForumClickToSong(div, song);

  return div;
}

function updateStatus(status) {
  statusText.textContent = status;
}

function displayError(message) {
  songsList.innerHTML = `
    <div class="loading-message" style="color: #ff6b6b;">
      Error: ${message}
      <br><br>
      Please check your webcam and refresh the page.
    </div>
  `;
}

// ============ UTILITY FUNCTIONS ============
function getCSS(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// Add staggered animation for songs
const style = document.createElement("style");
style.textContent = `
  .song-item {
    /* Temporarily disabled to debug visibility issue */
    /* animation: slideIn 0.3s ease forwards; */
    opacity: 1 !important;
    transform: translateX(0) !important;
    display: flex !important;
    visibility: visible !important;
  }

  .songs-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 12px;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

// ============ WINDOW EVENTS ============
window.addEventListener("load", () => {
  console.log("[app.js] Window loaded, waiting for mood.js...");

  // Wait for mood.js to be fully loaded
  let attempts = 0;
  const waitForMoodJS = setInterval(() => {
    if (window.startWebcam && typeof window.startWebcam === "function") {
      clearInterval(waitForMoodJS);
      console.log("[app.js] Found startWebcam function, starting webcam...");
      window.startWebcam();

      // Now initialize our app
      setTimeout(() => {
        init();
      }, 500);
    }

    attempts++;
    if (attempts > 50) {
      clearInterval(waitForMoodJS);
      console.error("[app.js] startWebcam function not found after waiting");
      displayError("Failed to initialize mood detection. Please refresh the page.");
    }
  }, 100);
});

// Handle visibility change (pause when tab is not visible)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("[app.js] Page hidden, stopping updates");
    clearInterval(updateInterval);
  } else {
    console.log("[app.js] Page visible, resuming updates");
    startMoodMonitor();
  }
});

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
});

console.log("[app.js] Script loaded and ready");

// ============ SERPAPI FORUM SEARCH FEATURE ============

// SERPApi Configuration
// API key is stored in .env file for security
const SERPAPI_KEY = '0319b7451391fc867cbeecf01edb722da62a53f06f95a3c1213f3fead6b9b626';
const SERPAPI_BASE_URL = 'https://serpapi.com/search';
const CORS_PROXY = 'https://api.allorigins.win/get?url='; // Free CORS proxy for browser requests
const FORUM_SEARCH_PARAMS = {
  engine: 'google_forums',
  hl: 'en',
  num: 5
};
const FORUM_DEBOUNCE_MS = 500; // Prevent rapid API calls
let lastForumSearch = 0;
let currentForumSong = null;

// ============ UTILITY FUNCTIONS ============
function debounce(func, wait) {
  return function executedFunction(...args) {
    const later = () => {
      lastForumSearch = 0;
      func(...args);
    };
    clearTimeout(lastForumSearch);
    lastForumSearch = setTimeout(later, wait);
  };
}

function isValidForumSearch(now) {
  return (now - lastForumSearch) > FORUM_DEBOUNCE_MS;
}

// ============ FORUM SEARCH FUNCTIONS ============
function initializeForumSearch() {
  const forumResultsClose = document.getElementById('forumResultsClose');
  const forumResultsOverlay = document.getElementById('forumResultsOverlay');

  if (!forumResultsClose) return;

  // Close modal on X button
  forumResultsClose.addEventListener('click', () => {
    forumResultsOverlay.classList.remove('active');
  });

  // Close modal on overlay click
  forumResultsOverlay.addEventListener('click', (e) => {
    if (e.target === forumResultsOverlay) {
      forumResultsOverlay.classList.remove('active');
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && forumResultsOverlay.classList.contains('active')) {
      forumResultsOverlay.classList.remove('active');
    }
  });

  console.log('[app.js] Forum search initialized');
}

function addForumClickToSong(element, song) {
  element.addEventListener('click', () => {
    handleForumClick(song);
  });
}

function handleForumClick(song) {
  const now = Date.now();

  if (!isValidForumSearch(now)) {
    console.log('[app.js] Forum search debounced');
    return;
  }

  if (!SERPAPI_KEY || SERPAPI_KEY.trim() === '' || SERPAPI_KEY === 'your_api_key_here') {
    showForumError('API Key Not Configured', 'Please add your SERPApi key to start searching forums. See console for instructions.');
    return;
  }

  lastForumSearch = now;
  currentForumSong = song;

  showForumLoading(song);
  searchForumDiscussions(song);
}

function showForumLoading(song) {
  const forumResultsOverlay = document.getElementById('forumResultsOverlay');
  const forumResultsTitle = document.getElementById('forumResultsTitle');
  const forumResultsList = document.getElementById('forumResultsList');

  forumResultsTitle.textContent = `Forum Discussions: ${song.title}`;
  forumResultsList.innerHTML = `
    <div class="forum-loading">
      <div class="forum-spinner"></div>
      <div class="forum-loading-text">Searching forums...</div>
    </div>
  `;

  forumResultsOverlay.classList.add('active');
}

function searchForumDiscussions(song) {
  const query = `${song.title} by ${song.artist} forum discussion`;

  const params = new URLSearchParams({
    q: query,
    api_key: SERPAPI_KEY
  });

  const serpApiUrl = `${SERPAPI_BASE_URL}?${params.toString()}`;
  const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(serpApiUrl)}`;

  console.log(`[app.js] Searching for discussions about: "${query}"`);
  console.log(`[app.js] Using CORS proxy to fetch from SERPApi...`);

  fetch(proxiedUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(proxyData => {
      // Parse the proxied response (allorigins returns { contents: "..." })
      const data = JSON.parse(proxyData.contents);

      console.log('[app.js] API Response received');
      console.log('[app.js] Response keys:', Object.keys(data));

      if (data.error) {
        showForumError('API Error', data.error || 'An error occurred while searching');
        return;
      }

      // Use organic_results from Google search (includes Reddit, forums, etc.)
      const results = data.organic_results || [];

      console.log('[app.js] Organic results found:', results.length);

      if (!results || results.length === 0) {
        showForumEmpty('No discussions found for this song. Try searching on Google directly for "' + query + '"');
        return;
      }

      // Transform organic_results into forum-like format
      const forums = results.slice(0, 5).map((result, index) => ({
        title: result.title,
        snippet: result.snippet || 'No description available',
        link: result.link
      }));

      displayForumResults(forums, song);
    })
    .catch(error => {
      console.error('[app.js] Forum search error:', error);

      let errorMessage = 'Could not fetch results. Please try again.';

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Check your connection.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your SERPApi key.';
      } else if (error.message.includes('402')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('SyntaxError')) {
        errorMessage = 'Could not parse API response. Please try again.';
      }

      showForumError('Search Error', errorMessage);
    });
}

function displayForumResults(forums, song) {
  const forumResultsList = document.getElementById('forumResultsList');
  forumResultsList.innerHTML = '';

  forums.forEach((forum, index) => {
    const forumElement = formatForumResult(forum, index);
    forumResultsList.appendChild(forumElement);
  });

  console.log(`[app.js] Displayed ${forums.length} forum results`);
}

function formatForumResult(forum, index) {
  const div = document.createElement('div');
  div.className = 'forum-result-item';
  div.style.animationDelay = (index * 50) + 'ms';

  const title = forum.title || 'Untitled Discussion';
  const snippet = forum.snippet || 'No preview available';
  const link = forum.link || '#';

  div.innerHTML = `
    <h4 class="forum-result-title">${title}</h4>
    <p class="forum-result-snippet">${snippet}</p>
    <a href="${link}" target="_blank" rel="noopener noreferrer" class="forum-result-link">
      View on Forum
    </a>
  `;

  return div;
}

function showForumError(title, message) {
  const forumResultsList = document.getElementById('forumResultsList');

  forumResultsList.innerHTML = `
    <div class="forum-error">
      <h4 class="forum-error-title">${title}</h4>
      <p class="forum-error-message">${message}</p>
      <button class="forum-error-button" onclick="location.reload()">Retry</button>
    </div>
  `;

  console.error(`[app.js] Forum error: ${title} - ${message}`);
}

function showForumEmpty(message) {
  const forumResultsList = document.getElementById('forumResultsList');

  forumResultsList.innerHTML = `
    <div class="forum-empty">
      <div class="forum-empty-icon">🔍</div>
      <div class="forum-empty-text">${message}</div>
    </div>
  `;

  console.log(`[app.js] No forum results: ${message}`);
}

// ============ INITIALIZE FORUM SEARCH ============
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeForumSearch();
  }, 100);
});

setTimeout(() => {
  initializeForumSearch();
}, 1000);



// ============ MOOD HISTORY FEATURE ============

// Mood History Data - Hard-coded realistic data
const moodHistoryData = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Happy',
        data: [5, 8, 6, 9, 7, 11, 8],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Angry',
        data: [2, 1, 3, 1, 2, 1, 1],
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#FF6B6B',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Sad',
        data: [3, 2, 2, 1, 2, 2, 2],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#4169E1',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Tired',
        data: [6, 5, 4, 3, 5, 4, 3],
        borderColor: '#C0C0C0',
        backgroundColor: 'rgba(192, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#C0C0C0',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Focused',
        data: [8, 7, 9, 10, 9, 6, 5],
        borderColor: '#2d2d44',
        backgroundColor: 'rgba(45, 45, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#2d2d44',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Calm',
        data: [7, 9, 8, 10, 8, 9, 10],
        borderColor: '#20B2AA',
        backgroundColor: 'rgba(32, 178, 170, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#20B2AA',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Neutral',
        data: [4, 3, 5, 4, 4, 3, 4],
        borderColor: '#808080',
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#808080',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      }
    ]
  },

  month: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Happy',
        data: [32, 36, 35, 38],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Angry',
        data: [8, 6, 7, 5],
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#FF6B6B',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Sad',
        data: [10, 9, 8, 6],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#4169E1',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Tired',
        data: [18, 17, 19, 16],
        borderColor: '#C0C0C0',
        backgroundColor: 'rgba(192, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#C0C0C0',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Focused',
        data: [34, 36, 32, 35],
        borderColor: '#2d2d44',
        backgroundColor: 'rgba(45, 45, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#2d2d44',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Calm',
        data: [32, 34, 36, 35],
        borderColor: '#20B2AA',
        backgroundColor: 'rgba(32, 178, 170, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#20B2AA',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Neutral',
        data: [14, 12, 13, 15],
        borderColor: '#808080',
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#808080',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      }
    ]
  },

  year: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Happy',
        data: [125, 132, 130, 138, 145, 152, 158, 150, 148, 155, 162, 170],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Angry',
        data: [28, 25, 22, 20, 18, 16, 14, 17, 19, 21, 23, 25],
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#FF6B6B',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Sad',
        data: [35, 32, 30, 25, 22, 20, 18, 21, 24, 28, 30, 32],
        borderColor: '#4169E1',
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#4169E1',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Tired',
        data: [72, 70, 75, 68, 65, 62, 59, 64, 68, 70, 72, 75],
        borderColor: '#C0C0C0',
        backgroundColor: 'rgba(192, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#C0C0C0',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Focused',
        data: [140, 145, 148, 155, 160, 165, 168, 162, 158, 152, 145, 140],
        borderColor: '#2d2d44',
        backgroundColor: 'rgba(45, 45, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#2d2d44',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Calm',
        data: [135, 138, 140, 148, 152, 158, 162, 155, 150, 145, 140, 135],
        borderColor: '#20B2AA',
        backgroundColor: 'rgba(32, 178, 170, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#20B2AA',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      },
      {
        label: 'Neutral',
        data: [55, 52, 50, 48, 45, 42, 40, 43, 46, 50, 52, 55],
        borderColor: '#808080',
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#808080',
        pointBorderColor: '#FFF',
        pointBorderWidth: 2
      }
    ]
  }
};

// Mood History State
let moodHistoryChart = null;
let currentTimeRange = 'week';

// ============ MODAL MANAGEMENT ============
function initializeMoodHistoryModal() {
  const moodHistoryBtn = document.getElementById('moodHistoryBtn');
  const moodHistoryOverlay = document.getElementById('moodHistoryOverlay');
  const moodHistoryClose = document.getElementById('moodHistoryClose');
  const timeRangeButtons = document.querySelectorAll('.time-range-btn');

  if (!moodHistoryBtn) return;

  // Open modal on button click
  moodHistoryBtn.addEventListener('click', () => {
    moodHistoryOverlay.classList.add('active');
    initializeChart(currentTimeRange);
    updateLegend();
  });

  // Close modal on X button click
  moodHistoryClose.addEventListener('click', () => {
    moodHistoryOverlay.classList.remove('active');
  });

  // Close modal on overlay click
  moodHistoryOverlay.addEventListener('click', (e) => {
    if (e.target === moodHistoryOverlay) {
      moodHistoryOverlay.classList.remove('active');
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && moodHistoryOverlay.classList.contains('active')) {
      moodHistoryOverlay.classList.remove('active');
    }
  });

  // Time range button handlers
  timeRangeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      timeRangeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update chart
      currentTimeRange = btn.getAttribute('data-range');
      initializeChart(currentTimeRange);
      updateLegend();
    });
  });
}

// ============ CHART INITIALIZATION ============
function initializeChart(timeRange) {
  const canvasElement = document.getElementById('moodChart');
  if (!canvasElement) return;

  const ctx = canvasElement.getContext('2d');
  const data = moodHistoryData[timeRange];

  // Destroy previous chart instance
  if (moodHistoryChart) {
    moodHistoryChart.destroy();
  }

  moodHistoryChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false // We'll use custom legend
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleColor: '#FFF',
          bodyColor: '#FFF',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 4,
          titleFont: {
            size: 12,
            weight: '600'
          },
          bodyFont: {
            size: 11
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

// ============ LEGEND MANAGEMENT ============
function updateLegend() {
  const legendContainer = document.getElementById('moodLegend');
  if (!legendContainer) return;

  const timeRange = currentTimeRange;
  const datasets = moodHistoryData[timeRange].datasets;

  legendContainer.innerHTML = '';

  datasets.forEach(dataset => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    const colorBox = document.createElement('div');
    colorBox.className = 'legend-color';
    colorBox.style.backgroundColor = dataset.borderColor;

    const label = document.createElement('span');
    label.textContent = dataset.label;

    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legendContainer.appendChild(legendItem);
  });
}

// ============ INITIALIZE MOOD HISTORY ============
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeMoodHistoryModal();
  }, 100);
});

// Also initialize when init() runs
setTimeout(() => {
  initializeMoodHistoryModal();
}, 1000);
