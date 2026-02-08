// web/mood.js

const MP_VERSION = "0.10.14";

// Exposed globals (Flutter reads these)
window.currentMood = "unknown";
window.currentConfidence = 0.0;
window.currentMoodDebug = "";

// Internal
let faceLandmarker = null;
let running = false;
let FilesetResolver = null;
let FaceLandmarker = null;

// Smoothing
let smileS = 0.0;
let eyeOpenS = 1.0;
let initS = false;
const alpha = 0.25;

// Utilities
function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}
function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

// Landmark indices (MediaPipe Face Mesh)
const IDX = {
  mouthLeft: 61,
  mouthRight: 291,
  upperLip: 13,
  lowerLip: 14,

  leftEyeLeft: 33,
  leftEyeRight: 133,
  leftEyeTop: 159,
  leftEyeBottom: 145,

  rightEyeLeft: 362,
  rightEyeRight: 263,
  rightEyeTop: 386,
  rightEyeBottom: 374,

  faceLeft: 234,
  faceRight: 454,
};

function estimateMoodFromLandmarks(lm) {
  const faceW = dist(lm[IDX.faceLeft], lm[IDX.faceRight]) + 1e-6;

  const mouthW = dist(lm[IDX.mouthLeft], lm[IDX.mouthRight]) / faceW;
  const mouthOpen = dist(lm[IDX.upperLip], lm[IDX.lowerLip]) / faceW;

  const leftEyeW = dist(lm[IDX.leftEyeLeft], lm[IDX.leftEyeRight]) / faceW;
  const leftEyeOpen =
    dist(lm[IDX.leftEyeTop], lm[IDX.leftEyeBottom]) / (leftEyeW + 1e-6);

  const rightEyeW = dist(lm[IDX.rightEyeLeft], lm[IDX.rightEyeRight]) / faceW;
  const rightEyeOpen =
    dist(lm[IDX.rightEyeTop], lm[IDX.rightEyeBottom]) / (rightEyeW + 1e-6);

  const eyeOpen = (leftEyeOpen + rightEyeOpen) / 2.0;

  // Calculate smile score (heuristic)
  let smile =
    clamp((mouthW - 0.34) / 0.10, 0, 1) * 0.7 +
    clamp((mouthOpen - 0.02) / 0.05, 0, 1) * 0.3;

  // Smooth with exponential moving average
  if (!initS) {
    smileS = smile;
    eyeOpenS = eyeOpen;
    initS = true;
  } else {
    smileS = alpha * smile + (1 - alpha) * smileS;
    eyeOpenS = alpha * eyeOpen + (1 - alpha) * eyeOpenS;
  }

  // Enhanced mood detection with new emotions
  let mood = "neutral";
  let confidence = 0;

  // Simple, robust detection based on actual thresholds

  // TIRED: Eyes VERY closed (eyeOpenS < 0.10) - extreme version
  if (eyeOpenS < 0.10) {
    mood = "tired";
    confidence = clamp((0.15 - eyeOpenS) / 0.15, 0, 1);
  }
  // HAPPY: Strong smile (smileS > 0.6)
  else if (smileS > 0.60) {
    mood = "happy";
    confidence = clamp((smileS - 0.50) / 0.30, 0, 1);
  }
  // ANGRY: Eyes open (eyeOpenS > 0.20) + closed mouth (mouthOpen < 0.03)
  else if (eyeOpenS > 0.20 && mouthOpen < 0.03) {
    mood = "angry";
    confidence = clamp((0.05 - mouthOpen) / 0.05, 0, 1);
  }
  // FOCUSED: Very wide eyes (eyeOpenS > 0.28) + no smile (smileS < 0.25)
  else if (eyeOpenS > 0.28 && smileS < 0.25) {
    mood = "focused";
    confidence = clamp((eyeOpenS - 0.25) / 0.10, 0, 1);
  }
  // SAD: No smile (smileS < 0.20) + open eyes (eyeOpenS > 0.15)
  else if (smileS < 0.20 && eyeOpenS > 0.15) {
    mood = "sad";
    confidence = clamp((0.25 - smileS) / 0.25, 0, 1);
  }
  // CALM: Gentle smile (0.25 < smileS < 0.60) + more closed eyes (0.10 < eyeOpenS < 0.16) - like tired but with smile
  else if (smileS > 0.25 && smileS < 0.60 && eyeOpenS > 0.10 && eyeOpenS < 0.16) {
    mood = "calm";
    confidence = 0.6;
  }
  // NEUTRAL: Default
  else {
    mood = "neutral";
    confidence = 0.3;
  }

  const debug = `smile=${smileS.toFixed(2)} eye=${eyeOpenS.toFixed(
    2
  )} mouthW=${mouthW.toFixed(2)} mouthO=${mouthOpen.toFixed(2)}`;

  return { mood, confidence, debug };
}

async function loadMediaPipe() {
  console.log("[mood.js] Loading MediaPipe library...");

  try {
    // Try to use ES6 import
    const vision = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/vision_bundle.mjs`);
    FilesetResolver = vision.FilesetResolver;
    FaceLandmarker = vision.FaceLandmarker;
    console.log("[mood.js] MediaPipe loaded via ES6 import");
    return true;
  } catch (e1) {
    console.warn("[mood.js] ES6 import failed, trying global objects...", e1.message);

    // Wait for global objects to be available (from vision_bundle.js script tag)
    return new Promise((resolve) => {
      let attempts = 0;
      const checkGlobals = setInterval(() => {
        if (window.FilesetResolver && window.FaceLandmarker) {
          clearInterval(checkGlobals);
          FilesetResolver = window.FilesetResolver;
          FaceLandmarker = window.FaceLandmarker;
          console.log("[mood.js] MediaPipe loaded from globals");
          resolve(true);
        }
        attempts++;
        if (attempts > 100) {
          clearInterval(checkGlobals);
          console.error("[mood.js] Timeout waiting for MediaPipe globals");
          resolve(false);
        }
      }, 50);
    });
  }
}

async function initFaceLandmarker() {
  try {
    console.log("[mood.js] Initializing FaceLandmarker...");
    console.log("[mood.js] FilesetResolver:", typeof FilesetResolver);
    console.log("[mood.js] FaceLandmarker:", typeof FaceLandmarker);

    if (!FilesetResolver || !FaceLandmarker) {
      console.log("[mood.js] Loading MediaPipe...");
      const loaded = await loadMediaPipe();
      if (!loaded) {
        throw new Error("Failed to load MediaPipe");
      }
    }

    const vision = await FilesetResolver.forVisionTasks(
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`
    );
    console.log("[mood.js] Vision initialized successfully");

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });
    console.log("[mood.js] FaceLandmarker created successfully!");
  } catch (e) {
    console.error("[mood.js] Failed to initialize FaceLandmarker:", e);
    // Fallback: try with CPU delegate
    try {
      console.log("[mood.js] Retrying with CPU delegate...");

      if (!FilesetResolver || !FaceLandmarker) {
        const loaded = await loadMediaPipe();
        if (!loaded) throw new Error("Failed to load MediaPipe for CPU fallback");
      }

      const vision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`
      );
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
      console.log("[mood.js] FaceLandmarker created with CPU delegate!");
    } catch (e2) {
      console.error("[mood.js] Failed with CPU delegate too:", e2);
      throw e2;
    }
  }
}

function scanLoop(video) {
  running = true;
  let last = -1;
  let frameCount = 0;
  let detectionCount = 0;

  const step = () => {
    if (!running) return;

    const nowMs = performance.now();

    if (video.readyState >= 2 && faceLandmarker) {
      // throttle to ~10fps
      if (last < 0 || nowMs - last > 100) {
        last = nowMs;
        frameCount++;

        try {
          const result = faceLandmarker.detectForVideo(video, nowMs);
          const faces = result.faceLandmarks;

          if (!faces || faces.length === 0) {
            window.currentMood = "unknown";
            window.currentConfidence = 0.0;
            window.currentMoodDebug = "no face";
          } else {
            detectionCount++;
            const est = estimateMoodFromLandmarks(faces[0]);
            window.currentMood = est.mood;
            window.currentConfidence = est.confidence;
            window.currentMoodDebug = est.debug;
          }

          // Log stats every 50 frames
          if (frameCount % 50 === 0) {
            console.log(`[mood.js] Processed ${frameCount} frames, detected face in ${detectionCount} frames`);
          }
        } catch (e) {
          console.error("[mood.js] Error in detection:", e);
        }
      }
    }

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function getOrCreateVideo() {
  let video = document.getElementById("webcamVideo");
  if (!video) {
    video = document.createElement("video");
    video.id = "webcamVideo";
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.style.width = "100%";
    video.style.height = "100%";
    document.body.appendChild(video);
  }
  return video;
}

// Called from Flutter
async function startWebcam() {
  console.log("[mood.js] startWebcam called");

  const video = getOrCreateVideo();
  if (!video) {
    console.log("[mood.js] ERROR: webcamVideo element not found");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    video.srcObject = stream;

    // iOS/Safari sometimes needs these:
    video.playsInline = true;
    video.muted = true;

    await video.play();
    console.log("[mood.js] webcam playing");

    if (!faceLandmarker) {
      console.log("[mood.js] initializing face landmarker...");
      await initFaceLandmarker();
      console.log("[mood.js] face landmarker ready");
    }

    scanLoop(video);
  } catch (e) {
    console.log("[mood.js] webcam/mediapipe failed:", e);
    window.currentMood = "unknown";
    window.currentConfidence = 0.0;
    window.currentMoodDebug = String(e);
  }
}

window.startWebcam = startWebcam;
console.log("[mood.js] loaded OK");
